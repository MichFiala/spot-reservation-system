import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { reservationPagesApi } from "../../api/apis";
import { apiClient } from "../../api/client";
import { useContext, useState } from "react";
import { PageIdContext } from "../../context/pageIdContext";

interface PageSummary {
  id: string;
  name: string;
}

export default function AdminDashboardHeaderPanel() {
  const queryKey = ["reservation-pages"];
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [pageId, setPageId] = useContext(PageIdContext);

  const { data: pages = [], isLoading } = useQuery<PageSummary[]>({
    queryKey: queryKey,
    queryFn: async () => {
      const res = await reservationPagesApi.apiReservationPagesGet();

      setPageId(res.data[0]?.id);

      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/api/reservation-pages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey });
      setDeleteOpen(false);
      setPageId(null);
    },
  });

  const handleCreate = () => {
    queryClient.invalidateQueries({ queryKey: queryKey });
    setPageId(null);
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Stack direction="row" spacing={2}>
          {(!isLoading && pages.length > 0 ) && (
            <FormControl size="small" sx={{ minWidth: 250 }}>
              <InputLabel>Rezervační stránka</InputLabel>
              <Select
                value={pageId}
                label="Rezervační stránka"
                onChange={(e) => setPageId(e.target.value!)}
              >
                {pages.map((page) => (
                  <MenuItem key={page.id} value={page.id}>
                    {page.name}
                  </MenuItem>
                ))}
              </Select>
              {isLoading && <CircularProgress size={24} sx={{ m: 1 }} />}
            </FormControl>
          )}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Nová
          </Button>
        </Stack>
        {pageId && (
          <Stack>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteOpen(true)}
            >
              Smazat
            </Button>
          </Stack>
        )}
      </Box>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Smazat rezervační stránku</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Opravdu chcete smazat tuto rezervační stránku? Budou smazána i
            všechna přiřazená místa a rezervace. Tuto akci nelze vrátit zpět.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Zrušit</Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate(pageId!)}
          >
            Smazat
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
