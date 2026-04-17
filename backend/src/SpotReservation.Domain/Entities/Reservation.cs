using SpotReservation.Domain.Common;
using SpotReservation.Domain.Exceptions;
using SpotReservation.Domain.ValueObjects;

namespace SpotReservation.Domain.Entities;

public abstract class Reservation : Entity
{
    public Guid SpotId { get; protected set; }

    public Guid UserId { get; protected set; }

    public TimeRange Period { get; protected set; } = null!;

    public DateTime CreatedAtUtc { get; protected set; }

    // EF Core
    protected Reservation() { }

    protected Reservation(Guid id, Guid spotId, Guid userId, TimeRange period, DateTime createdAtUtc)
        : base(id)
    {
        SpotId = spotId;
        UserId = userId;
        Period = period;
        CreatedAtUtc = createdAtUtc;
    }

    /// <summary>
    /// Creates a new reservation for a spot. Callers are responsible for verifying
    /// absence of overlap against existing reservations (use the repository for that).
    /// </summary>
    public static PendingReservation Place(Spot spot, Guid userId, TimeRange period, DateTime nowUtc)
    {
        ArgumentNullException.ThrowIfNull(spot);
        ArgumentNullException.ThrowIfNull(period);

        if (userId == Guid.Empty)
        {
            throw new ArgumentException("User id is required.", nameof(userId));
        }

        if (!spot.IsActive)
        {
            throw new SpotInactiveException(spot.Id);
        }

        var utcNow = DateTime.SpecifyKind(nowUtc, DateTimeKind.Utc);
        if (period.EndUtc <= utcNow)
        {
            throw new InvalidTimeRangeException("Reservations must end in the future.");
        }

        return new PendingReservation(Guid.NewGuid(), spot.Id, userId, period, utcNow);
    }
}
