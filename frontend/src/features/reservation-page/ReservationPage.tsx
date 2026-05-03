import {
  Alert,
  Box,
  Button,
  Card,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import PlaceIcon from "@mui/icons-material/Place";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { SpotDto } from "../../api-client";
import AboutSection from "./AboutSection";
import { useReservationPage } from "./useReservationPage";
import { PageName } from "../../constants";
import SpotCard from "../spot/SpotCard";

const createMarkerIcon = (color: string, highlighted: boolean)=>{
  const size = highlighted ? 40 : 30;
  
  return L.divIcon({
    className: "",
    html: `<div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: ${highlighted ? "3px solid white" : "1px solid ${color}"};
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
})};

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
  id?: string;
}

export default function ReservationPage({
  id: pageId,
}: ReservationPageProps) {
  const [searchParams] = useSearchParams();
  const resolvedPageId = pageId ?? searchParams.get("pageId") ?? "";

  const [selectedSpot, setSelectedSpot] = useState<SpotDto | null>(null);
  const { data, isLoading, isError } = useReservationPage(resolvedPageId);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedSpot) {
      setSelectedSpot(data?.data.spots.find((s) => s.id === selectedSpot.id) ?? null);
    }

    document.title = data?.data.name ? `${data.data.name} | ${PageName}` : PageName;
  }, [data]);

  if (isLoading) {
    return <Box>Načítání...</Box>;
  }

  if (isError || (!isLoading && !data)) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Alert severity="warning" sx={{ mb: 2, justifyContent: "center" }}>
          Rezervační stránka nebyla nalezena.
        </Alert>
        <Button variant="contained" onClick={() => navigate("/")}>
          Zpět na hlavní stránku
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Box>
        <Stack spacing={1}>
          {/* Header */}
          <Paper sx={{ p: 3, borderRadius: 1, boxShadow: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {data?.data.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {data?.data.description}
            </Typography>
          </Paper>

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
              {selectedSpot && data?.data && <SpotCard key={selectedSpot.id} selectedSpot={selectedSpot} reservationPage={data?.data} />}
            </Box>
          </Box>
          <AboutSection reservationPage={data?.data} />
        </Stack>
      </Box>
    </>
  );
}
