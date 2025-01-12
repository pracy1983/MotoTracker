import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../../../lib/supabase';
import { calculateBounds, calculateOptimalZoom, calculateSpeed, calculateDistance } from '../utils/geolib';
import type { Location } from '../types';
import { useWebSocket } from '../hooks/useWebSocket';

const MOTO_ICON = new Icon({
  iconUrl: '/moto-icon.png', // Adicione este ícone aos assets
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface TrackingMapProps {
  motoId?: string;
  standalone?: boolean;
  onLocationUpdate?: (location: Location) => void;
}

function MapController({ locations }: { locations: Location[] }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      const bounds = calculateBounds(locations);
      if (bounds) {
        const zoom = calculateOptimalZoom(bounds, {
          width: map.getSize().x,
          height: map.getSize().y
        });
        map.fitBounds([bounds.southWest, bounds.northEast]);
        map.setZoom(zoom);
      }
    }
  }, [locations, map]);

  return null;
}

export function TrackingMap({ motoId, standalone = false, onLocationUpdate }: TrackingMapProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [tracking, setTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const { isConnected, error: wsError, sendMessage } = useWebSocket(motoId);

  const updateLocation = useCallback(async (position: GeolocationPosition) => {
    const newLocation: Location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: position.timestamp,
      speed: position.coords.speed || undefined,
      heading: position.coords.heading || undefined,
      accuracy: position.coords.accuracy
    };

    // Enviar localização via WebSocket
    if (isConnected) {
      sendMessage({
        type: 'location',
        motoId,
        data: newLocation
      });
    }

    setLocations(prev => {
      const newLocations = [...prev, newLocation];
      if (prev.length > 0) {
        const lastLoc = prev[prev.length - 1];
        const speed = calculateSpeed(lastLoc, newLocation);
        const distance = calculateDistance(lastLoc, newLocation);
        setCurrentSpeed(speed);
        setTotalDistance(d => d + distance);
      }
      return newLocations;
    });

    if (motoId) {
      await supabase.from('rotas').insert([{
        motocicleta_id: motoId,
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
        timestamp: new Date(newLocation.timestamp).toISOString(),
        speed: newLocation.speed,
        heading: newLocation.heading,
        accuracy: newLocation.accuracy
      }]);
    }

    onLocationUpdate?.(newLocation);
  }, [motoId, onLocationUpdate, isConnected, sendMessage]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada pelo seu navegador');
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
          updateLocation,
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
  }, [updateLocation]);

  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setTracking(false);
    }
  }, [watchId]);

  useEffect(() => {
    if (motoId) {
      const loadRoutes = async () => {
        const { data } = await supabase
          .from('rotas')
          .select('*')
          .eq('motocicleta_id', motoId)
          .order('timestamp', { ascending: true });

        if (data) {
          const routes = data.map(rota => ({
            latitude: rota.latitude,
            longitude: rota.longitude,
            timestamp: new Date(rota.timestamp).getTime(),
            speed: rota.speed,
            heading: rota.heading,
            accuracy: rota.accuracy
          }));
          setLocations(routes);
          
          // Calcula distância total
          let total = 0;
          for (let i = 1; i < routes.length; i++) {
            total += calculateDistance(routes[i-1], routes[i]);
          }
          setTotalDistance(total);
        }
      };

      loadRoutes();
    }
  }, [motoId]);

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Rastreamento em Tempo Real</h3>
            <div className="text-sm text-gray-400 space-y-1">
              <p>Distância total: {totalDistance.toFixed(2)} km</p>
              {tracking && <p>Velocidade atual: {currentSpeed.toFixed(1)} km/h</p>}
            </div>
          </div>
          <button
            onClick={tracking ? stopTracking : startTracking}
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
              <>
                <Polyline
                  positions={locations.map(loc => [loc.latitude, loc.longitude])}
                  color="#EAB308"
                  weight={3}
                  opacity={0.7}
                />
                <Marker
                  position={[
                    locations[locations.length - 1].latitude,
                    locations[locations.length - 1].longitude
                  ]}
                  icon={MOTO_ICON}
                />
              </>
            )}
            <MapController locations={locations} />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
