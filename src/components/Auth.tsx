import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, User, Phone, Bike, Eye, EyeOff } from 'lucide-react';

const DDI_LIST = [
  { code: '55', country: 'Brasil' },
  { code: '1', country: 'Estados Unidos/Canadá' },
  { code: '351', country: 'Portugal' },
];

const DDD_LIST = [
  { ddd: '11', estado: 'SP' }, { ddd: '21', estado: 'RJ' },
  { ddd: '31', estado: 'MG' }, { ddd: '41', estado: 'PR' },
  { ddd: '51', estado: 'RS' }, { ddd: '61', estado: 'DF' },
  { ddd: '71', estado: 'BA' }, { ddd: '81', estado: 'PE' },
  { ddd: '85', estado: 'CE' }, { ddd: '91', estado: 'PA' },
];

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [ddd, setDdd] = useState('11');
  const [ddi, setDdi] = useState('55');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              phone_number: `+${ddi}${ddd}${phone}`,
            },
          },
        });
        if (signUpError) throw signUpError;
        alert('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar.');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/5 blur-[120px] rounded-full"></div>
      
      <div className="w-full max-w-md animate-slide-up z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-2xl shadow-orange-500/20 rotate-3">
            <Bike className="h-10 w-10 text-black" />
          </div>
          <h1 className="text-4xl font-bold font-orbitron tracking-tighter text-white">
            MOTO<span className="text-orange-500">TRACKER</span>
          </h1>
          <p className="text-gray-400 mt-2 font-medium">Sua jornada, sob controle.</p>
        </div>

        <div className="glass-card p-8 border-white/5 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest text-center font-orbitron">
            {isSignUp ? 'Criar Conta' : 'Acesse sua conta'}
          </h2>

          <form onSubmit={handleAuth} className="space-y-4">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium animate-pulse">
                {error}
              </div>
            )}

            {isSignUp && (
              <>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Nome Completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                   <div className="col-span-1 relative">
                    <select
                      value={ddi}
                      onChange={(e) => setDdi(e.target.value)}
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-orange-500 text-sm appearance-none"
                    >
                      {DDI_LIST.map(item => (
                        <option key={item.code} value={item.code} className="bg-gray-900">+{item.code}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1 relative">
                    <select
                      value={ddd}
                      onChange={(e) => setDdd(e.target.value)}
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-orange-500 text-sm appearance-none"
                      required
                    >
                      <option value="" className="bg-gray-900">DDD</option>
                      {DDD_LIST.map(item => (
                        <option key={item.ddd} value={item.ddd} className="bg-gray-900">{item.ddd}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2 relative">
                    <input
                      type="tel"
                      placeholder="WhatsApp"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-gray-600"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5 group-focus-within:text-orange-500 transition-colors" />
              <input
                type="email"
                placeholder="Seu E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5 group-focus-within:text-orange-500 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Sua Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-premium py-4"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
              ) : (
                isSignUp ? 'CRIAR MINHA CONTA' : 'ENVELOPAR AGORA'
              )}
            </button>
          </form>

          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full mt-6 text-sm font-bold text-gray-500 hover:text-orange-500 transition-colors uppercase tracking-widest"
          >
            {isSignUp ? 'Já tem uma conta? Entrar' : 'Não tem conta? Cadastrar-se'}
          </button>
        </div>
      </div>
    </div>
  );
}