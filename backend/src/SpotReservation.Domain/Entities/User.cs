using SpotReservation.Domain.Common;
using SpotReservation.Domain.Enums;

namespace SpotReservation.Domain.Entities;

public sealed class User : Entity
{
    public string Email { get; private set; } = null!;

    public string PasswordHash { get; private set; } = null!;

    public UserRole Role { get; private set; }

    public DateTime CreatedAtUtc { get; private set; }

    // EF Core
    private User() { }

    private User(Guid id, string email, string passwordHash, UserRole role, DateTime createdAtUtc)
        : base(id)
    {
        Email = email;
        PasswordHash = passwordHash;
        Role = role;
        CreatedAtUtc = createdAtUtc;
    }

    public static User Register(string email, string passwordHash, UserRole role, DateTime nowUtc)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new ArgumentException("Email is required.", nameof(email));
        }

        if (string.IsNullOrWhiteSpace(passwordHash))
        {
            throw new ArgumentException("Password hash is required.", nameof(passwordHash));
        }

        return new User(
            Guid.NewGuid(),
            email.Trim().ToLowerInvariant(),
            passwordHash,
            role,
            DateTime.SpecifyKind(nowUtc, DateTimeKind.Utc));
    }

    public void ChangePassword(string newPasswordHash)
    {
        if (string.IsNullOrWhiteSpace(newPasswordHash))
        {
            throw new ArgumentException("Password hash is required.", nameof(newPasswordHash));
        }

        PasswordHash = newPasswordHash;
    }
}
