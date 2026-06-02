using SpotReservation.Domain.ValueObjects;

namespace SpotReservation.Domain.Entities;

public sealed class PendingReservation : Reservation
{
    public override ReservationStatus Status => ReservationStatus.Pending;

    // EF Core

    private PendingReservation() { }

    internal PendingReservation(Guid id, Guid spotId, string reservationPageId, decimal amount,
        TimeRange period, DateTime createdAtUtc,
        string guestName, string guestEmail, string guestPhone, string? guestNote)
        : base(id, spotId, reservationPageId, amount, period, createdAtUtc,
            guestName, guestEmail, guestPhone, guestNote) { }

    public ApprovedReservation Approve(DateTime nowUtc) =>
        new(this, nowUtc);

    public CancelledReservation Cancel(DateTime nowUtc) =>
        new(this, nowUtc);
}
