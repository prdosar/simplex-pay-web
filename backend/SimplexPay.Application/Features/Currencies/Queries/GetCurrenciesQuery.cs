using MediatR;
using SimplexPay.Application.Features.Currencies.Dtos;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.Application.Features.Currencies.Queries;

public record GetCurrenciesQuery(string? Type = null) : IRequest<IList<CurrencyDto>>;

public class GetCurrenciesQueryHandler(ICurrencyRepository repo)
    : IRequestHandler<GetCurrenciesQuery, IList<CurrencyDto>>
{
    public async Task<IList<CurrencyDto>> Handle(GetCurrenciesQuery req, CancellationToken ct)
    {
        var currencies = await repo.GetCurrenciesAsync(req.Type, ct);
        return currencies.Select(CurrencyDto.From).ToList();
    }
}

public record GetCountriesQuery(string? CurrencyCode = null) : IRequest<IList<CountryDto>>;

public class GetCountriesQueryHandler(ICurrencyRepository repo)
    : IRequestHandler<GetCountriesQuery, IList<CountryDto>>
{
    public async Task<IList<CountryDto>> Handle(GetCountriesQuery req, CancellationToken ct)
    {
        var countries = await repo.GetCountriesAsync(req.CurrencyCode, ct);
        return countries.Select(CountryDto.From).ToList();
    }
}
