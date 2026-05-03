using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotReservation.Domain.Entities;

namespace SpotReservation.Infrastructure.Persistence.Configurations;

internal sealed class SpotPhotoConfiguration : IEntityTypeConfiguration<SpotPhoto>
{
    public void Configure(EntityTypeBuilder<SpotPhoto> builder)
    {
        builder.ToTable("spot_photos");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).ValueGeneratedNever();

        builder.Property(p => p.ObjectKey).HasMaxLength(500).IsRequired();

        builder.Property(p => p.SortOrder).IsRequired();

        builder.Property(p => p.UploadedAtUtc).IsRequired();

        builder.HasOne(p => p.Spot)
               .WithMany(s => s.Photos)
               .HasForeignKey(p => p.SpotId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(p => p.SpotId);
    }
}
