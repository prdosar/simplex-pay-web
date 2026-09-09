using MediatR;
using SimplexPay.Application.Features.Admin.Dtos;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.Application.Features.Admin.Queries;

public record GetAdminUsersQuery(string? Search, int Page, int PageSize)
    : IRequest<(IList<AdminUserDto> Items, int Total)>;

public class GetAdminUsersHandler(IUserRepository users)
    : IRequestHandler<GetAdminUsersQuery, (IList<AdminUserDto> Items, int Total)>
{
    public async Task<(IList<AdminUserDto> Items, int Total)> Handle(GetAdminUsersQuery q, CancellationToken ct)
    {
        var (items, total) = await users.GetPagedAsync(q.Search, q.Page, q.PageSize, ct);
        return (items.Select(AdminUserDto.From).ToList(), total);
    }
}
