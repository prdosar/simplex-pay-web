using SimplexPay.Domain.Entities;

namespace SimplexPay.Application.Features.Admin.Dtos;

public record ActivityLogDto(
    Guid Id,
    DateTime Timestamp,
    Guid? UserId,
    string? UserFirstName,
    string? UserLastName,
    string? UserEmail,
    string IpAddress,
    string? UserAgent,
    string Method,
    string Path,
    string Action,
    int StatusCode,
    string Source,  // "Web" ou "Admin"
    string? Country,
    string? City
)
{
    public static ActivityLogDto From(ActivityLog log, User? user) => new(
        log.Id,
        log.Timestamp,
        log.UserId,
        user?.FirstName,
        user?.LastName,
        user?.Email,
        log.IpAddress,
        log.UserAgent,
        log.Method,
        log.Path,
        log.Action,
        log.StatusCode,
        log.Source.ToString(),
        log.Country,
        log.City
    );
}
