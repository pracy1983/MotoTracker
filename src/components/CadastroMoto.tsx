import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Bike, Calendar, Gauge, Check } from 'lucide-react';

interface CadastroMotoProps {
  onClose?: () => void;
  motoParaEditar?: any;
  onSuccess?: () => void;
}

export function CadastroMoto({ onClose, motoParaEditar, onSuccess }: CadastroMotoProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    marca: motoParaEditar?.marca || '',
    modelo: motoParaEditar?.modelo || '',
    cilindradas: motoParaEditar?.cilindradas?.toString() || '',
    ano: motoParaEditar?.ano || new Date().getFullYear(),
    quilometragem_atual: motoParaEditar?.quilometragem_atual?.toString() || '',
    placa: motoParaEditar?.placa || '',
    cor: motoParaEditar?.cor || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.marca) newErrors.marca = 'Marca é obrigatória';
    if (!formData.modelo) newErrors.modelo = 'Modelo é obrigatório';
    if (!formData.cilindradas) newErrors.cilindradas = 'Cilindradas é obrigatório';
    if (formData.placa && !/^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$/.test(formData.placa.toUpperCase())) {
      newErrors.placa = 'Formato inválido (ABC1234 ou ABC1D23)';
    }
    if (formData.ano < 1900 || formData.ano > new Date().getFullYear() + 1) {
      newErrors.ano = 'Ano inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const dataToSave = {
        ...formData,
        placa: formData.placa.toUpperCase(),
        cilindradas: parseInt(formData.cilindradas) || 0,
        quilometragem_atual: parseInt(formData.quilometragem_atual) || 0,
        user_id: user.id
      };

      if (motoParaEditar) {
        const { error: updateError } = await supabase
          .from('motocicletas')
          .update(dataToSave)
          .eq('id', motoParaEditar.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('motocicletas')
          .insert([dataToSave]);
        if (insertError) throw insertError;
      }
      
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-lg border-white/10 shadow-3xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <Bike className="h-6 w-6 text-black" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white font-orbitron tracking-tight">
                  {motoParaEditar ? 'EDITAR MOTO' : 'NOVA MOTO'}
                </h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Detalhes técnicos</p>
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
                <h3 className="text-xl font-bold text-white font-orbitron">MÁQUINA PRONTA!</h3>
                <p className="text-gray-500 text-sm">Dados salvos com sucesso na garagem.</p>
             </div>
           ) : (
             <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Marca</label>
                    <input
                      type="text"
                      value={formData.marca}
                      onChange={(e) => setFormData({...formData, marca: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                      placeholder="Ex: Honda"
                    />
                    {errors.marca && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.marca}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Modelo</label>
                    <input
                      type="text"
                      value={formData.modelo}
                      onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                      placeholder="Ex: Hornet"
                    />
                    {errors.modelo && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.modelo}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">CC</label>
                    <input
                      type="number"
                      value={formData.cilindradas}
                      onChange={(e) => setFormData({...formData, cilindradas: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all text-center"
                      placeholder="600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Ano</label>
                    <input
                      type="number"
                      value={formData.ano}
                      onChange={(e) => setFormData({...formData, ano: parseInt(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all text-center"
                    />
                  </div>
                   <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Cor</label>
                    <input
                      type="text"
                      value={formData.cor}
                      onChange={(e) => setFormData({...formData, cor: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all text-center"
                      placeholder="Preta"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">KM Atual</label>
                    <input
                      type="number"
                      value={formData.quilometragem_atual}
                      onChange={(e) => setFormData({...formData, quilometragem_atual: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-orange-500 font-orbitron font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Placa</label>
                    <input
                      type="text"
                      value={formData.placa}
                      onChange={(e) => setFormData({...formData, placa: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all uppercase tracking-widest"
                      placeholder="ABC1234"
                    />
                    {errors.placa && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.placa}</p>}
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-4 rounded-xl border border-white/10 text-gray-400 font-bold uppercase tracking-widest hover:bg-white/5 transition-all text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] btn-premium"
                  >
                    {loading ? 'Salvando...' : motoParaEditar ? 'ATUALIZAR' : 'CADASTRAR'}
                  </button>
                </div>
             </form>
           )}
        </div>
      </div>
    </div>
  );
}