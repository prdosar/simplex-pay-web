using MediatR;
using SimplexPay.Application.Common.Exceptions;
using SimplexPay.Application.Features.Admin.Dtos;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.Application.Features.Admin.Queries;

// ────────── 1) Liste des pays avec le count de moyens de paiement rattachés ──────────
public record GetAdminCountriesQuery : IRequest<IList<AdminCountrySummaryDto>>;

public class GetAdminCountriesQueryHandler(IPaymentMethodAdminRepository repo)
    : IRequestHandler<GetAdminCountriesQuery, IList<AdminCountrySummaryDto>>
{
    public async Task<IList<AdminCountrySummaryDto>> Handle(GetAdminCountriesQuery req, CancellationToken ct)
    {
        var countries = await repo.GetAllCountriesWithCountsAsync(ct);
        return countries.Select(c => new AdminCountrySummaryDto(
            c.Code, c.Name, c.NameFr, c.CurrencyCode, c.Flag,
            c.PaymentMethods.Count)).ToList();
    }
}

// ────────── 2) Moyens de paiement d'un pays donné ──────────
public record GetAdminCountryPaymentMethodsQuery(string CountryCode)
    : IRequest<IList<AdminCountryPaymentMethodDto>>;

public class GetAdminCountryPaymentMethodsQueryHandler(IPaymentMethodAdminRepository repo)
    : IRequestHandler<GetAdminCountryPaymentMethodsQuery, IList<AdminCountryPaymentMethodDto>>
{
    public async Task<IList<AdminCountryPaymentMethodDto>> Handle(GetAdminCountryPaymentMethodsQuery req, CancellationToken ct)
    {
        var country = await repo.GetCountryWithPaymentMethodsAsync(req.CountryCode.ToUpperInvariant(), ct)
            ?? throw new NotFoundException("Country", req.CountryCode);

        // Comptage d'usage (offres actives) fait par PM. Une seule query groupée.
        var pmIds = country.PaymentMethods.Select(cpm => cpm.PaymentMethodId).ToList();
        var usageByPmId = new Dictionary<Guid, int>();
        foreach (var id in pmIds)
            usageByPmId[id] = await repo.CountOfferUsageAsync(id, ct);

        return country.PaymentMethods
            .OrderByDescending(cpm => cpm.IsPopular)
            .ThenBy(cpm => cpm.PaymentMethod.Name)
            .Select(cpm => new AdminCountryPaymentMethodDto(
                cpm.PaymentMethod.Id,
                cpm.PaymentMethod.Name,
                cpm.PaymentMethod.Description,
                cpm.PaymentMethod.Type.ToString(),
                cpm.PaymentMethod.IsActive,
                cpm.IsPopular,
                usageByPmId.TryGetValue(cpm.PaymentMethodId, out var count) ? count : 0
            ))
            .ToList();
    }
}

// ────────── 3) Liste globale de tous les moyens de paiement (pour la sélection "existants") ──────────
public record GetAllPaymentMethodsQuery : IRequest<IList<AdminPaymentMethodDto>>;

public class GetAllPaymentMethodsQueryHandler(IPaymentMethodAdminRepository repo)
    : IRequestHandler<GetAllPaymentMethodsQuery, IList<AdminPaymentMethodDto>>
{
    public async Task<IList<AdminPaymentMethodDto>> Handle(GetAllPaymentMethodsQuery req, CancellationToken ct)
    {
        var all = await repo.GetAllAsync(ct);
        var result = new List<AdminPaymentMethodDto>(all.Count);
        foreach (var pm in all)
        {
            var countryCount = pm.Countries.Count;
            var usage = await repo.CountOfferUsageAsync(pm.Id, ct);
            result.Add(AdminPaymentMethodDto.From(pm, countryCount, usage));
        }
        return result;
    }
}
