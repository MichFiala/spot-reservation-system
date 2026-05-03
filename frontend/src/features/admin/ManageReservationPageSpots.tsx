import { Box } from "@mui/material";
import type { ReservationPageDto } from "../../api-client";
import SpotManager from "./SpotManager";

export default function ManageReservationPageSpots({
  reservationPage,
}: {
  reservationPage: ReservationPageDto;
}) {
  const mapCenter: [number, number] | undefined =
    reservationPage.mapCenter?.coordinates
      ? [
          reservationPage.mapCenter.coordinates[1],
          reservationPage.mapCenter.coordinates[0],
        ]
      : undefined;

  return (
    <Box>
      <SpotManager
        pageId={reservationPage.id}
        mapCenter={mapCenter}
        mapZoom={reservationPage.mapZoom}
      />
    </Box>
  );
}
