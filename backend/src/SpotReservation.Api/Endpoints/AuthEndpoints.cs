using SpotReservation.Application.Features.Auth;

namespace SpotReservation.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuth(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("api/auth").WithTags("Auth").AllowAnonymous();

        group.MapPost("/register", async (RegisterRequest request, IAuthService auth, CancellationToken ct) =>
            Results.Ok(await auth.RegisterAsync(request, ct)))
            .Produces<AuthResponse>();

        group.MapPost("/login", async (LoginRequest request, IAuthService auth, CancellationToken ct) =>
            Results.Ok(await auth.LoginAsync(request, ct)))
            .Produces<AuthResponse>();

        return app;
    }
}
