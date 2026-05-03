using Microsoft.AspNetCore.Mvc;
using SpotReservation.Application.Features.ReservationPages;

namespace SpotReservation.Api.Endpoints;

public static class ReservationPagesEndpoints
{
    public static IEndpointRouteBuilder MapReservationPages(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("api/reservation-pages").WithTags("ReservationPages");

        // Publicly available for reservations
        group.MapGet("/{id}", async (string id, IReservationPageService pages, CancellationToken ct) =>
            Results.Ok(await pages.GetAsync(id, ct)))
            .Produces<ReservationPageDto>()
            .Produces(StatusCodes.Status404NotFound)
            .AllowAnonymous();
        
        // List of reservation pages to administrate
        group.MapGet("/", async (IReservationPageService pages, CancellationToken ct) =>
            Results.Ok(await pages.ListAsync(ct)))
            .RequireAuthorization(pb => pb.RequireRole("Admin"))
            .Produces<IReadOnlyList<ReservationPageSummaryDto>>();


        group.MapPost("/", async ([FromBody] CreateReservationPageRequest request, IReservationPageService pages, CancellationToken ct) =>
        {
            var created = await pages.CreateAsync(request, ct);
            return Results.Created($"/api/reservation-pages/{created.Id}", created);
        })
        .RequireAuthorization(pb => pb.RequireRole("Admin"))
        .Produces<ReservationPageDto>(StatusCodes.Status201Created);

        group.MapPut("/{id}", async (string id, [FromBody] UpdateReservationPageRequest request, IReservationPageService pages, CancellationToken ct) =>
            Results.Ok(await pages.UpdateAsync(id, request, ct)))
            .RequireAuthorization(pb => pb.RequireRole("Admin"))
            .Produces<ReservationPageDto>()
            .Produces(StatusCodes.Status404NotFound);

        group.MapDelete("/{id}", async (string id, IReservationPageService pages, CancellationToken ct) =>
        {
            await pages.DeleteAsync(id, ct);
            return Results.NoContent();
        })
        // .RequireAuthorization(pb => pb.RequireRole("Admin"))
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound);

        return app;
    }
}
