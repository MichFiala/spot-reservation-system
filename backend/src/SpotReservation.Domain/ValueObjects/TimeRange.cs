using SpotReservation.Domain.Common;
using SpotReservation.Domain.Exceptions;

namespace SpotReservation.Domain.ValueObjects;

/// <summary>
/// A half-open time interval <c>[Start, End)</c> expressed in UTC. Used by reservations
/// to encapsulate validity and overlap logic.
/// </summary>
public sealed class TimeRange : ValueObject
{
    public DateTime StartUtc { get; }

    public DateTime EndUtc { get; }

    private TimeRange(DateTime startUtc, DateTime endUtc)
    {
        StartUtc = startUtc;
        EndUtc = endUtc;
    }

    public static TimeRange Create(DateTime start, DateTime end)
    {
        var startUtc = NormalizeToUtc(start, nameof(start));
        var endUtc = NormalizeToUtc(end, nameof(end));

        if (endUtc <= startUtc)
        {
            throw new InvalidTimeRangeException("Reservation end must be strictly after the start.");
        }

        return new TimeRange(startUtc, endUtc);
    }

    public TimeSpan Duration => EndUtc - StartUtc;

    /// <summary>
    /// Treats both intervals as half-open <c>[Start, End)</c> so back-to-back
    /// reservations (end == other.start) do NOT count as overlapping.
    /// </summary>
    public bool Overlaps(TimeRange other)
    {
        ArgumentNullException.ThrowIfNull(other);
        return StartUtc < other.EndUtc && other.StartUtc < EndUtc;
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return StartUtc;
        yield return EndUtc;
    }

    private static DateTime NormalizeToUtc(DateTime value, string paramName) => value.Kind switch
    {
        DateTimeKind.Utc => value,
        DateTimeKind.Local => value.ToUniversalTime(),
        DateTimeKind.Unspecified => DateTime.SpecifyKind(value, DateTimeKind.Utc),
        _ => throw new InvalidTimeRangeException($"Unsupported DateTimeKind for '{paramName}'."),
    };
}
