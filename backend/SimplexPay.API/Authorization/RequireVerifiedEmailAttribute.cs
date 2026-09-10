using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace SimplexPay.API.Authorization;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
public sealed class RequireVerifiedEmailAttribute : Attribute, IAuthorizationFilter
{
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var user = context.HttpContext.User;
        if (user.Identity is null || !user.Identity.IsAuthenticated)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var verified = user.FindFirst("email_verified")?.Value == "true";
        if (!verified)
        {
            context.Result = new ObjectResult(new
            {
                error = "EmailNotVerified",
                message = "Vous devez vérifier votre adresse email avant d'effectuer cette action."
            })
            {
                StatusCode = StatusCodes.Status403Forbidden
            };
        }
    }
}
