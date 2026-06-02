import { Box, Paper } from "@mui/material";
import ManageReservationPage from "./ManageReservationPage";
import AdminDashboardHeaderPanel from "./AdminDashboardHeaderPanel";
import { PageIdProvider } from "../../context/pageIdContext";

export default function AdminDashboard() {
  return (
    <PageIdProvider>
      <Box sx={{ p: 3, minHeight: "80vh" }}>
        <AdminDashboardHeaderPanel />

        <Paper sx={{ mt: 3, p: 3 }}>
          <ManageReservationPage />
        </Paper>
      </Box>
    </PageIdProvider>
  );
}
