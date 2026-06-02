import { Box, Tabs } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import ReservationPageForm from "./ReservationPageForm";
import ContactAndPaymentForm from "./ContactAndPaymentForm";
import { useReservationPage } from "../reservation-page/useReservationPage";
import Tab from "@mui/material/Tab";
import AdminManageReservations from "./AdminManageReservations";
import { PageIdContext } from "../../context/pageIdContext";

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ManageReservationPage() {
  const [pageId, setPageId] = useContext(PageIdContext);

  const { data: response, isLoading } = useReservationPage(pageId);

  const [tab, setTab] = useState(0);

  const handleChange = (newValue: number) => {
    setTab(newValue);
  };

  const handleCreate = (id: string) => {
    setPageId(id);
  };

  useEffect(() => {
    if(tab !== 0) {
      setTab(0);
    }
  }, [pageId]);
  
  if (isLoading) return <Box>Načítání...</Box>;

  if (!pageId)
    return (
      <ReservationPageForm
        onCreate={(id) => {
          setPageId(id);
        }}
      />
    );


  return (
    <Box sx={{ display: "flex" }}>
      {pageId && (
        <Tabs
          orientation="vertical"
          value={tab}
          onChange={(_, value) => handleChange(value)}
          aria-label="admin tabs"
          sx={{ borderRight: 1, borderColor: "divider", minWidth: 220 }}
        >
          <Tab label="Nastavení a místa" {...a11yProps(0)} />
          <Tab label="Kontakt a platby" {...a11yProps(1)} />
          <Tab label="Rezervace" {...a11yProps(2)} />
        </Tabs>
      )}

      <Box sx={{ flex: 1 }}>
        <CustomTabPanel value={tab} index={0}>
          <ReservationPageForm
            key={`form-${pageId}`}
            page={response?.data}
            onCreate={(id) => handleCreate(id)}
          />
        </CustomTabPanel>
        <CustomTabPanel value={tab} index={1}>
          {response?.data && (
            <ContactAndPaymentForm
              key={`contact-${pageId}`}
              page={response.data}
            />
          )}
        </CustomTabPanel>
        <CustomTabPanel value={tab} index={2}>
          <AdminManageReservations key={`reservations-${pageId}`} />
        </CustomTabPanel>
      </Box>
    </Box>
  );
}
