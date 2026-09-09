namespace SimplexPay.Application.Common.Exceptions;

public class UnauthorizedException(string message = "Invalid credentials.") : Exception(message);
