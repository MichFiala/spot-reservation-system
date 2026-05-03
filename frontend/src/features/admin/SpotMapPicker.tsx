import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Box, Fab, Tooltip } from '@mui/material';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import AddLocationAltOutlinedIcon from '@mui/icons-material/AddLocationAltOutlined';

interface Spot {
  id: string;
  name: string;
  isActive: boolean;
  location?: { coordinates?: number[] } | null;
}

interface SpotMapPickerProps {
  spots: Spot[];
  mapCenter: [number, number];
  mapZoom: number;
  onPlaceSpot: (lat: number, lng: number) => void;
  onSpotClick: (spotId: string) => void;
  highlightedSpotId?: string | null;
}

const createMarkerIcon = (color: string, highlighted: boolean) => {
  const size = highlighted ? 40 : 30;
  return L.divIcon({
    className: '',
    html: `<div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: ${highlighted ? '3px solid white' : `1px solid ${color}`};
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
};

function ClickHandler({ enabled, onPlaceSpot }: { enabled: boolean; onPlaceSpot: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (enabled) {
        onPlaceSpot(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function SpotMapPicker({ spots, mapCenter, mapZoom, onPlaceSpot, onSpotClick, highlightedSpotId }: SpotMapPickerProps) {
  const [placing, setPlacing] = useState(false);

  return (
    <Box sx={{ position: 'relative', height: 400, mb: 2, borderRadius: 1, overflow: 'hidden', boxShadow: 2 }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        zoomControl={false}
        style={{ height: '400px', width: '100%', cursor: placing ? 'crosshair' : undefined }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler enabled={placing} onPlaceSpot={onPlaceSpot} />
        {spots.map(
          (spot) =>
            spot.location?.coordinates && (
              <Marker
                key={spot.id}
                position={[spot.location.coordinates[1], spot.location.coordinates[0]]}
                icon={createMarkerIcon(spot.isActive ? '#4caf50' : '#f44336', spot.id === highlightedSpotId)}
                eventHandlers={{ click: () => onSpotClick(spot.id) }}
              />
            ),
        )}
      </MapContainer>

      <Tooltip title={placing ? 'Vypnout přidávání spotů' : 'Přidat spot kliknutím na mapu'}>
        <Fab
          size="small"
          onClick={() => setPlacing(!placing)}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1000,
            bgcolor: placing ? 'primary.main' : 'background.paper',
            color: placing ? 'primary.contrastText' : 'text.primary',
            '&:hover': {
              bgcolor: placing ? 'primary.dark' : 'grey.200',
            },
          }}
        >
          {placing ? <AddLocationAltIcon /> : <AddLocationAltOutlinedIcon />}
        </Fab>
      </Tooltip>
    </Box>
  );
}
