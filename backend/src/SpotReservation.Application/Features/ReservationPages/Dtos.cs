using NetTopologySuite.Geometries;
using SpotReservation.Application.Features.Spots;

namespace SpotReservation.Application.Features.ReservationPages;

public sealed record ReservationPageDto(
    string Id,
    string Name,
    string? Description,
    Point? MapCenter,
    int MapZoom,
    int MapMinZoom,
    int MapMaxZoom,
    string? Iban,
    string? Currency,
    string? TermsAndConditionsUrl,
    string? OpeningHoursJson,
    string? ContactName,
    string? ContactEmail,
    string? ContactPhone,
    IReadOnlyCollection<SpotDto> Spots);

public sealed record UpdateReservationPageRequest(
    string Name,
    string? Description,
    string? Address,
    Point? AddressLocation,
    Point? MapCenter,
    int MapZoom,
    int MapMinZoom,
    int MapMaxZoom,
    decimal PricePerDay,
    string Iban,
    string Currency,
    string? TermsAndConditionsUrl,
    string? OpeningHoursJson,
    string ContactName,
    string ContactEmail,
    string ContactPhone);

public sealed record ReservationPageSummaryDto(string Id, string Name);

public sealed record CreateReservationPageRequest(
    string Id,
    string Name,
    string? Description,
    Point? MapCenter,
    int MapZoom,
    int MapMinZoom,
    int MapMaxZoom);
