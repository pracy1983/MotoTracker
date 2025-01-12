import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, User, Phone, Bike, Eye, EyeOff } from 'lucide-react';

// Lista de DDIs mais comuns
const DDI_LIST = [
  { code: '55', country: 'Brasil' },
  { code: '1', country: 'Estados Unidos/Canadá' },
  { code: '351', country: 'Portugal' },
  { code: '34', country: 'Espanha' },
  { code: '49', country: 'Alemanha' }
];

// Lista de DDDs do Brasil
const DDD_LIST = [
  // Norte
  { ddd: '68', estado: 'AC' }, { ddd: '96', estado: 'AP' },
  { ddd: '92', estado: 'AM' }, { ddd: '97', estado: 'AM' },
  { ddd: '91', estado: 'PA' }, { ddd: '93', estado: 'PA' },
  { ddd: '94', estado: 'PA' }, { ddd: '69', estado: 'RO' },
  { ddd: '95', estado: 'RR' }, { ddd: '63', estado: 'TO' },
  // Nordeste
  { ddd: '82', estado: 'AL' }, { ddd: '71', estado: 'BA' },
  { ddd: '73', estado: 'BA' }, { ddd: '74', estado: 'BA' },
  { ddd: '75', estado: 'BA' }, { ddd: '77', estado: 'BA' },
  { ddd: '85', estado: 'CE' }, { ddd: '88', estado: 'CE' },
  { ddd: '98', estado: 'MA' }, { ddd: '99', estado: 'MA' },
  { ddd: '83', estado: 'PB' }, { ddd: '81', estado: 'PE' },
  { ddd: '87', estado: 'PE' }, { ddd: '86', estado: 'PI' },
  { ddd: '89', estado: 'PI' }, { ddd: '84', estado: 'RN' },
  { ddd: '79', estado: 'SE' },
  // Centro-Oeste
  { ddd: '61', estado: 'DF' }, { ddd: '62', estado: 'GO' },
  { ddd: '64', estado: 'GO' }, { ddd: '65', estado: 'MT' },
  { ddd: '66', estado: 'MT' }, { ddd: '67', estado: 'MS' }
];

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [ddi, setDdi] = useState('55');
  const [ddd, setDdd] = useState('');
  const [phone, setPhone] = useState('');
  const [cadastrarMoto, setCadastrarMoto] = useState(true);
  const [motoData, setMotoData] = useState({
    marca: '',
    modelo: '',
    ano: new Date().getFullYear(),
    quilometragem_atual: ''
  });

  const handleAuthError = (error: any) => {
    console.error('Auth error:', error);
    
    if (error.message === 'User already registered' || error.code === 'user_already_exists') {
      setError('Este e-mail já está cadastrado. Por favor, faça login.');
      setIsSignUp(false);
      setPassword('');
      return;
    }

    switch (error.message) {
      case 'Invalid login credentials':
        setError('Email ou senha incorretos.');
        break;
      case 'Email not confirmed':
        setError('Por favor, confirme seu email antes de fazer login.');
        break;
      default:
        setError('Ocorreu um erro. Por favor, tente novamente.');
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              phone: `+${ddi}${ddd}${phone.replace(/\D/g, '')}`,
            },
          },
        });

        if (signUpError) {
          handleAuthError(signUpError);
        } else if (user && cadastrarMoto) {
          // Cadastrar moto se a opção estiver marcada
          const { error: motoError } = await supabase
            .from('motocicletas')
            .insert([{
              ...motoData,
              quilometragem_atual: parseInt(motoData.quilometragem_atual) || 0,
              user_id: user.id
            }]);

          if (motoError) throw motoError;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) {
          handleAuthError(signInError);
        }
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 mb-4">
            <Bike className="h-8 w-8 text-gray-900" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Moto Tracking
          </h1>
          <p className="text-gray-400">
            Com você em todo o caminho
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-white">
            {isSignUp ? 'Criar Conta' : 'Login'}
          </h2>
          
          {error && (
            <div className={`mb-4 p-3 rounded-md text-sm ${
              error.includes('sucesso') 
                ? 'bg-green-900/50 border border-green-500 text-green-200'
                : 'bg-red-900/50 border border-red-500 text-red-200'
            }`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    required={isSignUp}
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Telefone
                </label>
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-3">
                    <select
                      value={ddi}
                      onChange={(e) => setDdi(e.target.value)}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    >
                      {DDI_LIST.map(({ code, country }) => (
                        <option key={code} value={code}>
                          +{code} {country}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <select
                      value={ddd}
                      onChange={(e) => setDdd(e.target.value)}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      required={isSignUp}
                    >
                      <option value="">DDD</option>
                      {DDD_LIST.map(({ ddd, estado }) => (
                        <option key={ddd} value={ddd}>
                          ({ddd}) {estado}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-6">
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className="pl-10 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        required={isSignUp}
                        placeholder="Número"
                        maxLength={9}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {isSignUp && (
                <p className="mt-1 text-sm text-gray-400">
                  Mínimo de 6 caracteres
                </p>
              )}
            </div>

            {isSignUp && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="cadastrarMoto"
                    checked={cadastrarMoto}
                    onChange={(e) => setCadastrarMoto(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 text-yellow-500 focus:ring-yellow-500 bg-gray-700"
                  />
                  <label htmlFor="cadastrarMoto" className="text-sm text-gray-300">
                    Cadastrar uma moto agora
                  </label>
                </div>

                {cadastrarMoto && (
                  <div className="space-y-4 pt-4 border-t border-gray-700">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Marca da Moto
                      </label>
                      <input
                        type="text"
                        value={motoData.marca}
                        onChange={(e) => setMotoData(prev => ({ ...prev, marca: e.target.value }))}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        required={cadastrarMoto}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Modelo
                      </label>
                      <input
                        type="text"
                        value={motoData.modelo}
                        onChange={(e) => setMotoData(prev => ({ ...prev, modelo: e.target.value }))}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        required={cadastrarMoto}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Ano
                        </label>
                        <input
                          type="number"
                          value={motoData.ano}
                          onChange={(e) => setMotoData(prev => ({ ...prev, ano: parseInt(e.target.value) || new Date().getFullYear() }))}
                          min="1900"
                          max={new Date().getFullYear() + 1}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          required={cadastrarMoto}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Quilometragem
                        </label>
                        <input
                          type="number"
                          value={motoData.quilometragem_atual}
                          onChange={(e) => setMotoData(prev => ({ ...prev, quilometragem_atual: e.target.value }))}
                          min="0"
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          required={cadastrarMoto}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 py-2 px-4 rounded-md hover:from-yellow-400 hover:to-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 font-medium transition-all duration-300 transform hover:-translate-y-0.5"
            >
              {loading ? 'Carregando...' : isSignUp ? 'Criar Conta' : 'Entrar'}
            </button>
          </form>

          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setPassword('');
              if (!isSignUp) {
                setName('');
                setDdi('55');
                setDdd('');
                setPhone('');
                setCadastrarMoto(true);
                setMotoData({
                  marca: '',
                  modelo: '',
                  ano: new Date().getFullYear(),
                  quilometragem_atual: ''
                });
              }
            }}
            className="mt-4 text-sm text-yellow-400 hover:text-yellow-300 block w-full text-center transition-colors"
          >
            {isSignUp
              ? 'Já tem uma conta? Entre aqui'
              : 'Não tem uma conta? Cadastre-se'}
          </button>
        </div>
      </div>
    </div>
  );
}