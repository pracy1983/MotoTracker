import React, { useState } from 'react';
import { Gauge, Edit2, X, Save } from 'lucide-react';
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

  if (isEditing) {
    return (
      <div className="bg-gray-800 rounded-xl shadow-2xl p-6 mb-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gauge className="h-6 w-6 text-blue-500" />
            <h2 className="text-lg font-semibold text-white uppercase">QUILOMETRAGEM ATUAL</h2>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={newKm}
              onChange={(e) => setNewKm(e.target.value)}
              className="w-32 p-2 bg-gray-900 border border-gray-700 rounded-lg text-right font-mono text-xl text-white"
              min="0"
            />
            <span className="text-xl font-mono text-white">km</span>
            <button
              onClick={handleSave}
              disabled={loading}
              className="p-2 text-green-400 hover:text-green-300 transition-colors"
              title="Salvar"
            >
              <Save className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="p-2 text-red-400 hover:text-red-300 transition-colors"
              title="Cancelar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl p-6 mb-6 border border-gray-700 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/10 to-transparent"></div>
      
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Gauge className="h-6 w-6 text-blue-500" />
          <h2 className="text-lg font-semibold text-white uppercase">QUILOMETRAGEM ATUAL</h2>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="text-4xl font-bold font-mono tracking-wider"
            style={{
              color: 'white',
              textShadow: `
                0 0 10px rgba(255, 215, 0, 0.5),
                0 0 20px rgba(255, 215, 0, 0.3),
                0 0 30px rgba(255, 215, 0, 0.1)
              `,
              transform: 'translateZ(20px)',
              perspective: '1000px'
            }}
          >
            {quilometragem.toLocaleString()} km
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
            title="Editar quilometragem"
          >
            <Edit2 className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
    </div>
  );
}