import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Wrench, X } from 'lucide-react';

const TIPOS_MANUTENCAO = [
  'Óleo',
  'Filtro de óleo',
  'Pneu traseiro',
  'Pneu dianteiro',
  'Pastilha de freio',
  'Óleo da bengala',
  'Filtro combustível',
  'Sistema de suspensão',
  'Kit de relação'
];

interface NovaManutencaoProps {
  motoId: string;
  tipoPreSelecionado?: string;
  quilometragemSugerida?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function NovaManutencao({ 
  motoId, 
  tipoPreSelecionado,
  quilometragemSugerida,
  onClose, 
  onSuccess 
}: NovaManutencaoProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    tipo: tipoPreSelecionado || '',
    data: new Date().toISOString().split('T')[0],
    quilometragem: quilometragemSugerida?.toString() || '',
    custo: '',
    local: '',
    observacoes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error: insertError } = await supabase
        .from('manutencoes')
        .insert([{
          motocicleta_id: motoId,
          user_id: user.id,
          tipo: formData.tipo,
          data: new Date(formData.data).toISOString(),
          quilometragem: parseInt(formData.quilometragem),
          custo: parseFloat(formData.custo),
          local: formData.local,
          observacoes: formData.observacoes
        }]);

      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from('motocicletas')
        .update({ 
          quilometragem_atual: parseInt(formData.quilometragem),
          ...(formData.tipo === 'Óleo' && { ultima_troca_oleo: new Date(formData.data).toISOString() }),
          ...(formData.tipo === 'Pneu traseiro' && { ultima_troca_pneus: new Date(formData.data).toISOString() }),
          ...(formData.tipo === 'Pastilha de freio' && { ultima_revisao_freios: new Date(formData.data).toISOString() })
        })
        .eq('id', motoId);

      if (updateError) throw updateError;

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wrench className="h-5 w-5 text-yellow-400" />
            Nova Manutenção
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-900/50 border border-red-500 text-red-200 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Tipo de Manutenção
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              required
            >
              <option value="">Selecione o tipo</option>
              {TIPOS_MANUTENCAO.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Data
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="date"
                  name="data"
                  value={formData.data}
                  onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                  className="pl-10 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Quilometragem
              </label>
              <input
                type="number"
                name="quilometragem"
                value={formData.quilometragem}
                onChange={(e) => setFormData(prev => ({ ...prev, quilometragem: e.target.value }))}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Custo (R$)
            </label>
            <input
              type="number"
              name="custo"
              value={formData.custo}
              onChange={(e) => setFormData(prev => ({ ...prev, custo: e.target.value }))}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Local
            </label>
            <input
              type="text"
              name="local"
              value={formData.local}
              onChange={(e) => setFormData(prev => ({ ...prev, local: e.target.value }))}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Observações
            </label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 text-gray-900 py-2 px-4 rounded-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 font-medium"
          >
            {loading ? 'Salvando...' : 'Salvar Manutenção'}
          </button>
        </form>
      </div>
    </div>
  );
}