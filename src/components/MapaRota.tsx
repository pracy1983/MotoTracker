import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../lib/supabase';

interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface Motocicleta {
  id: string;
  marca: string;
  modelo: string;
}

interface RouteTrackerProps {
  motoId?: string;
  standalone?: boolean;
}

function LocationUpdater({ locations }: { locations: Location[] }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      const bounds = locations.reduce(
        (bounds, loc) => bounds.extend([loc.latitude, loc.longitude]),
        map.getBounds()
      );
      map.fitBounds(bounds);
    }
  }, [locations, map]);

  return null;
}

export function MapaRota({ motoId, standalone = false }: RouteTrackerProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [tracking, setTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [totalDistance, setTotalDistance] = useState(0);
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
        // Se tiver um motoId específico, use-o, caso contrário use a primeira moto
        const motoInicial = motoId 
          ? motosData.find(m => m.id === motoId) 
          : motosData[0];
        setSelectedMoto(motoInicial || motosData[0]);
        carregarRotas(motoInicial?.id || motosData[0].id);
      }
    };

    carregarMotos();
  }, [motoId]);

  const carregarRotas = async (motoId: string) => {
    const { data } = await supabase
      .from('rotas')
      .select('*')
      .eq('motocicleta_id', motoId)
      .order('timestamp', { ascending: true });

    if (data) {
      setLocations(data.map(rota => ({
        latitude: rota.latitude,
        longitude: rota.longitude,
        timestamp: new Date(rota.timestamp).getTime()
      })));
      calcularDistanciaTotal(data);
    } else {
      setLocations([]);
      setTotalDistance(0);
    }
  };

  const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calcularDistanciaTotal = (rotas: any[]) => {
    let total = 0;
    for (let i = 1; i < rotas.length; i++) {
      total += calcularDistancia(
        rotas[i-1].latitude,
        rotas[i-1].longitude,
        rotas[i].latitude,
        rotas[i].longitude
      );
    }
    setTotalDistance(total);
  };

  const iniciarRastreamento = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada pelo seu navegador');
      return;
    }

    if (!selectedMoto) {
      alert('Por favor, selecione uma moto primeiro');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      () => {
        const id = navigator.geolocation.watchPosition(
          async (position) => {
            const newLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              timestamp: position.timestamp
            };

            setLocations(prev => {
              const newLocations = [...prev, newLocation];
              if (prev.length > 0) {
                const lastLoc = prev[prev.length - 1];
                const distance = calcularDistancia(
                  lastLoc.latitude,
                  lastLoc.longitude,
                  newLocation.latitude,
                  newLocation.longitude
                );
                setTotalDistance(d => d + distance);
              }
              return newLocations;
            });

            await supabase.from('rotas').insert([{
              motocicleta_id: selectedMoto.id,
              latitude: newLocation.latitude,
              longitude: newLocation.longitude,
              timestamp: new Date(newLocation.timestamp).toISOString()
            }]);
          },
          (error) => {
            console.error('Erro ao rastrear localização:', error);
            alert('Erro ao rastrear localização. Por favor, verifique as permissões.');
          },
          options
        );

        setWatchId(id);
        setTracking(true);
      },
      () => {
        alert('Por favor, permita o acesso à sua localização para rastrear a rota.');
      },
      options
    );
  };

  const pararRastreamento = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setTracking(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
        {motos.length > 1 && standalone && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
            {motos.map((moto) => (
              <button
                key={moto.id}
                onClick={() => {
                  setSelectedMoto(moto);
                  carregarRotas(moto.id);
                }}
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

        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Rastreamento de Rota</h3>
            <p className="text-sm text-gray-400">
              {selectedMoto && `${selectedMoto.marca} ${selectedMoto.modelo} - `}
              Distância total: {totalDistance.toFixed(2)} km
            </p>
          </div>
          <button
            onClick={tracking ? pararRastreamento : iniciarRastreamento}
            className={`px-4 py-2 rounded-md transition-all duration-300 ${
              tracking 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 hover:from-yellow-400 hover:to-yellow-500'
            }`}
          >
            {tracking ? 'Parar Rastreamento' : 'Iniciar Rastreamento'}
          </button>
        </div>

        <div className="h-[400px] rounded-lg overflow-hidden relative bg-gray-900">
          <MapContainer
            center={[-23.5505, -46.6333]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {locations.length > 1 && (
              <Polyline
                positions={locations.map(loc => [loc.latitude, loc.longitude])}
                color="#EAB308"
                weight={3}
                opacity={0.7}
              />
            )}
            <LocationUpdater locations={locations} />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}