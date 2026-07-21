import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { IntroProvider } from "./context/IntroContext";
import { ThemeProvider } from "./context/ThemeContext";
import HomeMain from "./pages/HomeMain";
import CustomCursor from "./components/CustomCursor";

const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const DynamicPage = lazy(() => import("./pages/DynamicPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Careers = lazy(() => import("./pages/Careers"));
const JobDetail = lazy(() => import("./pages/JobDetail"));

export default function App() {
  return (
    <ThemeProvider>
      <IntroProvider>
        <CustomCursor />
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
