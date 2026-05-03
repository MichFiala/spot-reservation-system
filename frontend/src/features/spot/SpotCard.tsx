import {
  Box,
  Card,
  CardActions,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import type { ReservationPageDto, SpotDto } from "../../api-client";
import { SpotReservationForm } from "./SpotReservationForm";
import { PhotoStack } from "./PhotoGallery";
import { getSpotPhotos } from "./spotPhotos";

export default function SpotCard({
  selectedSpot,
  reservationPage,
}: {
  selectedSpot: SpotDto;
  reservationPage: ReservationPageDto;
}) {
  return (
    <Card
      sx={{
        position: "absolute",
        top: 16,
        right: 16,
        width: 380,
        maxHeight: "calc(100% - 32px)",
        overflowY: "auto",
        zIndex: 1000,
        boxShadow: 6,
      }}
    >
      <CardContent>
        <Stack spacing={4} sx={{ mb: 2 }}>
          <Stack direction={"row"} sx={{justifyContent: "space-between"}} spacing={4}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h5">{selectedSpot.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, whiteSpace: "pre-wrap" }}>
                {selectedSpot.description}
              </Typography>
              </Box>
              <PhotoStack photos={getSpotPhotos(selectedSpot.id!)} />
          </Stack>
            <SpotReservationForm
              key={selectedSpot.id}
              selectedSpot={selectedSpot}
            />
        </Stack>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ px: 2, pb: 2 }}></CardActions>
    </Card>
  );
}
