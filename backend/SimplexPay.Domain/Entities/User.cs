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
    public bool EmailVerified { get; private set; } = false;
    public string? EmailVerificationCodeHash { get; private set; }
    public DateTime? EmailVerificationCodeExpiresAt { get; private set; }
    public int EmailVerificationAttempts { get; private set; } = 0;

    // 2FA email obligatoire à chaque login — code régénéré + envoyé par mail à chaque tentative
    // password-OK. Distinct des colonnes EmailVerification* qui servent au flow initial de
    // vérification du compte (statut permanent).
    public string? TwoFactorCodeHash { get; private set; }
    public DateTime? TwoFactorCodeExpiresAt { get; private set; }
    public int TwoFactorAttempts { get; private set; } = 0;

    public bool IsAdmin { get; private set; } = false;
    public bool IsCertified { get; private set; } = false;
    public decimal Rating { get; private set; } = 0;
    public int ReviewCount { get; private set; } = 0;
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

    public void SetEmailVerificationCode(string codeHash, DateTime expiresAt)
    {
        EmailVerificationCodeHash = codeHash;
        EmailVerificationCodeExpiresAt = expiresAt;
        EmailVerificationAttempts = 0;
        MarkUpdated();
    }

    public void IncrementEmailVerificationAttempts()
    {
        EmailVerificationAttempts++;
        MarkUpdated();
    }

    public void MarkEmailVerified()
    {
        EmailVerified = true;
        EmailVerificationCodeHash = null;
        EmailVerificationCodeExpiresAt = null;
        EmailVerificationAttempts = 0;
        Status = UserStatus.Active;
        MarkUpdated();
    }

    public void SetTwoFactorCode(string codeHash, DateTime expiresAt)
    {
        TwoFactorCodeHash = codeHash;
        TwoFactorCodeExpiresAt = expiresAt;
        TwoFactorAttempts = 0;
        MarkUpdated();
    }

    public void IncrementTwoFactorAttempts()
    {
        TwoFactorAttempts++;
        MarkUpdated();
    }

    public void ClearTwoFactorCode()
    {
        TwoFactorCodeHash = null;
        TwoFactorCodeExpiresAt = null;
        TwoFactorAttempts = 0;
        MarkUpdated();
    }

    public void AddRefreshToken(RefreshToken token) => _refreshTokens.Add(token);

    public void RevokeAllRefreshTokens()
    {
        foreach (var token in _refreshTokens.Where(t => t.IsActive))
            token.Revoke();
        MarkUpdated();
    }

    public void UpdateRating(decimal newRating, int reviewCount)
    {
        Rating = Math.Round(newRating, 2);
        ReviewCount = reviewCount;
        MarkUpdated();
    }

    public void IncrementTransactionCount()
    {
        TransactionCount++;
        MarkUpdated();
    }

    public void SetCertified(bool certified)
    {
        IsCertified = certified;
        MarkUpdated();
    }

    public void SetWhatsAppNumber(string number)
    {
        WhatsAppNumber = number;
        MarkUpdated();
    }

    /// <summary>Met à jour les champs modifiables du profil. L'email n'est PAS modifiable ici
    /// (contrainte métier — l'email est l'identifiant + a un statut de vérification).</summary>
    public void UpdateProfile(string firstName, string lastName, string country, string phoneNumber, string? whatsAppNumber)
    {
        FirstName = firstName;
        LastName = lastName;
        Country = country;
        PhoneNumber = phoneNumber;
        WhatsAppNumber = string.IsNullOrWhiteSpace(whatsAppNumber) ? null : whatsAppNumber;
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
