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

        builder.HasDiscriminator<string>("ReservationType")
            .HasValue<PendingReservation>(nameof(ReservationStatus.Pending))
            .HasValue<ApprovedReservation>(nameof(ReservationStatus.Approved))
            .HasValue<CancelledReservation>(nameof(ReservationStatus.Cancelled));

        builder.Property(x => x.Status)
                .HasConversion<string>()
                .IsRequired();

        builder.Property(r => r.VariableSymbol).HasMaxLength(20).IsRequired();

        builder.Property(r => r.GuestName).HasMaxLength(200).IsRequired();
        builder.Property(r => r.GuestEmail).HasMaxLength(200).IsRequired();
        builder.Property(r => r.GuestPhone).HasMaxLength(50).IsRequired();
        builder.Property(r => r.GuestNote).HasMaxLength(2000);

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
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(r => r.ReservationPage)
            .WithMany()
            .HasForeignKey(r => r.ReservationPageId)
            .HasPrincipalKey(rp => rp.Id)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(r => r.SpotId);

        builder.HasIndex(r => r.ReservationPageId);
    }
}
