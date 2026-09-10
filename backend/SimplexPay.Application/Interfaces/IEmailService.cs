namespace SimplexPay.Application.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string toEmail, string subject, string htmlBody, string fromName = "SimplexPay");
}
