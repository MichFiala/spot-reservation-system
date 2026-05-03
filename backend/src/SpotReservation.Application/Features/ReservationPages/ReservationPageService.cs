using SpotReservation.Application.Common.Exceptions;
using SpotReservation.Application.Features.Spots;
using SpotReservation.Domain.Entities;
using SpotReservation.Domain.Repositories;

namespace SpotReservation.Application.Features.ReservationPages;

internal sealed class ReservationPageService(
    IReservationPageRepository reservationPages,
    IUnitOfWork uow) : IReservationPageService
{
    public async Task<IReadOnlyList<ReservationPageSummaryDto>> ListAsync(CancellationToken cancellationToken = default)
    {
        var pages = await reservationPages.ListAsync(cancellationToken);
        return [.. pages.Select(p => new ReservationPageSummaryDto(p.Id, p.Name))];
    }

    public async Task<ReservationPageDto> GetAsync(string id, CancellationToken cancellationToken = default)
    {
        var page = await LoadAsync(id, cancellationToken);

        return ToDto(page);
    }

    public async Task<ReservationPageDto> CreateAsync(CreateReservationPageRequest request, CancellationToken cancellationToken = default)
    {
        var page = ReservationPage.Create(
            request.Id,
            request.Name,
            request.Description,
            new MapOptions(request.MapCenter, request.MapZoom, request.MapMinZoom, request.MapMaxZoom));

        await reservationPages.AddAsync(page, cancellationToken);
        await uow.SaveChangesAsync(cancellationToken);

        return ToDto(page);
    }

    public async Task<ReservationPageDto> UpdateAsync(string pageId, UpdateReservationPageRequest request, CancellationToken cancellationToken = default)
    {
        var page = await LoadAsync(pageId, cancellationToken);

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
