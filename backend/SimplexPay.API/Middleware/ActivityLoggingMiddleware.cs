using System.Security.Claims;
using System.Text.RegularExpressions;
using SimplexPay.Application.Interfaces;
using SimplexPay.Domain.Entities;

namespace SimplexPay.API.Middleware;

// Middleware qui log les requêtes "significatives" en base pour audit admin.
// - Ne log pas : /api/countries, /api/currencies, /api/admin/*, /api/exchange-rates, /hubs/*,
//   health checks, static, favicon.
// - Log les mutations (POST/PUT/PATCH/DELETE) + GET sur les endpoints liste/détail offres.
// - Ne bloque JAMAIS la requête (les erreurs de logging sont avalées et logguées côté serveur).
public class ActivityLoggingMiddleware(RequestDelegate next, ILogger<ActivityLoggingMiddleware> logger)
{
    // Path GET qu'on veut logger (visualisation de liste/détail).
    private static readonly Regex[] LoggedGetPaths =
    [
        new(@"^/api/offers(?:/[0-9a-f-]+)?$", RegexOptions.Compiled | RegexOptions.IgnoreCase),
        new(@"^/api/travel-kilo(?:/[0-9a-f-]+)?$", RegexOptions.Compiled | RegexOptions.IgnoreCase),
        new(@"^/api/boat-shipping(?:/[0-9a-f-]+)?$", RegexOptions.Compiled | RegexOptions.IgnoreCase),
        new(@"^/api/users/[0-9a-f-]+/(?:profile|reviews)$", RegexOptions.Compiled | RegexOptions.IgnoreCase),
    ];

    public async Task InvokeAsync(HttpContext ctx, IServiceScopeFactory scopeFactory, IGeoIpService geo)
    {
        // Traite d'abord la requête, puis log après (on veut le StatusCode).
        await next(ctx);

        if (!ShouldLog(ctx)) return;

        try
        {
            var userIdStr = ctx.User?.FindFirstValue(ClaimTypes.NameIdentifier)
                         ?? ctx.User?.FindFirstValue("sub");
            var userId = Guid.TryParse(userIdStr, out var uid) ? uid : (Guid?)null;

            var ip = GetClientIp(ctx);
            var action = DeriveAction(ctx.Request.Method, ctx.Request.Path);

            // Geo depuis le cache uniquement (instantané). Si pas trouvé, on log sans geo
            // et on déclenche la résolution en background pour les prochaines requêtes de cet IP.
            var cached = geo.TryGetCached(ip);
            if (cached is null)
                _ = Task.Run(() => geo.ResolveAsync(ip));

            var log = ActivityLog.Create(
                userId: userId,
                ip: ip,
                userAgent: ctx.Request.Headers.UserAgent.ToString(),
                method: ctx.Request.Method,
                path: ctx.Request.Path.ToString(),
                action: action,
                statusCode: ctx.Response.StatusCode,
                country: cached?.CountryCode,
                city: cached?.City
            );

            // Nouveau scope car le middleware est singleton mais AppDbContext est scoped.
            _ = Task.Run(async () =>
            {
                try
                {
                    using var scope = scopeFactory.CreateScope();
                    var repo = scope.ServiceProvider.GetRequiredService<IActivityLogRepository>();
                    await repo.AddAsync(log);
                    await repo.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "[ActivityLog] Écriture en base échouée pour {Action}", log.Action);
                }
            });
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "[ActivityLog] Erreur pré-log");
        }
    }

    private static bool ShouldLog(HttpContext ctx)
    {
        var path = ctx.Request.Path.Value ?? string.Empty;
        var method = ctx.Request.Method;

        // Skip explicit
        if (path.StartsWith("/api/countries", StringComparison.OrdinalIgnoreCase)) return false;
        if (path.StartsWith("/api/currencies", StringComparison.OrdinalIgnoreCase)) return false;
        if (path.StartsWith("/api/exchange-rates", StringComparison.OrdinalIgnoreCase)) return false;
        if (path.StartsWith("/api/admin/", StringComparison.OrdinalIgnoreCase)) return false;
        if (path.StartsWith("/hubs/", StringComparison.OrdinalIgnoreCase)) return false;
        if (path.StartsWith("/swagger", StringComparison.OrdinalIgnoreCase)) return false;
        if (path.Equals("/favicon.ico", StringComparison.OrdinalIgnoreCase)) return false;
        if (!path.StartsWith("/api/", StringComparison.OrdinalIgnoreCase)) return false;

        // Log toutes les mutations
        if (method is "POST" or "PUT" or "PATCH" or "DELETE") return true;

        // GET : seulement liste + détail offres + profil user
        if (method == "GET")
            return LoggedGetPaths.Any(r => r.IsMatch(path));

        return false;
    }

    private static string GetClientIp(HttpContext ctx)
    {
        // Derrière nginx : le vrai IP est dans X-Forwarded-For (1er élément).
        var xff = ctx.Request.Headers["X-Forwarded-For"].ToString();
        if (!string.IsNullOrWhiteSpace(xff))
            return xff.Split(',')[0].Trim();
        var real = ctx.Request.Headers["X-Real-IP"].ToString();
        if (!string.IsNullOrWhiteSpace(real))
            return real.Trim();
        return ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }

    // Traduit method + path en action sémantique lisible côté admin.
    private static string DeriveAction(string method, string path)
    {
        path = path.ToLowerInvariant();

        // Auth
        if (path == "/api/auth/register") return "register";
        if (path == "/api/auth/login") return "login";
        if (path == "/api/auth/verify-email") return "verify_email";
        if (path == "/api/auth/resend-code") return "resend_verification_code";
        if (path == "/api/auth/refresh") return "refresh_token";
        if (path == "/api/auth/me") return "view_own_profile";

        // Users
        if (Regex.IsMatch(path, @"^/api/users/[0-9a-f-]+/profile$") && method == "GET") return "view_user_profile";
        if (Regex.IsMatch(path, @"^/api/users/[0-9a-f-]+/reviews$") && method == "GET") return "view_user_reviews";
        if (Regex.IsMatch(path, @"^/api/users/[0-9a-f-]+/reviews$") && method == "POST") return "submit_review";
        if (path == "/api/users/me/profile" && method == "PATCH") return "edit_own_profile";

        // Offers (Devises)
        if (path == "/api/offers" && method == "GET") return "browse_devises";
        if (path == "/api/offers/me") return "view_my_offers_devises";
        if (Regex.IsMatch(path, @"^/api/offers/[0-9a-f-]+$") && method == "GET") return "view_offer_devises";
        if (path == "/api/offers" && method == "POST") return "create_offer_devises";
        if (Regex.IsMatch(path, @"^/api/offers/[0-9a-f-]+$") && method == "PUT") return "update_offer_devises";
        if (Regex.IsMatch(path, @"^/api/offers/[0-9a-f-]+/cancel$")) return "cancel_offer_devises";

        // Kilos
        if (path == "/api/travel-kilo" && method == "GET") return "browse_kilos";
        if (path == "/api/travel-kilo/me") return "view_my_offers_kilos";
        if (Regex.IsMatch(path, @"^/api/travel-kilo/[0-9a-f-]+$") && method == "GET") return "view_offer_kilos";
        if (path == "/api/travel-kilo" && method == "POST") return "create_offer_kilos";
        if (Regex.IsMatch(path, @"^/api/travel-kilo/[0-9a-f-]+$") && method == "PUT") return "update_offer_kilos";

        // Fret
        if (path == "/api/boat-shipping" && method == "GET") return "browse_fret";
        if (path == "/api/boat-shipping/me") return "view_my_offers_fret";
        if (Regex.IsMatch(path, @"^/api/boat-shipping/[0-9a-f-]+$") && method == "GET") return "view_offer_fret";
        if (path == "/api/boat-shipping" && method == "POST") return "create_offer_fret";
        if (Regex.IsMatch(path, @"^/api/boat-shipping/[0-9a-f-]+$") && method == "PUT") return "update_offer_fret";

        // Fallback : "METHOD:/path/without/ids"
        return $"{method.ToLowerInvariant()}:{Regex.Replace(path, @"[0-9a-f-]{36}", "{id}")}";
    }
}
