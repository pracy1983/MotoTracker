import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Bike, Calendar, Gauge } from 'lucide-react';

interface CadastroMotoProps {
  onClose?: () => void;
}

export function CadastroMoto({ onClose }: CadastroMotoProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    cilindradas: '',
    ano: new Date().getFullYear(),
    quilometragem_atual: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Usuário não autenticado');
        return;
      }

      const { error: insertError } = await supabase
        .from('motocicletas')
        .insert([
          {
            ...formData,
            cilindradas: parseInt(formData.cilindradas) || 0,
            quilometragem_atual: parseInt(formData.quilometragem_atual) || 0,
            user_id: user.id
          }
        ]);

      if (insertError) throw insertError;
      
      setSuccess(true);
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'ano' ? parseInt(value) || new Date().getFullYear() : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800/90 backdrop-blur-md rounded-lg shadow-2xl max-w-md w-full border border-gray-700">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bike className="h-5 w-5 text-yellow-400" />
            {success ? 'Sucesso!' : 'Cadastrar Nova Moto'}
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="p-4">
          {success ? (
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-green-400 mb-4">Moto cadastrada com sucesso!</h2>
              <p className="text-gray-300">Você já pode começar a acompanhar suas manutenções.</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 rounded-md bg-red-900/50 border border-red-500 text-red-200 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Marca
                  </label>
                  <div className="relative">
                    <Bike className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      name="marca"
                      value={formData.marca}
                      onChange={handleChange}
                      className="pl-10 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Modelo
                  </label>
                  <input
                    type="text"
                    name="modelo"
                    value={formData.modelo}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Cilindradas
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="cilindradas"
                      value={formData.cilindradas}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent pr-10"
                      required
                      min="0"
                      placeholder="Ex: 150"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      cc
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Ano
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="number"
                      name="ano"
                      value={formData.ano}
                      onChange={handleChange}
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      className="pl-10 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Quilometragem Atual
                  </label>
                  <div className="relative">
                    <Gauge className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="number"
                      name="quilometragem_atual"
                      value={formData.quilometragem_atual}
                      onChange={handleChange}
                      min="0"
                      className="pl-10 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-500 text-gray-900 py-2 px-4 rounded-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 font-medium transition-all duration-300 transform hover:-translate-y-1"
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar Moto'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}