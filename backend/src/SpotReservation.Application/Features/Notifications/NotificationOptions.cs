namespace SpotReservation.Application.Features.Notifications;

public sealed class NotificationOptions
{
    public const string SectionName = "Notification";

    public EmailOptions Email { get; set; } = new();

    public sealed class EmailOptions
    {
        public string From { get; set; } = string.Empty;
        public string ApiKey { get; set; } = string.Empty;
    }
}
