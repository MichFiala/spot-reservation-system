using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotReservation.Domain.Entities;

namespace SpotReservation.Infrastructure.Persistence.Configurations;

internal sealed class SpotConfiguration : IEntityTypeConfiguration<Spot>
{
    public void Configure(EntityTypeBuilder<Spot> builder)
    {
        builder.ToTable("spots");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).ValueGeneratedNever();

        builder.Property(s => s.Name).HasMaxLength(200).IsRequired();
        builder.HasIndex(s => s.Name);

        builder.Property(s => s.Description).HasMaxLength(2000);

        builder.Property(s => s.IsActive).IsRequired();
        builder.Property(s => s.CreatedAtUtc).IsRequired();

        builder.Property(s => s.Location)
            .HasColumnName("location")
            .HasColumnType("geometry(Point, 4326)")
            .IsRequired(false);

    }
}
