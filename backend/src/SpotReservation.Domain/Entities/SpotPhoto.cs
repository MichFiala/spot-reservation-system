using SpotReservation.Domain.Common;

namespace SpotReservation.Domain.Entities;

public sealed class SpotPhoto : Entity
{
    public Guid SpotId { get; private set; }

    public Spot Spot { get; private set; } = null!;

    public string ObjectKey { get; private set; } = string.Empty;

    public int SortOrder { get; private set; }

    public DateTime UploadedAtUtc { get; private set; }

    private SpotPhoto() { }

    public SpotPhoto(Guid id, Guid spotId, string objectKey, int sortOrder, DateTime uploadedAtUtc)
        : base(id)
    {
        SpotId = spotId;
        ObjectKey = objectKey;
        SortOrder = sortOrder;
        UploadedAtUtc = DateTime.SpecifyKind(uploadedAtUtc, DateTimeKind.Utc);
    }
}
