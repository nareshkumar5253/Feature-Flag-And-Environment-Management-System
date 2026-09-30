
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import FeatureFlags from "./pages/features/FeatureFlags";
import Environments from "./pages/environments/Environments";
import Rollouts from "./pages/rollouts/Rollouts";
import Assignments from "./pages/assignments/Assignments";
import Analytics from "./pages/analytics/Analytics";
import AuditLogs from "./pages/audit/AuditLogs";

interface PagePlaceholderProps {
  title: string;
  description: string;
}

function PagePlaceholder({
  title,
  description,
}: PagePlaceholderProps) {
  return (
    <div style={{ padding: "32px" }}>
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          padding: "32px",
          minHeight: "300px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "24px",
            color: "#0f172a",
          }}
        >
          {title}
        </h1>

        <p
          style={{
            marginTop: "10px",
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route
                path="/dashboard"
                element={<Dashboard />}
              />

              <Route
                path="/features"
                element={<FeatureFlags />}
              />

              <Route
                path="/environments"
                element={<Environments />}
              />

              <Route
                path="/rollouts"
                element={<Rollouts />}
              />

              <Route
                path="/assignments"
                element={<Assignments />}
              />

              <Route
                path="/analytics"
                element={<Analytics />}
              />

              <Route
                path="/audit"
                element={<AuditLogs />}
              />

              {/* Future pages */}
              <Route
                path="/users"
                element={
                  <PagePlaceholder
                    title="Users"
                    description="Manage platform users and role-based access."
                  />
                }
              />
            </Route>
          </Route>

          {/* Default Route */}
          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          {/* Unknown Route */}
          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
