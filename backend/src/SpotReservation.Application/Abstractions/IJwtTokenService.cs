using SpotReservation.Domain.Entities;

namespace SpotReservation.Application.Abstractions;

public interface IJwtTokenService
{
    AccessToken Generate(User user);
}

public sealed record AccessToken(string Token, DateTime ExpiresAtUtc);
