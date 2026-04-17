namespace SpotReservation.Domain.Exceptions;

public sealed class SpotInactiveException : DomainException
{
    public SpotInactiveException(Guid spotId)
        : base($"Spot '{spotId}' is inactive and cannot be reserved.")
    {
        SpotId = spotId;
    }

    public Guid SpotId { get; }
}
