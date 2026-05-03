using NetTopologySuite.Geometries;
using SpotReservation.Domain.Common;

namespace SpotReservation.Domain.Entities;

public sealed class Spot : Entity
{
    public string Name { get; private set; }

    public string? Description { get; private set; }

    public bool IsActive { get; private set; }

    public DateTime CreatedAtUtc { get; private set; }

    public decimal PricePerDay { get; private set; }    

    /// <summary>
    /// WGS-84 geographic location of the spot (SRID 4326).
    /// X = longitude, Y = latitude — the NTS convention.
    /// </summary>
    public Point Location { get; private set; } = null!;

    public IList<Reservation> Reservations { get; private set; } = [];

    public IList<SpotPhoto> Photos { get; private set; } = [];

    public string ReservationPageId { get; private set; } = string.Empty;

    public ReservationPage ReservationPage { get; private set; } = null!;

    private Spot() { Name = string.Empty; }

    private Spot(Guid id, string name, string? description, bool isActive, decimal pricePerDay, DateTime createdAtUtc, Point location, string pageId)
        : base(id)
    {
        Name = name;
        Description = description;
        IsActive = isActive;
        PricePerDay = pricePerDay;
        CreatedAtUtc = createdAtUtc;
        Location = location;
        ReservationPageId = pageId;
    }

    public static Spot Create(string name, string? description, decimal pricePerDay, DateTime nowUtc, Point location, string pageId)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Spot name is required.", nameof(name));

        return new Spot(
            Guid.NewGuid(),
            name.Trim(),
            string.IsNullOrWhiteSpace(description) ? null : description.Trim(),
            isActive: true,
            pricePerDay,
            DateTime.SpecifyKind(nowUtc, DateTimeKind.Utc), location, pageId);
    }

    public void Rename(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Spot name is required.", nameof(name));

        Name = name.Trim();
    }

    public void UpdateDescription(string? description)
    {
        Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim();
    }

    public void Activate() => IsActive = true;

    public void Deactivate() => IsActive = false;

    public void SetLocation(double latitude, double longitude)
    {
        if (latitude is < -90 or > 90)
            throw new ArgumentOutOfRangeException(nameof(latitude), latitude, "Latitude must be between -90 and 90.");
        if (longitude is < -180 or > 180)
            throw new ArgumentOutOfRangeException(nameof(longitude), longitude, "Longitude must be between -180 and 180.");

        Location = new Point(longitude, latitude) { SRID = 4326 };
    }
}
