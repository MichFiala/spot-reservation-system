namespace SpotReservation.Application.Features.Reservations;

public sealed record ReservationDto(
    Guid Id,
    Guid SpotId,
    Guid UserId,
    DateTime StartUtc,
    DateTime EndUtc,
    string Status,
    DateTime CreatedAtUtc,
    DateTime? ApprovedAtUtc,
    DateTime? CancelledAtUtc);

public sealed record CreateReservationRequest(
    Guid SpotId,
    DateTime StartUtc,
    DateTime EndUtc);
