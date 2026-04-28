namespace SpotReservation.Domain.Entities;

public sealed class ApprovedReservation : Reservation
{
    public DateTime ApprovedAtUtc { get; private set; }

    // EF Core
    private ApprovedReservation() { }

    internal ApprovedReservation(PendingReservation pendingReservation, DateTime approvedAtUtc)
        : base(pendingReservation.Id, pendingReservation.SpotId, pendingReservation.ReservationPageId, pendingReservation.Amount, pendingReservation.Period, pendingReservation.CreatedAtUtc)
    {
        ApprovedAtUtc = approvedAtUtc;
    }   

    public CancelledReservation Cancel(DateTime nowUtc) =>
        new(this, nowUtc);
}
