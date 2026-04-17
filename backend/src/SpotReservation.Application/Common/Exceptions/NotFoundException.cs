namespace SpotReservation.Application.Common.Exceptions;

public sealed class NotFoundException : Exception
{
    public NotFoundException(string resource, object key)
        : base($"{resource} with key '{key}' was not found.")
    {
        Resource = resource;
    }

    public string Resource { get; }
}
