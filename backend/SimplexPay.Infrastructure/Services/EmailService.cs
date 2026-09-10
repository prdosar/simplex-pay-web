using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.Infrastructure.Services;

public class EmailService(IConfiguration configuration, ILogger<EmailService> logger) : IEmailService
{
    public async Task SendEmailAsync(string toEmail, string subject, string htmlBody, string fromName = "SimplexPay")
    {
        var smtpHost = configuration["Smtp:Host"];
        var smtpPortStr = configuration["Smtp:Port"];
        var smtpUser = configuration["Smtp:User"];
        var smtpPass = configuration["Smtp:Pass"];
        var fromEmail = configuration["Smtp:From"] ?? "noreply@simplex-pay.com";

        if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpPortStr))
        {
            logger.LogWarning("[EmailService] SMTP non configuré (Host={Host}, Port={Port}). Email non envoyé.", smtpHost, smtpPortStr);
            return;
        }

        var smtpPort = int.TryParse(smtpPortStr, out var p) ? p : 465;

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(fromName, fromEmail));
        message.To.Add(new MailboxAddress("", toEmail));
        message.Subject = subject;
        message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

        using var client = new SmtpClient();
        try
        {
            client.Timeout = 15000;
            var secureOption = smtpPort == 465 ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTls;
            await client.ConnectAsync(smtpHost, smtpPort, secureOption);
            if (!string.IsNullOrEmpty(smtpUser) && !string.IsNullOrEmpty(smtpPass))
                await client.AuthenticateAsync(smtpUser, smtpPass);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
            logger.LogInformation("[EmailService] Email envoyé à '{ToEmail}' sujet='{Subject}' via {Host}:{Port}", toEmail, subject, smtpHost, smtpPort);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[EmailService] Échec envoi email à '{ToEmail}' via {Host}:{Port}: {Message}", toEmail, smtpHost, smtpPort, ex.Message);
        }
    }
}
