import { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { useAuthStore } from "./store/authStore";
import { useAppStore } from "./store/appStore";

const AuthPage = lazy(() =>
  import("./pages/AuthPage").then((module) => ({ default: module.AuthPage })),
);
const HomePage = lazy(() =>
  import("./pages/HomePage").then((module) => ({ default: module.HomePage })),
);
const MatchPage = lazy(() =>
  import("./pages/MatchPage").then((module) => ({ default: module.MatchPage })),
);
const TerrainsPage = lazy(() =>
  import("./pages/TerrainsPage").then((module) => ({
    default: module.TerrainsPage,
  })),
);
const TeamsPage = lazy(() =>
  import("./pages/TeamsPage").then((module) => ({ default: module.TeamsPage })),
);
const WalletPage = lazy(() =>
  import("./pages/WalletPage").then((module) => ({
    default: module.WalletPage,
  })),
);
const OpsPage = lazy(() =>
  import("./pages/OpsPage").then((module) => ({ default: module.OpsPage })),
);
const ChatPage = lazy(() =>
  import("./pages/ChatPage").then((module) => ({ default: module.ChatPage })),
);
const NotificationsPage = lazy(() =>
  import("./pages/NotificationsPage").then((module) => ({
    default: module.NotificationsPage,
  })),
);
const ProfilePage = lazy(() =>
  import("./pages/ProfilePage").then((module) => ({
    default: module.ProfilePage,
  })),
);

function PrivateRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  return token ? children : <Navigate to="/auth" replace />;
}

export default function App() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    hydrate();
  }, [hydrate, theme]);

  return (
    <Suspense fallback={<AppLoading />}>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="matches/:id" element={<MatchPage />} />
          <Route path="terrains" element={<TerrainsPage />} />
          <Route path="teams" element={<TeamsPage />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="ops" element={<OpsPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

function AppLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-obsidian text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-black text-white/70 shadow-glass">
        Loading HKick...
      </div>
    </div>
  );
}
