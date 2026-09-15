using SimplexPay.Domain.Entities;

namespace SimplexPay.Application.Interfaces;

/// <summary>Opérations admin sur les moyens de paiement (CRUD + rattachement par pays).
/// Séparé de <see cref="ICurrencyRepository"/> qui reste read-only pour l'UI publique.</summary>
public interface IPaymentMethodAdminRepository
{
    Task<IList<PaymentMethod>> GetAllAsync(CancellationToken ct);
    Task<PaymentMethod?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<Country?> GetCountryWithPaymentMethodsAsync(string countryCode, CancellationToken ct);
    Task<IList<Country>> GetAllCountriesWithCountsAsync(CancellationToken ct);

    /// <summary>Nombre d'offres actives qui utilisent ce PM. Sert au warning de suppression.</summary>
    Task<int> CountOfferUsageAsync(Guid paymentMethodId, CancellationToken ct);

    Task AddAsync(PaymentMethod paymentMethod, CancellationToken ct);
    Task RemoveAsync(PaymentMethod paymentMethod, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}
