
import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '789512') {
      onLoginSuccess();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fadeIn px-4">
      <Card className="w-full max-w-md text-center p-8 border-t-4 border-t-lilac-500">
        <div className="w-20 h-20 bg-lilac-100 rounded-full flex items-center justify-center mx-auto mb-6 text-lilac-600 shadow-inner">
          <Lock size={40} />
        </div>
        
        <h2 className="text-2xl font-bold text-lilac-900 mb-2">Acesso Restrito</h2>
        <p className="text-slate-500 mb-8">Digite a senha de administrador para gerenciar as configurações do sistema.</p>

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

          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="ghost" 
              className="flex-1" 
              onClick={onCancel}
            >
              Voltar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 shadow-xl shadow-lilac-200" 
              icon={<ArrowRight size={20} />}
            >
              Entrar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
