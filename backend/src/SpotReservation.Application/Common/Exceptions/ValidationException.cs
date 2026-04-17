namespace SpotReservation.Application.Common.Exceptions;

public sealed class ValidationException : Exception
{
    public ValidationException(string message) : base(message) { }

    public ValidationException(IReadOnlyDictionary<string, string[]> errors)
        : base("One or more validation errors occurred.")
    {
        Errors = errors;
    }

    public IReadOnlyDictionary<string, string[]> Errors { get; }
        = new Dictionary<string, string[]>();
}
