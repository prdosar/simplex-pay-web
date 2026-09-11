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

        var totalUsersTask = users.GetTotalCountAsync(ct);
        var newUsersTask = users.GetCountSinceAsync(weekAgo, ct);
        var devisesStatsTask = offers.GetStatsAsync(ct);
        var kilosStatsTask = travelKilo.GetStatsAsync(ct);
        var bateauStatsTask = boatShipping.GetStatsAsync(ct);

        await Task.WhenAll(totalUsersTask, newUsersTask, devisesStatsTask, kilosStatsTask, bateauStatsTask);

        // Agrégation des 3 catégories du marketplace.
        var (dt, da, dn) = devisesStatsTask.Result;
        var (kt, ka, kn) = kilosStatsTask.Result;
        var (bt, ba, bn) = bateauStatsTask.Result;

        return new AdminStatsDto(
            TotalUsers: totalUsersTask.Result,
            TotalOffers: dt + kt + bt,
            ActiveOffers: da + ka + ba,
            TotalTransactions: 0,
            NewUsersThisWeek: newUsersTask.Result,
            NewOffersThisWeek: dn + kn + bn
        );
    }
}
