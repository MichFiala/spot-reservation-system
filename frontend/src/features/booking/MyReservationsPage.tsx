import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { format } from 'date-fns';
import { reservationsApi } from '../../api/reservations';

const statusColor: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
  Pending: 'warning',
  Approved: 'success',
  Cancelled: 'error',
};

export default function MyReservationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['reservations', 'mine'],
    queryFn: reservationsApi.listMine,
  });

  const { mutate: cancel, isPending: cancelling } = useMutation({
    mutationFn: reservationsApi.cancel,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reservations'] }),
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return <Alert severity="error" sx={{ mt: 4 }}>Failed to load reservations.</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        My Reservations
      </Typography>

      {data?.length === 0 && (
        <Typography color="text.secondary">You have no reservations yet.</Typography>
      )}

      {data && data.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Spot</TableCell>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.spotId}</TableCell>
                  <TableCell>{format(new Date(r.startUtc), 'dd MMM yyyy HH:mm')}</TableCell>
                  <TableCell>{format(new Date(r.endUtc), 'dd MMM yyyy HH:mm')}</TableCell>
                  <TableCell>
                    <Chip
                      label={r.status}
                      color={statusColor[r.status] ?? 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {r.status !== 'Cancelled' && (
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        disabled={cancelling}
                        onClick={() => cancel(r.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
