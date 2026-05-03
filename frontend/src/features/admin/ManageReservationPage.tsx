import { Box, Step, StepLabel, Stepper, Tabs } from "@mui/material";
import { useEffect, useState } from "react";
import ReservationPageForm from "./ReservationPageForm";
import ManageReservationPageSpots from "./ManageReservationPageSpots";
import ContactAndPaymentForm from "./ContactAndPaymentForm";
import { useSearchParams } from "react-router-dom";
import { useReservationPage } from "../reservation-page/useReservationPage";
import Tab from "@mui/material/Tab";

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
  const [searchParams, setSearchParams] = useSearchParams();

  const pageId = searchParams.get("pageId");
  const { data: response, isLoading } = useReservationPage(pageId);

  const [tab, setTab] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleCreate = (id: string) => {
      setSearchParams({ pageId: id });
  }

  useEffect(() => {
    setTab(0);
  }, [pageId]);

  if (!pageId)
    return (
      <ReservationPageForm
        onCreate={(id) => {
          setSearchParams({ pageId: id });
        }}
      />
    );

  if (isLoading) return <Box>Načítání...</Box>;

  return (
    <Box sx={{ display: "flex" }}>
      {pageId && (
        <Tabs
          orientation="vertical"
          value={tab}
          onChange={handleChange}
          aria-label="admin tabs"
          sx={{ borderRight: 1, borderColor: "divider", minWidth: 220 }}
        >
          <Tab label="Nastavení stránky" {...a11yProps(0)} />
          <Tab label="Místa a ceny" {...a11yProps(1)} />
          <Tab label="Kontakt a platby" {...a11yProps(2)} />
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
            <ManageReservationPageSpots
              key={`spots-${pageId}`}
              reservationPage={response?.data}
            />
          )}
        </CustomTabPanel>
        <CustomTabPanel value={tab} index={2}>
          {response?.data && (
            <ContactAndPaymentForm
              key={`contact-${pageId}`}
              page={response.data}
            />
          )}
        </CustomTabPanel>
      </Box>
    </Box>
  );
}
