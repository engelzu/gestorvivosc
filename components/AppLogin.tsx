
import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ArrowRight, ShieldAlert } from 'lucide-react';

interface AppLoginProps {
  onLoginSuccess: () => void;
}

export const AppLogin: React.FC<AppLoginProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'vivosc2025') {
      onLoginSuccess();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lilac-50 via-white to-purple-100 flex flex-col items-center justify-center p-4 animate-fadeIn">
      <Card className="w-full max-w-md text-center p-8 border-t-4 border-t-lilac-500 shadow-2xl">
        <div className="w-24 h-24 bg-gradient-to-br from-lilac-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg shadow-lilac-200">
           <span className="text-4xl font-bold font-sans">V</span>
        </div>
        
        <h1 className="text-3xl font-bold text-lilac-900 mb-2">Gestor <span className="text-lilac-500">VIVO_SC</span></h1>
        <p className="text-slate-500 mb-8 font-medium">Bem-vindo! Digite a senha de acesso para continuar.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              autoFocus
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Senha de Acesso"
              className={`w-full p-4 rounded-2xl border-2 text-center text-lg tracking-widest outline-none transition-all placeholder:tracking-normal ${
                error 
                  ? 'border-red-300 bg-red-50 text-red-600 focus:border-red-500 placeholder:text-red-300' 
                  : 'border-lilac-100 bg-lilac-50/50 focus:border-lilac-500 focus:ring-4 focus:ring-lilac-100 text-slate-700'
              }`}
            />
            {error && (
              <div className="absolute -bottom-6 left-0 right-0 text-red-500 text-xs font-bold flex items-center justify-center gap-1 animate-pulse">
                <ShieldAlert size={12} /> Senha incorreta
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full shadow-xl shadow-lilac-200 py-4 text-lg" 
            icon={<ArrowRight size={20} />}
          >
            Acessar Sistema
          </Button>
        </form>
      </Card>
      
      <p className="mt-8 text-lilac-400 text-sm font-medium">© 2025 Gestor VIVO_SC</p>
    </div>
  );
};
