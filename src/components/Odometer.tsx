import React, { useState, useEffect } from 'react';
import { Edit2, X, Save, Gauge } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface OdometerProps {
  quilometragem: number;
  motoId: string;
  onUpdate?: () => void;
}

export function Odometer({ quilometragem, motoId, onUpdate }: OdometerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentKm, setCurrentKm] = useState(quilometragem);
  const [newKm, setNewKm] = useState(quilometragem.toString());
  const [loading, setLoading] = useState(false);
  
  // Update local mileage when prop changes
  useEffect(() => {
    setCurrentKm(quilometragem);
    setNewKm(quilometragem.toString());
  }, [quilometragem]);

  // Listen for real-time updates from TrackingMap
  useEffect(() => {
    const handleLiveSync = (event: any) => {
      if (event.detail.motoId === motoId) {
        setCurrentKm(event.detail.quilometragem);
      }
    };

    window.addEventListener('odometerUpdate', handleLiveSync);
    return () => window.removeEventListener('odometerUpdate', handleLiveSync);
  }, [motoId]);

  // For the circular animation
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min((currentKm % 1000) / 1000, 1) || 0; // Show progress within the current thousand
  const offset = circumference - progress * circumference;

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('motocicletas')
        .update({ quilometragem_atual: parseInt(newKm) })
        .eq('id', motoId);

      if (error) throw error;
      
      if (onUpdate) onUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar quilometragem:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      <div className="absolute inset-0 bg-orange-500/10 rounded-full blur-3xl -z-10 scale-150"></div>

      <div className="relative w-64 h-64 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-white/5"
          />
          <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="url(#orangeGradient)"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
          <defs>
            <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {isEditing ? (
            <div className="flex flex-col items-center gap-2 p-4 bg-black/90 rounded-3xl border border-white/10 shadow-2xl animate-scale-up">
              <input
                type="number"
                value={newKm}
                onChange={(e) => setNewKm(e.target.value)}
                className="w-32 bg-transparent border-b-2 border-orange-500 text-3xl font-orbitron font-bold text-center text-white focus:outline-none"
                autoFocus
              />
              <div className="flex gap-4 mt-2">
                <button onClick={handleSave} disabled={loading} className="p-2 rounded-full bg-orange-500 text-black hover:scale-110 transition-transform">
                   <Save className="h-5 w-5"/>
                </button>
                <button onClick={() => setIsEditing(false)} className="p-2 rounded-full bg-white/10 text-white hover:scale-110 transition-transform">
                   <X className="h-5 w-5"/>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center group">
              <div className="relative">
                 <Gauge className="h-6 w-6 text-orange-500 mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                 {loading && <div className="absolute inset-0 animate-ping bg-orange-500 rounded-full opacity-20"></div>}
              </div>
              <span className="text-5xl font-black font-orbitron tracking-tighter text-white tabular-nums">
                {currentKm.toLocaleString()}
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mt-2">
                KILOMETERS
              </span>
              <button 
                onClick={() => setIsEditing(true)}
                className="mt-6 p-3 rounded-2xl bg-white/5 border border-white/5 opacity-0 group-hover:opacity-100 transition-all hover:bg-orange-500 hover:text-black hover:scale-110"
                title="Ajustar Odômetro"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="absolute w-full h-full pointer-events-none">
         {[...Array(24)].map((_, i) => (
           <div 
             key={i} 
             className={`absolute w-0.5 h-2 rounded-full transition-opacity duration-1000 ${i % 2 === 0 ? 'bg-orange-500/40' : 'bg-white/10'}`}
             style={{
               left: `calc(50% + ${Math.cos((i * 15) * Math.PI / 180) * (radius + 15)}px - 1px)`,
               top: `calc(50% + ${Math.sin((i * 15) * Math.PI / 180) * (radius + 15)}px - 1px)`,
               transform: `rotate(${i * 15 + 90}deg)`
             }}
           ></div>
         ))}
      </div>
    </div>
  );
}