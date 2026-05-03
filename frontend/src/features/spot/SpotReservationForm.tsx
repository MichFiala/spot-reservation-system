import {
  Alert,
  Box,
  Button,
  Divider,
  Stack,
  Step,
  StepButton,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickerDay, type PickerDayProps } from "@mui/x-date-pickers/PickerDay";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type { SpotDto } from "../../api-client";
import { reservationsApi } from "../../api/apis";

const STEP_LABELS = ["Termín", "Údaje", "Potvrzení", "Platba"];

function buildSpdString(
  iban: string,
  amount: number,
  currency: string,
  vs: string,
  message: string,
) {
  return `SPD*1.0*ACC:${iban}*AM:${amount.toFixed(2)}*CC:${currency}*X-VS:${vs}*MSG:${message}`;
}

const contactSchema = z.object({
  name: z.string().min(1, "Jméno je povinné"),
  email: z.string().email("Zadejte platný email"),
  phone: z.string().min(9, "Zadejte platné telefonní číslo"),
  note: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function SpotReservationForm({
  selectedSpot,
}: {
  selectedSpot: SpotDto;
}) {
  const [rangeStart, setRangeStart] = useState<Dayjs | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Dayjs | null>(null);
  const queryClient = useQueryClient();

  const hasBookedDayInRange = (start: Dayjs, end: Dayjs) =>
    selectedSpot.occupiedDates
      .map((d) => dayjs(d))
      .some(
        (d) =>
          (d.isAfter(start, "day") || d.isSame(start, "day")) &&
          (d.isBefore(end, "day") || d.isSame(end, "day")),
      );

  const [rangeError, setRangeError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [contactData, setContactData] = useState<ContactFormValues | null>(
    null,
  );
  const [confirmed, setConfirmed] = useState(false);

  const totalDays =
    rangeStart && rangeEnd ? rangeEnd.diff(rangeStart, "day") + 1 : 0;

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", note: "" },
  });

  const ReservationDay = (props: PickerDayProps) => {
    const { day, outsideCurrentMonth, ...other } = props;

    const isBooked = selectedSpot.occupiedDates?.some((d) =>
      dayjs(d).isSame(day, "day"),
    );
    const isPast = day.isBefore(dayjs(), "day");
    const isStart = rangeStart?.isSame(day, "day") ?? false;
    const isEnd = rangeEnd?.isSame(day, "day") ?? false;
    const isInRange =
      rangeStart &&
      rangeEnd &&
      day.isAfter(rangeStart, "day") &&
      day.isBefore(rangeEnd, "day");

    return (
      <PickerDay
        {...other}
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        disabled={isBooked || isPast}
        isVisuallySelected={isStart || isEnd}
        sx={{
          ...(!outsideCurrentMonth &&
            !isPast && {
              backgroundColor: isBooked
                ? "#ffebee"
                : isStart || isEnd
                  ? "primary.main"
                  : isInRange
                    ? "primary.light"
                    : "#e8f5e9",
              color: isBooked
                ? "#c62828"
                : isStart || isEnd
                  ? "primary.contrastText"
                  : isInRange
                    ? "primary.contrastText"
                    : "#2e7d32",
              fontWeight: 600,
              borderRadius: isStart
                ? "50% 0 0 50%"
                : isEnd
                  ? "0 50% 50% 0"
                  : isInRange
                    ? "0"
                    : undefined,
              "&:hover": {
                backgroundColor: isBooked
                  ? "#ffcdd2"
                  : isStart || isEnd
                    ? "primary.dark"
                    : "#c8e6c9",
              },
              "&.Mui-disabled": {
                backgroundColor: isBooked ? "#ffebee" : undefined,
                color: isBooked ? "#c62828" : undefined,
              },
            }),
        }}
      />
    );
  };

  const createReservation = useMutation({
    mutationFn: async () => {
      const response = await reservationsApi.apiReservationsPost({
        spotId: selectedSpot.id,
        startUtc: rangeStart!.hour(12).toISOString(),
        endUtc: rangeEnd!.hour(12).toISOString(),
      });

      queryClient.invalidateQueries({
        queryKey: ["reservation-pages", selectedSpot.pageId],
      });

      return response;
    },
  });

  const totalPrice = totalDays * selectedSpot.pricePerDay;

  const isStepComplete = (index: number): boolean => {
    switch (index) {
      case 0:
        return !!(rangeStart && rangeEnd);
      case 1:
        return !!contactData;
      case 2:
        return confirmed;
      case 3:
        return false;
      default:
        return false;
    }
  };

  const canGoToStep = (index: number): boolean => {
    for (let i = 0; i < index; i++) {
      if (!isStepComplete(i)) return false;
    }
    return true;
  };

  const handleResetFlow = () => {
    setStep(0);
    setRangeStart(null);
    setRangeEnd(null);
    setContactData(null);
    setConfirmed(false);
    form.reset();
  };

  const handleDayClick = (date: Dayjs | null) => {
    if (!date) return;
    setRangeError(null);

    if (!rangeStart || rangeEnd) {
      // First click or reset — set start
      setRangeStart(date);
      setRangeEnd(null);
    } else {
      // Second click — set end (swap if needed)
      const start = date.isBefore(rangeStart, "day") ? date : rangeStart;
      const end = date.isBefore(rangeStart, "day") ? rangeStart : date;

      if (hasBookedDayInRange(start, end)) {
        setRangeError(
          "Ve zvoleném rozsahu je obsazený den. Vyberte jiný termín.",
        );
        setRangeStart(null);
        setRangeEnd(null);
      } else {
        setRangeStart(start);
        setRangeEnd(end);
      }
    }
  };
  return (
    <Stack
      sx={{
        mt: 1,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 1.5,
      }}
    >
      {/* Stepper */}
      <Stepper nonLinear activeStep={step} alternativeLabel sx={{ mb: 1 }}>
        {STEP_LABELS.map((label, index) => (
          <Step key={label} completed={isStepComplete(index)}>
            <StepButton
              color="inherit"
              onClick={() => canGoToStep(index) && setStep(index)}
              disabled={!canGoToStep(index)}
            >
              {label}
            </StepButton>
          </Step>
        ))}
      </Stepper>

      <Stack sx={{ flexGrow: 1 }} spacing={2}>
        {/* Step 0 — Date picker */}
        {step === 0 && (
          <>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                onChange={handleDayClick}
                slots={{ day: ReservationDay }}
              />
            </LocalizationProvider>
            {rangeError && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {rangeError}
              </Typography>
            )}
            {rangeStart && (
              <Typography variant="body2">
                {rangeStart.format("DD.MM.YYYY")}
                {rangeEnd
                  ? ` – ${rangeEnd.format("DD.MM.YYYY")} (${totalDays} ${totalDays === 1 ? "den" : totalDays < 5 ? "dny" : "dní"})`
                  : " – vyberte koncový den"}
              </Typography>
            )}
            {rangeStart && rangeEnd && (
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Cena: {totalPrice} Kč
              </Typography>
            )}
          </>
        )}

        {/* Step 1 — Contact form */}
        {step === 1 && (
          <Box
            component="form"
            id="contact-form"
            onSubmit={form.handleSubmit((values) => {
              setContactData(values);
              setStep(2);
            })}
            noValidate
          >
            <Stack spacing={2}>
              <TextField
                label="Jméno a příjmení"
                size="small"
                {...form.register("name")}
                error={!!form.formState.errors.name}
                helperText={form.formState.errors.name?.message}
              />
              <TextField
                label="Email"
                type="email"
                size="small"
                {...form.register("email")}
                error={!!form.formState.errors.email}
                helperText={form.formState.errors.email?.message}
              />
              <TextField
                label="Telefon"
                size="small"
                {...form.register("phone")}
                error={!!form.formState.errors.phone}
                helperText={form.formState.errors.phone?.message}
              />
              <TextField
                label="Poznámka (volitelné)"
                size="small"
                multiline
                rows={2}
                {...form.register("note")}
              />
            </Stack>
          </Box>
        )}

        {/* Step 2 — Confirmation */}
        {step === 2 && (
          <Stack spacing={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Shrnutí rezervace
            </Typography>
            <Divider />
            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>Místo:</strong> {selectedSpot.name}
              </Typography>
              <Typography variant="body2">
                <strong>Termín:</strong> {rangeStart?.format("DD.MM.YYYY")} –{" "}
                {rangeEnd?.format("DD.MM.YYYY")} ({totalDays}{" "}
                {totalDays === 1 ? "den" : totalDays < 5 ? "dny" : "dní"})
              </Typography>
              <Divider />
              <Typography variant="body2">
                <strong>Jméno:</strong> {contactData?.name}
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong> {contactData?.email}
              </Typography>
              <Typography variant="body2">
                <strong>Telefon:</strong> {contactData?.phone}
              </Typography>
              {contactData?.note && (
                <Typography variant="body2">
                  <strong>Poznámka:</strong> {contactData.note}
                </Typography>
              )}
              <Divider />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Celkem: {totalPrice} Kč
              </Typography>
            </Stack>
            {createReservation.isError && (
              <Alert severity="error">
                Rezervace se nezdařila. Zvolený termín je již obsazený nebo
                došlo k chybě. Zkuste prosím jiný termín.
              </Alert>
            )}
          </Stack>
        )}

        {/* Step 3 — QR payment */}
        {step === 3 && (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Naskenujte QR kód v bankovní aplikaci
            </Typography>
            <Box
              component="img"
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                buildSpdString(
                  createReservation.data?.data.paymentInfoDto.iban ||
                    "CZ0000000000000000000000",
                  createReservation.data?.data.paymentInfoDto.amount ||
                    totalPrice,
                  createReservation.data?.data.paymentInfoDto.currency || "CZK",
                  createReservation.data?.data.paymentInfoDto.variableSymbol ||
                    "0000000000",
                  `Rezervace ${selectedSpot.name}`,
                ),
              )}`}
              alt="Platební QR kód"
              sx={{ width: 200, height: 200, borderRadius: 1 }}
            />
            <Divider sx={{ width: "100%" }} />
            <Stack spacing={0.5} sx={{ width: "100%" }}>
              <Typography variant="body2">
                <strong>Variabilní symbol:</strong>{" "}
                {createReservation.data?.data.paymentInfoDto.variableSymbol ||
                  "0000000000"}
              </Typography>
              <Typography variant="body2">
                <strong>Částka:</strong>{" "}
                {createReservation.data?.data.paymentInfoDto.amount ||
                  totalPrice}{" "}
                Kč
              </Typography>
              <Typography variant="body2">
                <strong>IBAN:</strong>{" "}
                {createReservation.data?.data.paymentInfoDto.iban ||
                  "CZ0000000000000000000000"}
              </Typography>
              <Typography variant="body2">
                <strong>Měna:</strong>{" "}
                {createReservation.data?.data.paymentInfoDto.currency || "CZK"}
              </Typography>
            </Stack>
          </Stack>
        )}
      </Stack>

      {/* Actions */}
      <Stack direction="row" spacing={1} sx={{ m: 1 }}>
        {step !== 0 && step !== 3 && (
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => setStep(step - 1)}
          >
            Zpět
          </Button>
        )}
        {step === 0 && (
          <Button
            variant="contained"
            fullWidth
            disabled={!rangeStart || !rangeEnd}
            onClick={() => setStep(1)}
          >
            Pokračovat
          </Button>
        )}
        {step === 1 && (
          <Button
            variant="contained"
            fullWidth
            type="submit"
            form="contact-form"
          >
            Pokračovat
          </Button>
        )}

        {step === 2 && (
          <Button
            variant="contained"
            fullWidth
            disabled={createReservation.isPending}
            onClick={() => {
              createReservation.mutate(undefined, {
                onSuccess: () => {
                  setConfirmed(true);
                  setStep(3);
                },
              });
            }}
          >
            {createReservation.isPending ? "Odesílám…" : "Potvrdit rezervaci"}
          </Button>
        )}
        {step === 3 && (
          <Button variant="contained" fullWidth onClick={handleResetFlow}>
            Hotovo
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
