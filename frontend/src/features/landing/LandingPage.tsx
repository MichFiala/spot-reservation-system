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
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";

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

const plans = [
  {
    name: "Starter",
    price: "0 Kč",
    period: "/měsíc",
    description: "Pro vyzkoušení",
    features: [
      "1 rezervační stránka",
      "Až 5 míst",
      "Základní statistiky",
      "E-mailové notifikace",
    ],
    cta: "Začít zdarma",
    variant: "outlined" as const,
  },
  {
    name: "Pro",
    price: "490 Kč",
    period: "/měsíc",
    description: "Pro malé firmy",
    features: [
      "Neomezené stránky",
      "Neomezená místa",
      "Pokročilé statistiky",
      "Vlastní doména",
      "Prioritní podpora",
    ],
    cta: "Vybrat Pro",
    variant: "contained" as const,
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Na míru",
    period: "",
    description: "Pro velké organizace",
    features: [
      "Vše z Pro",
      "API přístup",
      "SLA garance",
      "Dedikovaná podpora",
      "Vlastní úpravy",
    ],
    cta: "Kontaktujte nás",
    variant: "outlined" as const,
  },
];

export default function LandingPage() {
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
            Vytvořte si vlastní rezervační web za pár minut. Parkovací místa,
            sportovní kurty, kempy, coworkingy — cokoliv, co potřebuje rezervaci.
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to="/register"
              sx={{ px: 4, py: 1.5 }}
            >
              Vytvořit rezervační stránku
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={RouterLink}
              to="/reserve?id=demo"
              sx={{ px: 4, py: 1.5 }}
            >
              Zobrazit demo
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

      {/* Pricing */}
      <Box sx={{ py: 8, px: 2 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, textAlign: "center", mb: 2 }}
          >
            Ceník
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: "center", mb: 6, maxWidth: 500, mx: "auto" }}
          >
            Vyberte si plán, který vyhovuje vašemu podnikání. Upgrade nebo
            downgrade kdykoliv.
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 3,
              alignItems: "stretch",
            }}
          >
            {plans.map((plan) => (
              <Card
                key={plan.name}
                elevation={plan.highlighted ? 4 : 0}
                sx={{
                  p: 3,
                  border: plan.highlighted ? 2 : 1,
                  borderColor: plan.highlighted ? "primary.main" : "divider",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {plan.highlighted && (
                    <Typography
                      variant="caption"
                      sx={{
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        fontWeight: 600,
                        display: "inline-block",
                        mb: 2,
                      }}
                    >
                      Nejoblíbenější
                    </Typography>
                  )}
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {plan.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {plan.description}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "baseline", mb: 3 }}>
                    <Typography variant="h3" sx={{ fontWeight: 800 }}>
                      {plan.price}
                    </Typography>
                    {plan.period && (
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ ml: 0.5 }}
                      >
                        {plan.period}
                      </Typography>
                    )}
                  </Box>
                  <Stack spacing={1.5}>
                    {plan.features.map((feat) => (
                      <Box
                        key={feat}
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CheckCircleOutlineIcon
                          sx={{ fontSize: 20, color: "success.main" }}
                        />
                        <Typography variant="body2">{feat}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
                <Box sx={{ px: 2, pb: 2, pt: 1 }}>
                  <Button
                    variant={plan.variant}
                    fullWidth
                    size="large"
                    component={RouterLink}
                    to="/register"
                  >
                    {plan.cta}
                  </Button>
                </Box>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA */}
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
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Začněte přijímat rezervace ještě dnes
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            Registrace je zdarma. Žádná kreditní karta. Plně funkční do 5 minut.
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to="/register"
            sx={{
              px: 5,
              py: 1.5,
              bgcolor: "background.default",
              color: "primary.main",
              "&:hover": { bgcolor: "grey.100" },
            }}
          >
            Vytvořit účet zdarma
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
