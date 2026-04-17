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
        return [.. result.Select(ToDto)];
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

        var spot = Spot.Create(request.Name, request.Description, clock.UtcNow, request.Location);

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

    private static SpotDto ToDto(Spot spot) => new(
        spot.Id,
        spot.Name,
        spot.Description,
        spot.IsActive,
        spot.CreatedAtUtc,
        null);
}
