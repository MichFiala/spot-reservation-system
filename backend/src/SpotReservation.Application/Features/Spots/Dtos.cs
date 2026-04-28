using NetTopologySuite.Geometries;

namespace SpotReservation.Application.Features.Spots;
public sealed record SpotDto(
    Guid Id,
    string Name,
    string? Description,
    bool IsActive,
    decimal PricePerDay,
    DateTime CreatedAtUtc,
    Point? Location,
    string PageId,
    IReadOnlyCollection<DateOnly> OccupiedDates);

public sealed record CreateSpotRequest(
    string Name,
    string? Description,
    decimal PricePerDay,
    Point Location,
    string PageId);

public sealed record UpdateSpotRequest(
    string Name,
    string? Description,
    bool IsActive,
    Point? Location);
