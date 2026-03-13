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
  const [newKm, setNewKm] = useState(quilometragem.toString());
  const [loading, setLoading] = useState(false);
  
  // For the circular animation
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  // Let's assume max km for the gauge visual is 100,000 for scale, but it's just decorative
  const progress = Math.min((quilometragem % 100000) / 100000, 1) || 0;
  const offset = circumference - progress * circumference;

  useEffect(() => {
    setNewKm(quilometragem.toString());
  }, [quilometragem]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('motocicletas')
        .update({ quilometragem_atual: parseInt(newKm) })
        .eq('id', motoId);

      if (error) throw error;
      
      if (onUpdate) {
        onUpdate();
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar quilometragem:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Outer Glow Ring */}
      <div className="absolute inset-0 bg-orange-500/10 rounded-full blur-3xl -z-10 scale-150"></div>

      {/* Main Gauge Container */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* SVG Gauge */}
        <svg className="w-full h-full transform -rotate-90">
          {/* Background Track */}
          <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-white/5"
          />
          {/* Progress Path */}
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
            className="transition-all duration-1000 ease-out"
          />
          {/* Gradients */}
          <defs>
            <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
        </svg>

        {/* Inner Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {isEditing ? (
            <div className="flex flex-col items-center gap-2">
              <input
                type="number"
                value={newKm}
                onChange={(e) => setNewKm(e.target.value)}
                className="w-32 bg-transparent border-b-2 border-orange-500 text-3xl font-orbitron font-bold text-center text-white focus:outline-none"
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={handleSave} className="p-1 text-green-500 hover:scale-110 transition-transform"><Save className="h-5 w-5"/></button>
                <button onClick={() => setIsEditing(false)} className="p-1 text-red-500 hover:scale-110 transition-transform"><X className="h-5 w-5"/></button>
              </div>
            </div>
          ) : (
            <>
              <Gauge className="h-5 w-5 text-orange-500/50 mb-1" />
              <span className="text-4xl font-black font-orbitron tracking-tighter text-white">
                {quilometragem.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-500 mt-1">
                KILOMETERS
              </span>
              <button 
                onClick={() => setIsEditing(true)}
                className="mt-4 p-2 rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition-all"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Decorative Dots/Scale */}
      <div className="absolute w-full h-full pointer-events-none">
         {[...Array(12)].map((_, i) => (
           <div 
             key={i} 
             className="absolute w-1 h-1 bg-white/20 rounded-full"
             style={{
               left: `calc(50% + ${Math.cos((i * 30) * Math.PI / 180) * (radius + 15)}px - 2px)`,
               top: `calc(50% + ${Math.sin((i * 30) * Math.PI / 180) * (radius + 15)}px - 2px)`,
             }}
           ></div>
         ))}
      </div>
    </div>
  );
}