import React, { useState } from 'react';
import { Menu, Bell, Map, History, Wrench, LogOut, Home, Bike, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Notifications } from './Notifications';

interface HeaderProps {
  onNavigate: (page: string) => void;
}

export function Header({ onNavigate }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleNavigation = (page: string) => {
    onNavigate(page);
    setShowMenu(false);
  };

  return (
    <>
      <header className="header">
        <div className="container mx-auto flex justify-between items-center p-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowMenu(true)} className="p-1 text-white hover:text-yellow-400">
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-white">MotoTracker</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowNotifications(true)}
              className="p-1 text-white hover:text-yellow-400 rounded-full"
              title="Notificações"
            >
              <Bell className="h-6 w-6" />
            </button>
            <button 
              onClick={() => handleNavigation('maintenance')}
              className="p-1 text-white hover:text-yellow-400 rounded-full"
              title="Manutenções"
            >
              <Wrench className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {showMenu && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setShowMenu(false)}
          />
          
          <div className="side-menu">
            <div className="p-4 bg-black text-white">
              <h2 className="text-xl font-bold">Menu</h2>
            </div>
            
            <nav className="p-2">
              <button 
                onClick={() => handleNavigation('home')}
                className="menu-item"
              >
                <Home className="h-5 w-5" />
                <span>Início</span>
              </button>

              <button 
                onClick={() => handleNavigation('motos')}
                className="menu-item"
              >
                <Bike className="h-5 w-5" />
                <span>Minhas Motos</span>
              </button>

              <button 
                onClick={() => handleNavigation('map')}
                className="menu-item"
              >
                <Map className="h-5 w-5" />
                <span>Mapa de Rotas</span>
              </button>

              <button 
                onClick={() => handleNavigation('history')}
                className="menu-item"
              >
                <History className="h-5 w-5" />
                <span>Histórico</span>
              </button>

              <button 
                onClick={() => handleNavigation('maintenance')}
                className="menu-item"
              >
                <Wrench className="h-5 w-5" />
                <span>Manutenções</span>
              </button>

              <button 
                onClick={() => handleNavigation('profile')}
                className="menu-item"
              >
                <User className="h-5 w-5" />
                <span>Meu Perfil</span>
              </button>

              <button 
                onClick={handleLogout}
                className="menu-item text-red-500 hover:text-red-400"
              >
                <LogOut className="h-5 w-5" />
                <span>Sair</span>
              </button>
            </nav>
          </div>
        </>
      )}

      {showNotifications && (
        <Notifications onClose={() => setShowNotifications(false)} />
      )}
    </>
  );
}