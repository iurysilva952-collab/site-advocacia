import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
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

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        Carregando...
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/admin/login" />;
  }

  return <Component />;
}

function AdminRoutes() {
  return (
    <Switch>
      <Route path="/admin/login" component={Login} />
      <Route path="/admin/dashboard">
        <AdminLayout>
          <ProtectedRoute component={Dashboard} />
        </AdminLayout>
      </Route>
      <Route path="/admin/clients/:id">
        <AdminLayout>
          <ProtectedRoute component={ClientDetail} />
        </AdminLayout>
      </Route>
      <Route path="/admin/clients">
        <AdminLayout>
          <ProtectedRoute component={Clients} />
        </AdminLayout>
      </Route>
      <Route path="/admin/cases/:id">
        <AdminLayout>
          <ProtectedRoute component={CaseDetail} />
        </AdminLayout>
      </Route>
      <Route path="/admin/cases">
        <AdminLayout>
          <ProtectedRoute component={Cases} />
        </AdminLayout>
      </Route>
      <Route path="/admin/lawyers">
        <AdminLayout>
          <ProtectedRoute component={Lawyers} />
        </AdminLayout>
      </Route>
      <Route path="/admin/blog">
        <AdminLayout>
          <ProtectedRoute component={AdminBlogList} />
        </AdminLayout>
      </Route>
      <Route path="/admin/notifications">
        <AdminLayout>
          <ProtectedRoute component={Notifications} />
        </AdminLayout>
      </Route>
      <Route path="/admin">
        <Redirect to="/admin/dashboard" />
      </Route>
    </Switch>
  );
}

function PublicRoutes() {
  return (
    <PublicLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/blog" component={BlogList} />
        <Route path="/blog/:id" component={BlogPost} />
        <Route component={NotFound} />
      </Switch>
    </PublicLayout>
  );
}

function Router() {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");

  return isAdmin ? <AdminRoutes /> : <PublicRoutes />;
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
