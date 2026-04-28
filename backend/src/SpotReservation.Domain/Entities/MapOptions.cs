using NetTopologySuite.Geometries;

namespace SpotReservation.Domain.Entities;

public sealed record MapOptions(Point? Center, int Zoom, int MinZoom, int MaxZoom);
