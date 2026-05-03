import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  Alert,
  Tooltip,
} from "@mui/material";
import { useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { Fab } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import type { Map as LeafletMap } from "leaflet";
import { reservationPagesApi } from "../../api/apis";
import type { CreateReservationPageRequest, ReservationPageDto, UpdateReservationPageRequest } from "../../api-client";
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

export default function ReservationPageForm({ page, onCreate }: Props) {
  const isEdit = !!page;
  const queryClient = useQueryClient();
  const mapRef = useRef<LeafletMap | null>(null);
  const [locked, setLocked] = useState(!!page);

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

  const handleToggleLock = () => {
    if (!locked && mapRef.current) {
      const center = mapRef.current.getCenter();
      const zoom = mapRef.current.getZoom();

      setValue("mapCenter.coordinates.0", center.lng);
      setValue("mapCenter.coordinates.1", center.lat);
      setValue("mapZoom", zoom);

      console.log(zoom);
    }
    setLocked(!locked);
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
            cursor: locked ? "crosshair" : undefined,
          }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapRef mapRef={mapRef} />
          <MapInteraction locked={locked} />
          <div className={"leaflet-top leaflet-right"}>
            <div className="leaflet-control leaflet-bar">
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
    </Box>
  );
}
