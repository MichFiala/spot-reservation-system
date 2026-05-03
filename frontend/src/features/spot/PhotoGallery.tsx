import { useState, useCallback, useEffect } from "react";
import { Box, Dialog, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

interface PhotoGalleryProps {
  photos: string[];
}

export function PhotoStack({ photos }: PhotoGalleryProps) {
  const [open, setOpen] = useState(false);

  if (photos.length === 0) return null;

  return (
    <>
      <Box
        onClick={() => setOpen(true)}
        sx={{
          position: "relative",
          width: 100,
          height: 100,
          minWidth: 100,
          minHeight: 100,
          cursor: "pointer",
          mb: 1,
        }}
      >
        {/* Stacked card layers behind */}
        {photos.length > 2 && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              right: -4,
              bottom: -4,
              borderRadius: 2,
              bgcolor: "grey.300",
            }}
          />
        )}
        {photos.length > 1 && (
          <Box
            sx={{
              position: "absolute",
              top: 4,
              left: 4,
              right: -2,
              bottom: -2,
              borderRadius: 2,
              bgcolor: "grey.200",
            }}
          />
        )}

        {/* Main photo */}
        <Box
          component="img"
          src={photos[0]}
          alt=""
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: 2,
          }}
        />

        {/* Photo count badge */}
        {photos.length > 1 && (
          <Box
            sx={{
              position: "absolute",
              bottom: 8,
              right: 8,
              bgcolor: "rgba(0,0,0,0.6)",
              color: "white",
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontSize: "0.8rem",
            }}
          >
            1 / {photos.length}
          </Box>
        )}
      </Box>

      <GalleryDialog
        photos={photos}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

function GalleryDialog({
  photos,
  open,
  onClose,
}: {
  photos: string[];
  open: boolean;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);

  const prev = useCallback(
    () => setIndex((i) => (i > 0 ? i - 1 : photos.length - 1)),
    [photos.length],
  );
  const next = useCallback(
    () => setIndex((i) => (i < photos.length - 1 ? i + 1 : 0)),
    [photos.length],
  );

  useEffect(() => {
    if (!open) {
      setIndex(0);
      return;
    }
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, prev, next]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
    >
      {/* Image + arrows */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {photos.length > 1 && (
          <IconButton
            onClick={prev}
            sx={{
              position: "absolute",
              left: 8,
              color: "white",
              bgcolor: "rgba(0,0,0,0.4)",
              "&:hover": { bgcolor: "rgba(0,0,0,0.6)" },
            }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>
        )}
        <Typography
          variant="subtitle1"
          sx={{
            color: "white",
            position: "absolute",
            bottom: 8,
            left: 8,
          }}
        >
          {index + 1} / {photos.length}
        </Typography>
        <Box
          component="img"
          src={photos[index]}
          alt=""
          sx={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
        {photos.length > 1 && (
          <IconButton
            onClick={next}
            sx={{
              position: "absolute",
              right: 8,
              color: "white",
              bgcolor: "rgba(0,0,0,0.4)",
              "&:hover": { bgcolor: "rgba(0,0,0,0.6)" },
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        )}
      </Box>
    </Dialog>
  );
}
