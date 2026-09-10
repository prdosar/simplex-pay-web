using SimplexPay.Domain.Entities;

namespace SimplexPay.Application.Interfaces;

public interface IEmailVerificationService
{
    Task IssueCodeAsync(User user, CancellationToken ct = default);
    bool VerifyCode(User user, string providedCode);
}
