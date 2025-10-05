import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Timer from "./pages/Timer";
import Reports from "./pages/Reports";
import Approvals from "./pages/Approvals";
import Projects from "./pages/Projects";
import Clients from "./pages/Clients";
import Members from "./pages/Members";
import BillableRates from "./pages/BillableRates";
import Invoices from "./pages/Invoices";
import Tags from "./pages/Tags";
import Goals from "./pages/Goals";
import Integrations from "./pages/Integrations";
import Subscription from "./pages/Subscription";
import Organization from "./pages/Organization";
import Settings from "./pages/Settings";
import AdminConsole from "./pages/AdminConsole";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Track */}
          <Route path="/timer" element={<Timer />} />
          
          {/* Analyze */}
          <Route path="/reports" element={<Reports />} />
          <Route path="/approvals" element={<Approvals />} />
          
          {/* Manage */}
          <Route path="/projects" element={<Projects />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/members" element={<Members />} />
          <Route path="/billable-rates" element={<BillableRates />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/tags" element={<Tags />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/integrations" element={<Integrations />} />
          
          {/* Admin */}
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/organization" element={<Organization />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin-console" element={<AdminConsole />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
