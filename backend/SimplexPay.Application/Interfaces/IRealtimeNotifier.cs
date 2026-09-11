namespace SimplexPay.Application.Interfaces;

// Abstraction transport-agnostique pour émettre des events temps réel vers les clients.
// L'implémentation vit dans API (SignalR) pour respecter la Clean Architecture.
public interface IRealtimeNotifier
{
    Task NotifyNewOfferAsync(string category, Guid offerId, CancellationToken ct = default);
}
