using Microsoft.Extensions.DependencyInjection;
using SpotReservation.Application.Features.Auth;
using SpotReservation.Application.Features.Reservations;
using SpotReservation.Application.Features.Spots;

namespace SpotReservation.Application;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ISpotService, SpotService>();
        services.AddScoped<IReservationService, ReservationService>();
        return services;
    }
}
