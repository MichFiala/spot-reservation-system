using SpotReservation.Domain.ValueObjects;

namespace SpotReservation.Domain.Entities;

public sealed class PendingReservation : Reservation
{
    // EF Core
    private PendingReservation() { }

    internal PendingReservation(Guid id, Guid spotId, string reservationPageId, decimal amount, TimeRange period, DateTime createdAtUtc)
        : base(id, spotId, reservationPageId, amount, period, createdAtUtc) { }

    public ApprovedReservation Approve(DateTime nowUtc) =>
        new(this, nowUtc);

    public CancelledReservation Cancel(DateTime nowUtc) =>
        new(this, nowUtc);
}
