import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Mail, Phone, Trash2, Save, AlertTriangle, ArrowLeft, LogOut } from 'lucide-react';

interface Profile {
  id: string;
  name: string | null;
  phone: string | null;
  email: string;
}

export function MeuPerfil() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile({
          ...profileData,
          email: user.email || ''
        });
        setFormData({
          name: profileData.name || '',
          phone: profileData.phone || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;
      
      setProfile(prev => prev ? {
        ...prev,
        name: formData.name,
        phone: formData.phone
      } : null);
      
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    if (!profile) return;
    setDeleting(true);
    
    try {
      // Primeiro, deletar todos os dados do usuário
      await supabase.from('manutencoes').delete().eq('user_id', profile.id);
      await supabase.from('motocicletas').delete().eq('user_id', profile.id);
      await supabase.from('profiles').delete().eq('id', profile.id);

      await supabase.auth.signOut();
      window.location.reload();
    } catch (error: any) {
      console.error('Erro ao deletar conta:', error);
      alert('Erro ao deletar conta: ' + (error.message || 'Tente novamente.'));
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-32">
       <div>
          <h2 className="text-3xl font-bold text-white font-orbitron tracking-tighter uppercase">
            Meu Perfil
          </h2>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Gerencie seus dados e conta</p>
        </div>

      <div className="glass-card p-8 border-white/5 shadow-2xl space-y-8">
        <div className="flex items-center gap-6">
           <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center border border-orange-500/20">
              <User className="h-10 w-10 text-orange-500" />
           </div>
           <div>
              <h3 className="text-xl font-bold text-white font-orbitron">{profile?.name || 'Piloto'}</h3>
              <p className="text-gray-500 text-xs uppercase font-black tracking-widest mt-1 opacity-60">Status: Premium</p>
           </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">E-mail (Permanente)</label>
            <div className="w-full bg-white/2 border border-white/5 rounded-xl p-4 text-gray-500 flex items-center gap-3">
              <Mail className="h-4 w-4" />
              <span className="text-sm font-medium">{profile?.email}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nome de Exibição</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 group-focus-within:text-orange-500 transition-colors" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                placeholder="Seu nome"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Telefone / WhatsApp</label>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 group-focus-within:text-orange-500 transition-colors" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                placeholder="Telefone"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-premium w-full flex items-center justify-center gap-2"
          >
            {saving ? 'SALVANDO...' : (
               <>
                 <Save className="h-5 w-5 font-black" />
                 SALVAR ALTERAÇÕES
               </>
            )}
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-xl border border-white/5 bg-white/2 text-gray-400 font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center justify-center gap-2 text-[10px]"
          >
            <LogOut className="h-4 w-4" />
            ENCERRAR SESSÃO
          </button>
        </div>

        <div className="pt-8 border-t border-white/5">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-[10px] font-black text-red-900 hover:text-red-600 uppercase tracking-tighter transition-colors flex items-center gap-2"
          >
            <Trash2 className="h-3 w-3" />
            DELETAR MINHA CONTA PERMANENTEMENTE
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[70] p-6 animate-fade-in">
          <div className="glass-card p-8 max-w-md w-full border-red-500/20 shadow-2xl animate-shake">
            <div className="flex items-center gap-4 text-red-500 mb-6">
               <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
                  <AlertTriangle className="h-6 w-6" />
               </div>
               <h3 className="text-xl font-bold font-orbitron uppercase tracking-widest">AVISO CRÍTICO</h3>
            </div>

            <p className="text-gray-400 mb-8 font-medium">
              Esta ação irá <span className="text-red-500 font-bold">DELETAR PERMANENTEMENTE</span> sua conta e todos os dados de manutenção, motos e percursos. Não há volta.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-4 rounded-xl bg-white/5 text-gray-400 font-bold uppercase tracking-widest hover:bg-white/10 transition-all text-xs"
                disabled={deleting}
              >
                CANCELAR
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-6 py-4 rounded-xl bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-700 transition-all text-xs shadow-lg shadow-red-600/20"
              >
                {deleting ? 'DELETANDO...' : 'DELETAR AGORA'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}