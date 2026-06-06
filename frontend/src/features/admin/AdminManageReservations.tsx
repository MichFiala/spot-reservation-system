import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import type { EventInput } from "@fullcalendar/core/index.js";
import csLocale from "@fullcalendar/core/locales/cs";
import { ReservationStatus, type ReservationDto } from "../../api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reservationsApi } from "../../api/apis";
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import TableRowsIcon from "@mui/icons-material/TableRows";
import { theme } from "../../utils/theme";
import dayjs from "dayjs";
import { useContext, useState } from "react";
import { PageIdContext } from "../../context/pageIdContext";

const statusColors: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  [ReservationStatus.Approved]: {
    bg: "#6FAF4F", // #1E3A5F
    text: "#ffffff",
    border: "#ffffff", // #122439
  },
  [ReservationStatus.Pending]: {
    bg: "#3B7597", // #4783BB
    text: "#ffffff",
    border: "#ffffff", // #1E3A5F
  },
  [ReservationStatus.Cancelled]: {
    bg: "#D97A2B",
    text: "#ffffff",
    border: "#ffffff",
  },
};

export default function AdminManageReservations() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"calendar" | "table">("calendar");

  const [pageId] = useContext(PageIdContext);

  const { data } = useQuery({
    queryKey: ["reservations", pageId],
    queryFn: () =>
      reservationsApi.apiReservationsByPagePageIdYearMonthGet(
        pageId!,
        new Date().getFullYear(),
        new Date().getMonth() + 2,
      ),
    enabled: !!pageId,
  });

  const approve = useMutation({
    mutationFn: (id: string) =>
      reservationsApi.apiReservationsIdApprovePost(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["reservations", pageId] }),
  });

  const cancel = useMutation({
    mutationFn: (id: string) => reservationsApi.apiReservationsIdCancelPost(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["reservations", pageId] }),
  });

  const events: EventInput[] | undefined =
    data?.data.map(
      (reservation: ReservationDto, index: number) =>
      {
        return (
          {
          id: `${reservation.spotId}-${index}`,
          allDay: true,
          title: `${reservation.spotName}`,
          start: dayjs(reservation.startUtc).local().toDate(),
          end: dayjs(reservation.endUtc).add(1, "day").local().toDate(),
          backgroundColor:
            statusColors[reservation.status]?.bg ?? theme.palette.primary.light,
          borderColor:
            statusColors[reservation.status]?.border ??
            theme.palette.primary.dark,
          textColor: statusColors[reservation.status]?.text ?? "#ffffff",
          extendedProps: {
            reservationId: reservation.id,
            status: reservation.status,
            createdAtUtc: reservation.createdAtUtc,
            name: reservation.guestInfo.name,
            email: reservation.guestInfo.email,
            phone: reservation.guestInfo.phone,
            variableSymbol: reservation.paymentInfoDto.variableSymbol
          },
        }) as EventInput;
      }
    ) ?? [];

  const reservations: ReservationDto[] = data?.data ?? [];

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_, v) => v && setView(v)}
          size="small"
        >
          <ToggleButton value="calendar">
            <Tooltip title="Kalendář">
              <CalendarMonthIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="table">
            <Tooltip title="Seznam">
              <TableRowsIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {view === "table" ? (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>VS</TableCell>
                <TableCell>Místo</TableCell>
                <TableCell>Jméno</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Telefon</TableCell>
                <TableCell>Od</TableCell>
                <TableCell>Do</TableCell>
                <TableCell>Stav</TableCell>
                <TableCell align="right">Akce</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservations.map((r) => {
                const isPending = r.status === ReservationStatus.Pending;
                const isApproved = r.status === ReservationStatus.Approved;
                const colors = statusColors[r.status];
                return (
                  <TableRow key={r.id}>
                    <TableCell>{r.paymentInfoDto.variableSymbol}</TableCell>
                    <TableCell>{r.spotName}</TableCell>
                    <TableCell>{r.guestInfo.name}</TableCell>
                    <TableCell>{r.guestInfo.email}</TableCell>
                    <TableCell>{r.guestInfo.phone}</TableCell>
                    <TableCell>{dayjs(r.startUtc).local().format("D. M. YYYY")}</TableCell>
                    <TableCell>{dayjs(r.endUtc).local().format("D. M. YYYY")}</TableCell>
                    <TableCell>
                      <Chip
                        label={isPending ? "Čeká" : isApproved ? "Schváleno" : "Zrušeno"}
                        size="small"
                        sx={{ bgcolor: colors?.bg, color: colors?.text, fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} sx={{justifyContent:"flex-end"}}>
                        {isPending && (
                          <Tooltip title="Schválit">
                            <IconButton size="small" onClick={() => approve.mutate(r.id)}>
                              <CheckCircleIcon fontSize="small" color="success" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {(isPending || isApproved) && (
                          <Tooltip title="Zamítnout">
                            <IconButton size="small" onClick={() => cancel.mutate(r.id)}>
                              <CancelIcon fontSize="small" color="error" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
    <FullCalendar
      timeZone="local"
      locale={csLocale}
      plugins={[dayGridPlugin]}
      initialView="dayGridMonth"
      events={events}
      eventContent={(arg) => {
        const { reservationId, status, name, email, phone, variableSymbol } =
          arg.event.extendedProps;
        const isPending = status === ReservationStatus.Pending;
        const isApproved = status === ReservationStatus.Approved;

        return (
          <Card
            sx={{
              overflow: "hidden",
              backgroundColor:
                statusColors[status]?.bg ?? theme.palette.primary.light,
              color: statusColors[status]?.text ?? "#ffffff",
            }}
          >
            <CardContent>
              <Stack spacing={1} sx={{ m: 0.5 }}>
                <Stack
                  direction="row"
                  sx={{ alignItems: "center" }}
                  spacing={1}
                >
                  <Typography variant="subtitle2" noWrap>
                    {variableSymbol} - {arg.event.title}
                  </Typography>
                  <Chip
                    label={
                      isPending ? "Čeká na schválení" : isApproved ? "Schváleno" : "Zrušeno"
                    }
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "inherit",
                    }}
                  />
                </Stack>
                <Stack
                  direction="row"
                  sx={{ alignItems: "center", spacing: 0.5 }}
                >
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{ color: "inherit" }}
                  >
                    {name}
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  sx={{ alignItems: "center", spacing: 0.5 }}
                >
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{ color: "inherit" }}
                  >
                    {email}
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  sx={{ alignItems: "center", spacing: 0.5 }}
                >
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{ color: "inherit" }}
                  >
                    {phone}
                  </Typography>
                </Stack>
              </Stack>

              {(isPending || isApproved) && (
                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                  {isPending && (
                    <Tooltip title="Schválit">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          approve.mutate(reservationId);
                        }}
                        sx={{
                          color: "inherit",
                          bgcolor: "rgba(255,255,255,0.15)",
                          "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                          p: 0.5,
                        }}
                      >
                        <CheckCircleIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Zamítnout">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        cancel.mutate(reservationId);
                      }}
                      sx={{
                        color: "inherit",
                        bgcolor: "rgba(255,255,255,0.15)",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                        p: 0.5,
                      }}
                    >
                      <CancelIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )}
            </CardContent>
          </Card>
        );
      }}
    />
      )}
    </Box>
  );
}
