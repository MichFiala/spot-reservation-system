using SpotReservation.Application.Abstractions;
using SpotReservation.Application.Common.Exceptions;
using SpotReservation.Domain.Entities;
using SpotReservation.Domain.Exceptions;
using SpotReservation.Domain.Repositories;
using SpotReservation.Domain.ValueObjects;

namespace SpotReservation.Application.Features.Reservations;

internal sealed class ReservationService : IReservationService
{
    private const string AdminRole = "Admin";

    private readonly IReservationRepository _reservations;
    private readonly ISpotRepository _spots;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _clock;

    public ReservationService(
        IReservationRepository reservations,
        ISpotRepository spots,
        IUnitOfWork uow,
        ICurrentUserService currentUser,
        IDateTimeProvider clock)
    {
        _reservations = reservations;
        _spots = spots;
        _uow = uow;
        _currentUser = currentUser;
        _clock = clock;
    }

    public async Task<ReservationDto> CreateAsync(CreateReservationRequest request, CancellationToken cancellationToken = default)
    {
        var userId = RequireUserId();

        var period = TimeRange.Create(request.StartUtc, request.EndUtc);

        var spot = await _spots.GetByIdAsync(request.SpotId, cancellationToken)
            ?? throw new NotFoundException(nameof(Spot), request.SpotId);

        if (await _reservations.HasOverlapAsync(spot.Id, period, cancellationToken))
        {
            throw new ConflictException($"Spot '{spot.Id}' already has a reservation overlapping the requested time window.");
        }

        Reservation reservation;
        try
        {
            reservation = Reservation.Place(spot, userId, period, _clock.UtcNow);
        }
        catch (SpotInactiveException ex)
        {
            throw new ConflictException(ex.Message);
        }

        await _reservations.AddAsync(reservation, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);
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
        var reservations = await _reservations.ListForUserAsync(userId, cancellationToken);
        return reservations.Select(ToDto).ToList();
    }

    public async Task<IReadOnlyList<ReservationDto>> ListForSpotAsync(Guid spotId, CancellationToken cancellationToken = default)
    {
        var reservations = await _reservations.ListForSpotAsync(spotId, cancellationToken);
        return reservations.Select(ToDto).ToList();
    }

    public async Task CancelAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var reservation = await LoadAsync(id, cancellationToken);
        EnsureOwnerOrAdmin(reservation);

        var nowUtc = _clock.UtcNow;
        var cancelled = reservation switch
        {
            PendingReservation p  => (Reservation)p.Cancel(nowUtc),
            ApprovedReservation a => a.Cancel(nowUtc),
            CancelledReservation  => throw new ConflictException("Reservation is already cancelled."),
            _                     => throw new InvalidOperationException($"Unexpected reservation type: {reservation.GetType().Name}")
        };

        await _reservations.TransitionAsync(reservation, cancelled, cancellationToken);
    }

    private async Task<Reservation> LoadAsync(Guid id, CancellationToken cancellationToken)
    {
        var reservation = await _reservations.GetByIdAsync(id, cancellationToken);
        return reservation ?? throw new NotFoundException(nameof(Reservation), id);
    }

    private Guid RequireUserId()
    {
        return _currentUser.UserId
            ?? throw new UnauthorizedException("An authenticated user is required.");
    }

    private void EnsureOwnerOrAdmin(Reservation reservation)
    {
        var userId = RequireUserId();
        if (reservation.UserId != userId && !_currentUser.IsInRole(AdminRole))
        {
            throw new UnauthorizedException("You do not have access to this reservation.");
        }
    }

    private static ReservationDto ToDto(Reservation reservation) => new(
        reservation.Id,
        reservation.SpotId,
        reservation.UserId,
        reservation.Period.StartUtc,
        reservation.Period.EndUtc,
        reservation.GetType().Name.Replace("Reservation", string.Empty),
        reservation.CreatedAtUtc,
        (reservation as ApprovedReservation)?.ApprovedAtUtc,
        (reservation as CancelledReservation)?.CancelledAtUtc);
}
