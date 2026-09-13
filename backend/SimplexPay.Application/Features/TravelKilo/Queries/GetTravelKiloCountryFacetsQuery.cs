using MediatR;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.Application.Features.TravelKilo.Queries;

public record GetTravelKiloCountryFacetsQuery() : IRequest<IList<CountryFacet>>;

public class GetTravelKiloCountryFacetsQueryHandler(ITravelKiloOfferRepository repo)
    : IRequestHandler<GetTravelKiloCountryFacetsQuery, IList<CountryFacet>>
{
    public Task<IList<CountryFacet>> Handle(GetTravelKiloCountryFacetsQuery req, CancellationToken ct) =>
        repo.GetCountryFacetsAsync(ct);
}
