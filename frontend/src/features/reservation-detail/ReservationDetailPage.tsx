import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { reservationsApi } from "../../api/apis";
import { ReservationStatus } from "../../api-client";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import "dayjs/locale/cs";

dayjs.locale("cs");

const statusLabel: Record<string, string> = {
  [ReservationStatus.Pending]: "Čeká na schválení",
  [ReservationStatus.Approved]: "Schváleno",
  [ReservationStatus.Cancelled]: "Zrušeno",
};

const statusColor: Record<string, "warning" | "success" | "error"> = {
  [ReservationStatus.Pending]: "warning",
  [ReservationStatus.Approved]: "success",
  [ReservationStatus.Cancelled]: "error",
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack direction="row" sx={{justifyContent:"space-between", alignItems:"center"}}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">
        {value}
      </Typography>
    </Stack>
  );
}

export default function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["reservation", id],
    queryFn: () => reservationsApi.apiReservationsIdGet(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !data?.data) {
    return (
      <Box sx={{ maxWidth: 480, mx: "auto", mt: 8 }}>
        <Alert severity="error">Rezervace nebyla nalezena.</Alert>
      </Box>
    );
  }

  const r = data.data;
  const start = dayjs(r.startUtc).local();
  const end = dayjs(r.endUtc).local();
  const isPending = r.status === ReservationStatus.Pending;

  return (
    <Box sx={{ maxWidth: 520, mx: "auto", mt: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Stack direction="row" sx={{justifyContent:"space-between", alignItems:"center"}}>
            <Typography variant="h6">
              Detail rezervace
            </Typography>
            <Chip
              label={statusLabel[r.status] ?? r.status}
              color={statusColor[r.status] ?? "default"}
              size="small"
            />
          </Stack>

          <Divider />

          <Stack spacing={1.5}>
            <Row label="Místo" value={r.spotName} />
            <Row label="Od" value={start.format("D. MMMM YYYY")} />
            <Row label="Do" value={end.format("D. MMMM YYYY")} />
            <Row label="Jméno" value={r.guestInfo.name} />
            <Row label="Email" value={r.guestInfo.email} />
            <Row label="Telefon" value={r.guestInfo.phone} />
          </Stack>

          {isPending && (
            <>
              <Divider />
              <Stack spacing={1.5}>
                <Typography variant="subtitle2">
                  Platební údaje
                </Typography>
                <Row label="Částka" value={`${r.paymentInfoDto.amount.toLocaleString("cs-CZ")} ${r.paymentInfoDto.currency}`} />
                <Row label="IBAN" value={r.paymentInfoDto.iban} />
                <Row label="Variabilní symbol" value={r.paymentInfoDto.variableSymbol} />
              </Stack>

              {r.paymentQrCodeUrl && (
                <Stack sx={{alignItems:"center"}} spacing={1}>
                  <Typography variant="caption" color="text.secondary">
                    Naskenujte QR kód v bankovní aplikaci
                  </Typography>
                  <Box
                    component="img"
                    src={r.paymentQrCodeUrl}
                    alt="Platební QR kód"
                    sx={{ width: 180, height: 180, borderRadius: 1 }}
                  />
                </Stack>
              )}
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
