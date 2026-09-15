using FluentValidation;
using MediatR;
using SimplexPay.Application.Common.Exceptions;
using SimplexPay.Application.Features.Admin.Dtos;
using SimplexPay.Application.Interfaces;
using SimplexPay.Domain.Entities;
using SimplexPay.Domain.Enums;

namespace SimplexPay.Application.Features.Admin.Commands;

// ────────── Rattacher un moyen de paiement existant à un pays ──────────
public record AttachPaymentMethodToCountryCommand(
    string CountryCode,
    Guid PaymentMethodId,
    bool IsPopular
) : IRequest;

public class AttachPaymentMethodToCountryCommandHandler(IPaymentMethodAdminRepository repo)
    : IRequestHandler<AttachPaymentMethodToCountryCommand>
{
    public async Task Handle(AttachPaymentMethodToCountryCommand req, CancellationToken ct)
    {
        var country = await repo.GetCountryWithPaymentMethodsAsync(req.CountryCode.ToUpperInvariant(), ct)
            ?? throw new NotFoundException("Country", req.CountryCode);

        var pm = await repo.GetByIdAsync(req.PaymentMethodId, ct)
            ?? throw new NotFoundException("PaymentMethod", req.PaymentMethodId);

        country.AttachPaymentMethod(pm.Id, req.IsPopular);
        await repo.SaveChangesAsync(ct);
    }
}

// ────────── Créer un nouveau moyen de paiement et le rattacher à un pays ──────────
public record CreatePaymentMethodForCountryCommand(
    string CountryCode,
    string Name,
    string? Description,
    string Type,          // "Cash" | "BankTransfer" | "MobileMoney" | "Other"
    bool IsPopular
) : IRequest<AdminCountryPaymentMethodDto>;

public class CreatePaymentMethodForCountryCommandValidator : AbstractValidator<CreatePaymentMethodForCountryCommand>
{
    public CreatePaymentMethodForCountryCommandValidator()
    {
        RuleFor(x => x.CountryCode).NotEmpty().Length(2, 3);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Description).MaximumLength(300).When(x => x.Description != null);
        RuleFor(x => x.Type).NotEmpty()
            .Must(t => Enum.TryParse<PaymentMethodType>(t, out _))
            .WithMessage("Type invalide. Valeurs : Cash, BankTransfer, MobileMoney, Other.");
    }
}

public class CreatePaymentMethodForCountryCommandHandler(IPaymentMethodAdminRepository repo)
    : IRequestHandler<CreatePaymentMethodForCountryCommand, AdminCountryPaymentMethodDto>
{
    public async Task<AdminCountryPaymentMethodDto> Handle(CreatePaymentMethodForCountryCommand req, CancellationToken ct)
    {
        var country = await repo.GetCountryWithPaymentMethodsAsync(req.CountryCode.ToUpperInvariant(), ct)
            ?? throw new NotFoundException("Country", req.CountryCode);

        if (!Enum.TryParse<PaymentMethodType>(req.Type, out var type))
            throw new ConflictException("Type de moyen de paiement invalide.");

        var pm = PaymentMethod.Create(req.Name.Trim(), type, string.IsNullOrWhiteSpace(req.Description) ? null : req.Description!.Trim());
        await repo.AddAsync(pm, ct);
        country.AttachPaymentMethod(pm.Id, req.IsPopular);
        await repo.SaveChangesAsync(ct);

        return new AdminCountryPaymentMethodDto(
            pm.Id, pm.Name, pm.Description, pm.Type.ToString(), pm.IsActive, req.IsPopular, OfferUsageCount: 0);
    }
}

// ────────── Détacher un moyen de paiement d'un pays ──────────
public record DetachPaymentMethodFromCountryCommand(
    string CountryCode,
    Guid PaymentMethodId
) : IRequest;

public class DetachPaymentMethodFromCountryCommandHandler(IPaymentMethodAdminRepository repo)
    : IRequestHandler<DetachPaymentMethodFromCountryCommand>
{
    public async Task Handle(DetachPaymentMethodFromCountryCommand req, CancellationToken ct)
    {
        var country = await repo.GetCountryWithPaymentMethodsAsync(req.CountryCode.ToUpperInvariant(), ct)
            ?? throw new NotFoundException("Country", req.CountryCode);

        country.DetachPaymentMethod(req.PaymentMethodId);
        await repo.SaveChangesAsync(ct);
    }
}

// ────────── Modifier la popularité d'un moyen de paiement pour un pays ──────────
public record SetPaymentMethodPopularityCommand(
    string CountryCode,
    Guid PaymentMethodId,
    bool IsPopular
) : IRequest;

public class SetPaymentMethodPopularityCommandHandler(IPaymentMethodAdminRepository repo)
    : IRequestHandler<SetPaymentMethodPopularityCommand>
{
    public async Task Handle(SetPaymentMethodPopularityCommand req, CancellationToken ct)
    {
        var country = await repo.GetCountryWithPaymentMethodsAsync(req.CountryCode.ToUpperInvariant(), ct)
            ?? throw new NotFoundException("Country", req.CountryCode);

        country.SetPaymentMethodPopularity(req.PaymentMethodId, req.IsPopular);
        await repo.SaveChangesAsync(ct);
    }
}

// ────────── Mettre à jour un moyen de paiement globalement (nom, description, type, actif) ──────────
public record UpdatePaymentMethodCommand(
    Guid PaymentMethodId,
    string Name,
    string? Description,
    string Type,
    bool IsActive
) : IRequest;

public class UpdatePaymentMethodCommandValidator : AbstractValidator<UpdatePaymentMethodCommand>
{
    public UpdatePaymentMethodCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Description).MaximumLength(300).When(x => x.Description != null);
        RuleFor(x => x.Type).NotEmpty()
            .Must(t => Enum.TryParse<PaymentMethodType>(t, out _))
            .WithMessage("Type invalide.");
    }
}

public class UpdatePaymentMethodCommandHandler(IPaymentMethodAdminRepository repo)
    : IRequestHandler<UpdatePaymentMethodCommand>
{
    public async Task Handle(UpdatePaymentMethodCommand req, CancellationToken ct)
    {
        var pm = await repo.GetByIdAsync(req.PaymentMethodId, ct)
            ?? throw new NotFoundException("PaymentMethod", req.PaymentMethodId);

        if (!Enum.TryParse<PaymentMethodType>(req.Type, out var type))
            throw new ConflictException("Type de moyen de paiement invalide.");

        pm.Update(req.Name, req.Description, type, req.IsActive);
        await repo.SaveChangesAsync(ct);
    }
}

// ────────── Supprimer complètement un moyen de paiement (bloqué si utilisé par des offres) ──────────
public record DeletePaymentMethodCommand(Guid PaymentMethodId) : IRequest;

public class DeletePaymentMethodCommandHandler(IPaymentMethodAdminRepository repo)
    : IRequestHandler<DeletePaymentMethodCommand>
{
    public async Task Handle(DeletePaymentMethodCommand req, CancellationToken ct)
    {
        var pm = await repo.GetByIdAsync(req.PaymentMethodId, ct)
            ?? throw new NotFoundException("PaymentMethod", req.PaymentMethodId);

        var usage = await repo.CountOfferUsageAsync(pm.Id, ct);
        if (usage > 0)
            throw new ConflictException($"Ce moyen de paiement est utilisé par {usage} offre(s). Suppression bloquée.");

        await repo.RemoveAsync(pm, ct);
        await repo.SaveChangesAsync(ct);
    }
}
