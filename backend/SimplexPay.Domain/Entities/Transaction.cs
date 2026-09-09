using SimplexPay.Domain.Enums;

namespace SimplexPay.Domain.Entities;

public class Transaction : BaseEntity
{
    public Guid OfferId { get; private set; }
    public Offer Offer { get; private set; } = default!;

    public Guid BuyerId { get; private set; }
    public User Buyer { get; private set; } = default!;

    public Guid SellerId { get; private set; }
    public User Seller { get; private set; } = default!;

    public decimal Amount { get; private set; }
    public decimal Rate { get; private set; }
    public decimal TotalValue { get; private set; }
    public decimal PlatformFee { get; private set; }

    public TransactionStatus Status { get; private set; } = TransactionStatus.Initiated;
    public string? SellerPaymentProof { get; private set; }
    public string? BuyerPaymentProof { get; private set; }
    public string? DisputeReason { get; private set; }
    public DateTime? CompletedAt { get; private set; }

    private Transaction() { }

    public static Transaction Create(Guid offerId, Guid buyerId, Guid sellerId,
        decimal amount, decimal rate, decimal feePercent = 0.5m)
    {
        var total = amount * rate;
        var fee = total * (feePercent / 100);

        return new Transaction
        {
            OfferId = offerId,
            BuyerId = buyerId,
            SellerId = sellerId,
            Amount = amount,
            Rate = rate,
            TotalValue = total,
            PlatformFee = Math.Round(fee, 2)
        };
    }

    public void ConfirmBySeller(string? paymentProof = null)
    {
        if (Status != TransactionStatus.Initiated)
            throw new InvalidOperationException("Seller can only confirm an initiated transaction.");
        SellerPaymentProof = paymentProof;
        Status = TransactionStatus.SellerConfirmed;
        MarkUpdated();
    }

    public void ConfirmByBuyer(string? paymentProof = null)
    {
        if (Status != TransactionStatus.SellerConfirmed)
            throw new InvalidOperationException("Buyer must confirm after seller.");
        BuyerPaymentProof = paymentProof;
        Status = TransactionStatus.BuyerConfirmed;
        MarkUpdated();
    }

    public void Complete()
    {
        Status = TransactionStatus.Completed;
        CompletedAt = DateTime.UtcNow;
        MarkUpdated();
    }

    public void Dispute(string reason)
    {
        DisputeReason = reason;
        Status = TransactionStatus.Disputed;
        MarkUpdated();
    }
}
