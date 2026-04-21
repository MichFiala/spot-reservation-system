import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import { useSpots } from "./useSpots";
import "leaflet/dist/leaflet.css";
import { Marker } from "react-leaflet";
import type { SpotDto } from "../../api-client";
import { useState } from "react";
import { ManageSpots } from "../admin/ManageSpots";

export default function SpotsPage() {
  const { data, isLoading, isError } = useSpots();
  const [selectedSpot, setSelectedSpot] = useState<SpotDto | null>(null);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        Failed to load spots. Please try again later.
      </Alert>
    );
  }
  console.log(data);
  return (
    <>
    <Box>
      <ManageSpots />
    </Box>
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Available Spots
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Browse and reserve your spot.
      </Typography>
      {data?.data?.length === 0 && (
        <Typography color="text.secondary">
          No spots available at the moment.
        </Typography>
      )}
      <Grid container spacing={10}>
        <Grid size={6}>
          <MapContainer
            center={[49.327567, 13.049762]}
            zoom={17}
           
            style={{ height: "400px" }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {data?.data?.map(
              (spot) =>
                spot.location?.coordinates && (
                  <Marker
                    key={spot.id}
                    position={
                      [
                        spot.location.coordinates[1],
                        spot.location.coordinates[0],
                      ] as [number, number]
                    }
                    eventHandlers={{
                      click: () => {
                        setSelectedSpot(spot);
                      },
                    }}
                  />
                ),
            )}
          </MapContainer>
                  </Grid>
          {selectedSpot && (
            <Grid size={6}>
            <Card
             
              variant="outlined"
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 1,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {selectedSpot.name}
                  </Typography>
                  <Chip
                    label={selectedSpot.isActive ? "Active" : "Inactive"}
                    color={selectedSpot.isActive ? "success" : "default"}
                    size="small"
                  />
                </Box>

                {selectedSpot.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {selectedSpot.description}
                  </Typography>
                )}
              </CardContent>

              <CardActions>
                <Button
                  component={RouterLink}
                  to={`/spots/${selectedSpot.id}`}
                  variant="contained"
                  size="small"
                >
                  View &amp; Book
                </Button>
              </CardActions>
            </Card>
            </Grid>
          )}
      </Grid>
    </Box>
    </>
  );
}
