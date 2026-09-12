using System.Security.Claims;
using System.Text.RegularExpressions;
using SimplexPay.Application.Interfaces;
using SimplexPay.Domain.Entities;

namespace SimplexPay.API.Middleware;

// Middleware qui log les requêtes "significatives" en base pour audit admin.
// - Ne log pas : /api/countries, /api/currencies, /api/exchange-rates, /hubs/*,
//   health checks, static, favicon.
// - Log les mutations (POST/PUT/PATCH/DELETE) + GET sur les endpoints liste/détail offres
//   et les endpoints admin (/api/admin/*).
// - Source (Web / Admin) dérivée du path (/api/admin/* → Admin) ou de l'Origin header
//   (config Cors:AdminOrigins).
// - Ne bloque JAMAIS la requête (les erreurs de logging sont avalées et logguées côté serveur).
public class ActivityLoggingMiddleware(
    RequestDelegate next,
    ILogger<ActivityLoggingMiddleware> logger,
    IConfiguration config)
{
    private readonly HashSet<string> _adminOrigins = new(
        config.GetSection("Cors:AdminOrigins").Get<string[]>() ?? [],
        StringComparer.OrdinalIgnoreCase);

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
            var source = DeriveSource(ctx);
            var action = DeriveAction(ctx.Request.Method, ctx.Request.Path, source);

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
                source: source,
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
        if (path.StartsWith("/hubs/", StringComparison.OrdinalIgnoreCase)) return false;
        if (path.StartsWith("/swagger", StringComparison.OrdinalIgnoreCase)) return false;
        if (path.Equals("/favicon.ico", StringComparison.OrdinalIgnoreCase)) return false;
        if (!path.StartsWith("/api/", StringComparison.OrdinalIgnoreCase)) return false;

        // Admin panel : log tout /api/admin/* (GET compris pour l'audit du panel).
        if (path.StartsWith("/api/admin/", StringComparison.OrdinalIgnoreCase)) return true;

        // Log toutes les mutations
        if (method is "POST" or "PUT" or "PATCH" or "DELETE") return true;

        // GET : seulement liste + détail offres + profil user
        if (method == "GET")
            return LoggedGetPaths.Any(r => r.IsMatch(path));

        return false;
    }

    // Détermine la source : Admin si le path est /api/admin/* ou si l'Origin correspond
    // à un domaine admin déclaré (Cors:AdminOrigins). Web sinon (site public, mobile, curl).
    private ActivityLogSource DeriveSource(HttpContext ctx)
    {
        var path = ctx.Request.Path.Value ?? string.Empty;
        if (path.StartsWith("/api/admin/", StringComparison.OrdinalIgnoreCase))
            return ActivityLogSource.Admin;

        var origin = ctx.Request.Headers.Origin.ToString();
        if (!string.IsNullOrEmpty(origin) && _adminOrigins.Contains(origin))
            return ActivityLogSource.Admin;

        // Fallback : le Referer (utile si l'Origin est absent, ex: navigation même-origine).
        var referer = ctx.Request.Headers.Referer.ToString();
        if (!string.IsNullOrEmpty(referer))
        {
            foreach (var adminOrigin in _adminOrigins)
                if (referer.StartsWith(adminOrigin, StringComparison.OrdinalIgnoreCase))
                    return ActivityLogSource.Admin;
        }

        return ActivityLogSource.Web;
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
    private static string DeriveAction(string method, string path, ActivityLogSource source)
    {
        path = path.ToLowerInvariant();

        // Admin panel
        if (path == "/api/admin/stats") return "admin_view_stats";
        if (path == "/api/admin/activity-logs") return "admin_view_activity_logs";
        if (path == "/api/admin/users" && method == "GET") return "admin_list_users";
        if (Regex.IsMatch(path, @"^/api/admin/users/[0-9a-f-]+/certify$")) return "admin_certify_user";
        if (Regex.IsMatch(path, @"^/api/admin/users/[0-9a-f-]+/profile$")) return "admin_edit_user_profile";

        // Auth — préfixe si l'appel vient du panel admin (ex. login admin vs login user).
        var authPrefix = source == ActivityLogSource.Admin ? "admin_" : string.Empty;
        if (path == "/api/auth/register") return $"{authPrefix}register";
        if (path == "/api/auth/login") return $"{authPrefix}login";
        if (path == "/api/auth/verify-email") return $"{authPrefix}verify_email";
        if (path == "/api/auth/resend-code") return $"{authPrefix}resend_verification_code";
        if (path == "/api/auth/refresh") return $"{authPrefix}refresh_token";
        if (path == "/api/auth/me") return $"{authPrefix}view_own_profile";

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
