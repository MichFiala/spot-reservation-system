namespace SpotReservation.Domain.Exceptions;

/// <summary>
/// Base class for domain-rule violations. Thrown by entities/value objects when
/// an invariant cannot be satisfied. The Application/API layers translate these
/// into appropriate client responses.
/// </summary>
public abstract class DomainException : Exception
{
    protected DomainException(string message) : base(message) { }
}
