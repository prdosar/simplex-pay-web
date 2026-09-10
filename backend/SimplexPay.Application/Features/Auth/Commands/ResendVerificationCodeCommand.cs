using FluentValidation;
using MediatR;
using SimplexPay.Application.Common.Exceptions;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.Application.Features.Auth.Commands;

public record ResendVerificationCodeCommand(string Email) : IRequest<Unit>;

public class ResendVerificationCodeCommandValidator : AbstractValidator<ResendVerificationCodeCommand>
{
    public ResendVerificationCodeCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
    }
}

public class ResendVerificationCodeCommandHandler(
    IUserRepository userRepo,
    IEmailVerificationService emailVerification
) : IRequestHandler<ResendVerificationCodeCommand, Unit>
{
    public async Task<Unit> Handle(ResendVerificationCodeCommand request, CancellationToken ct)
    {
        var user = await userRepo.GetByEmailAsync(request.Email, ct);

        // Ne pas révéler si l'email existe ou non
        if (user is null || user.EmailVerified) return Unit.Value;

        await emailVerification.IssueCodeAsync(user, ct);
        await userRepo.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
