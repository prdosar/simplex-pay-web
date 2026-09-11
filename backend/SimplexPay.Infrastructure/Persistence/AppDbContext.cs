using Microsoft.EntityFrameworkCore;
using SimplexPay.Domain.Entities;

namespace SimplexPay.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<SupportedCurrency> SupportedCurrencies => Set<SupportedCurrency>();
    public DbSet<Country> Countries => Set<Country>();
    public DbSet<PaymentMethod> PaymentMethods => Set<PaymentMethod>();
    public DbSet<CountryPaymentMethod> CountryPaymentMethods => Set<CountryPaymentMethod>();
    public DbSet<Offer> Offers => Set<Offer>();
    public DbSet<OfferCountry> OfferCountries => Set<OfferCountry>();
    public DbSet<OfferPaymentMethod> OfferPaymentMethods => Set<OfferPaymentMethod>();
    public DbSet<TravelKiloOffer> TravelKiloOffers => Set<TravelKiloOffer>();
    public DbSet<BoatShippingOffer> BoatShippingOffers => Set<BoatShippingOffer>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Review> Reviews => Set<Review>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
