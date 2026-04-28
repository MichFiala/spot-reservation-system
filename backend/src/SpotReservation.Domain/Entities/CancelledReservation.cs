using SpotReservation.Domain.ValueObjects;

namespace SpotReservation.Domain.Entities;

public sealed class CancelledReservation : Reservation
{
    public DateTime CancelledAtUtc { get; private set; }

    // EF Core
    private CancelledReservation() { }

    internal CancelledReservation(PendingReservation pendingReservation, DateTime cancelledAtUtc)
        : base(pendingReservation.Id, pendingReservation.SpotId, pendingReservation.ReservationPageId, pendingReservation.Amount, pendingReservation.Period, pendingReservation.CreatedAtUtc)
    {
        CancelledAtUtc = cancelledAtUtc;
    }

    internal CancelledReservation(ApprovedReservation approvedReservation, DateTime cancelledAtUtc)
    : base(approvedReservation.Id, approvedReservation.SpotId, approvedReservation.ReservationPageId, approvedReservation.Amount, approvedReservation.Period, approvedReservation.CreatedAtUtc)
    {
        CancelledAtUtc = cancelledAtUtc;
    }
}
