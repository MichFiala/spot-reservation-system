using System.Globalization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Resend;
using SpotReservation.Application;
using SpotReservation.Domain.Entities;

namespace SpotReservation.Application.Features.Notifications;

public class EmailNotificationService(
    IOptions<NotificationOptions> notificationOptions,
    IOptions<ApplicationOptions> applicationOptions,
    ILogger<EmailNotificationService> logger)
{
    private readonly Dictionary<ReservationStatus, Guid> EmailTemplates = new(){
      {ReservationStatus.Pending, new Guid("c797bcb5-c610-4202-9058-b11fa1a1f2c9")},
      {ReservationStatus.Approved, new Guid("407ff780-6bfb-42e2-bb81-4686bc5c1d1c")},
      {ReservationStatus.Cancelled, new Guid("b97dd2a8-051e-4f97-823f-9c3ccfa96670")}
    };

    public async Task NotifyAsync(Reservation reservation)
    {
        try
        {
            await NotifyPrivateAsync(reservation);
        }
        catch (Exception ex)
        {
            logger.LogError(exception: ex, "NotifyAsync");   
        }
    }
    private async Task NotifyPrivateAsync(Reservation reservation)
    {
        var emailOpts = notificationOptions.Value.Email;

        IResend resend = ResendClient.Create(emailOpts.ApiKey);

        Dictionary<string, object> variables;

        var reservationUrl = BuildReservationUrl(reservation);

        variables = reservation.Status switch
        {
            ReservationStatus.Pending => PendingReservationVariables(reservation, reservationUrl),
            ReservationStatus.Approved => ApprovedReservationVariables(reservation, reservationUrl),
            ReservationStatus.Cancelled => CancelledReservationVariables(reservation, reservationUrl),
            _ => throw new InvalidDataException()
        };

        var message = new EmailMessage()
        {
            From = emailOpts.From,
            To = reservation.GuestEmail,
            Subject = reservation.Status switch
            {
                ReservationStatus.Pending => "Rezervace vytvořena",
                ReservationStatus.Approved => "Schválení rezervace",
                ReservationStatus.Cancelled => "Zrušení rezervace",
                _ => throw new InvalidDataException()
            },
            Template = new EmailMessageTemplate
            {
                TemplateId = EmailTemplates[reservation.Status],
                Variables = variables
            },
        };

        if(reservation.Status is ReservationStatus.Pending)
        {
            message.Attachments =
            [
                new EmailAttachment() {
                Filename = Path.GetFileName(new Uri(reservation.PaymentQrCodeUrl).LocalPath),
                Path = reservation.PaymentQrCodeUrl,
                ContentId = "qr-image",
                },
            ];
        }

        await resend.EmailSendAsync(message);
    }

    private string BuildReservationUrl(Reservation reservation)
    {
        var uri = new Uri(applicationOptions.Value.BaseUrl.TrimEnd('/'));
        return $"{uri.Scheme}://{reservation.ReservationPageId}.{uri.Host}/rezervace/{reservation.Id}";
    }

    public static Dictionary<string, object> ApprovedReservationVariables(Reservation reservation, string reservationUrl = "")
    {
        var cz = TimeZoneInfo.FindSystemTimeZoneById("Central European Standard Time");
        var start = TimeZoneInfo.ConvertTimeFromUtc(reservation.Period.StartUtc, cz);
        var end = TimeZoneInfo.ConvertTimeFromUtc(reservation.Period.EndUtc, cz);

        var cs = new CultureInfo("cs-CZ");

        return new Dictionary<string, object>
        {
            ["CustomerName"] = reservation.GuestName,
            ["ReservationNumber"] = reservation.VariableSymbol,
            ["ReservationDate"] = start.ToString("d. MMMM yyyy", cs) + " – " + end.ToString("d. MMMM yyyy", cs),
            ["ReservationLocation"] = reservation.Spot.Name,
            ["ReservationDescription"] = reservation.Spot.Description ?? string.Empty,
            ["ReservationUrl"] = reservationUrl,
        };
    }

    public static Dictionary<string, object> CancelledReservationVariables(Reservation reservation, string reservationUrl = "", string cancellationReason = "")
    {
        var cz = TimeZoneInfo.FindSystemTimeZoneById("Central European Standard Time");
        var start = TimeZoneInfo.ConvertTimeFromUtc(reservation.Period.StartUtc, cz);
        var end = TimeZoneInfo.ConvertTimeFromUtc(reservation.Period.EndUtc, cz);

        var cs = new CultureInfo("cs-CZ");

        return new Dictionary<string, object>
        {
            ["CustomerName"] = reservation.GuestName,
            ["ReservationNumber"] = reservation.VariableSymbol,
            ["ReservationDate"] = start.ToString("d. MMMM yyyy", cs) + " – " + end.ToString("d. MMMM yyyy", cs),
            ["ReservationLocation"] = reservation.Spot.Name,
            ["ReservationDescription"] = reservation.Spot.Description ?? string.Empty,
            ["ReservationUrl"] = reservationUrl,
            ["CancellationReason"] = cancellationReason,
        };
    }

    public static Dictionary<string, object> PendingReservationVariables(Reservation reservation, string reservationUrl = "")
    {
        var cz = TimeZoneInfo.FindSystemTimeZoneById("Central European Standard Time");
        var start = TimeZoneInfo.ConvertTimeFromUtc(reservation.Period.StartUtc, cz);
        var end = TimeZoneInfo.ConvertTimeFromUtc(reservation.Period.EndUtc, cz);

        var cs = new CultureInfo("cs-CZ");

        return new Dictionary<string, object>
        {
            ["CustomerName"] = reservation.GuestName,
            ["ReservationNumber"] = reservation.VariableSymbol,
            ["ReservationDate"] = start.ToString("d. MMMM yyyy", cs) + " – " + end.ToString("d. MMMM yyyy", cs),
            ["ReservationLocation"] = reservation.Spot.Name,
            ["ReservationDescription"] = reservation.Spot.Description ?? string.Empty,
            ["ReservationUrl"] = reservationUrl,
            ["PaymentAmount"] = reservation.Amount.ToString("N0", cs),
            ["PaymentAccountNumber"] = reservation.ReservationPage.PayementInformations?.Iban ?? string.Empty,
            ["PaymentVariableSymbol"] = reservation.VariableSymbol,
            ["PaymentDueDate"] = start.AddDays(-14).ToString("d. MMMM yyyy", cs),
        };
    }
}
