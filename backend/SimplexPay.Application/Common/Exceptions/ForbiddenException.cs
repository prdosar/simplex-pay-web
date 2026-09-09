namespace SimplexPay.Application.Common.Exceptions;

public class ForbiddenException(string message = "Access denied.") : Exception(message);
