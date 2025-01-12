import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AlertTriangle, Wrench, Plus } from 'lucide-react';
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

  const handleManutencaoClick = (manutencao: ManutencaoProgramada) => {
    setSelectedManutencao(manutencao);
    setShowHistorico(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
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
              onClick={() => {
                setSelectedMoto(moto);
                carregarDados();
              }}
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
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-yellow-400">Manutenções Programadas</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gray-700 hover:bg-gray-600 text-yellow-400 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-300 transform hover:-translate-y-1"
        >
          <Plus className="h-5 w-5" />
          Nova Manutenção
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {manutencoes.map((manutencao) => {
          const proxima = verificarProximidade(manutencao);
          const vencida = verificarVencida(manutencao);
          
          return (
            <button
              key={manutencao.tipo}
              onClick={() => handleManutencaoClick(manutencao)}
              className={`bg-gray-700/90 backdrop-blur-sm p-6 rounded-xl shadow-xl border-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl ${
                vencida ? 'border-red-500' :
                proxima ? 'border-yellow-500' :
                'border-gray-500'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-yellow-400 text-lg">{manutencao.tipo}</span>
                {(proxima || vencida) && (
                  <AlertTriangle className={`h-5 w-5 ${
                    vencida ? 'text-red-500' : 'text-yellow-500'
                  }`} />
                )}
              </div>
              
              <div className="text-sm text-gray-300 space-y-1">
                <p>Trocar a cada: {manutencao.kmTroca.toLocaleString()}km</p>
                {manutencao.ultimaTroca && manutencao.dataUltimaTroca && (
                  <>
                    <p>Última troca: {manutencao.ultimaTroca.toLocaleString()}km</p>
                    <p>Data: {new Date(manutencao.dataUltimaTroca).toLocaleDateString()}</p>
                  </>
                )}
              </div>

              {proxima && (
                <div className="mt-3 text-sm text-yellow-500 font-medium">
                  Próximo da troca! Faltam menos de 500km
                </div>
              )}
              {vencida && (
                <div className="mt-3 text-sm text-red-500 font-medium">
                  Manutenção vencida!
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