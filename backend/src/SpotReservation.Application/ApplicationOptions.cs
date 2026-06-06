namespace SpotReservation.Application;

public sealed class ApplicationOptions
{
    public const string SectionName = "Application";

    public string BaseUrl { get; set; } = string.Empty;
}