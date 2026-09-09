namespace SimplexPay.Domain.Entities;

public class RefreshToken : BaseEntity
{
    public Guid UserId { get; private set; }
    public User User { get; private set; } = default!;
    public string Token { get; private set; } = default!;
    public DateTime ExpiresAt { get; private set; }
    public bool IsRevoked { get; private set; }

    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsActive => !IsRevoked && !IsExpired;

    private RefreshToken() { }

    public static RefreshToken Create(Guid userId, string token, int expiryDays) =>
        new() { UserId = userId, Token = token, ExpiresAt = DateTime.UtcNow.AddDays(expiryDays) };

    public void Revoke()
    {
        IsRevoked = true;
        MarkUpdated();
    }
}
