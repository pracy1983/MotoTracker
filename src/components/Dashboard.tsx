import React, { useEffect, useState } from 'react';
import { Wrench, Calendar, MapPin, Clock, AlertTriangle, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { NovaManutencao } from './NovaManutencao';
import { MapaRota } from './MapaRota';
import { Odometer } from './Odometer';

interface Motocicleta {
  id: string;
  marca: string;
  modelo: string;
  quilometragem_atual: number;
  ultima_troca_oleo?: string;
  ultima_troca_pneus?: string;
  ultima_revisao_freios?: string;
}

interface Manutencao {
  id: string;
  tipo: string;
  data: string;
  quilometragem: number;
}

export function Dashboard() {
  const [motos, setMotos] = useState<Motocicleta[]>([]);
  const [selectedMoto, setSelectedMoto] = useState<Motocicleta | null>(null);
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const carregarDados = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: motosData } = await supabase
        .from('motocicletas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (motosData && motosData.length > 0) {
        setMotos(motosData);
        if (!selectedMoto) {
          setSelectedMoto(motosData[0]);
        } else {
          const motoAtualizada = motosData.find(m => m.id === selectedMoto.id);
          if (motoAtualizada) {
            setSelectedMoto(motoAtualizada);
          } else {
            setSelectedMoto(motosData[0]);
          }
        }

        const motoId = selectedMoto?.id || motosData[0].id;
        const { data: manutencoesData } = await supabase
          .from('manutencoes')
          .select('*')
          .eq('motocicleta_id', motoId)
          .order('data', { ascending: false })
          .limit(5);

        setManutencoes(manutencoesData || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleMotoSelect = async (moto: Motocicleta) => {
    setSelectedMoto(moto);
    try {
      const { data: manutencoesData } = await supabase
        .from('manutencoes')
        .select('*')
        .eq('motocicleta_id', moto.id)
        .order('data', { ascending: false })
        .limit(5);

      setManutencoes(manutencoesData || []);
    } catch (error) {
      console.error('Erro ao carregar manutenções:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center">
        <div className="text-gray-400">Carregando...</div>
      </div>
    );
  }

  if (!selectedMoto) {
    return (
      <div className="p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-yellow-400">
          Nenhuma moto encontrada. Por favor, cadastre uma moto primeiro.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {motos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
          {motos.map((moto) => (
            <button
              key={moto.id}
              onClick={() => handleMotoSelect(moto)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap ${
                selectedMoto.id === moto.id
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 shadow-lg transform -translate-y-0.5'
                  : 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300 hover:from-gray-600 hover:to-gray-700'
              }`}
            >
              {moto.marca} {moto.modelo}
            </button>
          ))}
        </div>
      )}

      <Odometer 
        quilometragem={selectedMoto.quilometragem_atual} 
        motoId={selectedMoto.id}
        onUpdate={carregarDados}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="text-yellow-400" />
            <h3 className="font-semibold text-white">Últimas Manutenções</h3>
          </div>
          {manutencoes.length > 0 ? (
            <ul className="space-y-2">
              {manutencoes.map(manutencao => (
                <li key={manutencao.id} className="flex items-center justify-between text-gray-300">
                  <span>{manutencao.tipo}</span>
                  <span className="text-gray-400">
                    {new Date(manutencao.data).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">Nenhuma manutenção registrada</p>
          )}
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-blue-500" />
            <h3 className="font-semibold text-white">Próximas Revisões</h3>
          </div>
          <ul className="space-y-2">
            {selectedMoto.ultima_troca_oleo && (
              <li className="flex items-center justify-between text-gray-300">
                <span>Troca de Óleo</span>
                <span className="text-gray-400">
                  Última: {new Date(selectedMoto.ultima_troca_oleo).toLocaleDateString()}
                </span>
              </li>
            )}
            {selectedMoto.ultima_revisao_freios && (
              <li className="flex items-center justify-between text-gray-300">
                <span>Revisão dos Freios</span>
                <span className="text-gray-400">
                  Última: {new Date(selectedMoto.ultima_revisao_freios).toLocaleDateString()}
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-6">
        <MapaRota motoId={selectedMoto.id} />
      </div>

      {showModal && (
        <NovaManutencao
          motoId={selectedMoto.id}
          quilometragemSugerida={selectedMoto.quilometragem_atual}
          onClose={() => setShowModal(false)}
          onSuccess={carregarDados}
        />
      )}
    </div>
  );
}