using QRCoder;
using SpotReservation.Application.Abstractions;

namespace SpotReservation.Infrastructure.Storage;

internal sealed class QrPaymentService(IFileStorage fileStorage) : IQrPaymentService
{
    public async Task<string> GenerateAndUploadAsync(
        string iban,
        decimal amount,
        string currency,
        string variableSymbol,
        CancellationToken cancellationToken = default)
    {
        var spdPayload = BuildSpdPayload(iban, amount, currency, variableSymbol);
        var pngBytes = GenerateQrPng(spdPayload);

        var objectKey = $"payment-qr/{variableSymbol}.png";

        using var stream = new MemoryStream(pngBytes);
        await fileStorage.UploadAsync(MinioFileStorage.QrBucket, objectKey, stream, "image/png", cancellationToken);

        return fileStorage.GetPublicUrl(MinioFileStorage.QrBucket, objectKey);
    }

    private static string BuildSpdPayload(string iban, decimal amount, string currency, string variableSymbol)
    {
        // Czech Short Payment Descriptor (SPD) format
        var normalizedIban = iban.Replace(" ", "");
        return $"SPD*1.0*ACC:{normalizedIban}*AM:{amount.ToString("F2", System.Globalization.CultureInfo.InvariantCulture)}*CC:{currency}*X-VS:{variableSymbol}";
    }

    private static byte[] GenerateQrPng(string payload)
    {
        using var generator = new QRCodeGenerator();
        using var data = generator.CreateQrCode(payload, QRCodeGenerator.ECCLevel.M);
        using var code = new PngByteQRCode(data);
        return code.GetGraphic(10);
    }
}
