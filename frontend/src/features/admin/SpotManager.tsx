import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import AddIcon from '@mui/icons-material/Add';
import { apiClient } from '../../api/client';
import SpotForm, { type SpotFormValues } from './SpotForm';
import SpotPhotoManager from './SpotPhotoManager';
import SpotMapPicker from './SpotMapPicker';

interface Spot {
  id: string;
  name: string;
  description?: string | null;
  pricePerDay: number;
  isActive: boolean;
  location?: { coordinates?: number[] } | null;
}

interface SpotManagerProps {
  pageId: string;
  mapCenter?: [number, number];
  mapZoom?: number;
}

export default function SpotManager({ pageId, mapCenter, mapZoom }: SpotManagerProps) {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingSpot, setEditingSpot] = useState<Spot | null>(null);
  const [expandedPhotos, setExpandedPhotos] = useState<string | null>(null);
  const [defaultCoords, setDefaultCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data: spots = [] } = useQuery<Spot[]>({
    queryKey: ['spots', pageId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/spots/by-page/${pageId}`, { params: { onlyActive: false } });
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (values: SpotFormValues) =>
      apiClient.post('/api/spots', {
        name: values.name,
        description: values.description || null,
        pricePerDay: values.pricePerDay,
        location: { type: 'Point', coordinates: [values.longitude, values.latitude] },
        pageId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spots', pageId] });
      setFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: SpotFormValues }) =>
      apiClient.put(`/api/spots/${id}`, {
        name: values.name,
        description: values.description || null,
        isActive: values.isActive,
        location: { type: 'Point', coordinates: [values.longitude, values.latitude] },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spots', pageId] });
      setFormOpen(false);
      setEditingSpot(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/spots/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spots', pageId] });
      setDeleteConfirmId(null);
    },
  });

  const handleSubmit = (values: SpotFormValues) => {
    if (editingSpot) {
      updateMutation.mutate({ id: editingSpot.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleEdit = (spot: Spot) => {
    setEditingSpot(spot);
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditingSpot(null);
    setDefaultCoords(null);
  };

  const handlePlaceSpot = (lat: number, lng: number) => {
    setEditingSpot(null);
    setDefaultCoords({ lat, lng });
    setFormOpen(true);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <SpotMapPicker
        spots={spots}
        mapCenter={mapCenter ?? [49.8, 15.5]}
        mapZoom={mapZoom ?? 7}
        onPlaceSpot={handlePlaceSpot}
        highlightedSpotId={editingSpot?.id}
        onSpotClick={(spotId) => {
          const spot = spots.find((s) => s.id === spotId);
          if (spot) handleEdit(spot);
        }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Místa</Typography>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Název</TableCell>
            <TableCell>Cena/den</TableCell>
            <TableCell>Stav</TableCell>
            <TableCell align="right">Akce</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {spots.map((spot) => (
            <>
              <TableRow key={spot.id}>
                <TableCell>{spot.name}</TableCell>
                <TableCell>{spot.pricePerDay} Kč</TableCell>
                <TableCell>
                  <Chip
                    label={spot.isActive ? 'Aktivní' : 'Neaktivní'}
                    color={spot.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => setExpandedPhotos(expandedPhotos === spot.id ? null : spot.id)}
                  >
                    <PhotoLibraryIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleEdit(spot)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setDeleteConfirmId(spot.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
              <TableRow key={`${spot.id}-photos`}>
                <TableCell colSpan={4} sx={{ py: 0, borderBottom: expandedPhotos === spot.id ? undefined : 'none' }}>
                  <Collapse in={expandedPhotos === spot.id}>
                    <Box sx={{ py: 1 }}>
                      <SpotPhotoManager spotId={spot.id} />
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </>
          ))}
          {spots.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center">
                Zatím žádná místa
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <SpotForm
        open={formOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        spot={editingSpot}
        loading={createMutation.isPending || updateMutation.isPending}
        defaultLatitude={defaultCoords?.lat}
        defaultLongitude={defaultCoords?.lng}
        key={editingSpot?.id ?? (defaultCoords ? `new-${defaultCoords.lat}-${defaultCoords.lng}` : 'new')}
      />

      <Dialog open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
        <DialogTitle>Smazat místo</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Opravdu chcete smazat toto místo? Tuto akci nelze vrátit zpět.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>Zrušit</Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
            onClick={() => {
              if (deleteConfirmId) deleteMutation.mutate(deleteConfirmId);
            }}
          >
            Smazat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
