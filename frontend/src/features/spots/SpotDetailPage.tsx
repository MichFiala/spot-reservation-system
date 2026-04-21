import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSpot } from './useSpots';
import { useAuthStore } from '../../store/authStore';
import { ReservationsApi } from '../../api-client';

const schema = z
  .object({
    startUtc: z.string().min(1, 'Start date is required'),
    endUtc: z.string().min(1, 'End date is required'),
  })
  .refine((d) => new Date(d.endUtc) > new Date(d.startUtc), {
    message: 'End must be after start',
    path: ['endUtc'],
  });

type FormValues = z.infer<typeof schema>;

export default function SpotDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading, isError } = useSpot(id!);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const { mutate, isPending, isSuccess, error } = useMutation({
    mutationFn: (values: FormValues) =>
    {
      const reservationsApi = new ReservationsApi();
      return reservationsApi.apiReservationsPost({ spotId: id!, ...values })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      reset();
    },
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !data?.data) {
    return <Alert severity="error" sx={{ mt: 4 }}>Spot not found.</Alert>;
  }

  const bookingError = error
    ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? 'Booking failed'
    : null;

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {data?.data?.name}
          </Typography>
          <Chip label={data?.data?.isActive ? 'Active' : 'Inactive'} color={data?.data?.isActive ? 'success' : 'default'} />
        </Box>

        {data?.data?.description && (
          <Typography variant="body1" color="text.secondary">
            {data?.data?.description}
          </Typography>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Make a Reservation
        </Typography>

        {!isAuthenticated() && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Please <strong>sign in</strong> to make a reservation.
          </Alert>
        )}

        {isSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Reservation created successfully!
          </Alert>
        )}

        {bookingError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {bookingError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit((d) => mutate(d))} noValidate>
          <TextField
            label="Start date & time"
            type="datetime-local"
            slotProps={{ inputLabel: { shrink: true } }}
            {...register('startUtc')}
            error={!!errors.startUtc}
            helperText={errors.startUtc?.message}
            sx={{ mb: 2 }}
          />
          <TextField
            label="End date & time"
            type="datetime-local"
            slotProps={{ inputLabel: { shrink: true } }}
            {...register('endUtc')}
            error={!!errors.endUtc}
            helperText={errors.endUtc?.message}
            sx={{ mb: 3 }}
          />
          <Divider sx={{ mb: 2 }} />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={isPending || !isAuthenticated() || !data?.data?.isActive}
          >
            {isPending ? <CircularProgress size={22} color="inherit" /> : 'Reserve'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
