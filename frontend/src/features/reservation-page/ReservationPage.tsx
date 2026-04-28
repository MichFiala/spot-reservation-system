import {
  Box,
  Card,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import PlaceIcon from "@mui/icons-material/Place";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { use, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { SpotDto } from "../../api-client";
import AboutSection from "./AboutSection";
import { useReservationPage } from "./useReservationPage";
import { ReservationForm } from "./ReservationForm";

const createMarkerIcon = (color: string, highlighted: boolean) =>
  L.divIcon({
    className: "",
    html: `<div style="
      background-color: ${color};
      width: ${highlighted ? 30 : 24}px;
      height: ${highlighted ? 30 : 24}px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: ${highlighted ? "2px solid white" : "1px solid white"};
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [24, 24],
  });

function FlyToSpot({ spot }: { spot: SpotDto | null }) {
  const map = useMap();
  useEffect(() => {
    if (spot?.location?.coordinates) {
      map.flyTo(
        [spot.location.coordinates[1], spot.location.coordinates[0]] as [
          number,
          number,
        ],
        map.getZoom(),
        { duration: 0.5 },
      );
    }
  }, [spot, map]);
  return null;
}

interface ReservationPageProps {
  slug?: string;
}

export default function ReservationPage({
  slug: pageId,
}: ReservationPageProps) {
  const [searchParams] = useSearchParams();
  const resolvedPageId = pageId ?? searchParams.get("pageId") ?? "";

  const [selectedSpot, setSelectedSpot] = useState<SpotDto | null>(null);
  const { data, isLoading, isError } = useReservationPage(resolvedPageId);

  useEffect(() => {
    if (selectedSpot) {
      setSelectedSpot(data?.data.spots.find((s) => s.id === selectedSpot.id) ?? null);
    }
  }, [data]);

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  return (
    <>
      <Box>
        <Stack spacing={4}>
          {/* Header */}
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {data?.data.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Vyberte místo na mapě a zarezervujte si termín.
            </Typography>
          </Box>

          {/* Spot list + Map + Spot detail */}
          <Box
            sx={{ display: "flex", gap: 0, height: "65vh", minHeight: "450px" }}
          >
            {/* Spot list — left sidebar */}
            <Card
              sx={{
                width: 280,
                minWidth: 280,
                borderRadius: "8px 0 0 8px",
                overflowY: "auto",
                boxShadow: 3,
              }}
            >
              <Box sx={{ px: 2, pt: 2, pb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Dostupná místa ({data?.data?.spots.length ?? 0})
                </Typography>
              </Box>
              <List disablePadding>
                {data?.data?.spots.map((spot: SpotDto) => (
                  <ListItemButton
                    key={spot.id}
                    selected={spot.id === selectedSpot?.id}
                    onClick={() => setSelectedSpot(spot)}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <PlaceIcon
                        fontSize="small"
                        sx={{
                          color: spot.isActive ? "#4caf50" : "#f44336",
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={spot.name}
                      secondary={spot.isActive ? "Aktivní" : "Neaktivní"}
                    />
                  </ListItemButton>
                ))}
              </List>
              {data?.data?.spots.length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ px: 2, py: 3, textAlign: "center" }}
                >
                  Žádná místa
                </Typography>
              )}
            </Card>

            {/* Map */}
            <Box sx={{ position: "relative", flexGrow: 1 }}>
              <Box
                sx={{
                  borderRadius: "0 8px 8px 0",
                  overflow: "hidden",
                  boxShadow: 3,
                  height: "100%",
                }}
              >
                <MapContainer
                  center={
                    [
                      data?.data.mapCenter.coordinates[1],
                      data?.data.mapCenter.coordinates[0],
                    ] as [number, number]
                  }
                  zoom={data?.data.mapZoom ?? 17}
                  maxZoom={data?.data.mapMaxZoom ?? 19}
                  minZoom={data?.data.mapMinZoom ?? 15}
                  dragging={false}
                  touchZoom={false}
                  scrollWheelZoom={false}
                  doubleClickZoom={false}
                  style={{ height: "100%" }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <FlyToSpot spot={selectedSpot} />
                  {data?.data?.spots.map(
                    (spot: SpotDto) =>
                      spot.location?.coordinates && (
                        <Marker
                          key={spot.id}
                          position={
                            [
                              spot.location.coordinates[1] as number,
                              spot.location.coordinates[0] as number,
                            ] as [number, number]
                          }
                          icon={createMarkerIcon(
                            spot.isActive ? "#4caf50" : "#f44336",
                            spot.id === selectedSpot?.id,
                          )}
                          eventHandlers={{
                            click: () => {
                              setSelectedSpot(spot);
                            },
                          }}
                        />
                      ),
                  )}
                </MapContainer>
              </Box>

              {/* Spot detail panel — overlays the map on the right */}
              {selectedSpot && <ReservationForm key={selectedSpot.id} selectedSpot={selectedSpot} />}
            </Box>
          </Box>
          <AboutSection reservationPage={data?.data} />
        </Stack>
      </Box>
    </>
  );
}
