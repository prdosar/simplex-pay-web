namespace SimplexPay.Domain.Enums;

public enum TransactionStatus
{
    Initiated,
    SellerConfirmed,
    BuyerConfirmed,
    Completed,
    Disputed,
    Cancelled
}
