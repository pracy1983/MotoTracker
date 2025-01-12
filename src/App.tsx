import React, { useEffect, useState } from 'react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Header } from './components/Header';
import { MapaRota } from './components/MapaRota';
import { ManutencoesProgramadas } from './components/ManutencoesProgramadas';
import { Settings } from './components/Settings';
import { MinhasMotos } from './components/MinhasMotos';
import { MeuPerfil } from './components/MeuPerfil';
import { supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return <Dashboard />;
      case 'motos':
        return <MinhasMotos />;
      case 'map':
        return <MapaRota standalone />;
      case 'maintenance':
        return <ManutencoesProgramadas />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <MeuPerfil />;
      default:
        return <Dashboard />;
    }
  };

  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Configuração Necessária</h2>
          <p className="text-gray-400 mb-4">
            Para começar, clique no botão "Connect to Supabase" no canto superior direito para configurar seu banco de dados.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-400">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen">
      <Header onNavigate={setCurrentPage} />
      <main className="container mx-auto px-4 py-8 mt-16">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;