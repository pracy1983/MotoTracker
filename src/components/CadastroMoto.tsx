import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Bike, Calendar, Gauge, Check, Search, Trash2, AlertTriangle, ChevronRight } from 'lucide-react';
import { MOTORCYCLE_DATABASE } from '../data/motorcycles';

interface CadastroMotoProps {
  onClose?: () => void;
  motoParaEditar?: any;
  onSuccess?: () => void;
}

export function CadastroMoto({ onClose, motoParaEditar, onSuccess }: CadastroMotoProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    marca: motoParaEditar?.marca || '',
    modelo: motoParaEditar?.modelo || '',
    cilindradas: motoParaEditar?.cilindradas?.toString() || '',
    ano: motoParaEditar?.ano || new Date().getFullYear(),
    quilometragem_atual: motoParaEditar?.quilometragem_atual?.toString() || '',
    placa: motoParaEditar?.placa || '',
    cor: motoParaEditar?.cor || ''
  });

  const [marcaSuggestions, setMarcaSuggestions] = useState<string[]>([]);
  const [modeloSuggestions, setModeloSuggestions] = useState<any[]>([]);
  const [showMarcaList, setShowMarcaList] = useState(false);
  const [showModeloList, setShowModeloList] = useState(false);
  
  useEffect(() => {
    setFormData({
      marca: motoParaEditar?.marca || '',
      modelo: motoParaEditar?.modelo || '',
      cilindradas: motoParaEditar?.cilindradas?.toString() || '',
      ano: motoParaEditar?.ano || new Date().getFullYear(),
      quilometragem_atual: motoParaEditar?.quilometragem_atual?.toString() || '',
      placa: motoParaEditar?.placa || '',
      cor: motoParaEditar?.cor || ''
    });
    setErrors({});
    setError('');
  }, [motoParaEditar]);

  useEffect(() => {
    if (formData.marca && !motoParaEditar) {
      const filtered = Object.keys(MOTORCYCLE_DATABASE).filter(m => 
        m.toLowerCase().includes(formData.marca.toLowerCase())
      );
      setMarcaSuggestions(filtered);
    } else if (!motoParaEditar) {
      setMarcaSuggestions(Object.keys(MOTORCYCLE_DATABASE));
    }
  }, [formData.marca, motoParaEditar]);

  useEffect(() => {
    if (formData.marca && MOTORCYCLE_DATABASE[formData.marca]) {
      const models = MOTORCYCLE_DATABASE[formData.marca];
      if (formData.modelo) {
        setModeloSuggestions(models.filter(m => 
          m.name.toLowerCase().includes(formData.modelo.toLowerCase())
        ));
      } else {
        setModeloSuggestions(models);
      }
    } else {
      setModeloSuggestions([]);
    }
  }, [formData.marca, formData.modelo]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.marca) newErrors.marca = 'Marca é obrigatória';
    if (!formData.modelo) newErrors.modelo = 'Modelo é obrigatório';
    if (!formData.cilindradas) newErrors.cilindradas = 'Cilindradas é obrigatório';
    if (formData.placa && !/^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$/.test(formData.placa.toUpperCase())) {
      newErrors.placa = 'Formato inválido (ABC1234 ou ABC1D23)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectMarca = (m: string) => {
    setFormData({ ...formData, marca: m, modelo: '', cilindradas: '' });
    setShowMarcaList(false);
  };

  const handleSelectModelo = (m: any) => {
    setFormData({ ...formData, modelo: m.name, cilindradas: m.defaultCC?.toString() || formData.cilindradas });
    setShowModeloList(false);
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

  const handleDelete = async () => {
    if (!motoParaEditar) return;
    setLoading(true);
    setError('');
    
    try {
      // 1. Manually delete related data first as a safety measure
      // (Even though we have a migration for CASCADE, this ensures it works during transitions)
      await supabase
        .from('rotas')
        .delete()
        .eq('motocicleta_id', motoParaEditar.id);
        
      await supabase
        .from('manutencoes')
        .delete()
        .eq('motocicleta_id', motoParaEditar.id);

      // 2. Finally delete the motorcycle
      const { error: delError } = await supabase
        .from('motocicletas')
        .delete()
        .eq('id', motoParaEditar.id);
      
      if (delError) {
        console.error('Database delete error:', delError);
        throw delError;
      }
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err: any) {
      console.error('Delete catch block:', err);
      // Safely extract error message
      const msg = err?.message || err?.details || (typeof err === 'string' ? err : 'Erro desconhecido ao deletar');
      setError(msg);
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
      <div className="glass-card w-full max-w-xl border-white/10 shadow-3xl overflow-hidden animate-slide-up bg-black/40">
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
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Configuração da Máquina</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
           {success ? (
             <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-green-500/20">
                   <Check className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-xl font-bold text-white font-orbitron">MÁQUINA CONFIGURADA!</h3>
                <p className="text-gray-500 text-sm">Os dados foram integrados com sucesso.</p>
             </div>
           ) : showDeleteConfirm ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-6 animate-shake">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                   <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-orbitron uppercase tracking-widest text-red-500">Remover Moto?</h3>
                  <p className="text-gray-500 text-sm mt-2 max-w-xs">Isso apagará permanentemente todos os registros, fotos e rotas desta moto.</p>
                </div>
                <div className="flex gap-4 w-full pt-4">
                   <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-4 rounded-xl bg-white/5 text-gray-400 font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-all">Cancelar</button>
                   <button onClick={handleDelete} className="flex-1 py-4 rounded-xl bg-red-600 text-white font-bold uppercase tracking-widest text-xs hover:bg-red-700 transition-all">DELETAR AGORA</button>
                </div>
              </div>
           ) : (
             <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Marca */}
                  <div className="space-y-2 relative">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Marca</label>
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 group-focus-within:text-orange-500" />
                      <input
                        type="text"
                        value={formData.marca}
                        onFocus={() => setShowMarcaList(true)}
                        onBlur={() => setTimeout(() => setShowMarcaList(false), 200)}
                        onChange={(e) => setFormData({...formData, marca: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-700"
                        placeholder="Ex: Honda, BMW..."
                      />
                    </div>
                    {showMarcaList && marcaSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-gray-900 border border-white/10 rounded-2xl shadow-3xl overflow-hidden animate-slide-down">
                        {marcaSuggestions.map(m => (
                          <button key={m} type="button" onMouseDown={() => handleSelectMarca(m)} className="w-full p-4 text-left text-sm text-gray-400 hover:bg-orange-500 hover:text-black transition-all flex justify-between items-center group">
                            {m}
                            <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                          </button>
                        ))}
                      </div>
                    )}
                    {errors.marca && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.marca}</p>}
                  </div>

                  {/* Modelo */}
                  <div className="space-y-2 relative">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Modelo</label>
                    <div className="relative group">
                      <Bike className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 group-focus-within:text-orange-500" />
                      <input
                        type="text"
                        value={formData.modelo}
                        onFocus={() => setShowModeloList(true)}
                        onBlur={() => setTimeout(() => setShowModeloList(false), 200)}
                        onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-700"
                        placeholder="Ex: Hornet, Twister..."
                      />
                    </div>
                    {showModeloList && modeloSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-gray-900 border border-white/10 rounded-2xl shadow-3xl overflow-hidden max-h-60 overflow-y-auto animate-slide-down">
                        {modeloSuggestions.map(m => (
                          <button key={m.name} type="button" onMouseDown={() => handleSelectModelo(m)} className="w-full p-4 text-left text-sm text-gray-400 hover:bg-orange-500 hover:text-black transition-all flex justify-between items-center group">
                            <div>
                              <p className="font-bold">{m.name}</p>
                              <p className="text-[9px] opacity-60 font-black uppercase tracking-widest">{m.category}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                          </button>
                        ))}
                      </div>
                    )}
                    {errors.modelo && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.modelo}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Cilindradas</label>
                    <input
                      type="number"
                      value={formData.cilindradas}
                      onChange={(e) => setFormData({...formData, cilindradas: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all text-center font-orbitron"
                      placeholder="600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Ano</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                      <input
                        type="number"
                        value={formData.ano || ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : parseInt(e.target.value);
                          setFormData({...formData, ano: val as any});
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all text-center font-orbitron"
                      />
                    </div>
                  </div>
                   <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Cor Predom.</label>
                    <input
                      type="text"
                      value={formData.cor}
                      onChange={(e) => setFormData({...formData, cor: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all text-center"
                      placeholder="Preta"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Odômetro Atual (KM)</label>
                    <div className="relative">
                      <Gauge className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                      <input
                        type="number"
                        value={formData.quilometragem_atual}
                        onChange={(e) => setFormData({...formData, quilometragem_atual: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-orange-500 font-orbitron font-bold text-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Placa (Mercosul)</label>
                    <input
                      type="text"
                      value={formData.placa}
                      onChange={(e) => setFormData({...formData, placa: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all uppercase tracking-[0.2em] font-bold text-center"
                      placeholder="ABC1234"
                    />
                    {errors.placa && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.placa}</p>}
                  </div>
                </div>

                <div className="pt-6 flex flex-col md:flex-row gap-4">
                  {motoParaEditar && (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all order-3 md:order-1"
                      title="Deletar Moto"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-4 rounded-xl border border-white/10 text-gray-400 font-bold uppercase tracking-widest hover:bg-white/5 transition-all text-xs order-2"
                  >
                    Cancelar
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] btn-premium order-1 md:order-3"
                  >
                    {loading ? (
                       <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                    ) : (
                       motoParaEditar ? 'ATUALIZAR CONFIG' : 'INCORPORAR À FROTA'
                    )}
                  </button>
                </div>
             </form>
           )}
        </div>
      </div>
    </div>
  );
}