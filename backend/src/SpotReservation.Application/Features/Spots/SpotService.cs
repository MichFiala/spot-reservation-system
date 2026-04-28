using SpotReservation.Application.Abstractions;
using SpotReservation.Application.Common.Exceptions;
using SpotReservation.Domain.Entities;
using SpotReservation.Domain.Repositories;

namespace SpotReservation.Application.Features.Spots;

internal sealed class SpotService(
    ISpotRepository spots,
    IUnitOfWork uow,
    IDateTimeProvider clock) : ISpotService
{
    public async Task<IReadOnlyList<SpotDto>> ListAsync(bool onlyActive, CancellationToken cancellationToken = default)
    {
        var result = await spots.ListAsync(onlyActive, cancellationToken);
        return [.. result.Select(s => ToDto(s))];
    }

    public async Task<SpotDto> GetAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var spot = await LoadAsync(id, cancellationToken);
        return ToDto(spot);
    }

    public async Task<SpotDto> CreateAsync(CreateSpotRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ValidationException("Spot name is required.");

        var spot = Spot.Create(request.Name, request.Description, request.PricePerDay, clock.UtcNow, request.Location, request.PageId);

        await spots.AddAsync(spot, cancellationToken);
        await uow.SaveChangesAsync(cancellationToken);

        return ToDto(spot);
    }

    public async Task<SpotDto> UpdateAsync(Guid id, UpdateSpotRequest request, CancellationToken cancellationToken = default)
    {
        var spot = await LoadAsync(id, cancellationToken);

        if (!string.IsNullOrWhiteSpace(request.Name))
            spot.Rename(request.Name);

        spot.UpdateDescription(request.Description);

        if (request.IsActive) spot.Activate(); else spot.Deactivate();

        await uow.SaveChangesAsync(cancellationToken);
        return ToDto(spot);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var spot = await LoadAsync(id, cancellationToken);
        spots.Remove(spot);
        await uow.SaveChangesAsync(cancellationToken);
    }

    private async Task<Spot> LoadAsync(Guid id, CancellationToken cancellationToken)
    {
        var spot = await spots.GetByIdAsync(id, cancellationToken);
        return spot ?? throw new NotFoundException(nameof(Spot), id);
    }

    public async Task<IReadOnlyList<SpotDto>> ListByPageAsync(string pageId, bool onlyActive, CancellationToken cancellationToken = default)
    {
        var result = await spots.ListByPageAsync(pageId, onlyActive, cancellationToken);
        return [.. result.Select(s => ToDto(s))];
    }

    internal static SpotDto ToDto(Spot spot) => new(
        spot.Id,
        spot.Name,
        spot.Description,
        spot.IsActive,
        spot.PricePerDay,
        spot.CreatedAtUtc,
        spot.Location,
        spot.ReservationPageId,
        spot.Reservations
            .Where(r => r is PendingReservation or ApprovedReservation)
            .SelectMany(r => GenerateDateRange(r.Period.StartUtc, r.Period.EndUtc)).ToHashSet());


    public static List<DateOnly> GenerateDateRange(DateTime from, DateTime to)
    {
        if (from > to)
            throw new ArgumentException("From musí být menší nebo rovno To");

        var dates = new List<DateOnly>();

        for (var date = from; date <= to; date = date.AddDays(1))
        {
            dates.Add(DateOnly.FromDateTime(date));
        }

        return dates;
    }
}
