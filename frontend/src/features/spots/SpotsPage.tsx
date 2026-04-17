import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useSpots } from './useSpots';

export default function SpotsPage() {
  const { data: spots, isLoading, isError } = useSpots();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        Failed to load spots. Please try again later.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Available Spots
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Browse and reserve your spot.
      </Typography>

      {spots?.length === 0 && (
        <Typography color="text.secondary">No spots available at the moment.</Typography>
      )}

      <Grid container spacing={3}>
        {spots?.map((spot) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={spot.id}>
            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {spot.name}
                  </Typography>
                  <Chip
                    label={spot.isActive ? 'Active' : 'Inactive'}
                    color={spot.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </Box>

                {spot.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {spot.description}
                  </Typography>
                )}

                {spot.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOnIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {spot.location}
                    </Typography>
                  </Box>
                )}
              </CardContent>

              <CardActions>
                <Button component={RouterLink} to={`/spots/${spot.id}`} variant="contained" size="small">
                  View &amp; Book
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
