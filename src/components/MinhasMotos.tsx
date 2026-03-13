import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Bike, Edit2, Plus, X, ChevronRight } from 'lucide-react';
import { CadastroMoto } from './CadastroMoto';

interface Motocicleta {
  id: string;
  marca: string;
  modelo: string;
  cilindradas: number;
  ano: number;
  quilometragem_atual: number;
  created_at: string;
  placa?: string;
  cor?: string;
}

export function MinhasMotos() {
  const [motos, setMotos] = useState<Motocicleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCadastro, setShowCadastro] = useState(false);
  const [editingMoto, setEditingMoto] = useState<Motocicleta | null>(null);

  const carregarMotos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('motocicletas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setMotos(data);
      }
    } catch (error) {
      console.error('Erro ao carregar motos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarMotos();
  }, []);

  const handleUpdate = () => {
    carregarMotos();
    setShowCadastro(false);
    setEditingMoto(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white font-orbitron tracking-tighter uppercase">
            Garagem
          </h2>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Sua frota registrada</p>
        </div>
        <button
          onClick={() => setShowCadastro(true)}
          className="btn-premium flex items-center gap-2 self-start"
        >
          <Plus className="h-5 w-5" />
          NOVA MÁQUINA
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {motos.map((moto) => (
          <div
            key={moto.id}
            className="glass-card p-6 flex flex-col relative group overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl -z-10 group-hover:bg-orange-500/10 transition-colors"></div>

            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                    <Bike className="h-6 w-6 text-orange-500" />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-white font-orbitron tracking-tight">
                      {moto.marca} <span className="text-orange-500">{moto.modelo}</span>
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-black uppercase bg-white/5 px-2 py-0.5 rounded text-gray-400 border border-white/5">
                        {moto.cilindradas}CC
                      </span>
                      <span className="text-[10px] font-black uppercase bg-white/5 px-2 py-0.5 rounded text-gray-400 border border-white/5">
                        {moto.ano}
                      </span>
                    </div>
                 </div>
              </div>
              <button
                onClick={() => setEditingMoto(moto)}
                className="p-2 text-gray-600 hover:text-white transition-colors"
                title="Editar moto"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 mt-auto">
               <div className="flex items-center justify-between py-3 border-y border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Kilometragem</span>
                    <span className="text-xl font-bold text-white font-orbitron">{moto.quilometragem_atual.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Placa</span>
                    <span className="text-sm font-bold text-orange-500 tracking-widest uppercase">{moto.placa || 'N/A'}</span>
                  </div>
               </div>
               
               <button className="w-full flex items-center justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-orange-500 transition-colors group/btn">
                  Ver histórico completo
                  <ChevronRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
               </button>
            </div>
          </div>
        ))}
      </div>

      {(showCadastro || editingMoto) && (
        <CadastroMoto
          motoParaEditar={editingMoto}
          onClose={() => {
            setShowCadastro(false);
            setEditingMoto(null);
          }}
          onSuccess={handleUpdate}
        />
      )}

      {motos.length === 0 && !showCadastro && (
        <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10">
          <div className="w-20 h-20 bg-gray-900 rounded-3xl flex items-center justify-center mb-6 border border-white/5">
            <Bike className="h-10 w-10 text-orange-500 opacity-20" />
          </div>
          <h3 className="text-2xl font-bold text-white font-orbitron mb-2 uppercase tracking-tighter">
            Garagem Vazia
          </h3>
          <p className="text-gray-500 mb-8 max-w-xs text-center font-medium">
            Sua jornada começa com a primeira moto. Adicione uma agora.
          </p>
          <button
            onClick={() => setShowCadastro(true)}
            className="btn-premium"
          >
            <Plus className="h-5 w-5" />
            ADICIONAR MOTO
          </button>
        </div>
      )}
    </div>
  );
}