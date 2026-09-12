namespace SimplexPay.Domain.Entities;

// Origine d'une requête loggée : distingue le site public/mobile ("Web") du panel admin ("Admin").
public enum ActivityLogSource
{
    Web = 0,
    Admin = 1,
}

// Log d'activité — capté par ActivityLoggingMiddleware pour chaque requête "significative"
// (mutations POST/PUT/PATCH/DELETE + GET sur les endpoints liste/détail offres).
// Endpoints ignorés : /api/countries, /hubs/*, health, favicon, etc.
public class ActivityLog
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public DateTime Timestamp { get; private set; } = DateTime.UtcNow;

    // Null si utilisateur anonyme.
    public Guid? UserId { get; private set; }

    public string IpAddress { get; private set; } = default!;        // v4=15 chars max, v6=45
    public string? UserAgent { get; private set; }
    public string Method { get; private set; } = default!;           // GET, POST, PUT, PATCH, DELETE
    public string Path { get; private set; } = default!;             // /api/offers, /api/offers/{guid}
    public string Action { get; private set; } = default!;           // sémantique : login, register, create_kilo, view_offer, browse_devises, etc.
    public int StatusCode { get; private set; }
    public ActivityLogSource Source { get; private set; }            // Web ou Admin (dérivé du path /api/admin/* ou de l'Origin)

    // Géo — remplis async par GeoIpService (peut rester null si résolution échoue/timeout).
    public string? Country { get; private set; }                     // ISO code 2 chars (FR, CA, TG)
    public string? City { get; private set; }

    private ActivityLog() { }

    public static ActivityLog Create(
        Guid? userId, string ip, string? userAgent, string method, string path,
        string action, int statusCode, ActivityLogSource source, string? country, string? city
    ) => new()
    {
        UserId = userId,
        IpAddress = ip,
        UserAgent = userAgent,
        Method = method,
        Path = path,
        Action = action,
        StatusCode = statusCode,
        Source = source,
        Country = country,
        City = city,
    };

    // Utilisé par le background enrichment si on décide de backfill les rows sans geo.
    public void SetGeo(string? country, string? city)
    {
        Country = country;
        City = city;
    }
}
