import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import Home from './pages/Home';
import Chat from './pages/Chat';
import VoiceAssistant from './pages/VoiceAssistant';
import MediaLibrary from './pages/MediaLibrary';
import Progress from './pages/Progress';
import Appointments from './pages/Appointments';
import Emergency from './pages/Emergency';
import Navbar from './components/Navbar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/voice" element={<VoiceAssistant />} />
              <Route path="/media" element={<MediaLibrary />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/emergency" element={<Emergency />} />
            </Routes>
          </main>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
