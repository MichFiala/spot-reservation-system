using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotReservation.Domain.Entities;

namespace SpotReservation.Infrastructure.Persistence.Configurations;

internal sealed class ApprovedReservationConfiguration : IEntityTypeConfiguration<ApprovedReservation>
{
    public void Configure(EntityTypeBuilder<ApprovedReservation> builder)
    {
        builder.Property(r => r.ApprovedAtUtc)
            .HasColumnName("approved_at_utc")
            .IsRequired();
    }
}
