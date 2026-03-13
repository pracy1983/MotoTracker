import React, { useEffect, useState } from 'react';
import { Wrench, MapPin, Clock, AlertTriangle, Plus, Bike, Navigation, Activity, ChevronRight, Gauge, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { NovaManutencao } from './NovaManutencao';
import { MapaRota } from './MapaRota';
import { Odometer } from './Odometer';
import { getMaintenanceAlerts, MaintenanceAlert } from '../utils/maintenance';

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
  const [allManutencoes, setAllManutencoes] = useState<Manutencao[]>([]);
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
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
    // Carregar todas para o motor de alertas
    const { data: allData } = await supabase
      .from('manutencoes')
      .select('*')
      .eq('motocicleta_id', motoId)
      .order('quilometragem', { ascending: false });

    setAllManutencoes(allData || []);
    setManutencoes(allData?.slice(0, 5) || []);
  };

  useEffect(() => {
    if (selectedMoto) {
      const newAlerts = getMaintenanceAlerts(selectedMoto, allManutencoes);
      setAlerts(newAlerts);
    }
  }, [selectedMoto, allManutencoes]);

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    const handleOdometerUpdate = (event: any) => {
      if (selectedMoto && event.detail.motoId === selectedMoto.id) {
        setSelectedMoto(prev => prev ? ({
          ...prev,
          quilometragem_atual: event.detail.quilometragem
        }) : null);
        setIsTripActive(true);
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
        <p className="text-gray-400 font-medium animate-pulse font-orbitron text-[10px] tracking-[0.2em] uppercase">Sincronizando Garagem</p>
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

  const urgentAlert = alerts[0];

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-24 px-4">
      {/* Moto Selector */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2 no-scrollbar">
        {motos.map((moto) => (
          <button
            key={moto.id}
            onClick={() => handleMotoSelect(moto)}
            className={`px-6 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all duration-300 whitespace-nowrap border ${
              selectedMoto.id === moto.id
                ? 'bg-orange-500 border-orange-500 text-black shadow-lg shadow-orange-500/20'
                : 'bg-white/2 border-white/5 text-gray-500 hover:border-white/20'
            }`}
          >
            {moto.marca} {moto.modelo}
          </button>
        ))}
        <button 
           onClick={() => window.location.href = '/motos'}
           className="w-10 h-10 min-w-[40px] rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-orange-500 hover:bg-orange-500 hover:text-black transition-all"
        >
           <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Main Odometer Display */}
      <div className="flex flex-col items-center justify-center py-6 relative">
          {isTripActive && (
            <div className="absolute top-0 right-4 md:right-10 flex items-center gap-2 bg-orange-500/20 px-3 py-1.5 rounded-full border border-orange-500/20 animate-pulse">
               <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
               <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Live Trip</span>
            </div>
          )}
          
          {/* Status Badge */}
          {urgentAlert && (
            <div className={`absolute top-0 left-4 md:left-10 flex items-center gap-2 px-3 py-1.5 rounded-full border bg-black/40 ${
              urgentAlert.status === 'late' ? 'border-red-500/30 text-red-500' : 
              urgentAlert.status === 'near' ? 'border-orange-500/30 text-orange-500' : 'border-green-500/30 text-green-500'
            }`}>
               <AlertTriangle className="h-3 w-3" />
               <span className="text-[10px] font-black uppercase tracking-widest">
                  {urgentAlert.status === 'late' ? 'Manutenção Atrasada' : 
                   urgentAlert.status === 'near' ? 'Próximo da Revisão' : 'Máquina em Dia'}
               </span>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="btn-sos col-span-2 lg:col-span-1 border border-red-500/10 group hover:border-red-500 transition-all flex flex-col items-center justify-center h-24">
          <span className="text-2xl font-black mb-1 font-orbitron group-hover:scale-110 transition-transform">SOS</span>
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Emergência</span>
        </button>
        
        <button 
          onClick={() => setShowModal(true)}
          className="glass-card p-6 flex flex-col items-center justify-center gap-3 group hover:border-orange-500/40 transition-all h-24"
        >
          <Wrench className="h-6 w-6 text-orange-500 group-hover:rotate-45 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white text-center font-orbitron">Manutenção</span>
        </button>

        <button 
          onClick={() => document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="glass-card p-6 flex flex-col items-center justify-center gap-3 group hover:border-orange-500/40 transition-all h-24"
        >
          <Navigation className="h-6 w-6 text-orange-500 group-hover:translate-y-[-4px] transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white text-center font-orbitron">Trip Live</span>
        </button>

        <button className="glass-card p-6 flex flex-col items-center justify-center gap-3 group hover:border-orange-500/40 transition-all h-24">
           <div className="relative">
              <Activity className="h-6 w-6 text-orange-500 group-hover:scale-110 transition-transform" />
              {urgentAlert && urgentAlert.status !== 'ok' && (
                 <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
              )}
           </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-white text-center font-orbitron">Alertas</span>
        </button>
      </div>

      {/* Smart Insights / Proximity Indicator */}
      {urgentAlert && (
         <div className={`p-1 overflow-hidden rounded-[30px] bg-gradient-to-r ${
           urgentAlert.status === 'late' ? 'from-red-500/20 to-transparent border border-red-500/20' : 
           urgentAlert.status === 'near' ? 'from-orange-500/20 to-transparent border border-orange-500/20' : 
           'from-green-500/10 to-transparent border border-white/5'
         }`}>
            <div className="glass-card flex items-center justify-between p-6 rounded-[28px] border-none">
               <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    urgentAlert.status === 'late' ? 'bg-red-500/20 text-red-500' : 
                    urgentAlert.status === 'near' ? 'bg-orange-500/20 text-orange-500' : 'bg-green-500/20 text-green-500'
                  }`}>
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Próxima Parada Estimada</h4>
                    <p className="text-xl font-bold text-white font-orbitron truncate max-w-[180px] md:max-w-none">
                       {urgentAlert.item}
                    </p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Faltam Aprox.</p>
                  <p className={`text-2xl font-black font-orbitron ${
                     urgentAlert.status === 'late' ? 'text-red-500' : 'text-white'
                  }`}>
                    {urgentAlert.status === 'late' ? 'KM EXCEDIDO' : `${urgentAlert.remainingKm.toLocaleString()} KM`}
                  </p>
               </div>
            </div>
         </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress & Alerts List */}
        <div className="glass-card p-6 border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Gauge className="h-4 w-4 text-orange-500" />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-widest text-white font-orbitron tracking-tighter">Status de Peças</h3>
            </div>
            <button className="text-[10px] font-black text-orange-500 uppercase tracking-widest hover:underline">Ver Tabela</button>
          </div>
          
          <div className="space-y-6">
            {alerts.map(alert => (
              <div key={alert.item} className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{alert.item}</span>
                  <span className={`text-[10px] font-black font-orbitron ${
                    alert.status === 'late' ? 'text-red-500' : 'text-orange-500/60'
                  }`}>
                    {alert.nextKm.toLocaleString()} KM
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                   <div 
                     className={`h-full transition-all duration-1000 ${
                       alert.status === 'late' ? 'bg-red-500' : 
                       alert.status === 'near' ? 'bg-orange-500' : 'bg-green-500'
                     }`}
                     style={{ width: `${Math.max(0, Math.min(100, 100 - (alert.remainingKm / alert.nextKm * 100)))}%` }}
                   ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* History / Activity */}
        <div className="glass-card p-6 border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-widest text-white font-orbitron tracking-tighter">Últimos Registros</h3>
            </div>
          </div>
          
          <div className="space-y-3">
            {manutencoes.length > 0 ? (
               manutencoes.map(man => (
                <div key={man.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/2 border border-white/5 group hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-white uppercase tracking-tight font-orbitron">{man.tipo}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{new Date(man.data).toLocaleDateString()} • {man.quilometragem.toLocaleString()} KM</p>
                     </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-700 group-hover:text-white transition-colors" />
                </div>
               ))
            ) : (
                <div className="py-12 text-center bg-white/2 rounded-3xl border border-dashed border-white/10">
                   <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Aguardando manutenção...</p>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Map Live Section */}
      <div id="map-section" className="space-y-4">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-orange-500" />
               </div>
               <h3 className="font-bold text-sm uppercase tracking-widest text-white font-orbitron tracking-tighter">Live Track</h3>
            </div>
         </div>
         <div className="glass-card p-2 overflow-hidden border-white/5 shadow-inner">
            <MapaRota motoId={selectedMoto.id} standalone={true} />
         </div>
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