namespace SimplexPay.Domain.Entities;

/// <summary>Notification persistée pour un utilisateur (cloche + historique).
/// Le SignalR pousse l'event ; le client va chercher l'entité via l'API.</summary>
public class Notification : BaseEntity
{
    public Guid UserId { get; private set; }
    public User User { get; private set; } = default!;

    /// <summary>Type discriminant : "OfferInquiry" | "NewReview". Sert au routing/rendering côté client.</summary>
    public string Type { get; private set; } = default!;

    public string Title { get; private set; } = default!;
    public string Body { get; private set; } = default!;

    /// <summary>Lien relatif à ouvrir au clic (ex: "/mon-compte/offres/{id}"). Null si aucun.</summary>
    public string? Link { get; private set; }

    public bool IsRead { get; private set; } = false;
    public DateTime? ReadAt { get; private set; }

    private Notification() { }

    public static Notification Create(Guid userId, string type, string title, string body, string? link)
    {
        if (userId == Guid.Empty) throw new ArgumentException("UserId requis.");
        if (string.IsNullOrWhiteSpace(type)) throw new ArgumentException("Type requis.");
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Titre requis.");
        return new Notification
        {
            UserId = userId,
            Type = type,
            Title = title.Trim(),
            Body = body?.Trim() ?? string.Empty,
            Link = string.IsNullOrWhiteSpace(link) ? null : link.Trim()
        };
    }

    public void MarkRead()
    {
        if (IsRead) return;
        IsRead = true;
        ReadAt = DateTime.UtcNow;
        MarkUpdated();
    }
}
