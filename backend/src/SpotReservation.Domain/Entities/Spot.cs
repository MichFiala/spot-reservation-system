using NetTopologySuite.Geometries;
using SpotReservation.Domain.Common;

namespace SpotReservation.Domain.Entities;

public sealed class Spot : Entity
{
    public string Name { get; private set; }

    public string? Description { get; private set; }

    public bool IsActive { get; private set; }

    public DateTime CreatedAtUtc { get; private set; }

    /// <summary>
    /// WGS-84 geographic location of the spot (SRID 4326).
    /// X = longitude, Y = latitude — the NTS convention.
    /// </summary>
    public Point Location { get; private set; }

    private Spot(Guid id, string name, string? description, bool isActive, DateTime createdAtUtc, Point location)
        : base(id)
    {
        Name = name;
        Description = description;
        IsActive = isActive;
        CreatedAtUtc = createdAtUtc;
        Location = location;
    }

    public static Spot Create(string name, string? description, DateTime nowUtc, Point location)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Spot name is required.", nameof(name));

        return new Spot(
            Guid.NewGuid(),
            name.Trim(),
            string.IsNullOrWhiteSpace(description) ? null : description.Trim(),
            isActive: true,
            DateTime.SpecifyKind(nowUtc, DateTimeKind.Utc), location);
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
