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
    // Aqui você pode implementar lógica adicional quando a localização é atualizada
    // Por exemplo, notificar outros componentes ou fazer chamadas para APIs
    console.log('Nova localização:', location);
  };

  return (
    <div className="space-y-4">
      {motos.length > 1 && standalone && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
          {motos.map((moto) => (
            <button
              key={moto.id}
              onClick={() => setSelectedMoto(moto)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap ${
                selectedMoto?.id === moto.id
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 shadow-lg transform -translate-y-0.5'
                  : 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300 hover:from-gray-600 hover:to-gray-700'
              }`}
            >
              {moto.marca} {moto.modelo}
            </button>
          ))}
        </div>
      )}

      <TrackingMap
        motoId={selectedMoto?.id}
        standalone={standalone}
        onLocationUpdate={handleLocationUpdate}
      />
    </div>
  );
}