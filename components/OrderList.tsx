
import React from 'react';
import { Order } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Edit, FileText, MapPin, User, AlertCircle, Trash2 } from 'lucide-react';

interface OrderListProps {
  orders: Order[];
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
}

export const OrderList: React.FC<OrderListProps> = ({ orders, onEdit, onDelete }) => {
  
  if (orders.length === 0) {
    return (
      <Card className="text-center py-20">
        <div className="flex flex-col items-center text-lilac-400">
          <FileText className="w-16 h-16 mb-4 opacity-50" />
          <h3 className="text-2xl font-bold text-lilac-800">Nenhum registro encontrado</h3>
          <p className="text-lilac-600 mt-2">Crie um novo registro para começar.</p>
        </div>
      </Card>
    );
  }

  const handleDeleteConfirm = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-3xl font-bold text-lilac-900 flex items-center gap-2">
        <FileText />
        Registros Recentes
      </h2>
      
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
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-lilac-50/50 transition-colors">
                  <td className="p-4 font-bold text-lilac-900">{order.pedido}</td>
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
        {orders.map((order) => (
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
    </div>
  );
};
