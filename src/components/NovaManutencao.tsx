import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Wrench, X, Check, DollarSign } from 'lucide-react';

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
  const [success, setSuccess] = useState(false);
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
          custo: parseFloat(formData.custo) || 0,
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

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-lg border-white/10 shadow-3xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <Wrench className="h-6 w-6 text-black" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white font-orbitron tracking-tight">
                  REGISTRAR SERVIÇO
                </h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Manutenção Corretiva/Preventiva</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
           {success ? (
             <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                   <Check className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-xl font-bold text-white font-orbitron">SERVIÇO SALVO!</h3>
                <p className="text-gray-500 text-sm">Registro atualizado com sucesso.</p>
             </div>
           ) : (
             <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Tipo de Serviço</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all appearance-none"
                    required
                  >
                    <option value="" className="bg-gray-900">Selecione...</option>
                    {TIPOS_MANUTENCAO.map(tipo => (
                      <option key={tipo} value={tipo} className="bg-gray-900">{tipo}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Data</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                      <input
                        type="date"
                        value={formData.data}
                        onChange={(e) => setFormData({...formData, data: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Quilometragem</label>
                    <input
                      type="number"
                      value={formData.quilometragem}
                      onChange={(e) => setFormData({...formData, quilometragem: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-orange-500 font-orbitron font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Custo Total</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                      <input
                        type="number"
                        value={formData.custo}
                        onChange={(e) => setFormData({...formData, custo: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Local / Oficina</label>
                    <input
                      type="text"
                      value={formData.local}
                      onChange={(e) => setFormData({...formData, local: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                      placeholder="Nome da oficina"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Observações</label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    rows={3}
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-4 rounded-xl border border-white/10 text-gray-400 font-bold uppercase tracking-widest hover:bg-white/5 transition-all text-xs"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] btn-premium"
                  >
                    {loading ? 'SALVANDO...' : 'REGISTRAR'}
                  </button>
                </div>
             </form>
           )}
        </div>
      </div>
    </div>
  );
}