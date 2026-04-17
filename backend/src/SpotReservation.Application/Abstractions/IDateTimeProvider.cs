namespace SpotReservation.Application.Abstractions;

public interface IDateTimeProvider
{
    DateTime UtcNow { get; }
}
