using SimplexPay.Domain.Enums;

namespace SimplexPay.Domain.Entities;

public class User : BaseEntity
{
    public string FirstName { get; private set; } = default!;
    public string LastName { get; private set; } = default!;
    public string Email { get; private set; } = default!;
    public string PasswordHash { get; private set; } = default!;
    public string PhoneNumber { get; private set; } = default!;
    public string? WhatsAppNumber { get; private set; }
    public string Country { get; private set; } = default!;
    public UserStatus Status { get; private set; } = UserStatus.PendingVerification;
    public bool IsAdmin { get; private set; } = false;
    public decimal Rating { get; private set; } = 0;
    public int TransactionCount { get; private set; } = 0;

    private readonly List<Offer> _offers = [];
    private readonly List<Review> _reviewsReceived = [];
    private readonly List<RefreshToken> _refreshTokens = [];

    public IReadOnlyCollection<Offer> Offers => _offers.AsReadOnly();
    public IReadOnlyCollection<Review> ReviewsReceived => _reviewsReceived.AsReadOnly();
    public IReadOnlyCollection<RefreshToken> RefreshTokens => _refreshTokens.AsReadOnly();

    private User() { }

    public static User Create(string firstName, string lastName, string email,
        string passwordHash, string phoneNumber, string country) =>
        new()
        {
            FirstName = firstName,
            LastName = lastName,
            Email = email.ToLowerInvariant(),
            PasswordHash = passwordHash,
            PhoneNumber = phoneNumber,
            Country = country
        };

    public void Activate()
    {
        Status = UserStatus.Active;
        MarkUpdated();
    }

    public void AddRefreshToken(RefreshToken token) => _refreshTokens.Add(token);

    public void RevokeAllRefreshTokens()
    {
        foreach (var token in _refreshTokens.Where(t => t.IsActive))
            token.Revoke();
        MarkUpdated();
    }

    public void UpdateRating(decimal newRating)
    {
        Rating = Math.Round(newRating, 2);
        MarkUpdated();
    }

    public void IncrementTransactionCount()
    {
        TransactionCount++;
        MarkUpdated();
    }

    public void SetWhatsAppNumber(string number)
    {
        WhatsAppNumber = number;
        MarkUpdated();
    }

    public void GrantAdmin()
    {
        IsAdmin = true;
        MarkUpdated();
    }

    public void RevokeAdmin()
    {
        IsAdmin = false;
        MarkUpdated();
    }
}
