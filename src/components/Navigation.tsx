import React from 'react';
import { Home, Bike, Map, Wrench, User, LogOut, Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'motos', label: 'Minhas Motos', icon: Bike },
    { id: 'map', label: 'Rotas', icon: Map },
    { id: 'maintenance', label: 'Manutenção', icon: Wrench },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <>
      {/* Desktop Header */}
      <header className="desktop-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Bike className="h-6 w-6 text-black" />
          </div>
          <h1 className="text-xl font-bold font-orbitron tracking-tighter text-white">
            MOTO<span className="text-orange-500">TRACKER</span>
          </h1>
        </div>

        <nav className="flex items-center gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`desktop-nav-link ${currentPage === item.id ? 'active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-[#141417]"></span>
          </button>
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Sair"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            >
              <Icon />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      {/* Mobile Top Bar (Title and Logout only) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 glass-panel px-6 flex items-center justify-between z-50">
        <h1 className="text-lg font-bold font-orbitron tracking-tighter text-white">
          MOTO<span className="text-orange-500">TRACKER</span>
        </h1>
        <button 
          onClick={handleLogout}
          className="p-2 text-gray-400"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </>
  );
}
