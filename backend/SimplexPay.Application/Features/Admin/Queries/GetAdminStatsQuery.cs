using MediatR;
using SimplexPay.Application.Features.Admin.Dtos;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.Application.Features.Admin.Queries;

public record GetAdminStatsQuery : IRequest<AdminStatsDto>;

public class GetAdminStatsHandler(
    IUserRepository users,
    IOfferRepository offers,
    ITravelKiloOfferRepository travelKilo,
    IBoatShippingOfferRepository boatShipping)
    : IRequestHandler<GetAdminStatsQuery, AdminStatsDto>
{
    public async Task<AdminStatsDto> Handle(GetAdminStatsQuery _, CancellationToken ct)
    {
        var weekAgo = DateTime.UtcNow.AddDays(-7);

        // Sérialisé : tous ces repos partagent le même AppDbContext scoped ;
        // Task.WhenAll parallèle throw "second operation started on this context".
        var totalUsers = await users.GetTotalCountAsync(ct);
        var newUsers = await users.GetCountSinceAsync(weekAgo, ct);
        var (dt, da, dn) = await offers.GetStatsAsync(ct);
        var (kt, ka, kn) = await travelKilo.GetStatsAsync(ct);
        var (bt, ba, bn) = await boatShipping.GetStatsAsync(ct);

        return new AdminStatsDto(
            TotalUsers: totalUsers,
            TotalOffers: dt + kt + bt,
            ActiveOffers: da + ka + ba,
            TotalTransactions: 0,
            NewUsersThisWeek: newUsers,
            NewOffersThisWeek: dn + kn + bn
        );
    }
}
