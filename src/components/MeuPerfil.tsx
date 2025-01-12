import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Mail, Phone, Trash2, Save, AlertTriangle } from 'lucide-react';

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

  const handleDeleteAccount = async () => {
    if (!profile) return;
    setDeleting(true);
    
    try {
      // Primeiro, deletar todos os dados do usuário
      const { error: rotasError } = await supabase
        .from('rotas')
        .delete()
        .eq('motocicleta_id', profile.id);

      if (rotasError) throw rotasError;

      const { error: manutencoesError } = await supabase
        .from('manutencoes')
        .delete()
        .eq('user_id', profile.id);

      if (manutencoesError) throw manutencoesError;

      const { error: motosError } = await supabase
        .from('motocicletas')
        .delete()
        .eq('user_id', profile.id);

      if (motosError) throw motosError;

      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profile.id);

      if (profileError) throw profileError;

      // Por fim, deletar a conta do usuário
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;

      window.location.reload();
    } catch (error: any) {
      console.error('Erro ao deletar conta:', error);
      alert('Erro ao deletar conta: ' + (error.message || 'Tente novamente.'));
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-400">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <User className="h-6 w-6 text-yellow-400" />
        Meu Perfil
      </h2>

      <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 border border-gray-700 shadow-xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <div className="flex items-center gap-2 text-gray-400 bg-gray-700/50 p-2 rounded-md">
            <Mail className="h-5 w-5 text-gray-500" />
            {profile?.email}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Nome
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Telefone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>

        <div className="pt-6 border-t border-gray-700">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-400 hover:text-red-300 flex items-center gap-2"
          >
            <Trash2 className="h-5 w-5" />
            Deletar Conta
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
            <div className="flex items-center gap-2 text-red-400 mb-4">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold">Confirmar Exclusão</h3>
            </div>

            <p className="text-gray-300 mb-6">
              Tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita e todos os seus dados serão perdidos.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? 'Deletando...' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}