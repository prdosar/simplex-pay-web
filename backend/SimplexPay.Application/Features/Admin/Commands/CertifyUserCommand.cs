using MediatR;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.Application.Features.Admin.Commands;

public record CertifyUserCommand(Guid UserId, bool IsCertified) : IRequest;

public class CertifyUserCommandHandler(IUserRepository users) : IRequestHandler<CertifyUserCommand>
{
    public async Task Handle(CertifyUserCommand req, CancellationToken ct)
    {
        var user = await users.GetByIdAsync(req.UserId, ct)
            ?? throw new KeyNotFoundException("User not found.");
        user.SetCertified(req.IsCertified);
        await users.SaveChangesAsync(ct);
    }
}
