using Microsoft.AspNetCore.Http.Json;
using NetTopologySuite.IO.Converters;
using SpotReservation.Api.Endpoints;
using SpotReservation.Api.Middleware;
using SpotReservation.Api.Services;
using SpotReservation.Application;
using SpotReservation.Application.Abstractions;
using SpotReservation.Infrastructure;
using SpotReservation.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddJwtBearerAuth(builder.Configuration);
builder.Services.AddAuthorization();


builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", options =>
    {
        if (builder.Environment.IsDevelopment())
            options.WithOrigins("http://*.localhost:5173", "http://localhost:5173")
                   .SetIsOriginAllowedToAllowWildcardSubdomains()
                   .AllowAnyHeader()
                   .AllowAnyMethod()
                   .AllowCredentials();
        else
            options.WithOrigins("http://*.localhost:4040", "https://*.tenspot.cz")
                   .SetIsOriginAllowedToAllowWildcardSubdomains()
                   .AllowAnyHeader()
                   .AllowAnyMethod()
                   .AllowCredentials();
    }
);
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

builder.Services.Configure<JsonOptions>(options =>
{
    options.SerializerOptions.Converters.Add(new GeoJsonConverterFactory());
});


var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();


if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
await DatabaseSeeder.SeedAsync(app.Services);

app.UseCors("CorsPolicy");

if (app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
}

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();


app.MapAuth();
app.MapSpots();
app.MapReservations();
app.MapReservationPages();
app.MapSpotPhotos();

Console.WriteLine("Starting application...");

app.Run();
