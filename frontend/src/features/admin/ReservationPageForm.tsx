import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  Alert,
  Tooltip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { Fab } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import AddLocationAltOutlinedIcon from "@mui/icons-material/AddLocationAltOutlined";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import L from "leaflet";
import type { Map as LeafletMap } from "leaflet";
import { reservationPagesApi } from "../../api/apis";
import { apiClient } from "../../api/client";
import type { CreateReservationPageRequest, ReservationPageDto, SpotDto, UpdateReservationPageRequest } from "../../api-client";
import SpotForm, { type SpotFormValues } from "./SpotForm";
import { isDirty } from "zod/v3";

interface Props {
  page?: ReservationPageDto | null;
  onCreate: (id: string) => void;
}

function MapInteraction({ locked }: { locked: boolean }) {
  const map = useMap();

  if (locked) {
    map.dragging.disable();
    map.touchZoom.disable();
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
  } else {
    map.dragging.enable();
    map.touchZoom.enable();
    map.scrollWheelZoom.enable();
    map.doubleClickZoom.disable();
  }

  return null;
}

function MapRef({
  mapRef,
}: {
  mapRef: React.MutableRefObject<LeafletMap | null>;
}) {
  const map = useMap();
  mapRef.current = map;
  return null;
}

const createMarkerIcon = (color: string, highlighted: boolean) => {
  const size = highlighted ? 40 : 30;
  return L.divIcon({
    className: "",
    html: `<div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: ${highlighted ? "3px solid white" : `1px solid ${color}`};
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

export default function ReservationPageForm({ page, onCreate }: Props) {
  const isEdit = !!page;
  const queryClient = useQueryClient();
  const mapRef = useRef<LeafletMap | null>(null);
  const [locked, setLocked] = useState(!!page);
  const [placing, setPlacing] = useState(false);

  // Spot management state
  const [spotFormOpen, setSpotFormOpen] = useState(false);
  const [editingSpot, setEditingSpot] = useState<SpotDto | null>(null);
  const [defaultCoords, setDefaultCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { control, handleSubmit, formState, watch, setValue } =
    useForm<CreateReservationPageRequest>({
      defaultValues: {
        id: page?.id ?? "",
        name: page?.name ?? "",
        description: page?.description ?? "",

        mapCenter: page?.mapCenter ?? {
          coordinates: [14.41475, 50.07436], // Praha [lng, lat]
        },

        mapZoom: page?.mapZoom ?? 13,
        mapMinZoom: page?.mapMinZoom ?? 10,
        mapMaxZoom: page?.mapMaxZoom ?? 18,
      },
    });

  // Spots query — only when editing an existing page
  const { data: spots = [] } = useQuery<SpotDto[]>({
    queryKey: ["spots", page?.id],
    queryFn: async () => {
      const res = await apiClient.get(`/api/spots/by-page/${page!.id}`, { params: { onlyActive: false } });
      return res.data;
    },
    enabled: isEdit,
  });

  // Spot mutations
  const createSpotMutation = useMutation({
    mutationFn: (values: SpotFormValues) =>
      apiClient.post("/api/spots", {
        name: values.name,
        description: values.description || null,
        pricePerDay: values.pricePerDay,
        location: { type: "Point", coordinates: [values.longitude, values.latitude] },
        pageId: page!.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spots", page!.id] });
      setSpotFormOpen(false);
    },
  });

  const updateSpotMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: SpotFormValues }) =>
      apiClient.put(`/api/spots/${id}`, {
        name: values.name,
        description: values.description || null,
        isActive: values.isActive,
        location: { type: "Point", coordinates: [values.longitude, values.latitude] },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spots", page!.id] });
      setSpotFormOpen(false);
      setEditingSpot(null);
    },
  });

  const deleteSpotMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/spots/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spots", page!.id] });
      setDeleteConfirmId(null);
    },
  });

  const handleSpotSubmit = (values: SpotFormValues) => {
    if (editingSpot) {
      updateSpotMutation.mutate({ id: editingSpot.id, values });
    } else {
      createSpotMutation.mutate(values);
    }
  };

  const handleEditSpot = (spot: SpotDto) => {
    setEditingSpot(spot);
    setSpotFormOpen(true);
  };

  const handleCloseSpotForm = () => {
    setSpotFormOpen(false);
    setEditingSpot(null);
    setDefaultCoords(null);
  };

  const handleToggleLock = () => {
    if (!locked && mapRef.current) {
      const center = mapRef.current.getCenter();
      const zoom = mapRef.current.getZoom();

      setValue("mapCenter.coordinates.0", center.lng);
      setValue("mapCenter.coordinates.1", center.lat);
      setValue("mapZoom", zoom);
    }
    const newLocked = !locked;
    setLocked(newLocked);
    if (!newLocked) {
      setPlacing(false);
    }
  };

  const handleTogglePlacing = () => {
    setPlacing(!placing);
  };

  const handleMapPlaceSpot = (lat: number, lng: number) => {
    setPlacing(false);
    setEditingSpot(null);
    setDefaultCoords({ lat, lng });
    setSpotFormOpen(true);
  };

  const handleSpotClick = (spotId: string) => {
    const spot = spots.find((s) => s.id === spotId);
    if (spot) handleEditSpot(spot);
  };

  const buildMapCenter = (values: CreateReservationPageRequest) =>
    values.mapCenter?.coordinates &&
    values.mapCenter?.coordinates.length === 2
      ? {
          type: "Point",
          coordinates: values.mapCenter.coordinates as [number, number],
        }
      : null;

  const createMutation = useMutation({
    mutationFn: (values: CreateReservationPageRequest) =>
      reservationPagesApi.apiReservationPagesPost({
        id: values.id,
        name: values.name,
        description: values.description || null,
        mapCenter: buildMapCenter(values),
        mapZoom: values.mapZoom,
        mapMinZoom: values.mapMinZoom,
        mapMaxZoom: values.mapMaxZoom,
      }),
    onSuccess: (_, values) => {
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      onCreate(values.id);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: CreateReservationPageRequest) =>
      reservationPagesApi.apiReservationPagesIdPut(page!.id, {
        name: values.name,
        description: values.description || null,
        mapCenter: buildMapCenter(values),
        mapZoom: values.mapZoom,
        mapMinZoom: values.mapMinZoom,
        mapMaxZoom: values.mapMaxZoom,
      } as UpdateReservationPageRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservation-pages", page!.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
    },
  });

  const mutation = isEdit ? updateMutation : createMutation;

  const onSubmit = (values: CreateReservationPageRequest) => {
    mutation.mutate(values);
  };

  const lng = watch("mapCenter.coordinates.0");
  const lat = watch("mapCenter.coordinates.1");
  const zoom = watch("mapZoom");

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {isEdit ? "Upravit rezervační stránku" : "Nová rezervační stránka"}
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
          name="id"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="ID"
              disabled={isEdit}
              error={!!formState.errors.id}
              helperText={formState.errors.id?.message ?? "např. rybnik-u-lesa"}
              fullWidth
            />
          )}
        />
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Název"
              error={!!formState.errors.name}
              helperText={formState.errors.name?.message}
              fullWidth
            />
          )}
        />
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Popis"
              multiline
              rows={3}
              fullWidth
            />
          )}
        />

        <MapContainer
          center={[lat, lng] as [number, number]}
          zoom={zoom}
          style={{
            height: "400px",
            width: "100%",
            cursor: placing ? "crosshair" : locked ? "default" : undefined,
          }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapRef mapRef={mapRef} />
          <MapInteraction locked={locked} />
          {locked && isEdit && (
            <ClickHandler enabled={placing} onPlaceSpot={handleMapPlaceSpot} />
          )}
          {spots.map(
            (spot) =>
              spot.location?.coordinates && (
                <Marker
                  key={spot.id}
                  position={[spot.location.coordinates[1], spot.location.coordinates[0]]}
                  icon={createMarkerIcon(spot.isActive ? "#4caf50" : "#f44336", spot.id === editingSpot?.id)}
                  eventHandlers={{ click: () => handleSpotClick(spot.id) }}
                />
              ),
          )}
          <div className={"leaflet-top leaflet-right"}>
            <div className="leaflet-control leaflet-bar" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Tooltip
                title={
                  locked
                    ? "Odemknout mapu (klikněte pro navigaci)"
                    : "Zamknout mapu (uložit centrum)"
                }
              >
                <Fab
                  size="small"
                  onClick={handleToggleLock}
                  sx={{
                    bgcolor: locked ? "primary.main" : "background.paper",
                    color: locked ? "primary.contrastText" : "text.primary",
                    "&:hover": {
                      bgcolor: locked ? "primary.dark" : "grey.200",
                    },
                  }}
                >
                  {locked ? <LockIcon /> : <LockOpenIcon />}
                </Fab>
              </Tooltip>
              {locked && isEdit && (
                <Tooltip title={placing ? "Vypnout přidávání míst" : "Přidat místo kliknutím na mapu"}>
                  <Fab
                    size="small"
                    onClick={handleTogglePlacing}
                    sx={{
                      bgcolor: placing ? "primary.main" : "background.paper",
                      color: placing ? "primary.contrastText" : "text.primary",
                      "&:hover": {
                        bgcolor: placing ? "primary.dark" : "grey.200",
                      },
                    }}
                  >
                    {placing ? <AddLocationAltIcon /> : <AddLocationAltOutlinedIcon />}
                  </Fab>
                </Tooltip>
              )}
            </div>
          </div>
        </MapContainer>

        {!locked && (
          <Alert severity="info">
            Nastavte centrum mapy a zamkněte ji kliknutím na zámek.
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={mutation.isPending || !locked || !isDirty}
          sx={{ alignSelf: "flex-start" }}
        >
          {isEdit ? "Uložit změny" : "Vytvořit stránku"}
        </Button>
      </Stack>

      {/* Spot management — only for existing pages */}
      {isEdit && (
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
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
                <TableRow key={spot.id}>
                  <TableCell>{spot.name}</TableCell>
                  <TableCell>{spot.pricePerDay} Kč</TableCell>
                  <TableCell>
                    <Chip
                      label={spot.isActive ? "Aktivní" : "Neaktivní"}
                      color={spot.isActive ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEditSpot(spot)}>
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
            open={spotFormOpen}
            onClose={handleCloseSpotForm}
            onSubmit={handleSpotSubmit}
            spot={editingSpot}
            loading={createSpotMutation.isPending || updateSpotMutation.isPending}
            defaultLatitude={defaultCoords?.lat}
            defaultLongitude={defaultCoords?.lng}
            key={editingSpot?.id ?? (defaultCoords ? `new-${defaultCoords.lat}-${defaultCoords.lng}` : "new")}
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
                disabled={deleteSpotMutation.isPending}
                onClick={() => {
                  if (deleteConfirmId) deleteSpotMutation.mutate(deleteConfirmId);
                }}
              >
                Smazat
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Box>
  );
}
