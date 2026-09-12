using MediatR;
using SimplexPay.Application.Features.Admin.Dtos;
using SimplexPay.Application.Features.Offers.Queries;
using SimplexPay.Application.Interfaces;
using SimplexPay.Domain.Entities;

namespace SimplexPay.Application.Features.Admin.Queries;

public record GetActivityLogsQuery(
    ActivityLogSource? Source = null,
    string? Action = null,
    string? IpAddress = null,
    string? Country = null,
    Guid? UserId = null,
    DateTime? From = null,
    DateTime? To = null,
    int Page = 1,
    int PageSize = 10
) : IRequest<PagedResult<ActivityLogDto>>;

public class GetActivityLogsQueryHandler(
    IActivityLogRepository logs,
    IUserRepository users
) : IRequestHandler<GetActivityLogsQuery, PagedResult<ActivityLogDto>>
{
    public async Task<PagedResult<ActivityLogDto>> Handle(GetActivityLogsQuery req, CancellationToken ct)
    {
        var pageSize = Math.Clamp(req.PageSize, 1, 100);
        var (items, total) = await logs.GetPagedAsync(
            req.Source, req.Action, req.IpAddress, req.Country, req.UserId,
            req.From, req.To, req.Page, pageSize, ct);

        // Hydrate les infos user pour les logs authentifiés. On charge en 1 seule requête.
        var userIds = items.Where(l => l.UserId.HasValue).Select(l => l.UserId!.Value).Distinct().ToList();
        var userMap = new Dictionary<Guid, Domain.Entities.User>();
        foreach (var uid in userIds)
        {
            var u = await users.GetByIdAsync(uid, ct);
            if (u is not null) userMap[uid] = u;
        }

        var dtos = items.Select(l =>
        {
            var u = l.UserId.HasValue && userMap.TryGetValue(l.UserId.Value, out var user) ? user : null;
            return ActivityLogDto.From(l, u);
        }).ToList();

        return new PagedResult<ActivityLogDto>(dtos, total, req.Page, pageSize);
    }
}
