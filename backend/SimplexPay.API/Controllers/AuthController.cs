using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SimplexPay.Application.Features.Auth.Commands;

namespace SimplexPay.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IMediator mediator) : ControllerBase
{
    /// <summary>Inscription d'un nouvel utilisateur.</summary>
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        return Created(string.Empty, result);
    }

    /// <summary>Étape 1 — vérifie email+password, envoie un code 2FA par email.
    /// Réponse : { requiresTwoFactor, email, codeExpiryMinutes }. Pas de token à ce stade.</summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        return Ok(result);
    }

    /// <summary>Étape 2 — vérifie le code 2FA reçu par email, retourne accessToken + refreshToken.</summary>
    [HttpPost("login-verify")]
    [AllowAnonymous]
    public async Task<IActionResult> LoginVerify([FromBody] VerifyLoginCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        return Ok(result);
    }

    /// <summary>Renouvelle l'access token via le refresh token.</summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        return Ok(result);
    }

    /// <summary>Vérifie le code envoyé par email pour activer un compte.</summary>
    [HttpPost("verify-email")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        return Ok(result);
    }

    /// <summary>Renvoie un nouveau code de vérification à l'email indiqué.</summary>
    [HttpPost("resend-code")]
    [AllowAnonymous]
    public async Task<IActionResult> ResendCode([FromBody] ResendVerificationCodeCommand command, CancellationToken ct)
    {
        await mediator.Send(command, ct);
        return NoContent();
    }

    /// <summary>Retourne le profil de l'utilisateur connecté.</summary>
    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                  ?? User.FindFirst("sub")?.Value;
        return Ok(new { userId, claims = User.Claims.Select(c => new { c.Type, c.Value }) });
    }
}
