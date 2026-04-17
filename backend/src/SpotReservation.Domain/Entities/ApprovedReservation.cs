using SpotReservation.Domain.ValueObjects;

namespace SpotReservation.Domain.Entities;

public sealed class ApprovedReservation : Reservation
{
    public DateTime ApprovedAtUtc { get; private set; }

    // EF Core
    private ApprovedReservation() { }

    internal ApprovedReservation(Guid id, Guid spotId, Guid userId, TimeRange period, DateTime createdAtUtc, DateTime approvedAtUtc)
        : base(id, spotId, userId, period, createdAtUtc)
    {
        ApprovedAtUtc = approvedAtUtc;
    }

    public CancelledReservation Cancel(DateTime nowUtc) =>
        new(Id, SpotId, UserId, Period, CreatedAtUtc, nowUtc);
}
