using Microsoft.Extensions.Options;
using SpotReservation.Application.Abstractions;
using SpotReservation.Application.Common.Exceptions;
using SpotReservation.Application.Features.Notifications;
using SpotReservation.Domain.Entities;
using SpotReservation.Domain.Exceptions;
using SpotReservation.Domain.Repositories;
using SpotReservation.Domain.ValueObjects;

namespace SpotReservation.Application.Features.Reservations;

internal sealed class ReservationService(
    IReservationRepository reservations,
    IReservationPageRepository reservationPages,
    ISpotRepository spots,
    IUnitOfWork uow,
    ICurrentUserService currentUser,
    IDateTimeProvider clock,
    EmailNotificationService emailNotificationService,
    IQrPaymentService qrPaymentService,
    IOptions<ApplicationOptions> applicationOptions) : IReservationService
{
    public async Task<ReservationDto> CreateAsync(CreateReservationRequest request, CancellationToken cancellationToken = default)
    {
        var period = TimeRange.Create(request.StartUtc, request.EndUtc);

        var spot = await spots.GetByIdAsync(request.SpotId, cancellationToken)
            ?? throw new NotFoundException(nameof(Spot), request.SpotId);

        if (await reservations.HasOverlapAsync(spot.Id, period, cancellationToken))
        {
            throw new ConflictException($"Spot '{spot.Id}' already has a reservation overlapping the requested time window.");
        }

        PendingReservation reservation;
        try
        {
            reservation = Reservation.Place(spot, period, clock.UtcNow,
                request.GuestName, request.GuestEmail, request.GuestPhone, request.GuestNote);
        }
        catch (SpotInactiveException ex)
        {
            throw new ConflictException(ex.Message);
        }

        if (spot.ReservationPage.PayementInformations?.Iban is { } iban)
        {
            var relativePath = await qrPaymentService.GenerateAndUploadAsync(
                iban,
                reservation.Amount,
                "CZK",
                reservation.VariableSymbol,
                cancellationToken);

            var qrUrl = applicationOptions.Value.BaseUrl.TrimEnd('/') + relativePath;
            reservation.SetPaymentQrCodeUrl(qrUrl);
        }

        await reservations.AddAsync(reservation, cancellationToken);
        await uow.SaveChangesAsync(cancellationToken);

        await emailNotificationService.NotifyAsync(reservation);

        return ToDto(reservation);
    }

    public async Task<ReservationDto> GetAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var reservation = await LoadAsync(id, cancellationToken);

        return ToDto(reservation);
    }

    public async Task<IReadOnlyList<ReservationDto>> ListMineAsync(CancellationToken cancellationToken = default)
    {
        var userId = RequireUserId();
        var result = await reservations.ListForUserAsync(userId, cancellationToken);
        return result.Select(ToDto).ToList();
    }

    public async Task<IReadOnlyList<ReservationDto>> ListForSpotAsync(Guid spotId, CancellationToken cancellationToken = default)
    {
        var result = await reservations.ListForSpotAsync(spotId, cancellationToken);
        return result.Select(ToDto).ToList();
    }

    public async Task<IReadOnlyList<ReservationDto>> ListForPageByMonthAsync(
        string reservationPageId, int year, int month, CancellationToken cancellationToken = default)
    {
        await EnsureOwner(reservationPageId, cancellationToken);

        var result = await reservations.ListForPageAsync(reservationPageId, year, month, cancellationToken);

        return result.Select(ToDto).ToList();
    }

    public async Task ApproveAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var reservation = await LoadAsync(id, cancellationToken);

        EnsureOwner(reservation);

        if (reservation is not PendingReservation pending)
            throw new ConflictException("Only pending reservations can be approved.");

        var approved = pending.Approve(clock.UtcNow);

        await reservations.TransitionAsync(reservation, approved, cancellationToken);

        await emailNotificationService.NotifyAsync(approved);
    }

    public async Task CancelAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var reservation = await LoadAsync(id, cancellationToken);

        EnsureOwner(reservation);

        var nowUtc = clock.UtcNow;
        var cancelled = reservation switch
        {
            PendingReservation p => (Reservation)p.Cancel(nowUtc),
            ApprovedReservation a => a.Cancel(nowUtc),
            CancelledReservation => throw new ConflictException("Reservation is already cancelled."),
            _ => throw new InvalidOperationException($"Unexpected reservation type: {reservation.GetType().Name}")
        };

        await reservations.TransitionAsync(reservation, cancelled, cancellationToken);

        await emailNotificationService.NotifyAsync(cancelled);
    }

    private async Task<Reservation> LoadAsync(Guid id, CancellationToken cancellationToken)
    {
        var reservation = await reservations.GetByIdAsync(id, cancellationToken);
        return reservation ?? throw new NotFoundException(nameof(Reservation), id);
    }

    private Guid RequireUserId()
    {
        return currentUser.UserId
            ?? throw new UnauthorizedException("An authenticated user is required.");
    }

    private void EnsureOwner(Reservation reservation)
    {
        var userId = RequireUserId();

        if (reservation.ReservationPage.UserId != userId)
        {
            throw new UnauthorizedException("You do not have access to this reservation.");
        }
    }

    private async Task EnsureOwner(string reservationPageId, CancellationToken cancellationToken = default)
    {
        var userId = RequireUserId();

        bool ownsPage = await reservationPages.OwnsPageAsync(userId, reservationPageId, cancellationToken);

        if (!ownsPage)
            throw new UnauthorizedException("You do not have access to this reservation page.");
    }

    private static ReservationDto ToDto(Reservation reservation) => new(
        reservation.Id,
        reservation.SpotId,
        reservation.Spot.Name,
        reservation.Period.StartUtc,
        reservation.Period.EndUtc,
        reservation.Status,
        new PaymentInfoDto(
            reservation.ReservationPage.PayementInformations!.Iban,
            reservation.Amount,
            reservation.VariableSymbol,
            reservation.ReservationPage.PayementInformations.Currency
        ),
        new GuestInfoDto(
            reservation.GuestName,
            reservation.GuestEmail,
            reservation.GuestPhone,
            reservation.GuestNote
        ),
        reservation.PaymentQrCodeUrl,
        reservation.CreatedAtUtc,
        (reservation as ApprovedReservation)?.ApprovedAtUtc,
        (reservation as CancelledReservation)?.CancelledAtUtc);
}
