using FluentValidation;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SimplexPay.Application.Common.Exceptions;
using SimplexPay.Application.Interfaces;
using SimplexPay.Domain.Entities;

namespace SimplexPay.Application.Features.Offers.Commands;

/// <summary>Un utilisateur demande au posteur si son offre est encore disponible.
/// Crée une notification dans la cloche + envoie un email au posteur. Message optionnel.</summary>
public record InquireOfferCommand(
    Guid OfferId,
    Guid InquirerId,
    string? Message
) : IRequest;

public class InquireOfferCommandValidator : AbstractValidator<InquireOfferCommand>
{
    public InquireOfferCommandValidator()
    {
        RuleFor(x => x.OfferId).NotEmpty();
        RuleFor(x => x.InquirerId).NotEmpty();
        RuleFor(x => x.Message).MaximumLength(500).When(x => x.Message != null);
    }
}

public class InquireOfferCommandHandler(
    IOfferRepository offerRepo,
    IUserRepository userRepo,
    INotificationRepository notifRepo,
    IEmailService email,
    IConfiguration config,
    ILogger<InquireOfferCommandHandler> logger)
    : IRequestHandler<InquireOfferCommand>
{
    public async Task Handle(InquireOfferCommand req, CancellationToken ct)
    {
        var offer = await offerRepo.GetByIdWithDetailsAsync(req.OfferId, ct)
            ?? throw new NotFoundException("Offer", req.OfferId);

        if (offer.UserId == req.InquirerId)
            throw new ConflictException("Vous ne pouvez pas contacter votre propre offre.");

        var inquirer = await userRepo.GetByIdAsync(req.InquirerId, ct)
            ?? throw new NotFoundException("User", req.InquirerId);

        var offerLabel = $"{offer.SellCurrencyCode} → {offer.BuyCurrencyCode}";
        var inquirerName = $"{inquirer.FirstName} {inquirer.LastName}".Trim();
        var messagePart = string.IsNullOrWhiteSpace(req.Message) ? "" : $"\n\n« {req.Message.Trim()} »";

        var notif = Notification.Create(
            userId: offer.UserId,
            type: "OfferInquiry",
            title: $"{inquirerName} demande si votre offre {offerLabel} est disponible",
            body: string.IsNullOrWhiteSpace(req.Message)
                ? $"{inquirerName} vous a demandé si votre offre {offerLabel} est encore active."
                : $"{inquirerName} : « {req.Message.Trim()} »",
            link: $"/mon-compte/offres/{offer.Id}/modifier"
        );
        await notifRepo.AddAsync(notif, ct);
        await notifRepo.SaveChangesAsync(ct);

        // Email — best effort (le service log les erreurs).
        var webUrl = config["Cors:Origins:0"] ?? "https://simplex-pay.com";
        var contactHtml = BuildInquiryEmail(inquirerName, inquirer.Email, inquirer.PhoneNumber, offerLabel, req.Message, webUrl);
        try
        {
            await email.SendEmailAsync(
                toEmail: offer.User.Email,
                subject: $"{inquirerName} vous a demandé si votre offre {offerLabel} est disponible",
                htmlBody: contactHtml);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[InquireOffer] Échec envoi email à {Email}", offer.User.Email);
        }
    }

    private static string BuildInquiryEmail(string inquirerName, string inquirerEmail, string inquirerPhone,
                                             string offerLabel, string? message, string webUrl)
    {
        var messageBlock = string.IsNullOrWhiteSpace(message)
            ? ""
            : $@"<div style=""background:#f8fafc;border-left:3px solid #0d9488;padding:12px 16px;margin:16px 0;color:#334155;font-size:14px;font-style:italic;"">« {System.Net.WebUtility.HtmlEncode(message.Trim())} »</div>";

        return $@"<!DOCTYPE html><html><body style=""font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a;"">
  <h2 style=""color:#0d9488;margin:0 0 12px;"">Un utilisateur vous contacte</h2>
  <p style=""color:#334155;line-height:1.5;"">
    <strong>{System.Net.WebUtility.HtmlEncode(inquirerName)}</strong> vous demande si votre offre
    <strong>{System.Net.WebUtility.HtmlEncode(offerLabel)}</strong> est encore disponible.
  </p>
  {messageBlock}
  <div style=""border-top:1px solid #e2e8f0;margin-top:20px;padding-top:16px;font-size:14px;color:#475569;"">
    <p style=""margin:4px 0;""><strong>Email :</strong> {System.Net.WebUtility.HtmlEncode(inquirerEmail)}</p>
    <p style=""margin:4px 0;""><strong>Téléphone :</strong> {System.Net.WebUtility.HtmlEncode(inquirerPhone)}</p>
  </div>
  <p style=""margin-top:24px;""><a href=""{webUrl}/fr/mon-compte"" style=""display:inline-block;background:#0d9488;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;"">Voir mes offres</a></p>
  <p style=""color:#94a3b8;font-size:12px;margin-top:24px;"">SimplexPay — plateforme sécurisée d'échange P2P.</p>
</body></html>";
    }
}
