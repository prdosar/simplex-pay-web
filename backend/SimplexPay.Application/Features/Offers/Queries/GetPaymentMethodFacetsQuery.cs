using MediatR;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.Application.Features.Offers.Queries;

public record GetPaymentMethodFacetsQuery(
    string? SellCountryCode = null,
    string? Search = null,
    decimal? MinAmount = null,
    decimal? MaxAmount = null
) : IRequest<IList<PaymentMethodFacet>>;

public class GetPaymentMethodFacetsQueryHandler(IOfferRepository offerRepo)
    : IRequestHandler<GetPaymentMethodFacetsQuery, IList<PaymentMethodFacet>>
{
    public Task<IList<PaymentMethodFacet>> Handle(GetPaymentMethodFacetsQuery req, CancellationToken ct)
    {
        var filter = new OfferFilter(
            SellCountryCode: req.SellCountryCode,
            Status: "Open",
            Search: req.Search,
            MinAmount: req.MinAmount,
            MaxAmount: req.MaxAmount
        );
        return offerRepo.GetPaymentMethodFacetsAsync(filter, ct);
    }
}
