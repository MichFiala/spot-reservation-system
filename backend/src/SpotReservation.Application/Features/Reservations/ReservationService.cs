using SpotReservation.Application.Abstractions;
using SpotReservation.Application.Common.Exceptions;
using SpotReservation.Domain.Entities;
using SpotReservation.Domain.Exceptions;
using SpotReservation.Domain.Repositories;
using SpotReservation.Domain.ValueObjects;

namespace SpotReservation.Application.Features.Reservations;

internal sealed class ReservationService(
    IReservationRepository reservations,
    ISpotRepository spots,
    IUnitOfWork uow,
    ICurrentUserService currentUser,
    IDateTimeProvider clock) : IReservationService
{
    private const string AdminRole = "Admin";

    public async Task<ReservationDto> CreateAsync(CreateReservationRequest request, CancellationToken cancellationToken = default)
    {
        // var userId = RequireUserId();

        var period = TimeRange.Create(request.StartUtc, request.EndUtc);

        var spot = await spots.GetByIdAsync(request.SpotId, cancellationToken)
            ?? throw new NotFoundException(nameof(Spot), request.SpotId);

        if (await reservations.HasOverlapAsync(spot.Id, period, cancellationToken))
        {
            throw new ConflictException($"Spot '{spot.Id}' already has a reservation overlapping the requested time window.");
        }

        Reservation reservation;
        try
        {
            reservation = Reservation.Place(spot, period, clock.UtcNow);
        }
        catch (SpotInactiveException ex)
        {
            throw new ConflictException(ex.Message);
        }

        await reservations.AddAsync(reservation, cancellationToken);
        await uow.SaveChangesAsync(cancellationToken);
        return ToDto(reservation);
    }

    public async Task<ReservationDto> GetAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var reservation = await LoadAsync(id, cancellationToken);
        EnsureOwnerOrAdmin(reservation);
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

    public async Task CancelAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var reservation = await LoadAsync(id, cancellationToken);
        EnsureOwnerOrAdmin(reservation);

        var nowUtc = clock.UtcNow;
        var cancelled = reservation switch
        {
            PendingReservation p  => (Reservation)p.Cancel(nowUtc),
            ApprovedReservation a => a.Cancel(nowUtc),
            CancelledReservation  => throw new ConflictException("Reservation is already cancelled."),
            _                     => throw new InvalidOperationException($"Unexpected reservation type: {reservation.GetType().Name}")
        };

        await reservations.TransitionAsync(reservation, cancelled, cancellationToken);
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

    private void EnsureOwnerOrAdmin(Reservation reservation)
    {
        var userId = RequireUserId();
        // if (reservation.UserId != userId && !currentUser.IsInRole(AdminRole))
        // {
        //     throw new UnauthorizedException("You do not have access to this reservation.");
        // }
    }

    private static ReservationDto ToDto(Reservation reservation) => new(
        reservation.Id,
        reservation.SpotId,
        reservation.Period.StartUtc,
        reservation.Period.EndUtc,
        reservation.GetType().Name.Replace("Reservation", string.Empty),
        new PaymentInfoDto(
            reservation.Spot.ReservationPage.PayementInformations!.Iban,
            reservation.Amount,
            reservation.VariableSymbol,
            reservation.Spot.ReservationPage.PayementInformations.Currency
        ),
        reservation.CreatedAtUtc,
        (reservation as ApprovedReservation)?.ApprovedAtUtc,
        (reservation as CancelledReservation)?.CancelledAtUtc);
}
