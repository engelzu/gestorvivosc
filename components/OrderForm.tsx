
import React, { useState, useEffect } from 'react';
import { Order, SystemConfig } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Save, X, ArrowLeft, Lock, FileText } from 'lucide-react';

interface OrderFormProps {
  config: SystemConfig;
  initialData?: Order | null;
  onSave: (order: Order) => void;
  onCancel: () => void;
  userRole: 'admin' | 'restricted';
}

export const OrderForm: React.FC<OrderFormProps> = ({ config, initialData, onSave, onCancel, userRole }) => {
  const [formData, setFormData] = useState<Order>({
    id: crypto.randomUUID(),
    pedido: '',
    cliente: '',
    cidade: '',
    cluster: '',
    status: '',
    obs: '',
    supervisor: '',
    alteracaoRede: 'Não',
    redeDesignada: '',
    redeConstruida: '',
    chamado: '',
    atualizadoPor: '',
    draft: 0,
    statusDraft: '',
    dataCriacao: Date.now(),
  });

  const isRestricted = userRole === 'restricted';

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof Order, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputClasses = "w-full p-4 rounded-2xl border-2 border-lilac-100 focus:border-lilac-500 focus:ring-4 focus:ring-lilac-200 outline-none transition-all text-slate-700 bg-white disabled:bg-slate-100 disabled:text-slate-500 disabled:border-slate-200 disabled:cursor-not-allowed";
  const labelClasses = "block text-lilac-800 font-bold mb-2 ml-1 flex items-center gap-2";

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 text-lilac-900">
          <Button variant="ghost" onClick={onCancel} className="!p-2">
            <ArrowLeft size={24} />
          </Button>
          <div className="flex flex-col">
            <h2 className="text-3xl font-bold">{initialData ? 'Editar Registro' : 'Novo Registro'}</h2>
            {isRestricted && <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded w-fit mt-1">Modo Restrito: Apenas atualização</span>}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Informações de Draft - NOVO */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 mb-2">
               <h3 className="text-lg font-bold text-lilac-600 border-b border-lilac-200 pb-2 mb-4 flex items-center gap-2">
                 <FileText size={20}/> Draft & Status
               </h3>
            </div>

            <div>
                <label className={labelClasses}>
                    Nº Draft
                    {isRestricted && <Lock size={12} className="text-slate-400"/>}
                </label>
                <input
                    type="number"
                    disabled={isRestricted}
                    value={formData.draft || ''}
                    onChange={(e) => handleChange('draft', parseInt(e.target.value) || 0)}
                    className={inputClasses}
                    placeholder="Número do Draft"
                />
            </div>

            <div>
                <label className={labelClasses}>
                    Status Draft
                    {isRestricted && <Lock size={12} className="text-slate-400"/>}
                </label>
                <select
                    disabled={isRestricted}
                    value={formData.statusDraft || ''}
                    onChange={(e) => handleChange('statusDraft', e.target.value)}
                    className={inputClasses}
                >
                    <option value="">Selecione...</option>
                    {(config.statusDraftList || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>

            {/* Basic Info */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 mb-2 mt-4">
               <h3 className="text-lg font-bold text-lilac-600 border-b border-lilac-200 pb-2 mb-4">Informações do Pedido</h3>
            </div>

            <div>
              <label className={labelClasses}>
                Nº Registro
                {isRestricted && <Lock size={12} className="text-slate-400"/>}
              </label>
              <input
                required
                disabled={isRestricted}
                type="text"
                value={formData.pedido}
                onChange={(e) => handleChange('pedido', e.target.value)}
                className={inputClasses}
                placeholder="Ex: 12345"
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClasses}>
                Cliente
                {isRestricted && <Lock size={12} className="text-slate-400"/>}
              </label>
              <input
                required
                disabled={isRestricted}
                type="text"
                value={formData.cliente}
                onChange={(e) => handleChange('cliente', e.target.value)}
                className={inputClasses}
                placeholder="Nome do Cliente"
              />
            </div>

            <div>
              <label className={labelClasses}>
                Cidade
                {isRestricted && <Lock size={12} className="text-slate-400"/>}
              </label>
              <select
                required
                disabled={isRestricted}
                value={formData.cidade}
                onChange={(e) => handleChange('cidade', e.target.value)}
                className={inputClasses}
              >
                <option value="">Selecione...</option>
                {config.cidades.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClasses}>
                Cluster
                {isRestricted && <Lock size={12} className="text-slate-400"/>}
              </label>
              <select
                required
                disabled={isRestricted}
                value={formData.cluster}
                onChange={(e) => handleChange('cluster', e.target.value)}
                className={inputClasses}
              >
                <option value="">Selecione...</option>
                {config.clusters.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClasses}>
                Status
                {/* Status é permitido para todos */}
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className={inputClasses}
              >
                <option value="">Selecione...</option>
                {config.statusList.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            {/* Technical Info */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-6 mb-2">
               <h3 className="text-lg font-bold text-lilac-600 border-b border-lilac-200 pb-2 mb-4">Detalhes Técnicos</h3>
            </div>

            <div>
              <label className={labelClasses}>
                Supervisor
                {isRestricted && <Lock size={12} className="text-slate-400"/>}
              </label>
              <select
                disabled={isRestricted}
                value={formData.supervisor}
                onChange={(e) => handleChange('supervisor', e.target.value)}
                className={inputClasses}
              >
                <option value="">Selecione...</option>
                {config.supervisores.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClasses}>
                Alteração de Rede?
                {isRestricted && <Lock size={12} className="text-slate-400"/>}
              </label>
              <div className={`flex gap-4 p-2 ${isRestricted ? 'opacity-50 pointer-events-none' : ''}`}>
                 <label className="flex items-center gap-2 cursor-pointer p-4 rounded-2xl border-2 border-lilac-100 has-[:checked]:bg-lilac-50 has-[:checked]:border-lilac-500 transition-all flex-1">
                    <input 
                      type="radio" 
                      name="alteracaoRede" 
                      value="Sim"
                      checked={formData.alteracaoRede === 'Sim'}
                      onChange={() => handleChange('alteracaoRede', 'Sim')}
                      className="w-6 h-6 text-lilac-600 accent-lilac-600" 
                    />
                    <span className="font-bold text-slate-700">Sim</span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer p-4 rounded-2xl border-2 border-lilac-100 has-[:checked]:bg-lilac-50 has-[:checked]:border-lilac-500 transition-all flex-1">
                    <input 
                      type="radio" 
                      name="alteracaoRede" 
                      value="Não"
                      checked={formData.alteracaoRede === 'Não'}
                      onChange={() => handleChange('alteracaoRede', 'Não')}
                      className="w-6 h-6 text-lilac-600 accent-lilac-600" 
                    />
                    <span className="font-bold text-slate-700">Não</span>
                 </label>
              </div>
            </div>

            <div>
              <label className={labelClasses}>
                Chamado
                {isRestricted && <Lock size={12} className="text-slate-400"/>}
              </label>
              <input
                disabled={isRestricted}
                type="text"
                value={formData.chamado}
                onChange={(e) => handleChange('chamado', e.target.value)}
                className={inputClasses}
                placeholder="# Chamado"
              />
            </div>

            <div>
              <label className={labelClasses}>
                Rede Designada
                {isRestricted && <Lock size={12} className="text-slate-400"/>}
              </label>
              <input
                disabled={isRestricted}
                type="text"
                value={formData.redeDesignada}
                onChange={(e) => handleChange('redeDesignada', e.target.value)}
                className={inputClasses}
                placeholder="Info da rede designada"
              />
            </div>

            <div>
              <label className={labelClasses}>
                Rede Construída
                {isRestricted && <Lock size={12} className="text-slate-400"/>}
              </label>
              <input
                disabled={isRestricted}
                type="text"
                value={formData.redeConstruida}
                onChange={(e) => handleChange('redeConstruida', e.target.value)}
                className={inputClasses}
                placeholder="Info da rede construída"
              />
            </div>

            <div>
              <label className={labelClasses}>
                Atualizado Por
                {/* Permitido para todos */}
              </label>
              <select
                value={formData.atualizadoPor}
                onChange={(e) => handleChange('atualizadoPor', e.target.value)}
                className={inputClasses}
              >
                <option value="">Selecione...</option>
                {config.atualizadores.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <label className={labelClasses}>
                Observações
                {/* Permitido para todos */}
              </label>
              <textarea
                value={formData.obs}
                onChange={(e) => handleChange('obs', e.target.value)}
                className={`${inputClasses} min-h-[120px] resize-y`}
                placeholder="Observações adicionais..."
              />
            </div>
          </div>
          
          <div className="mt-10 flex justify-end gap-4">
            <Button type="button" variant="secondary" size="lg" onClick={onCancel} icon={<X />}>
              Cancelar
            </Button>
            <Button type="submit" size="lg" icon={<Save />}>
              Salvar Registro
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};
