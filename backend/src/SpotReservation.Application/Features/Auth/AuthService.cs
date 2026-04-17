using SpotReservation.Application.Abstractions;
using SpotReservation.Application.Common.Exceptions;
using SpotReservation.Domain.Entities;
using SpotReservation.Domain.Enums;
using SpotReservation.Domain.Repositories;

namespace SpotReservation.Application.Features.Auth;

internal sealed class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IUnitOfWork _uow;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwt;
    private readonly IDateTimeProvider _clock;

    public AuthService(
        IUserRepository users,
        IUnitOfWork uow,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwt,
        IDateTimeProvider clock)
    {
        _users = users;
        _uow = uow;
        _passwordHasher = passwordHasher;
        _jwt = jwt;
        _clock = clock;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        ValidateCredentials(request.Email, request.Password);

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        if (await _users.EmailExistsAsync(normalizedEmail, cancellationToken))
        {
            throw new ConflictException($"A user with email '{normalizedEmail}' already exists.");
        }

        var hash = _passwordHasher.Hash(request.Password);
        var user = User.Register(normalizedEmail, hash, UserRole.User, _clock.UtcNow);

        await _users.AddAsync(user, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return BuildResponse(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        ValidateCredentials(request.Email, request.Password);

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _users.GetByEmailAsync(normalizedEmail, cancellationToken);
        if (user is null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedException("Invalid email or password.");
        }

        return BuildResponse(user);
    }

    private AuthResponse BuildResponse(User user)
    {
        var token = _jwt.Generate(user);
        return new AuthResponse(
            user.Id,
            user.Email,
            user.Role.ToString(),
            token.Token,
            token.ExpiresAtUtc);
    }

    private static void ValidateCredentials(string email, string password)
    {
        var errors = new Dictionary<string, string[]>();
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
        {
            errors[nameof(email)] = ["A valid email is required."];
        }

        if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
        {
            errors[nameof(password)] = ["Password must be at least 8 characters long."];
        }

        if (errors.Count > 0)
        {
            throw new ValidationException(errors);
        }
    }
}
