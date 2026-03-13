import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AlertTriangle, Wrench, Plus, CheckCircle, Clock } from 'lucide-react';
import { NovaManutencao } from './NovaManutencao';
import { HistoricoManutencao } from './HistoricoManutencao';
import { Odometer } from './Odometer';

interface Manutencao {
  id: string;
  data: string;
  tipo: string;
  quilometragem: number;
  custo: number;
  local: string;
  observacoes: string;
}

interface ManutencaoProgramada {
  tipo: string;
  kmTroca: number;
  ultimaTroca?: number;
  dataUltimaTroca?: string;
  historico?: Manutencao[];
}

interface Motocicleta {
  id: string;
  marca: string;
  modelo: string;
  quilometragem_atual: number;
}

const MANUTENCOES_PADRAO: ManutencaoProgramada[] = [
  { tipo: 'Óleo', kmTroca: 2000 },
  { tipo: 'Filtro de óleo', kmTroca: 4000 },
  { tipo: 'Pneu traseiro', kmTroca: 12000 },
  { tipo: 'Pneu dianteiro', kmTroca: 20000 },
  { tipo: 'Pastilha de freio', kmTroca: 5000 },
  { tipo: 'Óleo da bengala', kmTroca: 30000 },
  { tipo: 'Filtro combustível', kmTroca: 24000 },
  { tipo: 'Sistema de suspensão', kmTroca: 24000 },
  { tipo: 'Kit de relação', kmTroca: 7000 }
];

export function ManutencoesProgramadas() {
  const [motos, setMotos] = useState<Motocicleta[]>([]);
  const [selectedMoto, setSelectedMoto] = useState<Motocicleta | null>(null);
  const [manutencoes, setManutencoes] = useState<ManutencaoProgramada[]>(MANUTENCOES_PADRAO);
  const [showModal, setShowModal] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);
  const [selectedManutencao, setSelectedManutencao] = useState<ManutencaoProgramada | null>(null);
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
        const motoAtual = selectedMoto ? motosData.find(m => m.id === selectedMoto.id) : motosData[0];
        setSelectedMoto(motoAtual || motosData[0]);

        const { data: todasManutencoes } = await supabase
          .from('manutencoes')
          .select('*')
          .eq('motocicleta_id', motoAtual?.id || motosData[0].id)
          .order('data', { ascending: false });

        if (todasManutencoes) {
          const manutencoesAtualizadas = MANUTENCOES_PADRAO.map(man => {
            const historicoTipo = todasManutencoes.filter(m => m.tipo === man.tipo);
            const ultima = historicoTipo[0];
            return {
              ...man,
              ultimaTroca: ultima?.quilometragem,
              dataUltimaTroca: ultima?.data,
              historico: historicoTipo
            };
          });
          setManutencoes(manutencoesAtualizadas);
        }
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

  const verificarProximidade = (manutencao: ManutencaoProgramada) => {
    if (!selectedMoto || !manutencao.ultimaTroca) return false;
    const kmDesdeUltimaTroca = selectedMoto.quilometragem_atual - manutencao.ultimaTroca;
    const kmAteTroca = manutencao.kmTroca - kmDesdeUltimaTroca;
    return kmAteTroca <= 500 && kmAteTroca > 0;
  };

  const verificarVencida = (manutencao: ManutencaoProgramada) => {
    if (!selectedMoto || !manutencao.ultimaTroca) return false;
    const kmDesdeUltimaTroca = selectedMoto.quilometragem_atual - manutencao.ultimaTroca;
    return kmDesdeUltimaTroca >= manutencao.kmTroca;
  };

  const calcularProgresso = (manutencao: ManutencaoProgramada) => {
    if (!selectedMoto || !manutencao.ultimaTroca) return 0;
    const kmDesdeUltimaTroca = Math.max(0, selectedMoto.quilometragem_atual - manutencao.ultimaTroca);
    return Math.min(100, (kmDesdeUltimaTroca / manutencao.kmTroca) * 100);
  };

  const handleManutencaoClick = (manutencao: ManutencaoProgramada) => {
    setSelectedManutencao(manutencao);
    setShowHistorico(true);
  };

  if (loading) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!selectedMoto) {
    return (
      <div className="p-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
          <p className="text-red-500 font-bold font-orbitron">Nenhuma moto encontrada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
       <div>
          <h2 className="text-3xl font-bold text-white font-orbitron tracking-tighter uppercase">
            Manutenção
          </h2>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Cronograma técnico preventivo</p>
        </div>

      {motos.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {motos.map((moto) => (
            <button
              key={moto.id}
              onClick={() => {
                setSelectedMoto(moto);
                carregarDados();
              }}
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
      
      <div className="flex justify-center py-6 scale-90 md:scale-100">
        <Odometer 
          quilometragem={selectedMoto.quilometragem_atual} 
          motoId={selectedMoto.id}
          onUpdate={carregarDados}
        />
      </div>
      
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.2em]">Checklist de Revisão</h3>
        <button
          onClick={() => setShowModal(true)}
          className="btn-premium flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">NOVA ATIVIDADE</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {manutencoes.map((manutencao) => {
          const proxima = verificarProximidade(manutencao);
          const vencida = verificarVencida(manutencao);
          const progresso = calcularProgresso(manutencao);
          
          return (
            <button
              key={manutencao.tipo}
              onClick={() => handleManutencaoClick(manutencao)}
              className={`glass-card p-6 border-l-4 transition-all duration-300 text-left group relative ${
                vencida ? 'border-l-red-500 bg-red-500/5' :
                proxima ? 'border-l-orange-500 bg-orange-500/5' :
                'border-l-green-500'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-white text-lg font-orbitron group-hover:text-orange-500 transition-colors uppercase tracking-tight">
                  {manutencao.tipo}
                </span>
                {vencida ? <AlertTriangle className="h-5 w-5 text-red-500" /> : 
                 proxima ? <Clock className="h-5 w-5 text-orange-500" /> : 
                 <CheckCircle className="h-5 w-5 text-green-500/50" />}
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <span>Vida Útil</span>
                  <span>{Math.round(progresso)}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                   <div 
                    className={`h-full transition-all duration-1000 ${
                      vencida ? 'bg-red-500' : 
                      proxima ? 'bg-orange-500' : 
                      'bg-green-500'
                    }`} 
                    style={{ width: `${progresso}%` }}
                   />
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                   <div className="p-2 rounded-lg bg-white/2 border border-white/5">
                      <span className="block text-[8px] font-black text-gray-600 uppercase">Intervalo</span>
                      <span className="text-xs font-bold text-white font-orbitron">{manutencao.kmTroca.toLocaleString()} KM</span>
                   </div>
                   <div className="p-2 rounded-lg bg-white/2 border border-white/5">
                      <span className="block text-[8px] font-black text-gray-600 uppercase">Última</span>
                      <span className="text-xs font-bold text-white font-orbitron">{manutencao.ultimaTroca?.toLocaleString() || '---'} KM</span>
                   </div>
                </div>
              </div>

              {vencida && (
                <div className="mt-4 py-2 px-3 rounded-lg bg-red-500/20 text-[10px] text-red-500 font-black uppercase tracking-widest text-center animate-pulse">
                  Manutenção Atrasada
                </div>
              )}
            </button>
          );
        })}
      </div>

      {showModal && selectedMoto && (
        <NovaManutencao
          motoId={selectedMoto.id}
          tipoPreSelecionado={selectedManutencao?.tipo}
          quilometragemSugerida={selectedMoto.quilometragem_atual}
          onClose={() => {
            setShowModal(false);
            setSelectedManutencao(null);
          }}
          onSuccess={() => {
            carregarDados();
            setShowModal(false);
            setSelectedManutencao(null);
          }}
        />
      )}

      {showHistorico && selectedManutencao && (
        <HistoricoManutencao
          tipo={selectedManutencao.tipo}
          historico={selectedManutencao.historico || []}
          onClose={() => {
            setShowHistorico(false);
            setSelectedManutencao(null);
          }}
          onUpdate={carregarDados}
        />
      )}
    </div>
  );
}