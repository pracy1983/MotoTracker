import React, { useState } from 'react';
import { X, Calendar, Wrench, DollarSign, MapPin, Edit2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Manutencao {
  id: string;
  data: string;
  quilometragem: number;
  custo: number;
  local: string;
  observacoes: string;
}

interface HistoricoManutencaoProps {
  tipo: string;
  historico: Manutencao[];
  onClose: () => void;
  onUpdate: () => void;
}

interface EditFormData {
  data: string;
  quilometragem: string;
  custo: string;
  local: string;
  observacoes: string;
}

export function HistoricoManutencao({ tipo, historico, onClose, onUpdate }: HistoricoManutencaoProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<EditFormData>({
    data: '',
    quilometragem: '',
    custo: '',
    local: '',
    observacoes: ''
  });

  const handleEdit = (manutencao: Manutencao) => {
    setEditingId(manutencao.id);
    setFormData({
      data: new Date(manutencao.data).toISOString().split('T')[0],
      quilometragem: manutencao.quilometragem.toString(),
      custo: manutencao.custo.toString(),
      local: manutencao.local || '',
      observacoes: manutencao.observacoes || ''
    });
  };

  const handleSave = async () => {
    if (!editingId) return;
    setLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('manutencoes')
        .update({
          data: new Date(formData.data).toISOString(),
          quilometragem: parseInt(formData.quilometragem),
          custo: parseFloat(formData.custo),
          local: formData.local,
          observacoes: formData.observacoes
        })
        .eq('id', editingId);

      if (updateError) throw updateError;

      setEditingId(null);
      onUpdate();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800/95 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wrench className="h-5 w-5 text-yellow-400" />
            Histórico de {tipo}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-900/50 border border-red-500 text-red-200 text-sm">
              {error}
            </div>
          )}

          {historico.length > 0 ? (
            <div className="space-y-4">
              {historico.map((manutencao) => (
                <div 
                  key={manutencao.id}
                  className="border border-gray-700 rounded-lg p-4 hover:bg-gray-700/50 transition-colors"
                >
                  {editingId === manutencao.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Data
                          </label>
                          <input
                            type="date"
                            value={formData.data}
                            onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Quilometragem
                          </label>
                          <input
                            type="number"
                            value={formData.quilometragem}
                            onChange={(e) => setFormData(prev => ({ ...prev, quilometragem: e.target.value }))}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Custo (R$)
                          </label>
                          <input
                            type="number"
                            value={formData.custo}
                            onChange={(e) => setFormData(prev => ({ ...prev, custo: e.target.value }))}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Local
                          </label>
                          <input
                            type="text"
                            value={formData.local}
                            onChange={(e) => setFormData(prev => ({ ...prev, local: e.target.value }))}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Observações
                        </label>
                        <textarea
                          value={formData.observacoes}
                          onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={handleCancel}
                          className="px-4 py-2 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={loading}
                          className="px-4 py-2 rounded-md bg-yellow-500 text-gray-900 hover:bg-yellow-400 transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <div className="grid grid-cols-2 gap-4 flex-1">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Calendar className="h-5 w-5 text-yellow-400" />
                            <span>{new Date(manutencao.data).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Wrench className="h-5 w-5 text-yellow-400" />
                            <span>{manutencao.quilometragem.toLocaleString()} km</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <DollarSign className="h-5 w-5 text-yellow-400" />
                            <span>R$ {manutencao.custo.toFixed(2)}</span>
                          </div>
                          {manutencao.local && (
                            <div className="flex items-center gap-2 text-gray-300">
                              <MapPin className="h-5 w-5 text-yellow-400" />
                              <span>{manutencao.local}</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleEdit(manutencao)}
                          className="ml-4 p-2 text-gray-400 hover:text-yellow-400 transition-colors"
                          title="Editar manutenção"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                      </div>
                      {manutencao.observacoes && (
                        <div className="mt-2 text-gray-400 text-sm">
                          <p className="font-medium text-gray-300">Observações:</p>
                          <p>{manutencao.observacoes}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              Nenhuma manutenção registrada para {tipo}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}