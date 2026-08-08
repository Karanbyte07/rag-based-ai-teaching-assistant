import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import RootLayout from "./components/layout/RootLayout";
import HomePage from "./pages/HomePage";
import LecturesPage from "./pages/LecturesPage";
import ProcessingPage from "./pages/ProcessingPage";
import ChatPage from "./pages/ChatPage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path="lectures" element={<LecturesPage />} />
            <Route path="processing/:jobId" element={<ProcessingPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="settings" element={<SettingsPage />} />
            {/* Legacy path from the first prototype. */}
            <Route path="jobs" element={<Navigate to="/lectures" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
