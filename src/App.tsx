import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Timer from "./pages/Timer";
import Reports from "./pages/Reports";
import Approvals from "./pages/Approvals";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Clients from "./pages/Clients";
import BillableRates from "./pages/BillableRates";
import Invoices from "./pages/Invoices";
import Tags from "./pages/Tags";
import Goals from "./pages/Goals";
import Integrations from "./pages/Integrations";
import Subscription from "./pages/Subscription";
import Organization from "./pages/Organization";
import Members from "./pages/Members";
import Settings from "./pages/Settings";
import AdminConsole from "./pages/AdminConsole";
import UserProfile from "./pages/UserProfile";
import Payouts from "./pages/Payouts";
import FinanceAlerts from "./pages/FinanceAlerts";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            
            {/* Protected Routes - Track */}
            <Route 
              path="/timer" 
              element={
                <ProtectedRoute>
                  <Timer />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Routes - Analyze */}
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/approvals" 
              element={
                <ProtectedRoute>
                  <Approvals />
                </ProtectedRoute>
              } 
            />
            
            {/* Manage */}
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:projectId" element={<ProjectDetail />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/billable-rates" element={<BillableRates />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/payouts" element={<Payouts />} />
            <Route path="/alerts" element={<FinanceAlerts />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/integrations" element={<Integrations />} />
            {/* Protected Routes - Manage */}
            <Route 
              path="/projects" 
              element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/projects/:projectId" 
              element={
                <ProtectedRoute>
                  <ProjectDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clients" 
              element={
                <ProtectedRoute>
                  <Clients />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/billable-rates" 
              element={
                <ProtectedRoute>
                  <BillableRates />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/invoices" 
              element={
                <ProtectedRoute>
                  <Invoices />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/payouts" 
              element={
                <ProtectedRoute>
                  <Payouts />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/alerts" 
              element={
                <ProtectedRoute>
                  <FinanceAlerts />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tags" 
              element={
                <ProtectedRoute>
                  <Tags />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/goals" 
              element={
                <ProtectedRoute>
                  <Goals />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/integrations" 
              element={
                <ProtectedRoute>
                  <Integrations />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Routes - Admin */}
            <Route 
              path="/subscription" 
              element={
                <ProtectedRoute>
                  <Subscription />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/organization" 
              element={
                <ProtectedRoute>
                  <Organization />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/members" 
              element={
                <ProtectedRoute>
                  <Members />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-console" 
              element={
                <ProtectedRoute>
                  <AdminConsole />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Routes - User */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } 
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
