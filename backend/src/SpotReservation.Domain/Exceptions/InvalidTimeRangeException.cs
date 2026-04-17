namespace SpotReservation.Domain.Exceptions;

public sealed class InvalidTimeRangeException : DomainException
{
    public InvalidTimeRangeException(string message) : base(message) { }
}
