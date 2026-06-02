using SpotReservation.Application.Abstractions;
using SpotReservation.Application.Common.Exceptions;
using SpotReservation.Application.Features.Spots;
using SpotReservation.Domain.Entities;
using SpotReservation.Domain.Repositories;

namespace SpotReservation.Application.Features.ReservationPages;

public class ManageReservationPageService(
    IReservationPageRepository reservationPages,
    ICurrentUserService currentUser,
    IUnitOfWork uow)
{
    public async Task<IReadOnlyList<ReservationPageSummaryDto>> ListAsync(CancellationToken cancellationToken = default)
    {
        var userId = currentUser.UserId
            ?? throw new UnauthorizedException("An authenticated user is required.");

        var pages = await reservationPages.ListByOwnerIdAsync(userId, cancellationToken);

        return [.. pages.Select(p => new ReservationPageSummaryDto(p.Id, p.Name))];
    }

    public async Task<ReservationPageDto> GetAsync(string id, CancellationToken cancellationToken = default)
    {
        var userId = currentUser.UserId
            ?? throw new UnauthorizedException("An authenticated user is required.");

        bool ownsPage = await reservationPages.OwnsPageAsync(userId, id, cancellationToken);

        if(!ownsPage)
            throw new UnauthorizedException("You do not have permission to access this reservation page.");

        var page = await reservationPages.GetByPageAsync(id, cancellationToken) ?? throw new NotFoundException(nameof(ReservationPage), id);

        return ToDto(page);
    }

    public async Task<ReservationPageDto> CreateAsync(CreateReservationPageRequest request, CancellationToken cancellationToken = default)
    {
        var userId = currentUser.UserId
            ?? throw new UnauthorizedException("An authenticated user is required.");

        var page = ReservationPage.Create(
            request.Id,
            request.Name,
            request.Description,
            new MapOptions(request.MapCenter, request.MapZoom, request.MapMinZoom, request.MapMaxZoom),
            userId);

        await reservationPages.AddAsync(page, cancellationToken);
        await uow.SaveChangesAsync(cancellationToken);

        return ToDto(page);
    }

    public async Task<ReservationPageDto> UpdateAsync(string id, UpdateReservationPageRequest request, CancellationToken cancellationToken = default)
    {
        var userId = currentUser.UserId
            ?? throw new UnauthorizedException("An authenticated user is required.");

        bool ownsPage = await reservationPages.OwnsPageAsync(userId, id, cancellationToken);

        if(!ownsPage)
            throw new UnauthorizedException("You do not have permission to access this reservation page.");

        var page = await LoadAsync(id, cancellationToken);

        page.UpdateName(request.Name);
        page.UpdateDescription(request.Description);
        page.UpdateMapSettings(new MapOptions(request.MapCenter, request.MapZoom, request.MapMinZoom, request.MapMaxZoom));
        page.UpdatePaymentInformations(request.Iban, request.Currency);
        page.UpdateContactInformations(request.ContactName, request.ContactEmail, request.ContactPhone, request.OpeningHoursJson);
        page.UpdateTermsUrl(request.TermsAndConditionsUrl);

        await uow.SaveChangesAsync(cancellationToken);
        return ToDto(page);
    }

    public async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        var userId = currentUser.UserId
            ?? throw new UnauthorizedException("An authenticated user is required.");

        bool ownsPage = await reservationPages.OwnsPageAsync(userId, id, cancellationToken);

        if(!ownsPage)
            throw new UnauthorizedException("You do not have permission to access this reservation page.");

        var page = await LoadAsync(id, cancellationToken);
        reservationPages.Remove(page);
        await uow.SaveChangesAsync(cancellationToken);
    }

    private async Task<ReservationPage> LoadAsync(string id, CancellationToken cancellationToken)
    {
        var page = await reservationPages.GetByPageAsync(id, cancellationToken);
        
        return page ?? throw new NotFoundException(nameof(ReservationPage), id);
    }

    private static ReservationPageDto ToDto(ReservationPage page) => new(
        page.Id,
        page.Name,
        page.Description,
        page.MapOptions.Center,
        page.MapOptions.Zoom,
        page.MapOptions.MinZoom,
        page.MapOptions.MaxZoom,
        page.PayementInformations?.Iban,
        page.PayementInformations?.Currency,
        page.TermsAndConditionsUrl,
        page.ContactInformations?.OpeningHoursJson,
        page.ContactInformations?.Name,
        page.ContactInformations?.Email,
        page.ContactInformations?.Phone,
        [.. page.Spots.Where(s => s.IsActive).Select(s => SpotService.ToDto(s))]);
}