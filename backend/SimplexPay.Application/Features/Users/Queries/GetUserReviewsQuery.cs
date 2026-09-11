using MediatR;
using SimplexPay.Application.Features.Offers.Queries;
using SimplexPay.Application.Features.Users.Dtos;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.Application.Features.Users.Queries;

public record GetUserReviewsQuery(Guid UserId, int Page = 1, int PageSize = 20)
    : IRequest<PagedResult<ReviewDto>>;

public class GetUserReviewsQueryHandler(IReviewRepository reviews)
    : IRequestHandler<GetUserReviewsQuery, PagedResult<ReviewDto>>
{
    public async Task<PagedResult<ReviewDto>> Handle(GetUserReviewsQuery req, CancellationToken ct)
    {
        var pageSize = Math.Min(req.PageSize, 50);
        var (items, total) = await reviews.GetPagedByReviewedUserAsync(req.UserId, req.Page, pageSize, ct);
        var dtos = items.Select(ReviewDto.From).ToList();
        return new PagedResult<ReviewDto>(dtos, total, req.Page, pageSize);
    }
}
