
import React, { useState, useMemo } from 'react';
import { Order, SystemConfig } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Edit, FileText, MapPin, User, AlertCircle, Trash2, Search, Filter, X } from 'lucide-react';

interface OrderListProps {
  orders: Order[];
  config: SystemConfig;
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
}

export const OrderList: React.FC<OrderListProps> = ({ orders, config, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [clusterFilter, setClusterFilter] = useState('');

  // Filtra os pedidos baseado na busca e nos dropdowns
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // 1. Busca Global (Search Term)
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        order.pedido?.toLowerCase().includes(searchLower) ||
        order.cliente?.toLowerCase().includes(searchLower) ||
        order.cidade?.toLowerCase().includes(searchLower) ||
        order.chamado?.toLowerCase().includes(searchLower) ||
        order.obs?.toLowerCase().includes(searchLower) ||
        order.redeDesignada?.toLowerCase().includes(searchLower) ||
        order.redeConstruida?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // 2. Filtros Específicos
      if (statusFilter && order.status !== statusFilter) return false;
      if (cityFilter && order.cidade !== cityFilter) return false;
      if (clusterFilter && order.cluster !== clusterFilter) return false;

      return true;
    });
  }, [orders, searchTerm, statusFilter, cityFilter, clusterFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCityFilter('');
    setClusterFilter('');
  };

  const handleDeleteConfirm = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      onDelete(id);
    }
  };

  // Componentes visuais para inputs de filtro
  const FilterDropdown = ({ 
    value, 
    onChange, 
    options, 
    placeholder,
    label 
  }: { value: string, onChange: (val: string) => void, options: string[], placeholder: string, label: string }) => (
    <div className="flex flex-col gap-1 min-w-[150px] flex-1">
      <label className="text-xs font-bold text-lilac-600 ml-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="p-3 rounded-2xl border border-lilac-200 bg-white text-slate-700 focus:ring-2 focus:ring-lilac-200 focus:border-lilac-500 outline-none transition-all text-sm"
      >
        <option value="">{placeholder}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold text-lilac-900 flex items-center gap-2">
          <FileText />
          Registros
          <span className="text-sm font-normal text-lilac-500 bg-lilac-100 px-3 py-1 rounded-full">
            {filteredOrders.length} de {orders.length}
          </span>
        </h2>
      </div>

      {/* --- BARRA DE PESQUISA E FILTROS --- */}
      <Card className="p-4 bg-lilac-50/50 border-lilac-100">
        <div className="flex flex-col gap-4">
          
          {/* Busca Global */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-lilac-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por ID, Nome, Cidade, Obs, Rede..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-lilac-200 focus:border-lilac-500 focus:ring-4 focus:ring-lilac-100 outline-none transition-all text-slate-700 bg-white"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-lilac-400 hover:text-lilac-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filtros Dropdown */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex items-center gap-2 text-lilac-700 font-bold md:w-auto min-w-[80px]">
              <Filter size={18} />
              Filtros:
            </div>
            
            <div className="grid grid-cols-2 md:flex md:flex-wrap gap-3 flex-1">
              <FilterDropdown 
                label="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={config.statusList}
                placeholder="Todos Status"
              />
              
              <FilterDropdown 
                label="Cidade"
                value={cityFilter}
                onChange={setCityFilter}
                options={config.cidades}
                placeholder="Todas Cidades"
              />

              <FilterDropdown 
                label="Cluster"
                value={clusterFilter}
                onChange={setClusterFilter}
                options={config.clusters}
                placeholder="Todos Clusters"
              />
            </div>

            {(statusFilter || cityFilter || clusterFilter || searchTerm) && (
              <button 
                onClick={clearFilters}
                className="mt-auto p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-colors font-bold text-sm flex items-center justify-center gap-1 border border-transparent hover:border-red-100"
              >
                <Trash2 size={16} />
                Limpar
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* --- LISTA DE RESULTADOS --- */}
      
      {filteredOrders.length === 0 ? (
        <Card className="text-center py-20 border-dashed border-2 border-lilac-200 bg-transparent">
          <div className="flex flex-col items-center text-lilac-400">
            <Search className="w-16 h-16 mb-4 opacity-30" />
            <h3 className="text-2xl font-bold text-lilac-800">Nenhum registro encontrado</h3>
            <p className="text-lilac-600 mt-2">Tente ajustar sua busca ou filtros.</p>
            <Button variant="ghost" onClick={clearFilters} className="mt-4">
              Limpar Filtros
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-hidden rounded-3xl border border-lilac-200 shadow-lg bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-lilac-500 text-white text-left">
                    <th className="p-4 font-bold">Registro</th>
                    <th className="p-4 font-bold">Cliente</th>
                    <th className="p-4 font-bold">Cidade / Cluster</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold">Supervisor</th>
                    <th className="p-4 font-bold text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lilac-100">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-lilac-50/50 transition-colors">
                      <td className="p-4 font-bold text-lilac-900">
                        {order.pedido}
                        <div className="text-xs font-normal text-slate-400 mt-1">
                            {new Date(order.dataCriacao).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4 text-slate-700">{order.cliente}</td>
                      <td className="p-4 text-slate-600">
                        <div className="flex flex-col">
                          <span className="font-medium">{order.cidade}</span>
                          <span className="text-xs text-lilac-500">{order.cluster}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-lilac-100 text-lilac-700 border border-lilac-200">
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 text-sm">{order.supervisor}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => onEdit(order)}
                            className="p-2 text-lilac-500 hover:text-lilac-700 hover:bg-lilac-100 rounded-full transition-all"
                            title="Editar"
                          >
                            <Edit size={20} />
                          </button>
                          <button 
                            onClick={() => handleDeleteConfirm(order.id)}
                            className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                            title="Excluir"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden grid grid-cols-1 gap-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="border-l-8 border-l-lilac-500">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-lilac-900">#{order.pedido}</h3>
                    <p className="text-lg text-slate-700 font-medium">{order.cliente}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-lilac-500 text-white shadow-sm">
                    {order.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-slate-600 mb-4 bg-lilac-50/50 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-lilac-400" />
                    <span>{order.cidade} &bull; {order.cluster}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-lilac-400" />
                    <span>Sup: {order.supervisor || 'N/A'}</span>
                  </div>
                  {order.alteracaoRede === 'Sim' && (
                    <div className="flex items-center gap-2 text-amber-600 font-bold">
                      <AlertCircle size={16} />
                      <span>Alteração de Rede</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="flex-1 rounded-xl" 
                    onClick={() => onEdit(order)}
                    icon={<Edit size={16}/>}
                  >
                    Editar
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50" 
                    onClick={() => handleDeleteConfirm(order.id)}
                    icon={<Trash2 size={16}/>}
                  >
                    Excluir
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
