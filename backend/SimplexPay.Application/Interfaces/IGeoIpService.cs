namespace SimplexPay.Application.Interfaces;

public record GeoInfo(string? CountryCode, string? City);

public interface IGeoIpService
{
    /// <summary>Retourne le geo depuis le cache (instantané). Null si pas encore résolu.
    /// Fire-and-forget la résolution externe si absent → prochaines requêtes auront le geo.</summary>
    GeoInfo? TryGetCached(string ip);

    /// <summary>Résolution synchrone avec cache + fallback network. Timeout court.</summary>
    Task<GeoInfo?> ResolveAsync(string ip, CancellationToken ct = default);
}
