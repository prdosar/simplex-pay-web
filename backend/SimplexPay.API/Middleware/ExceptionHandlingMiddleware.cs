using FluentValidation;
using SimplexPay.Application.Common.Exceptions;
using System.Text.Json;

namespace SimplexPay.API.Middleware;

public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext ctx)
    {
        try
        {
            await next(ctx);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await HandleAsync(ctx, ex);
        }
    }

    private static async Task HandleAsync(HttpContext ctx, Exception ex)
    {
        var (status, code, message) = ex switch
        {
            ValidationException ve => (400, "VALIDATION_ERROR",
                string.Join("; ", ve.Errors.Select(e => e.ErrorMessage))),
            ConflictException    => (409, "CONFLICT",     ex.Message),
            NotFoundException    => (404, "NOT_FOUND",    ex.Message),
            UnauthorizedException=> (401, "UNAUTHORIZED", ex.Message),
            ForbiddenException   => (403, "FORBIDDEN",    ex.Message),
            _                    => (500, "SERVER_ERROR", "Une erreur inattendue s'est produite.")
        };

        ctx.Response.StatusCode = status;
        ctx.Response.ContentType = "application/json";

        await ctx.Response.WriteAsync(JsonSerializer.Serialize(new
        {
            code,
            message,
            timestamp = DateTime.UtcNow
        }));
    }
}
