using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotReservation.Domain.Entities;

namespace SpotReservation.Infrastructure.Persistence.Configurations;

internal sealed class CancelledReservationConfiguration : IEntityTypeConfiguration<CancelledReservation>
{
    public void Configure(EntityTypeBuilder<CancelledReservation> builder)
    {
        builder.Property(r => r.CancelledAtUtc)
            .HasColumnName("cancelled_at_utc")
            .IsRequired();
    }
}
