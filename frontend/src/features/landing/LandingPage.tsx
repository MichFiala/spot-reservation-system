import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import PeopleIcon from "@mui/icons-material/People";
import PaymentsIcon from "@mui/icons-material/Payments";
import EmailIcon from "@mui/icons-material/Email";
import { useEffect } from "react";

const features = [
  {
    icon: <DashboardCustomizeIcon sx={{ fontSize: 40 }} />,
    title: "Vlastní rezervační stránka",
    description:
      "Vytvořte si vlastní stránku s mapou, popisem míst a rezervačním kalendářem za pár minut.",
  },
  {
    icon: <CalendarMonthIcon sx={{ fontSize: 40 }} />,
    title: "Online rezervace 24/7",
    description:
      "Vaši zákazníci si mohou rezervovat místo kdykoliv, odkudkoliv. Bez telefonátů a e-mailů.",
  },
  {
    icon: <PeopleIcon sx={{ fontSize: 40 }} />,
    title: "Správa míst a rezervací",
    description:
      "Přehledný admin panel pro správu míst, schvalování rezervací a sledování obsazenosti.",
  },
  {
    icon: <PaymentsIcon sx={{ fontSize: 40 }} />,
    title: "Online platby",
    description:
      "Automatické generování QR platebních kódů. Zákazníci zaplatí přímo z mobilu.",
  },
];

const CONTACT_EMAIL = "michfiala.it@gmail.com";

export default function LandingPage() {
  useEffect(() => {
    document.title = "Tenspot - Rezervační systém pro vaše podnikání";
  }, []);

  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          textAlign: "center",
          py: { xs: 8, md: 12 },
          px: 2,
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            sx={{ fontWeight: 800, mb: 2, fontSize: { xs: "2rem", md: "3rem" } }}
          >
            Rezervační systém pro vaše podnikání
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 600, mx: "auto", fontWeight: 400 }}
          >
            Vytvořte si vlastní rezervační web za pár minut. Rybářské revíry,
            parkovací místa, kempy — cokoliv, co potřebuje rezervaci.
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ justifyContent: "center" }}
          >
            <Button
              variant="contained"
              size="large"
              href={`mailto:${CONTACT_EMAIL}`}
              startIcon={<EmailIcon />}
              sx={{ px: 4, py: 1.5 }}
            >
              Zájem o přístup
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={RouterLink}
              to="/přihlášení"
              sx={{ px: 4, py: 1.5 }}
            >
              Přihlásit se
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Features */}
      <Box sx={{ py: 8, px: 2, bgcolor: "background.paper" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, textAlign: "center", mb: 6 }}
          >
            Vše, co potřebujete
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" },
              gap: 3,
            }}
          >
            {features.map((f) => (
              <Card
                key={f.title}
                elevation={0}
                sx={{
                  textAlign: "center",
                  p: 3,
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <CardContent>
                  <Box sx={{ color: "primary.main", mb: 2 }}>{f.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {f.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {f.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Contact */}
      <Box
        sx={{
          py: 8,
          px: 2,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          textAlign: "center",
        }}
      >
        <Container maxWidth="sm">
          <EmailIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Máte zájem?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            Systém je aktuálně v raném vývoji. Napište mi a domluvíme se na
            zpřístupnění pro vaši organizaci.
          </Typography>
          <Button
            variant="contained"
            size="large"
            href={`mailto:${CONTACT_EMAIL}`}
            sx={{
              px: 5,
              py: 1.5,
              bgcolor: "background.default",
              color: "primary.main",
              "&:hover": { bgcolor: "grey.100" },
            }}
          >
            {CONTACT_EMAIL}
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
