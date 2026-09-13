using MediatR;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.Application.Features.BoatShipping.Queries;

public record GetBoatShippingCountryFacetsQuery() : IRequest<IList<CountryFacet>>;

public class GetBoatShippingCountryFacetsQueryHandler(IBoatShippingOfferRepository repo)
    : IRequestHandler<GetBoatShippingCountryFacetsQuery, IList<CountryFacet>>
{
    public Task<IList<CountryFacet>> Handle(GetBoatShippingCountryFacetsQuery req, CancellationToken ct) =>
        repo.GetCountryFacetsAsync(ct);
}
