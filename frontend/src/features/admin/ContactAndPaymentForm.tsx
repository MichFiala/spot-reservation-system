import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  Alert,
  IconButton,
  Switch,
  FormControlLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { reservationPagesApi } from "../../api/apis";
import type { ReservationPageDto, UpdateReservationPageRequest } from "../../api-client";

const DAYS = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"] as const;

interface DayHours {
  day: string;
  open: boolean;
  from: string;
  to: string;
}

interface FormValues {
  iban: string;
  currency: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  termsAndConditionsUrl: string;
  openingHours: DayHours[];
}

function parseOpeningHours(json: string | null): DayHours[] {
  let parsed: Record<string, { from: string; to: string } | null> = {};
  try {
    if (json) parsed = JSON.parse(json);
  } catch {
    // ignore
  }

  return DAYS.map((day) => {
    const entry = parsed[day];
    return {
      day,
      open: !!entry,
      from: entry?.from ?? "08:00",
      to: entry?.to ?? "20:00",
    };
  });
}

function serializeOpeningHours(hours: DayHours[]): string | null {
  const result: Record<string, { from: string; to: string }> = {};
  for (const h of hours) {
    if (h.open) {
      result[h.day] = { from: h.from, to: h.to };
    }
  }
  return Object.keys(result).length > 0 ? JSON.stringify(result) : null;
}

interface Props {
  page: ReservationPageDto;
}

export default function ContactAndPaymentForm({ page }: Props) {
  const queryClient = useQueryClient();

  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      iban: page.iban ?? "",
      currency: page.currency ?? "",
      contactName: page.contactName ?? "",
      contactEmail: page.contactEmail ?? "",
      contactPhone: page.contactPhone ?? "",
      termsAndConditionsUrl: page.termsAndConditionsUrl ?? "",
      openingHours: parseOpeningHours(page.openingHoursJson),
    },
  });

  const { fields } = useFieldArray({ control, name: "openingHours" });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      reservationPagesApi.apiReservationPagesIdPut(page.id, {
        name: page.name,
        description: page.description,
        mapCenter: page.mapCenter,
        mapZoom: page.mapZoom,
        mapMinZoom: page.mapMinZoom,
        mapMaxZoom: page.mapMaxZoom,
        iban: values.iban,
        currency: values.currency,
        contactName: values.contactName,
        contactEmail: values.contactEmail,
        contactPhone: values.contactPhone,
        termsAndConditionsUrl: values.termsAndConditionsUrl || null,
        openingHoursJson: serializeOpeningHours(values.openingHours),
      } as UpdateReservationPageRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservation-pages", page.id] });
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Kontaktní údaje
      </Typography>

      {mutation.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(mutation.error as Error)?.message ?? "Nastala chyba"}
        </Alert>
      )}
      {mutation.isSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Uloženo
        </Alert>
      )}

      <Stack spacing={2}>
        <Controller
          name="contactName"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Kontaktní jméno" fullWidth />
          )}
        />
        <Controller
          name="contactEmail"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Kontaktní e-mail" type="email" fullWidth />
          )}
        />
        <Controller
          name="contactPhone"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Kontaktní telefon" fullWidth />
          )}
        />

        <Typography variant="h6" sx={{ mt: 2 }}>
          Platební údaje
        </Typography>

        <Controller
          name="iban"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="IBAN" fullWidth />
          )}
        />
        <Controller
          name="currency"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Měna" placeholder="CZK" fullWidth />
          )}
        />

        <Typography variant="h6" sx={{ mt: 2 }}>
          Další nastavení
        </Typography>

        <Controller
          name="termsAndConditionsUrl"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="URL obchodních podmínek" fullWidth />
          )}
        />

        <Typography variant="h6" sx={{ mt: 2 }}>
          Otevírací doba
        </Typography>

        {fields.map((field, index) => (
          <Controller
            key={field.id}
            name={`openingHours.${index}.open`}
            control={control}
            render={({ field: switchField }) => (
              <Stack direction="row" spacing={2} alignItems="center">
                <FormControlLabel
                  control={
                    <Switch
                      checked={switchField.value}
                      onChange={switchField.onChange}
                    />
                  }
                  label={field.day}
                  sx={{ minWidth: 140 }}
                />
                {switchField.value && (
                  <>
                    <Controller
                      name={`openingHours.${index}.from`}
                      control={control}
                      render={({ field: f }) => (
                        <TextField
                          {...f}
                          label="Od"
                          type="time"
                          size="small"
                          slotProps={{ inputLabel: { shrink: true } }}
                          sx={{ width: 130 }}
                        />
                      )}
                    />
                    <Typography>—</Typography>
                    <Controller
                      name={`openingHours.${index}.to`}
                      control={control}
                      render={({ field: f }) => (
                        <TextField
                          {...f}
                          label="Do"
                          type="time"
                          size="small"
                          slotProps={{ inputLabel: { shrink: true } }}
                          sx={{ width: 130 }}
                        />
                      )}
                    />
                  </>
                )}
              </Stack>
            )}
          />
        ))}

        <Button
          type="submit"
          variant="contained"
          disabled={mutation.isPending}
          sx={{ alignSelf: "flex-start" }}
        >
          Uložit
        </Button>
      </Stack>
    </Box>
  );
}
