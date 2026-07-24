import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { IntroProvider } from "./context/IntroContext";
import { ThemeProvider } from "./context/ThemeContext";
import HomeMain from "./pages/HomeMain";
import CustomCursor from "./components/CustomCursor";
import ThemeToggle from "./components/ThemeToggle";
import { useSiteData } from "./hooks/useSiteData";
import UnderConstruction from "./pages/UnderConstruction";

const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const DynamicPage = lazy(() => import("./pages/DynamicPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Careers = lazy(() => import("./pages/Careers"));
const JobDetail = lazy(() => import("./pages/JobDetail"));

export default function App() {
  const { siteData, loading } = useSiteData();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center">
        <span className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isUnderConstruction = siteData?.theme?.underConstruction === true;
  const isAdminPath = window.location.pathname.startsWith("/admin");

  let isAdminLoggedIn = false;
  try {
    isAdminLoggedIn = !!localStorage.getItem("adminToken");
  } catch (err) {
    // Fail-safe for security/private-browsing settings
  }

  if (isUnderConstruction && !isAdminPath && !isAdminLoggedIn) {
    return (
      <ThemeProvider>
        <CustomCursor />
        <UnderConstruction logoConfig={siteData?.logo} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <IntroProvider>
        <CustomCursor />
        {/* Vertical Sticky Theme Toggle Widget on Left Margin */}
        <div className="fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 z-[999]">
          <ThemeToggle orientation="vertical" layoutId="theme-toggle-sticky-left" />
        </div>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<HomeMain />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/careers/:slug" element={<JobDetail />} />
            <Route path="/:slug" element={<DynamicPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </IntroProvider>
    </ThemeProvider>
  );
}
