using NetTopologySuite.Geometries;

namespace SpotReservation.Application.Features.Spots;
public sealed record SpotDto(
    Guid Id,
    string Name,
    string? Description,
    bool IsActive,
    DateTime CreatedAtUtc,
    Point? Location);

public sealed record CreateSpotRequest(
    string Name,
    string? Description,
    Point Location);

public sealed record UpdateSpotRequest(
    string Name,
    string? Description,
    bool IsActive,
    Point? Location);
