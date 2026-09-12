import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { AppSettingsProvider } from "@/providers/AppSettingsProvider";
import AuthPage from "./pages/AuthPage";
import InboxPage from "./pages/InboxPage";
import ChatPage from "./pages/ChatPage";
import FriendsPage from "./pages/FriendsPage";
import ProfilePage from "./pages/ProfilePage";
import RoomsPage from "./pages/RoomsPage";
import RoomChatPage from "./pages/RoomChatPage";
import FeedPage from "./pages/FeedPage";
import AnonymousMessagesPage from "./pages/AnonymousMessagesPage";
import NotificationsListPage from "./pages/NotificationsListPage";
import NotificationsPage from "./pages/settings/NotificationsPage";
import PrivacyPage from "./pages/settings/PrivacyPage";
import AppearancePage from "./pages/settings/AppearancePage";
import LanguagePage from "./pages/settings/LanguagePage";
import TranslationPage from "./pages/settings/TranslationPage";
import AdvancedSettingsPage from "./pages/settings/AdvancedSettingsPage";
import UserProfilePage from "./pages/UserProfilePage";
import NotFound from "./pages/NotFound";
import { usePresence } from "@/hooks/usePresence";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  usePresence();
  if (loading) return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<AuthPage />} />
    <Route path="/" element={<Navigate to="/rooms" replace />} />
    <Route path="/inbox" element={<ProtectedRoute><InboxPage /></ProtectedRoute>} />
    <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
    <Route path="/friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
    <Route path="/rooms" element={<ProtectedRoute><RoomsPage /></ProtectedRoute>} />
    <Route path="/rooms/:roomId" element={<ProtectedRoute><RoomChatPage /></ProtectedRoute>} />
    <Route path="/feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
    <Route path="/anonymous" element={<ProtectedRoute><AnonymousMessagesPage /></ProtectedRoute>} />
    <Route path="/notifications" element={<ProtectedRoute><NotificationsListPage /></ProtectedRoute>} />
    <Route path="/user/:userId" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
    <Route path="/settings/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
    <Route path="/settings/privacy" element={<ProtectedRoute><PrivacyPage /></ProtectedRoute>} />
    <Route path="/settings/appearance" element={<ProtectedRoute><AppearancePage /></ProtectedRoute>} />
    <Route path="/settings/language" element={<ProtectedRoute><LanguagePage /></ProtectedRoute>} />
    <Route path="/settings/translation" element={<ProtectedRoute><TranslationPage /></ProtectedRoute>} />
    <Route path="/settings/advanced" element={<ProtectedRoute><AdvancedSettingsPage /></ProtectedRoute>} />
    <Route path="/index" element={<Navigate to="/rooms" replace />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const AppWithSettings = () => (
  <AppSettingsProvider>
    <AppRoutes />
  </AppSettingsProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AppWithSettings />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
