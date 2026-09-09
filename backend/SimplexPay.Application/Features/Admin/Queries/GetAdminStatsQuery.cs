using MediatR;
using SimplexPay.Application.Features.Admin.Dtos;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.Application.Features.Admin.Queries;

public record GetAdminStatsQuery : IRequest<AdminStatsDto>;

public class GetAdminStatsHandler(IUserRepository users, IOfferRepository offers)
    : IRequestHandler<GetAdminStatsQuery, AdminStatsDto>
{
    public async Task<AdminStatsDto> Handle(GetAdminStatsQuery _, CancellationToken ct)
    {
        var weekAgo = DateTime.UtcNow.AddDays(-7);

        var totalUsersTask = users.GetTotalCountAsync(ct);
        var newUsersTask = users.GetCountSinceAsync(weekAgo, ct);
        var offerStatsTask = offers.GetStatsAsync(ct);

        await Task.WhenAll(totalUsersTask, newUsersTask, offerStatsTask);

        var (totalOffers, activeOffers, newOffersThisWeek) = offerStatsTask.Result;

        return new AdminStatsDto(
            TotalUsers: totalUsersTask.Result,
            TotalOffers: totalOffers,
            ActiveOffers: activeOffers,
            TotalTransactions: 0,
            NewUsersThisWeek: newUsersTask.Result,
            NewOffersThisWeek: newOffersThisWeek
        );
    }
}
