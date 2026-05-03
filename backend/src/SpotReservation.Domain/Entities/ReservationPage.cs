using System.Text.RegularExpressions;
using NetTopologySuite.Geometries;
using SpotReservation.Domain.Common;

namespace SpotReservation.Domain.Entities;

public sealed partial class ReservationPage : Entity
{
    [GeneratedRegex("^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$")]
    private static partial Regex SlugPattern();

    public new string Id { get; set; }

    public string Name { get; private set; }

    public string? Description { get; private set; }

    public MapOptions MapOptions { get; private set; } = null!;

    public OwnerPayementInformations? PayementInformations { get; private set; }

    public string? TermsAndConditionsUrl { get; private set; }

    public ContactInformations? ContactInformations { get; private set; }

    public IList<Spot> Spots { get; private set; } = [];

    private ReservationPage()
    {
        Id = string.Empty;
        Name = string.Empty;
    }

    private ReservationPage(
        string id,
        string name,
        string? description,
        MapOptions mapOptions)
    {
        Id = id;
        Name = name;
        Description = description;
        MapOptions = mapOptions;
    }

    public static ReservationPage Create(
        string id,
        string name,
        string? description,
        MapOptions mapOptions)
    {
        ValidateId(id);

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Page name is required.", nameof(name));

        return new ReservationPage(
            id.Trim(),
            name.Trim(),
            description?.Trim(),
            mapOptions);
    }

    public static ReservationPage Create(
        string id,
        string name,
        string? description,
        MapOptions mapOptions,
        ContactInformations contactInformations,
        OwnerPayementInformations ownerPayementInformations)
    {
        var reservationPage = Create(id, name, description, mapOptions);

        reservationPage.ContactInformations = contactInformations;
        reservationPage.PayementInformations = ownerPayementInformations;

        return reservationPage;
    }


    public void UpdateId(string id)
    {
        ValidateId(id);
        Id = id;
    }

    private static void ValidateId(string id)
    {
        if (string.IsNullOrWhiteSpace(id) || !SlugPattern().IsMatch(id))
            throw new ArgumentException(
                "Slug must be 3-63 characters, lowercase alphanumeric and hyphens only, cannot start or end with a hyphen.",
                nameof(id));
    }

    public void UpdateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Page name is required.", nameof(name));
        Name = name.Trim();
    }

    public void UpdateDescription(string? description)
        => Description = description?.Trim();

    public void UpdateMapSettings(MapOptions mapOptions)
    {
        MapOptions = mapOptions;
    }

    public void UpdatePaymentInformations(string iban, string currency)
    {
        if (string.IsNullOrEmpty(iban) || string.IsNullOrEmpty(currency))
            return;

        if (string.IsNullOrWhiteSpace(currency) || currency.Length != 3)
            throw new ArgumentException("Currency must be a 3-letter ISO code.", nameof(currency));


        if (iban != null && (iban.Length < 15 || iban.Length > 34))
            throw new ArgumentException("IBAN must be between 15 and 34 characters.", nameof(iban));

        PayementInformations = new OwnerPayementInformations(iban!, currency);
    }
    public void UpdateContactInformations(string contactName, string email, string phone, string? openingHoursJson)
    {
        ContactInformations = new ContactInformations(contactName, email, phone, openingHoursJson);
    }

    public void UpdateTermsUrl(string? url)
        => TermsAndConditionsUrl = url?.Trim();

    public override bool Equals(object? obj) =>
        obj is ReservationPage other && Id == other.Id;

    public override int GetHashCode() => Id.GetHashCode(StringComparison.Ordinal);
}
