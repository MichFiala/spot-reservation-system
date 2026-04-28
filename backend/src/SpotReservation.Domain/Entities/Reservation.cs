using SpotReservation.Domain.Common;
using SpotReservation.Domain.Exceptions;
using SpotReservation.Domain.ValueObjects;

namespace SpotReservation.Domain.Entities;

public abstract class Reservation : Entity
{

    public TimeRange Period { get; protected set; } = null!;

    public DateTime CreatedAtUtc { get; protected set; }

    public Guid SpotId { get; protected set; }
    public Spot Spot { get; protected set; } = null!;

    public string ReservationPageId { get; private set; } = string.Empty;
    public ReservationPage ReservationPage { get; private set; } = null!;

    public decimal Amount { get; private set; }

    public string VariableSymbol { get; private set; } = string.Empty;

    // EF Core
    protected Reservation() { }

    protected Reservation(Guid id, Guid spotId, string reservationPageId, decimal amount, TimeRange period, DateTime createdAtUtc)
        : base(id)
    {
        SpotId = spotId;
        ReservationPageId = reservationPageId;
        Amount = amount;
        Period = period;
        CreatedAtUtc = createdAtUtc;

        var bytes = id.ToByteArray();
        var number = Math.Abs(BitConverter.ToInt64(bytes, 0)) % 10_000_000_000L;
        VariableSymbol = number.ToString("D10");
    }

    /// <summary>
    /// Creates a new reservation for a spot. Callers are responsible for verifying
    /// absence of overlap against existing reservations (use the repository for that).
    /// </summary>
    public static PendingReservation Place(Spot spot, TimeRange period, DateTime nowUtc)
    {
        ArgumentNullException.ThrowIfNull(spot);
        ArgumentNullException.ThrowIfNull(period);

        if (!spot.IsActive)
        {
            throw new SpotInactiveException(spot.Id);
        }

        var utcNow = DateTime.SpecifyKind(nowUtc, DateTimeKind.Utc);
        if (period.EndUtc <= utcNow)
        {
            throw new InvalidTimeRangeException("Reservations must end in the future.");
        }

        return new PendingReservation(Guid.NewGuid(), spot.Id, spot.ReservationPageId, CalculateAmount(spot, period), period, utcNow);
    }

    private static decimal CalculateAmount(Spot spot, TimeRange period)
    {
        var days = (int)Math.Ceiling((period.EndUtc - period.StartUtc).TotalDays) + 1;
        return days * spot.PricePerDay;
    }
}
