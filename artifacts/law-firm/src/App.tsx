import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/lib/auth";

// Public Pages
import Home from "@/pages/public/Home";
import BlogList from "@/pages/public/BlogList";
import BlogPost from "@/pages/public/BlogPost";

// Admin Pages
import Login from "@/pages/admin/Login";
import Dashboard from "@/pages/admin/Dashboard";
import Clients from "@/pages/admin/Clients";
import ClientDetail from "@/pages/admin/ClientDetail";
import Cases from "@/pages/admin/Cases";
import CaseDetail from "@/pages/admin/CaseDetail";
import Lawyers from "@/pages/admin/Lawyers";
import AdminBlogList from "@/pages/admin/BlogList";
import Notifications from "@/pages/admin/Notifications";

import PublicLayout from "@/components/layout/PublicLayout";
import AdminLayout from "@/components/layout/AdminLayout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">Carregando...</div>;
  }

  if (!user) {
    setLocation("/admin/login");
    return null;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/admin/login" component={Login} />
      <Route path="/admin*">
        <AdminLayout>
          <Switch>
            <Route path="/admin/dashboard"><ProtectedRoute component={Dashboard} /></Route>
            <Route path="/admin/clients"><ProtectedRoute component={Clients} /></Route>
            <Route path="/admin/clients/:id"><ProtectedRoute component={ClientDetail} /></Route>
            <Route path="/admin/cases"><ProtectedRoute component={Cases} /></Route>
            <Route path="/admin/cases/:id"><ProtectedRoute component={CaseDetail} /></Route>
            <Route path="/admin/lawyers"><ProtectedRoute component={Lawyers} /></Route>
            <Route path="/admin/blog"><ProtectedRoute component={AdminBlogList} /></Route>
            <Route path="/admin/notifications"><ProtectedRoute component={Notifications} /></Route>
            <Route component={NotFound} />
          </Switch>
        </AdminLayout>
      </Route>
      <Route path="*">
        <PublicLayout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/blog" component={BlogList} />
            <Route path="/blog/:id" component={BlogPost} />
            <Route component={NotFound} />
          </Switch>
        </PublicLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
