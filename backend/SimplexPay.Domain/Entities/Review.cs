namespace SimplexPay.Domain.Entities;

public class Review : BaseEntity
{
    public Guid ReviewerId { get; private set; }
    public User Reviewer { get; private set; } = default!;

    public Guid ReviewedUserId { get; private set; }
    public User ReviewedUser { get; private set; } = default!;

    public int Rating { get; private set; }
    public string? Comment { get; private set; }

    private Review() { }

    public static Review Create(Guid reviewerId, Guid reviewedUserId, int rating, string? comment)
    {
        if (rating < 1 || rating > 5)
            throw new ArgumentException("Rating must be between 1 and 5.");
        if (reviewerId == reviewedUserId)
            throw new ArgumentException("A user cannot review themselves.");

        return new Review
        {
            ReviewerId = reviewerId,
            ReviewedUserId = reviewedUserId,
            Rating = rating,
            Comment = string.IsNullOrWhiteSpace(comment) ? null : comment.Trim()
        };
    }

    public void Update(int rating, string? comment)
    {
        if (rating < 1 || rating > 5)
            throw new ArgumentException("Rating must be between 1 and 5.");
        Rating = rating;
        Comment = string.IsNullOrWhiteSpace(comment) ? null : comment.Trim();
        MarkUpdated();
    }
}
