using FluentValidation;
using MediatR;
using SimplexPay.Application.Common.Exceptions;
using SimplexPay.Application.Features.Auth.Dtos;
using SimplexPay.Application.Interfaces;

namespace SimplexPay.Application.Features.Users.Commands;

// Met à jour firstName / lastName / country / phone / whatsapp.
// L'email n'est PAS dans la command (immuable — identifiant + statut de vérification).
public record UpdateUserProfileCommand(
    Guid UserId,
    string FirstName,
    string LastName,
    string Country,
    string PhoneNumber,
    string? WhatsAppNumber
) : IRequest<UserDto>;

public class UpdateUserProfileCommandValidator : AbstractValidator<UpdateUserProfileCommand>
{
    public UpdateUserProfileCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Country).NotEmpty().Length(2, 3);
        RuleFor(x => x.PhoneNumber).NotEmpty().MaximumLength(30);
        RuleFor(x => x.WhatsAppNumber).MaximumLength(30).When(x => !string.IsNullOrWhiteSpace(x.WhatsAppNumber));
    }
}

public class UpdateUserProfileCommandHandler(IUserRepository users) : IRequestHandler<UpdateUserProfileCommand, UserDto>
{
    public async Task<UserDto> Handle(UpdateUserProfileCommand req, CancellationToken ct)
    {
        var user = await users.GetByIdAsync(req.UserId, ct)
            ?? throw new NotFoundException("User", req.UserId);

        user.UpdateProfile(
            firstName: req.FirstName.Trim(),
            lastName: req.LastName.Trim(),
            country: req.Country.ToUpperInvariant(),
            phoneNumber: req.PhoneNumber.Trim(),
            whatsAppNumber: req.WhatsAppNumber?.Trim()
        );

        await users.SaveChangesAsync(ct);
        return UserDto.From(user);
    }
}
