import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  Typography,
  Box,
  Stack,
  Divider,
} from "@mui/material";

import DirectionsIcon from "@mui/icons-material/Directions";
import type { ReservationPageDto } from "../../api-client";

export default function AboutSection({
  reservationPage,
}: {
  reservationPage?: ReservationPageDto;
}) {
  return (
    <Card>
      <CardHeader title={"O nás"} />
      <CardContent>
        <Grid container spacing={4}>
          <Grid size={6}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Kontaktní údaje
                </Typography>
                <Typography
                  color="text.secondary"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <DirectionsIcon fontSize="small" />
                  {reservationPage?.contactPhone}
                </Typography>
                <Typography
                  color="text.secondary"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <DirectionsIcon fontSize="small" />
                  {reservationPage?.contactEmail}
                </Typography>
              </Box>
              <Divider />

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Otevírací doba
                </Typography>
                <Stack spacing={1}>
                  {/* {reservationPage?.openingHoursJson.map((day) => (
                  <Box
                    key={day}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    >
                      {day}
                    </Typography>
                    <Typography color="text.secondary">
                      00:00 – 12:00
                    </Typography>
                  </Box>
                ))} */}
                </Stack>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
