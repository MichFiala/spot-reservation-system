import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  CardActions,
  Button,
} from "@mui/material";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import type { data } from "react-router-dom";
import { useSpots } from "../spots/useSpots";
import { useState } from "react";
import { SpotsApi, type Coordinate3, type Point, type SpotDto } from "../../api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function ManageSpots() {
  const { data, isLoading, isError } = useSpots();
  const queryClient = useQueryClient();
  const [selectedSpot, setSelectedSpot] = useState<SpotDto | null>(null);
  const mutate = useMutation({
    mutationFn: async () => {
      const spotsApi = new SpotsApi();
      var response = await spotsApi.apiSpotsIdDelete(selectedSpot!.id, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      queryClient.invalidateQueries({ queryKey: ['spots'] });

      return response;
      // Here you would call your API to remove the spot, e.g.:
      // return apiClient.removeSpot(selectedSpot.id);
    },
  });

  const mutationAdd = useMutation({
    mutationFn: async ({x, y}: { x: number; y: number }) => {
      const spotsApi = new SpotsApi();
      var response = await spotsApi.apiSpotsPost({
        location: {
          type: "Point",
          coordinates: [x as Coordinate3, y as Coordinate3],
        } as Point,
        name: "New Spot",
        description: "Added from map click",
        
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

       queryClient.invalidateQueries({ queryKey: ['spots'] });

      return response;
    },
  });
  const AddedMarker = () => {
      useMapEvents({
        click(e) {
          mutationAdd.mutate({ x: e.latlng.lng, y: e.latlng.lat });
        },
      });
      return false;
  }
  return (
    <div>
      <h1>Manage Spots</h1>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Available Spots
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Browse and reserve your spot.
        </Typography>
        {/* {data?.data?.length === 0 && (
        <Typography color="text.secondary">
          No spots available at the moment.
        </Typography>
      )} */}
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
              <AddedMarker />
            </MapContainer>
          </Grid>
          {selectedSpot && (
            <Grid size={6}>
              <Card
                variant="outlined"
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
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
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => mutate.mutate()}
                    >
                      Remove
                    </Button>
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
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    </div>
  );
}
