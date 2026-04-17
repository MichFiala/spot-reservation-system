using SpotReservation.Domain.ValueObjects;

namespace SpotReservation.Domain.Entities;

public sealed class CancelledReservation : Reservation
{
    public DateTime CancelledAtUtc { get; private set; }

    // EF Core
    private CancelledReservation() { }

    internal CancelledReservation(Guid id, Guid spotId, Guid userId, TimeRange period, DateTime createdAtUtc, DateTime cancelledAtUtc)
        : base(id, spotId, userId, period, createdAtUtc)
    {
        CancelledAtUtc = cancelledAtUtc;
    }
}
