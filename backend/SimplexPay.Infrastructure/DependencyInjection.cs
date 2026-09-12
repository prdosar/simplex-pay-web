using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SimplexPay.Application.Interfaces;
using SimplexPay.Infrastructure.Persistence;
using SimplexPay.Infrastructure.Repositories;
using SimplexPay.Infrastructure.Services;

namespace SimplexPay.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(config.GetConnectionString("DefaultConnection"),
                npgsql => npgsql.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)));

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IOfferRepository, OfferRepository>();
        services.AddScoped<ITravelKiloOfferRepository, TravelKiloOfferRepository>();
        services.AddScoped<IBoatShippingOfferRepository, BoatShippingOfferRepository>();
        services.AddScoped<IReviewRepository, ReviewRepository>();
        services.AddScoped<ICurrencyRepository, CurrencyRepository>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddSingleton<IPasswordHasher, PasswordHasherService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IEmailVerificationService, EmailVerificationService>();

        services.AddMemoryCache();
        services.AddHttpClient("ExchangeRates", c =>
        {
            c.Timeout = TimeSpan.FromSeconds(6);
            c.DefaultRequestHeaders.UserAgent.ParseAdd("SimplexPay/1.0");
        });
        services.AddScoped<IExchangeRateService, ExchangeRateService>();

        // Activity logging + geolocation IP (cache in-memory partagé).
        services.AddScoped<IActivityLogRepository, ActivityLogRepository>();
        services.AddHttpClient("geoip", c =>
        {
            c.DefaultRequestHeaders.UserAgent.ParseAdd("SimplexPay/1.0");
        });
        services.AddSingleton<IGeoIpService, GeoIpService>();

        return services;
    }
}
