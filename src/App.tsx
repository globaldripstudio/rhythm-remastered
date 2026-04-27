import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { SpotifyPlayerProvider } from "@/contexts/SpotifyPlayerContext";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import Services from "./pages/Services";
import Portfolio from "./pages/Portfolio";
import Projets from "./pages/Projets";
import MentionsLegales from "./pages/MentionsLegales";
import PolitiqueConfidentialite from "./pages/PolitiqueConfidentialite";
import CGV from "./pages/CGV";
import NotFound from "./pages/NotFound";
import Ebook from "./pages/Ebook";
import PaymentSuccess from "./pages/PaymentSuccess";
import EbookLogin from "./pages/EbookLogin";
import EbookReader from "./pages/EbookReader";
import Loudness from "./pages/Loudness";
import Admin from "./pages/Admin";

import LiveChat from "./components/LiveChat";
import PageTracker from "./components/PageTracker";

const queryClient = new QueryClient();

const ConditionalLiveChat = () => {
  const { pathname } = useLocation();
  return pathname.startsWith("/admin") ? null : <LiveChat />;
};

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <SpotifyPlayerProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
            <ConditionalLiveChat />
          <PageTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogArticle />} />
            <Route path="/services" element={<Services />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/projets" element={<Projets />} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
            <Route path="/cgv" element={<CGV />} />
            <Route path="/ebook" element={<Ebook />} />
            <Route path="/ebook/login" element={<EbookLogin />} />
            <Route path="/ebook/reader" element={<EbookReader />} />
            <Route path="/loudness" element={<Loudness />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/admin" element={<Admin />} />
            
            {/* Redirections anciennes URLs */}
            <Route path="/a-propos" element={<Navigate to="/" replace />} />
            <Route path="/about" element={<Navigate to="/" replace />} />
            <Route path="/programmes" element={<Navigate to="/services" replace />} />
            <Route path="/programs" element={<Navigate to="/services" replace />} />
            <Route path="/our-projects" element={<Navigate to="/projets" replace />} />
            <Route path="/projects" element={<Navigate to="/projets" replace />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SpotifyPlayerProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;