import React, { useEffect, useState } from 'react';
import { Wrench, MapPin, Clock, AlertTriangle, Plus, Bike, Navigation } from 'lucide-react';
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
  const [isTripActive, setIsTripActive] = useState(false);

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
          const firstMoto = motosData[0];
          setSelectedMoto(firstMoto);
          loadManutencoes(firstMoto.id);
        } else {
          const motoAtualizada = motosData.find(m => m.id === selectedMoto.id);
          if (motoAtualizada) {
            setSelectedMoto(motoAtualizada);
            loadManutencoes(motoAtualizada.id);
          } else {
            setSelectedMoto(motosData[0]);
            loadManutencoes(motosData[0].id);
          }
        }
      } else {
        setMotos([]);
        setSelectedMoto(null);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadManutencoes = async (motoId: string) => {
    const { data: manutencoesData } = await supabase
      .from('manutencoes')
      .select('*')
      .eq('motocicleta_id', motoId)
      .order('data', { ascending: false })
      .limit(5);

    setManutencoes(manutencoesData || []);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Sync state if odometer updates from another component
  useEffect(() => {
    const handleOdometerUpdate = (event: any) => {
      if (selectedMoto && event.detail.motoId === selectedMoto.id) {
        setSelectedMoto(prev => prev ? ({
          ...prev,
          quilometragem_atual: event.detail.quilometragem
        }) : null);
        setIsTripActive(true); // If odometer is updating live, a trip is active
      }
    };
    window.addEventListener('odometerUpdate', handleOdometerUpdate);
    return () => window.removeEventListener('odometerUpdate', handleOdometerUpdate);
  }, [selectedMoto]);

  const handleMotoSelect = (moto: Motocicleta) => {
    setSelectedMoto(moto);
    loadManutencoes(moto.id);
    setIsTripActive(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
        <p className="text-gray-400 font-medium animate-pulse">Sincronizando dados...</p>
      </div>
    );
  }

  if (!selectedMoto) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
        <div className="w-24 h-24 bg-gray-800/50 rounded-3xl flex items-center justify-center mb-6 border border-white/5 shadow-2xl">
          <Bike className="h-12 w-12 text-orange-500" />
        </div>
        <h2 className="text-3xl font-bold mb-3 font-orbitron">BEM-VINDO AO <span className="text-orange-500">MOTO TRACKER</span></h2>
        <p className="text-gray-400 max-w-sm mb-8">Sua jornada começa aqui. Adicione sua primeira motocicleta para começar a monitorar suas manutenções e rotas.</p>
        <button 
          onClick={() => window.location.href = '/motos'} 
          className="btn-premium px-10"
        >
          <Plus className="h-5 w-5" />
          CADASTRAR MINHA MOTO
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-24">
      {/* Moto Selector */}
      {motos.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {motos.map((moto) => (
            <button
              key={moto.id}
              onClick={() => handleMotoSelect(moto)}
              className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 whitespace-nowrap border-2 ${
                selectedMoto.id === moto.id
                  ? 'bg-orange-500 border-orange-500 text-black shadow-lg shadow-orange-500/20'
                  : 'bg-transparent border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              {moto.marca} {moto.modelo}
            </button>
          ))}
        </div>
      )}

      {/* Main Odometer Display */}
      <div className="flex flex-col items-center justify-center py-6 relative">
          {isTripActive && (
            <div className="absolute top-0 right-10 flex items-center gap-2 bg-orange-500/20 px-3 py-1 rounded-full border border-orange-500/20 animate-pulse">
               <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
               <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Live Trip</span>
            </div>
          )}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-orange-500/5 blur-[100px] rounded-full -z-10"></div>
         <Odometer 
          quilometragem={selectedMoto.quilometragem_atual} 
          motoId={selectedMoto.id}
          onUpdate={carregarDados}
        />
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="btn-sos col-span-2 md:col-span-1 border border-red-500/20 group hover:border-red-500 transition-all">
          <span className="text-2xl font-black mb-1 font-orbitron group-hover:scale-110 transition-transform">SOS</span>
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Emergência</span>
        </button>
        
        <button 
          onClick={() => setShowModal(true)}
          className="glass-card p-6 flex flex-col items-center justify-center gap-3 group hover:border-orange-500/40 transition-all"
        >
          <Wrench className="h-8 w-8 text-orange-500 group-hover:rotate-45 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white text-center font-orbitron">Manutenção</span>
        </button>

        <button 
          onClick={() => document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="glass-card p-6 flex flex-col items-center justify-center gap-3 group hover:border-orange-500/40 transition-all"
        >
          <Navigation className="h-8 w-8 text-orange-500 group-hover:translate-y-[-4px] transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white text-center font-orbitron">Trip Live</span>
        </button>

        <button className="glass-card p-6 flex flex-col items-center justify-center gap-3 group hover:border-orange-500/40 transition-all">
          <Activity className="h-8 w-8 text-orange-500 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white text-center font-orbitron">Relatório</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Maintenance */}
        <div className="glass-card p-6 border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-widest text-white font-orbitron tracking-tight">Histórico</h3>
            </div>
            <button className="text-[10px] font-black text-orange-500 uppercase tracking-widest hover:underline">Ver tudo</button>
          </div>
          
          {manutencoes.length > 0 ? (
            <div className="space-y-3">
              {manutencoes.map(manutencao => (
                <div key={manutencao.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/5 transition-colors group">
                  <div>
                    <p className="text-sm font-bold text-white mb-1 uppercase tracking-tight font-orbitron">{manutencao.tipo}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{new Date(manutencao.data).toLocaleDateString()} • {manutencao.quilometragem.toLocaleString()} KM</p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-black transition-all">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center bg-white/2 rounded-3xl border border-dashed border-white/10">
               <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Nenhum registro encontrado</p>
            </div>
          )}
        </div>

        {/* Reminders / Next Revisions */}
        <div className="glass-card p-6 border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-widest text-white font-orbitron tracking-tight">Alertas</h3>
            </div>
          </div>
          
          <div className="space-y-4">
            {selectedMoto.ultima_troca_oleo ? (
              <div className="flex items-center gap-4 p-4 rounded-3xl bg-gradient-to-r from-orange-500/10 to-transparent border-l-4 border-orange-500">
                <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center text-orange-500">
                   <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white mb-0.5 uppercase font-orbitron">Troca de Óleo</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Última: {new Date(selectedMoto.ultima_troca_oleo).toLocaleDateString()}</p>
                </div>
              </div>
            ) : (
                <div className="p-10 rounded-3xl bg-white/2 border border-white/5 text-center">
                   <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Sem alertas ativos</p>
                </div>
            )}
          </div>
        </div>
      </div>

      <div id="map-section" className="glass-card p-2 overflow-hidden border-white/5 shadow-inner">
        <MapaRota motoId={selectedMoto.id} standalone={true} />
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

function CheckCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}