namespace SpotReservation.Application.Abstractions;

public interface ICurrentUserService
{
    /// <summary>
    /// The authenticated user's id, or <c>null</c> if the request is anonymous.
    /// </summary>
    Guid? UserId { get; }

    bool IsAuthenticated { get; }

    bool IsInRole(string role);
}
