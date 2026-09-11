using Microsoft.AspNetCore.SignalR;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.API.Hubs;

// Hub SignalR anonyme (AllowAnonymous global via l'absence d'attribut Authorize).
// Les clients s'abonnent pour recevoir des events "NewOffer" sur les 3 catégories marketplace.
public class MarketplaceHub : Hub { }

// Implémentation IRealtimeNotifier — pousse les events via IHubContext (utilisable hors Hub).
public class SignalRRealtimeNotifier(IHubContext<MarketplaceHub> hub) : IRealtimeNotifier
{
    public Task NotifyNewOfferAsync(string category, Guid offerId, CancellationToken ct = default) =>
        hub.Clients.All.SendAsync("NewOffer", new { category, offerId }, ct);
}
