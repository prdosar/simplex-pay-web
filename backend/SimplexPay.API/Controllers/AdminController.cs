using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SimplexPay.Application.Features.Admin.Commands;
using SimplexPay.Application.Features.Admin.Queries;
using SimplexPay.Application.Features.Users.Commands;
using SimplexPay.Domain.Entities;

namespace SimplexPay.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Policy = "AdminOnly")]
public class AdminController(IMediator mediator) : ControllerBase
{
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats(CancellationToken ct) =>
        Ok(await mediator.Send(new GetAdminStatsQuery(), ct));

    /// <summary>Journal d'activité. Filtres : source (Web/Admin), action, ipAddress, country (ISO 2), userId, from, to (ISO date).</summary>
    [HttpGet("activity-logs")]
    public async Task<IActionResult> GetActivityLogs(
        [FromQuery] string? source,
        [FromQuery] string? action,
        [FromQuery] string? ipAddress,
        [FromQuery] string? country,
        [FromQuery] Guid? userId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        ActivityLogSource? src = Enum.TryParse<ActivityLogSource>(source, ignoreCase: true, out var s) ? s : null;
        var result = await mediator.Send(new GetActivityLogsQuery(
            Source: src,
            Action: action,
            IpAddress: ipAddress,
            Country: country,
            UserId: userId,
            From: from,
            To: to,
            Page: page,
            PageSize: pageSize
        ), ct);
        return Ok(result);
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? search,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var (items, total) = await mediator.Send(new GetAdminUsersQuery(search, pageNumber, pageSize), ct);
        int totalPages = (int)Math.Ceiling(total / (double)pageSize);
        return Ok(new
        {
            items,
            total,
            page = pageNumber,
            pageSize,
            totalPages,
        });
    }

    [HttpPatch("users/{userId:guid}/certify")]
    public async Task<IActionResult> CertifyUser(Guid userId, [FromBody] CertifyRequest req, CancellationToken ct)
    {
        try
        {
            await mediator.Send(new CertifyUserCommand(userId, req.IsCertified), ct);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    /// <summary>Admin met à jour le profil de n'importe quel user. Email non modifiable.</summary>
    [HttpPatch("users/{userId:guid}/profile")]
    public async Task<IActionResult> UpdateUserProfile(Guid userId, [FromBody] AdminUpdateUserProfileRequest req, CancellationToken ct)
    {
        var dto = await mediator.Send(new UpdateUserProfileCommand(
            UserId: userId,
            FirstName: req.FirstName,
            LastName: req.LastName,
            Country: req.Country,
            PhoneNumber: req.PhoneNumber,
            WhatsAppNumber: req.WhatsAppNumber
        ), ct);
        return Ok(dto);
    }
}

public record CertifyRequest(bool IsCertified);

public record AdminUpdateUserProfileRequest(
    string FirstName,
    string LastName,
    string Country,
    string PhoneNumber,
    string? WhatsAppNumber
);

// ─────────────────────────── Moyens de paiement (par pays) ───────────────────────────
[ApiController]
[Route("api/admin/payment-methods")]
[Authorize(Policy = "AdminOnly")]
public class AdminPaymentMethodsController(IMediator mediator) : ControllerBase
{
    /// <summary>Liste tous les pays avec le nombre de moyens de paiement rattachés.</summary>
    [HttpGet("countries")]
    public async Task<IActionResult> GetCountries(CancellationToken ct) =>
        Ok(await mediator.Send(new SimplexPay.Application.Features.Admin.Queries.GetAdminCountriesQuery(), ct));

    /// <summary>Moyens de paiement rattachés à un pays (avec IsPopular + usage).</summary>
    [HttpGet("countries/{code}")]
    public async Task<IActionResult> GetCountryPaymentMethods(string code, CancellationToken ct) =>
        Ok(await mediator.Send(new SimplexPay.Application.Features.Admin.Queries.GetAdminCountryPaymentMethodsQuery(code), ct));

    /// <summary>Liste globale des moyens de paiement (pour la sélection "rattacher un existant").</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct) =>
        Ok(await mediator.Send(new SimplexPay.Application.Features.Admin.Queries.GetAllPaymentMethodsQuery(), ct));

    /// <summary>Rattache un moyen de paiement existant à un pays.</summary>
    [HttpPost("countries/{code}/attach")]
    public async Task<IActionResult> Attach(string code, [FromBody] AttachPmRequest req, CancellationToken ct)
    {
        await mediator.Send(new SimplexPay.Application.Features.Admin.Commands.AttachPaymentMethodToCountryCommand(
            code, req.PaymentMethodId, req.IsPopular), ct);
        return NoContent();
    }

    /// <summary>Crée un nouveau moyen de paiement (typiquement un mobile money) et le rattache au pays.</summary>
    [HttpPost("countries/{code}/create")]
    public async Task<IActionResult> CreateAndAttach(string code, [FromBody] CreatePmRequest req, CancellationToken ct)
    {
        var dto = await mediator.Send(new SimplexPay.Application.Features.Admin.Commands.CreatePaymentMethodForCountryCommand(
            code, req.Name, req.Description, req.Type, req.IsPopular), ct);
        return CreatedAtAction(nameof(GetCountryPaymentMethods), new { code }, dto);
    }

    /// <summary>Détache un moyen de paiement d'un pays (ne supprime pas le PM globalement).</summary>
    [HttpDelete("countries/{code}/{pmId:guid}")]
    public async Task<IActionResult> Detach(string code, Guid pmId, CancellationToken ct)
    {
        await mediator.Send(new SimplexPay.Application.Features.Admin.Commands.DetachPaymentMethodFromCountryCommand(code, pmId), ct);
        return NoContent();
    }

    /// <summary>Bascule l'état "populaire" d'un moyen de paiement pour un pays.</summary>
    [HttpPatch("countries/{code}/{pmId:guid}/popularity")]
    public async Task<IActionResult> SetPopularity(string code, Guid pmId, [FromBody] PopularityRequest req, CancellationToken ct)
    {
        await mediator.Send(new SimplexPay.Application.Features.Admin.Commands.SetPaymentMethodPopularityCommand(
            code, pmId, req.IsPopular), ct);
        return NoContent();
    }

    /// <summary>Renomme / met à jour un moyen de paiement (affecte tous les pays où il est rattaché).</summary>
    [HttpPatch("{pmId:guid}")]
    public async Task<IActionResult> Update(Guid pmId, [FromBody] UpdatePmRequest req, CancellationToken ct)
    {
        await mediator.Send(new SimplexPay.Application.Features.Admin.Commands.UpdatePaymentMethodCommand(
            pmId, req.Name, req.Description, req.Type, req.IsActive), ct);
        return NoContent();
    }

    /// <summary>Supprime définitivement un moyen de paiement. Bloqué si des offres l'utilisent.</summary>
    [HttpDelete("{pmId:guid}")]
    public async Task<IActionResult> Delete(Guid pmId, CancellationToken ct)
    {
        await mediator.Send(new SimplexPay.Application.Features.Admin.Commands.DeletePaymentMethodCommand(pmId), ct);
        return NoContent();
    }
}

public record AttachPmRequest(Guid PaymentMethodId, bool IsPopular);
public record CreatePmRequest(string Name, string? Description, string Type, bool IsPopular);
public record PopularityRequest(bool IsPopular);
public record UpdatePmRequest(string Name, string? Description, string Type, bool IsActive);
