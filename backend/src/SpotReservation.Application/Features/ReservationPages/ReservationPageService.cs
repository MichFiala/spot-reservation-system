using SpotReservation.Application.Abstractions;
using SpotReservation.Application.Common.Exceptions;
using SpotReservation.Application.Features.Spots;
using SpotReservation.Domain.Entities;
using SpotReservation.Domain.Repositories;

namespace SpotReservation.Application.Features.ReservationPages;

internal sealed class ReservationPageService(
    IReservationPageRepository reservationPages,
    IUnitOfWork uow) : IReservationPageService
{
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
            new ContactInformations(request.ContactName!, request.ContactEmail!, request.ContactPhone!, request.OpeningHoursJson),
            new MapOptions(request.MapCenter, request.MapZoom, request.MapMinZoom, request.MapMaxZoom), 
            new OwnerPayementInformations(request.Iban, "CZK"));

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
        page.UpdatePaymentInformations(request.Iban, "CZK");
        page.UpdateOpeningHours(request.OpeningHoursJson);
        page.UpdateContact(request.ContactEmail!, request.ContactPhone!);
        page.UpdateTermsUrl(request.TermsAndConditionsUrl);

        await uow.SaveChangesAsync(cancellationToken);
        return ToDto(page);
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
        page.PayementInformations.Iban,
        page.TermsAndConditionsUrl,
        page.ContactInformations.OpeningHoursJson,
        page.ContactInformations.Email,
        page.ContactInformations.Phone,
        [.. page.Spots.Select(s => SpotService.ToDto(s))]);
}
