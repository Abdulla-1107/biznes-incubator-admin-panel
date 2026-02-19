import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/shared/providers/ThemeProvider";
import { DashboardLayout } from "@/widgets/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import ServicesPage from "./pages/ServicesPage";
import PartnersPage from "./pages/PartnersPage";
import MentorsPage from "./pages/MentorsPage";
import StartupsPage from "./pages/StartupsPage";
import EventsPage from "./pages/EventsPage";
import ContactsPage from "./pages/ContactsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/partners" element={<PartnersPage />} />
              <Route path="/mentors" element={<MentorsPage />} />
              <Route path="/startups" element={<StartupsPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
