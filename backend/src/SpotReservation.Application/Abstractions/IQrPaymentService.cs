namespace SpotReservation.Application.Abstractions;

public interface IQrPaymentService
{
    /// <summary>
    /// Generates a QR payment image (Czech SPD format), uploads it, and returns the public URL.
    /// </summary>
    Task<string> GenerateAndUploadAsync(
        string iban,
        decimal amount,
        string currency,
        string variableSymbol,
        CancellationToken cancellationToken = default);
}
