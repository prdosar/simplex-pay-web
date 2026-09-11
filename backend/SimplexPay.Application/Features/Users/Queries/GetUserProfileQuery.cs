using MediatR;
using SimplexPay.Application.Features.Users.Dtos;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.Application.Features.Users.Queries;

public record GetUserProfileQuery(Guid UserId, bool IsAuthenticated) : IRequest<UserProfileDto?>;

public class GetUserProfileQueryHandler(IUserRepository users)
    : IRequestHandler<GetUserProfileQuery, UserProfileDto?>
{
    public async Task<UserProfileDto?> Handle(GetUserProfileQuery req, CancellationToken ct)
    {
        var user = await users.GetByIdAsync(req.UserId, ct);
        return user is null ? null : UserProfileDto.From(user, req.IsAuthenticated);
    }
}
