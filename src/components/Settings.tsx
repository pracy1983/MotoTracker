import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Bell, HelpCircle, Save, ChevronRight, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  name: string | null;
  phone: string | null;
}

export function Settings() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (profileData) {
            setProfile(profileData);
            setFormData({
              name: profileData.name || '',
              phone: profileData.phone || ''
            });
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: formData.name,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      setProfile({
        id: user.id,
        name: formData.name,
        phone: formData.phone
      });
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
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
            Configurações
          </h2>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Ajustes finos da plataforma</p>
        </div>

      <div className="space-y-4">
        {/* Perfil Link-like Button (Since we have MeuPerfil, maybe this should redirect or just be a quick edit) */}
        <div className="glass-card p-6 border-white/5 space-y-6">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                    <User className="h-5 w-5 text-orange-500" />
                 </div>
                 <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Informações Pessoais</h3>
                    <p className="text-[10px] text-gray-500 font-medium">Nome, Telefone e E-mail</p>
                 </div>
              </div>
              <button 
                onClick={() => setEditMode(!editMode)}
                className="text-[10px] font-black text-orange-500 uppercase tracking-widest hover:underline"
              >
                {editMode ? 'FECHAR' : 'EDITAR'}
              </button>
           </div>

           {editMode && (
             <div className="space-y-4 pt-4 border-t border-white/5 animate-slide-down">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nome</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Telefone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  />
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-premium w-full flex items-center justify-center gap-2"
                >
                  {saving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                </button>
             </div>
           )}
        </div>

        {/* Segurança */}
        <div className="glass-card p-6 border-white/5">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <Shield className="h-5 w-5 text-blue-500" />
                 </div>
                 <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Segurança</h3>
                    <p className="text-[10px] text-gray-500 font-medium">Senha e autenticação</p>
                 </div>
              </div>
              <button 
                onClick={async () => {
                  const { error } = await supabase.auth.resetPasswordForEmail(user?.email);
                  if (!error) alert('Link de redefinição enviado para seu e-mail!');
                }}
                className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline"
              >
                REDEFINIR SENHA
              </button>
           </div>
        </div>

        {/* Notificações */}
        <div className="glass-card p-6 border-white/5">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                    <Bell className="h-5 w-5 text-purple-500" />
                 </div>
                 <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Notificações</h3>
                    <p className="text-[10px] text-gray-500 font-medium">Alertas de manutenção push</p>
                 </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-white/5 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all border border-white/5"></div>
              </label>
           </div>
        </div>

        {/* Suporte */}
        <div className="glass-card p-6 border-white/5 group hover:bg-white/10 transition-colors cursor-pointer">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                 </div>
                 <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Suporte & FAQ</h3>
                    <p className="text-[10px] text-gray-500 font-medium">Ajuda e termos de uso</p>
                 </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-700 group-hover:text-white transition-colors" />
           </div>
        </div>
      </div>
    </div>
  );
}