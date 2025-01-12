import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Bike, Edit2, Plus, X } from 'lucide-react';
import { CadastroMoto } from './CadastroMoto';

interface Motocicleta {
  id: string;
  marca: string;
  modelo: string;
  cilindradas: number;
  ano: number;
  quilometragem_atual: number;
  created_at: string;
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
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-400">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bike className="h-6 w-6 text-yellow-400" />
          Minhas Motos
        </h2>
        <button
          onClick={() => setShowCadastro(true)}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
        >
          <Plus className="h-5 w-5" />
          Adicionar Moto
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {motos.map((moto) => (
          <div
            key={moto.id}
            className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 border border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {moto.marca} {moto.modelo}
                </h3>
                <p className="text-gray-400">
                  {moto.cilindradas}cc • {moto.ano}
                </p>
              </div>
              <button
                onClick={() => setEditingMoto(moto)}
                className="p-2 text-gray-400 hover:text-yellow-400 transition-colors rounded-full hover:bg-gray-700/50"
                title="Editar moto"
              >
                <Edit2 className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-gray-300">
                <span>Quilometragem:</span>
                <span className="font-mono">{moto.quilometragem_atual.toLocaleString()} km</span>
              </div>
              <div className="flex justify-between items-center text-gray-300">
                <span>Cadastrada em:</span>
                <span>{new Date(moto.created_at).toLocaleDateString()}</span>
              </div>
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
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
            <Bike className="h-8 w-8 text-yellow-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Nenhuma moto cadastrada
          </h3>
          <p className="text-gray-400 mb-6">
            Comece adicionando sua primeira moto
          </p>
          <button
            onClick={() => setShowCadastro(true)}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 mx-auto transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            Adicionar Moto
          </button>
        </div>
      )}
    </div>
  );
}