using Microsoft.AspNetCore.Mvc;
using SpotReservation.Application.Features.ReservationPages;

namespace SpotReservation.Api.Endpoints;

public static class ReservationPagesEndpoints
{
    public static IEndpointRouteBuilder MapReservationPages(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("api/reservation-pages")
                       .RequireAuthorization(pb => pb.RequireRole("Admin"))
                       .WithTags("ReservationPages");

        // Publicly available for reservations
        group.MapGet("/{id}", async (string id, IReservationPageService pages, CancellationToken ct) =>
            Results.Ok(await pages.GetAsync(id, ct)))
                    .Produces<ReservationPageDto>()
                    .Produces(StatusCodes.Status404NotFound)
                    .AllowAnonymous();

        #region Owner-only management endpoints
        // List of reservation pages to manage by owner
        group.MapGet("/", async (ManageReservationPageService pages, CancellationToken ct) =>
            Results.Ok(await pages.ListAsync(ct)))
                    .Produces<IReadOnlyList<ReservationPageSummaryDto>>();

        // Create a new reservation page
        group.MapPost("/", async ([FromBody] CreateReservationPageRequest request, ManageReservationPageService pages, CancellationToken ct) =>
        {
            var created = await pages.CreateAsync(request, ct);

            return Results.Created($"/api/reservation-pages/{created.Id}", created);
        })
        .Produces<ReservationPageDto>(StatusCodes.Status201Created);
        // Update an existing reservation page
        group.MapPut("/{id}", async (string id, [FromBody] UpdateReservationPageRequest request, ManageReservationPageService pages, CancellationToken ct) =>
            Results.Ok(await pages.UpdateAsync(id, request, ct)))
            .Produces<ReservationPageDto>()
            .Produces(StatusCodes.Status404NotFound);
        // Delete a reservation page
        group.MapDelete("/{id}", async (string id, ManageReservationPageService pages, CancellationToken ct) =>
        {
            await pages.DeleteAsync(id, ct);
            return Results.NoContent();
        })
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound);
        #endregion
        return app;
    }
}
