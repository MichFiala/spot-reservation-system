namespace SpotReservation.Application.Features.Reservations;

public sealed record ReservationDto(
    Guid Id,
    Guid SpotId,
    DateTime StartUtc,
    DateTime EndUtc,
    string Status,
    PaymentInfoDto PaymentInfoDto,
    DateTime CreatedAtUtc,
    DateTime? ApprovedAtUtc,
    DateTime? CancelledAtUtc);

public sealed record PaymentInfoDto(
    string Iban,
    decimal Amount,
    string VariableSymbol,
    string Currency);

public sealed record CreateReservationRequest(
    Guid SpotId,
    DateTime StartUtc,
    DateTime EndUtc);
