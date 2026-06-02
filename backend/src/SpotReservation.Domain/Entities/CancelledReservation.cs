namespace SpotReservation.Domain.Entities;

public sealed class CancelledReservation : Reservation
{
    public DateTime CancelledAtUtc { get; private set; }

    public override ReservationStatus Status => ReservationStatus.Cancelled;
    // EF Core
    private CancelledReservation() { }

    internal CancelledReservation(PendingReservation pendingReservation, DateTime cancelledAtUtc)
        : base(pendingReservation.Id, pendingReservation.SpotId, pendingReservation.ReservationPageId,
            pendingReservation.Amount, pendingReservation.Period, pendingReservation.CreatedAtUtc,
            pendingReservation.GuestName, pendingReservation.GuestEmail,
            pendingReservation.GuestPhone, pendingReservation.GuestNote)
    {
        CancelledAtUtc = cancelledAtUtc;
    }

    internal CancelledReservation(ApprovedReservation approvedReservation, DateTime cancelledAtUtc)
        : base(approvedReservation.Id, approvedReservation.SpotId, approvedReservation.ReservationPageId,
            approvedReservation.Amount, approvedReservation.Period, approvedReservation.CreatedAtUtc,
            approvedReservation.GuestName, approvedReservation.GuestEmail,
            approvedReservation.GuestPhone, approvedReservation.GuestNote)
    {
        CancelledAtUtc = cancelledAtUtc;
    }
}
