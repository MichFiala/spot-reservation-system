import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  IconButton,
  Button,
  CircularProgress,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { apiClient } from '../../api/client';

interface SpotPhoto {
  id: string;
  spotId: string;
  url: string;
  sortOrder: number;
}

export default function SpotPhotoManager({ spotId }: { spotId: string }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: photos = [], isLoading } = useQuery<SpotPhoto[]>({
    queryKey: ['spot-photos', spotId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/spot-photos/by-spot/${spotId}`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (photoId: string) => apiClient.delete(`/api/spot-photos/${photoId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spot-photos', spotId] }),
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('spotId', spotId);
    formData.append('sortOrder', String(photos.length));

    setUploading(true);
    try {
      await apiClient.post('/api/spot-photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      queryClient.invalidateQueries({ queryKey: ['spot-photos', spotId] });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (isLoading) return <CircularProgress size={20} />;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Button
          size="small"
          startIcon={uploading ? <CircularProgress size={16} /> : <AddPhotoAlternateIcon />}
          component="label"
          disabled={uploading}
        >
          Nahrát fotku
          <input type="file" accept="image/*" hidden onChange={handleUpload} />
        </Button>
      </Box>
      {photos.length > 0 && (
        <ImageList cols={4} rowHeight={100} gap={4}>
          {photos.map((photo) => (
            <ImageListItem key={photo.id}>
              <img
                src={photo.url}
                alt=""
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
              <ImageListItemBar
                sx={{ background: 'transparent' }}
                position="top"
                actionPosition="right"
                actionIcon={
                  <IconButton
                    size="small"
                    sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.5)', m: 0.5 }}
                    onClick={() => deleteMutation.mutate(photo.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}
    </Box>
  );
}
