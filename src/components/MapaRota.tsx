import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TrackingMap } from '../modules/tracking/components/TrackingMap';
import type { Location } from '../modules/tracking/types';

interface Motocicleta {
  id: string;
  marca: string;
  modelo: string;
}

interface RouteTrackerProps {
  motoId?: string;
  standalone?: boolean;
}

export function MapaRota({ motoId, standalone = false }: RouteTrackerProps) {
  const [motos, setMotos] = useState<Motocicleta[]>([]);
  const [selectedMoto, setSelectedMoto] = useState<Motocicleta | null>(null);

  useEffect(() => {
    const carregarMotos = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: motosData } = await supabase
        .from('motocicletas')
        .select('id, marca, modelo')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (motosData && motosData.length > 0) {
        setMotos(motosData);
        const motoInicial = motoId 
          ? motosData.find(m => m.id === motoId) 
          : motosData[0];
        setSelectedMoto(motoInicial || motosData[0]);
      }
    };

    carregarMotos();
  }, [motoId]);

  const handleLocationUpdate = async (location: Location) => {
    console.log('Nova localização:', location);
  };

  return (
    <div className="space-y-6">
      {motos.length > 1 && standalone && (
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {motos.map((moto) => (
            <button
              key={moto.id}
              onClick={() => setSelectedMoto(moto)}
              className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 whitespace-nowrap border-2 ${
                selectedMoto?.id === moto.id
                  ? 'bg-orange-500 border-orange-500 text-black shadow-lg shadow-orange-500/20'
                  : 'bg-transparent border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              {moto.marca} {moto.modelo}
            </button>
          ))}
        </div>
      )}

      <div className={`relative ${standalone ? 'h-[70vh]' : 'h-full'} rounded-3xl overflow-hidden border border-white/5 shadow-2xl`}>
        <TrackingMap
          motoId={selectedMoto?.id}
          standalone={standalone}
          onLocationUpdate={handleLocationUpdate}
        />
        
        {/* Decorative Overlay for Map */}
        <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 rounded-3xl"></div>
      </div>
    </div>
  );
}