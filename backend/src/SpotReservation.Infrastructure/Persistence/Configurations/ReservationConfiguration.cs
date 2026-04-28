using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotReservation.Domain.Entities;

namespace SpotReservation.Infrastructure.Persistence.Configurations;

internal sealed class ReservationConfiguration : IEntityTypeConfiguration<Reservation>
{
    public void Configure(EntityTypeBuilder<Reservation> builder)
    {
        builder.ToTable("reservations");

        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).ValueGeneratedNever();

        builder.Property(r => r.SpotId).IsRequired();
        
        builder.Property(r => r.CreatedAtUtc).IsRequired();

        builder.HasDiscriminator<string>("status")
            .HasValue<PendingReservation>("Pending")
            .HasValue<ApprovedReservation>("Approved")
            .HasValue<CancelledReservation>("Cancelled");

        builder.Property<string>("status").HasMaxLength(32).IsRequired();
        builder.Property(r => r.VariableSymbol).HasMaxLength(20).IsRequired();

        builder.OwnsOne(r => r.Period, period =>
        {
            period.Property(p => p.StartUtc).HasColumnName("start_utc").IsRequired();
            period.Property(p => p.EndUtc).HasColumnName("end_utc").IsRequired();
            period.HasIndex(p => p.StartUtc);
            period.HasIndex(p => p.EndUtc);
        });

        builder.HasOne(r => r.Spot)
            .WithMany(s => s.Reservations)
            .HasForeignKey(r => r.SpotId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.ReservationPage)
            .WithMany()
            .HasForeignKey(r => r.ReservationPageId)
            .HasPrincipalKey(rp => rp.Id)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(r => r.SpotId);
        // builder.HasIndex(r => r.UserId);
        builder.HasIndex(r => r.ReservationPageId);
    }
}
