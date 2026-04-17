namespace SpotReservation.Domain.Exceptions;

public sealed class ReservationOverlapException : DomainException
{
    public ReservationOverlapException(Guid spotId)
        : base($"Spot '{spotId}' already has a reservation overlapping the requested time window.")
    {
        SpotId = spotId;
    }

    public Guid SpotId { get; }
}
