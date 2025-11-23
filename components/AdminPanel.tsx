import React, { useState } from 'react';
import { SystemConfig } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Trash2, Plus, Settings, Edit2, Check, X } from 'lucide-react';

interface AdminPanelProps {
  config: SystemConfig;
  onUpdateConfig: (newConfig: SystemConfig) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ config, onUpdateConfig }) => {
  const [activeTab, setActiveTab] = useState<keyof SystemConfig>('cidades');
  const [newItem, setNewItem] = useState('');
  
  // State for Editing
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const tabs: { key: keyof SystemConfig; label: string }[] = [
    { key: 'cidades', label: 'Cidades' },
    { key: 'clusters', label: 'Clusters' },
    { key: 'supervisores', label: 'Supervisores' },
    { key: 'statusList', label: 'Status' },
    { key: 'atualizadores', label: 'Atualizadores' },
  ];

  const handleAdd = () => {
    if (!newItem.trim()) return;
    
    const updatedList = [...config[activeTab], newItem.trim()];
    onUpdateConfig({
      ...config,
      [activeTab]: updatedList,
    });
    setNewItem('');
  };

  const handleRemove = (indexToRemove: number) => {
    const updatedList = config[activeTab].filter((_, index) => index !== indexToRemove);
    onUpdateConfig({
      ...config,
      [activeTab]: updatedList,
    });
  };

  const startEdit = (index: number, currentValue: string) => {
    setEditingIndex(index);
    setEditValue(currentValue);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const saveEdit = (index: number) => {
    if (!editValue.trim()) return;

    const updatedList = [...config[activeTab]];
    updatedList[index] = editValue.trim();
    
    onUpdateConfig({
      ...config,
      [activeTab]: updatedList,
    });
    setEditingIndex(null);
    setEditValue('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3 text-lilac-900 mb-2">
        <Settings className="w-8 h-8" />
        <h2 className="text-3xl font-bold">Administração do Sistema</h2>
      </div>

      <Card className="min-h-[500px]">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-lilac-100 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                cancelEdit();
                setNewItem('');
              }}
              className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-lilac-500 text-white shadow-lg scale-105'
                  : 'bg-lilac-50 text-lilac-600 hover:bg-lilac-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-8">
          {/* Add New Item Section */}
          <div className="flex flex-col md:flex-row gap-4 items-end bg-lilac-50/30 p-4 rounded-3xl border border-lilac-100">
            <div className="flex-1 w-full">
              <label className="block text-lilac-700 font-bold mb-2 ml-2">
                Adicionar em <span className="text-lilac-500">{tabs.find(t => t.key === activeTab)?.label}</span>
              </label>
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="w-full p-4 rounded-2xl border-2 border-lilac-100 focus:border-lilac-500 focus:ring-4 focus:ring-lilac-200 outline-none transition-all text-lg text-slate-700 bg-white"
                placeholder="Digite o nome para cadastrar..."
              />
            </div>
            <Button onClick={handleAdd} icon={<Plus size={20} />} size="lg" disabled={!newItem.trim()}>
              Adicionar
            </Button>
          </div>

          {/* List Section */}
          <div className="space-y-3">
            <h3 className="text-lilac-800 font-bold ml-2 text-xl flex items-center gap-2">
              <span className="bg-lilac-100 text-lilac-600 px-3 py-1 rounded-full text-sm">
                Total: {config[activeTab].length}
              </span>
              Itens Cadastrados
            </h3>
            
            {config[activeTab].length === 0 ? (
              <div className="text-center text-lilac-400 py-12 bg-lilac-50/30 rounded-3xl border border-dashed border-lilac-200">
                Nenhum item cadastrado nesta categoria.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {config[activeTab].map((item, idx) => (
                  <div 
                    key={`${idx}`} 
                    className={`group flex justify-between items-center p-3 pl-5 rounded-2xl border transition-all duration-300 ${
                      editingIndex === idx 
                        ? 'bg-white border-lilac-500 ring-4 ring-lilac-100 shadow-lg scale-105 z-10' 
                        : 'bg-white border-lilac-100 hover:border-lilac-300 hover:shadow-md'
                    }`}
                  >
                    {editingIndex === idx ? (
                      // Edit Mode
                      <div className="flex w-full gap-2 items-center">
                        <input
                          autoFocus
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(idx);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          className="flex-1 p-2 bg-lilac-50 rounded-xl border border-lilac-300 outline-none text-slate-700 font-medium"
                        />
                        <button
                          onClick={() => saveEdit(idx)}
                          className="p-2 rounded-xl bg-lilac-500 text-white hover:bg-lilac-600 transition-colors"
                          title="Salvar"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                          title="Cancelar"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      // View Mode
                      <>
                        <span className="font-semibold text-slate-700 truncate mr-2 select-all">
                          {item}
                        </span>
                        <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(idx, item)}
                            className="p-2 rounded-xl text-lilac-400 hover:text-lilac-600 hover:bg-lilac-50 transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleRemove(idx)}
                            className="p-2 rounded-xl text-lilac-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Remover"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
