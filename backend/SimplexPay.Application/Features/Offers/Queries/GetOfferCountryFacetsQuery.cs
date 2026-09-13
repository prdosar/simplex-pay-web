using MediatR;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.Application.Features.Offers.Queries;

public record GetOfferCountryFacetsQuery() : IRequest<IList<CountryFacet>>;

public class GetOfferCountryFacetsQueryHandler(IOfferRepository offerRepo)
    : IRequestHandler<GetOfferCountryFacetsQuery, IList<CountryFacet>>
{
    public Task<IList<CountryFacet>> Handle(GetOfferCountryFacetsQuery req, CancellationToken ct) =>
        offerRepo.GetCountryFacetsAsync(ct);
}
