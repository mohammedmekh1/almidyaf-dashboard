import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { SheetsProvider } from "./contexts/SheetsContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Leads from "./pages/Leads";
import Orders from "./pages/Orders";
import Tasks from "./pages/Tasks";
import Delivery from "./pages/Delivery";
import CustomerService from "./pages/CustomerService";
import Content from "./pages/Content";

function Router() {
  return (
    <Switch>
      <Route path="/"                  component={Home} />
      <Route path="/leads"             component={Leads} />
      <Route path="/orders"            component={Orders} />
      <Route path="/tasks"             component={Tasks} />
      <Route path="/delivery"          component={Delivery} />
      <Route path="/customer-service"  component={CustomerService} />
      <Route path="/content"           component={Content} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <SheetsProvider>
          <TooltipProvider>
            <Toaster position="top-center" dir="rtl" />
            <Router />
          </TooltipProvider>
        </SheetsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
