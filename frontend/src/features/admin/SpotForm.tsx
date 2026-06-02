import { useForm, Controller } from 'react-hook-form';
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
  Divider,
  Typography,
} from '@mui/material';
import type { SpotDto } from '../../api-client';
import SpotPhotoManager from './SpotPhotoManager';

interface SpotFormValues {
  name: string;
  description: string;
  pricePerDay: number;
  latitude: number;
  longitude: number;
  isActive: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: SpotFormValues) => void;
  spot?: SpotDto | null;
  loading?: boolean;
  defaultLatitude?: number;
  defaultLongitude?: number;
}

export type { SpotFormValues };

export default function SpotForm({ open, onClose, onSubmit, spot, loading, defaultLatitude, defaultLongitude }: Props) {
  const isEdit = !!spot;

  const { control, handleSubmit, formState: { errors } } = useForm<SpotFormValues>({
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
            {isEdit && spot && (
              <>
                <Divider />
                <Typography variant="subtitle2" color="text.secondary">Fotky</Typography>
                <SpotPhotoManager spotId={spot.id} />
              </>
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
