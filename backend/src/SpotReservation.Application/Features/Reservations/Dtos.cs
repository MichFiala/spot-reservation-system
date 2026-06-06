using SpotReservation.Domain.Entities;

namespace SpotReservation.Application.Features.Reservations;

public sealed record ReservationDto(
    Guid Id,
    Guid SpotId,
    string SpotName,
    DateTime StartUtc,
    DateTime EndUtc,
    ReservationStatus Status,
    PaymentInfoDto PaymentInfoDto,
    GuestInfoDto GuestInfo,
    string PaymentQrCodeUrl,
    DateTime CreatedAtUtc,
    DateTime? ApprovedAtUtc,
    DateTime? CancelledAtUtc);

public sealed record GuestInfoDto(
    string Name,
    string Email,
    string Phone,
    string? Note);

public sealed record PaymentInfoDto(
    string Iban,
    decimal Amount,
    string VariableSymbol,
    string Currency);

public sealed record CreateReservationRequest(
    Guid SpotId,
    DateTime StartUtc,
    DateTime EndUtc,
    string GuestName,
    string GuestEmail,
    string GuestPhone,
    string? GuestNote);
