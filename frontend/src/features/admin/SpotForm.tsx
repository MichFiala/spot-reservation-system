import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Stack,
} from '@mui/material';

const spotSchema = z.object({
  name: z.string().min(1, 'Název je povinný'),
  description: z.string().optional(),
  pricePerDay: z.coerce.number().min(0, 'Cena musí být >= 0'),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  isActive: z.boolean(),
});

type SpotFormValues = z.infer<typeof spotSchema>;

interface Spot {
  id: string;
  name: string;
  description?: string | null;
  pricePerDay: number;
  location?: { coordinates?: number[] } | null;
  isActive: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: SpotFormValues) => void;
  spot?: Spot | null;
  loading?: boolean;
  defaultLatitude?: number;
  defaultLongitude?: number;
}

export type { SpotFormValues };

export default function SpotForm({ open, onClose, onSubmit, spot, loading, defaultLatitude, defaultLongitude }: Props) {
  const isEdit = !!spot;

  const { control, handleSubmit, formState: { errors } } = useForm<SpotFormValues>({
    resolver: zodResolver(spotSchema),
    defaultValues: {
      name: spot?.name ?? '',
      description: spot?.description ?? '',
      pricePerDay: spot?.pricePerDay ?? 0,
      latitude: spot?.location?.coordinates?.[1] ?? defaultLatitude ?? 0,
      longitude: spot?.location?.coordinates?.[0] ?? defaultLongitude ?? 0,
      isActive: spot?.isActive ?? true,
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{isEdit ? 'Upravit místo' : 'Nové místo'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Název" error={!!errors.name} helperText={errors.name?.message} fullWidth />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Popis" multiline rows={2} fullWidth />
              )}
            />
            <Controller
              name="pricePerDay"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Cena za den" type="number" error={!!errors.pricePerDay} helperText={errors.pricePerDay?.message} fullWidth />
              )}
            />
            <input type="hidden" {...control.register('latitude')} />
            <input type="hidden" {...control.register('longitude')} />
            {isEdit && (
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={field.onChange} />}
                    label="Aktivní"
                  />
                )}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Zrušit</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {isEdit ? 'Uložit' : 'Vytvořit'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
