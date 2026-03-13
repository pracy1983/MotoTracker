import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../../../lib/supabase';
import { calculateBounds, calculateOptimalZoom, calculateSpeed, calculateDistance } from '../utils/geolib';
import type { Location } from '../types';
import { useWebSocket } from '../hooks/useWebSocket';
import { Play, Square, Navigation, Activity, Gauge } from 'lucide-react';

const MOTO_ICON = new Icon({
  iconUrl: '/moto-icon.png',
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
        map.fitBounds([bounds.southWest, bounds.northEast], { padding: [50, 50] });
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
  const [sessionDistance, setSessionDistance] = useState(0);
  
  // Ref for accumulating distance to sync with DB
  const pendingDistanceRef = useRef(0);
  const lastSyncTimeRef = useRef(Date.now());
  const { isConnected, sendMessage } = useWebSocket(motoId);

  const syncOdometer = useCallback(async (distanceDelta: number) => {
    if (!motoId || distanceDelta <= 0) return;

    try {
      // Get current mileage first to avoid race conditions (simple approach)
      // For more robust sync, an RPC element like SET quilometragem_atual = quilometragem_atual + delta would be better
      // But we'll do a point update for now.
      const { data: moto } = await supabase
        .from('motocicletas')
        .select('quilometragem_atual')
        .eq('id', motoId)
        .single();
      
      if (moto) {
        const newKm = moto.quilometragem_atual + distanceDelta;
        await supabase
          .from('motocicletas')
          .update({ quilometragem_atual: newKm })
          .eq('id', motoId);
        
        // Broadcast update locally for other components
        window.dispatchEvent(new CustomEvent('odometerUpdate', { 
          detail: { motoId, quilometragem: newKm } 
        }));
      }
    } catch (err) {
      console.error('Error syncing odometer:', err);
    }
  }, [motoId]);

  const updateLocation = useCallback(async (position: GeolocationPosition) => {
    const newLocation: Location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: position.timestamp,
      speed: position.coords.speed || undefined,
      heading: position.coords.heading || undefined,
      accuracy: position.coords.accuracy
    };

    if (isConnected) {
      sendMessage({ type: 'location', motoId, data: newLocation });
    }

    setLocations(prev => {
      const newLocations = [...prev, newLocation];
      if (prev.length > 0) {
        const lastLoc = prev[prev.length - 1];
        const speed = calculateSpeed(lastLoc, newLocation);
        const distance = calculateDistance(lastLoc, newLocation);
        
        setCurrentSpeed(speed > 1 ? speed : 0); // Filter noise
        setTotalDistance(d => d + distance);
        setSessionDistance(d => d + distance);
        
        // Add to pending sync
        pendingDistanceRef.current += distance;
        
        // Sync with DB if pending > 50 meters or > 30 seconds
        const now = Date.now();
        if (pendingDistanceRef.current >= 0.05 || (now - lastSyncTimeRef.current > 30000 && pendingDistanceRef.current > 0)) {
           syncOdometer(pendingDistanceRef.current);
           pendingDistanceRef.current = 0;
           lastSyncTimeRef.current = now;
        }
      }
      return newLocations;
    });

    if (motoId && tracking) {
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
  }, [motoId, onLocationUpdate, isConnected, sendMessage, tracking, syncOdometer]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocalização não suportada');
      return;
    }

    const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };
    const id = navigator.geolocation.watchPosition(updateLocation, 
      (err) => console.error(err), 
      options
    );
    setWatchId(id);
    setTracking(true);
    setSessionDistance(0);
  }, [updateLocation]);

  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setTracking(false);
      // Final sync if any pending
      if (pendingDistanceRef.current > 0) {
        syncOdometer(pendingDistanceRef.current);
        pendingDistanceRef.current = 0;
      }
    }
  }, [watchId, syncOdometer]);

  useEffect(() => {
    if (motoId) {
      const loadRoutes = async () => {
        const { data } = await supabase
          .from('rotas')
          .select('*')
          .eq('motocicleta_id', motoId)
          .order('timestamp', { ascending: true });

        if (data && data.length > 0) {
          const routes = data.map(rota => ({
            latitude: rota.latitude,
            longitude: rota.longitude,
            timestamp: new Date(rota.timestamp).getTime(),
            speed: rota.speed,
            heading: rota.heading,
            accuracy: rota.accuracy
          }));
          setLocations(routes);
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
    <div className="flex flex-col gap-4">
      <div className="glass-card p-6 border-white/5 shadow-2xl overflow-hidden relative">
        {/* Progress Background */}
        <div className="absolute top-0 left-0 h-1 bg-orange-500 transition-all duration-500" style={{ width: tracking ? '100%' : '0%', opacity: tracking ? 1 : 0 }}></div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${tracking ? 'bg-orange-500 animate-pulse' : 'bg-white/5'}`}>
              <Navigation className={`h-6 w-6 ${tracking ? 'text-black' : 'text-orange-500'}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-orbitron tracking-tight uppercase">Rastreador Live</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{tracking ? 'Monitorando Percurso' : 'Pronto para Rodar'}</p>
            </div>
          </div>
          
          <button
            onClick={tracking ? stopTracking : startTracking}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${
              tracking 
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' 
                : 'btn-premium'
            }`}
          >
            {tracking ? (
              <><Square className="h-4 w-4" /> PARAR</>
            ) : (
              <><Play className="h-4 w-4 fill-current" /> INICIAR TRIP</>
            )}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/2 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center">
            <Activity className="h-4 w-4 text-orange-500 mb-2 opacity-50" />
            <span className="text-[10px] font-black text-gray-600 uppercase mb-1">Velocidade</span>
            <span className="text-xl font-bold text-white font-orbitron">{currentSpeed.toFixed(0)} <span className="text-[8px] opacity-40">KM/H</span></span>
          </div>
          <div className="bg-white/2 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center">
            <Navigation className="h-4 w-4 text-orange-500 mb-2 opacity-50" />
            <span className="text-[10px] font-black text-gray-600 uppercase mb-1">Esta Trip</span>
            <span className="text-xl font-bold text-white font-orbitron">{sessionDistance.toFixed(2)} <span className="text-[8px] opacity-40">KM</span></span>
          </div>
          <div className="bg-white/2 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center">
            <Gauge className="h-4 w-4 text-orange-500 mb-2 opacity-50" />
            <span className="text-[10px] font-black text-gray-600 uppercase mb-1">Total Hist.</span>
            <span className="text-xl font-bold text-white font-orbitron">{totalDistance.toFixed(1)} <span className="text-[8px] opacity-40">KM</span></span>
          </div>
        </div>

        <div className="h-[350px] rounded-[30px] overflow-hidden relative shadow-inner border border-white/5">
          <MapContainer
            center={locations[locations.length-1] ? [locations[locations.length-1].latitude, locations[locations.length-1].longitude] : [-23.5505, -46.6333]}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            className="z-0 grayscale contrast-125 brightness-75 invert hue-rotate-180"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations.length > 1 && (
              <>
                <Polyline
                  positions={locations.map(loc => [loc.latitude, loc.longitude])}
                  color="#f97316"
                  weight={4}
                  opacity={1}
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
          
          {/* Map Overlay Shadow */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.4)] rounded-[30px]"></div>
        </div>
      </div>
    </div>
  );
}
