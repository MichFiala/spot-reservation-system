using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotReservation.Domain.Entities;

namespace SpotReservation.Infrastructure.Persistence.Configurations;

internal sealed class ReservationPageConfiguration : IEntityTypeConfiguration<ReservationPage>
{
    public void Configure(EntityTypeBuilder<ReservationPage> builder)
    {
        builder.ToTable("reservation_pages");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name).HasMaxLength(200).IsRequired();

        builder.Property(p => p.Description).HasMaxLength(2000);

        builder.OwnsOne(p => p.MapOptions, mo =>
        {
            mo.Property(m => m.Center)
                .HasColumnName("map_center")
                .HasColumnType("geometry(Point, 4326)")
                .IsRequired(false);

            mo.Property(m => m.Zoom).HasColumnName("map_zoom").IsRequired();
            mo.Property(m => m.MinZoom).HasColumnName("map_min_zoom").IsRequired();
            mo.Property(m => m.MaxZoom).HasColumnName("map_max_zoom").IsRequired();
        });

        builder.OwnsOne(p => p.PayementInformations, pi =>
        {
            pi.Property(p => p.Iban).HasMaxLength(34);
            pi.Property(p => p.Currency).HasMaxLength(3);
        });

        builder.Property(p => p.TermsAndConditionsUrl).HasMaxLength(500);

        builder.OwnsOne(p => p.ContactInformations, ci =>
        {
            ci.Property(c => c.Name).HasMaxLength(200).IsRequired();
            ci.Property(c => c.Email).HasMaxLength(200).IsRequired();
            ci.Property(c => c.Phone).HasMaxLength(50).IsRequired();
            ci.Property(c => c.OpeningHoursJson)
                .HasColumnName("contact_opening_hours_json")
                .HasColumnType("text")
                .IsRequired(false);
        });
    }
}
