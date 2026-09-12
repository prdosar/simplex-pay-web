using System.Collections.Concurrent;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.Infrastructure.Services;

// Résolution IP → pays/ville via ip-api.com (free, no auth, 45 req/min).
// Cache mémoire in-process avec TTL 24h. Fire-and-forget si cache miss.
public class GeoIpService : IGeoIpService
{
    private readonly HttpClient _http;
    private readonly ILogger<GeoIpService> _logger;
    private readonly ConcurrentDictionary<string, CachedGeo> _cache = new();
    private static readonly TimeSpan Ttl = TimeSpan.FromHours(24);

    public GeoIpService(IHttpClientFactory httpFactory, ILogger<GeoIpService> logger)
    {
        _http = httpFactory.CreateClient("geoip");
        _http.Timeout = TimeSpan.FromMilliseconds(1500);
        _logger = logger;
    }

    public GeoInfo? TryGetCached(string ip)
    {
        if (!_cache.TryGetValue(ip, out var cached)) return null;
        if (DateTime.UtcNow - cached.CachedAt > Ttl) { _cache.TryRemove(ip, out _); return null; }
        return cached.Info;
    }

    public async Task<GeoInfo?> ResolveAsync(string ip, CancellationToken ct = default)
    {
        var cached = TryGetCached(ip);
        if (cached is not null) return cached;

        // IP locale / privée → pas d'appel externe.
        if (IsPrivateOrLocal(ip))
        {
            var local = new GeoInfo(null, null);
            _cache[ip] = new CachedGeo(local, DateTime.UtcNow);
            return local;
        }

        try
        {
            // ip-api.com renvoie { status, countryCode, city, ... }
            var res = await _http.GetStringAsync($"http://ip-api.com/json/{ip}?fields=status,countryCode,city", ct);
            using var doc = JsonDocument.Parse(res);
            var root = doc.RootElement;
            if (root.GetProperty("status").GetString() != "success") return null;

            var info = new GeoInfo(
                root.TryGetProperty("countryCode", out var cc) ? cc.GetString() : null,
                root.TryGetProperty("city", out var city) ? city.GetString() : null
            );
            _cache[ip] = new CachedGeo(info, DateTime.UtcNow);
            return info;
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "[GeoIp] Résolution échouée pour {Ip}", ip);
            return null;
        }
    }

    private static bool IsPrivateOrLocal(string ip)
    {
        if (string.IsNullOrWhiteSpace(ip)) return true;
        if (ip == "::1" || ip.StartsWith("127.")) return true;
        // RFC1918 : 10.*, 172.16-31.*, 192.168.*
        if (ip.StartsWith("10.") || ip.StartsWith("192.168.")) return true;
        if (ip.StartsWith("172."))
        {
            var parts = ip.Split('.');
            if (parts.Length > 1 && int.TryParse(parts[1], out var b) && b >= 16 && b <= 31) return true;
        }
        return false;
    }

    private record CachedGeo(GeoInfo Info, DateTime CachedAt);
}
