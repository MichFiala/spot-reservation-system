using SpotReservation.Domain.ValueObjects;

namespace SpotReservation.Domain.Entities;

public sealed class PendingReservation : Reservation
{
    // EF Core
    private PendingReservation() { }

    internal PendingReservation(Guid id, Guid spotId, Guid userId, TimeRange period, DateTime createdAtUtc)
        : base(id, spotId, userId, period, createdAtUtc) { }

    public ApprovedReservation Approve(DateTime nowUtc) =>
        new(Id, SpotId, UserId, Period, CreatedAtUtc, nowUtc);

    public CancelledReservation Cancel(DateTime nowUtc) =>
        new(Id, SpotId, UserId, Period, CreatedAtUtc, nowUtc);
}
