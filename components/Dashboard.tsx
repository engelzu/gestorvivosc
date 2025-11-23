import React, { useState, useMemo } from 'react';
import { Order, SystemConfig } from '../types';
import { Card } from './ui/Card';
import { Filter, TrendingUp, Activity, Database, RotateCcw } from 'lucide-react';
import { Button } from './ui/Button';

interface DashboardProps {
  orders: Order[];
  config: SystemConfig;
}

export const Dashboard: React.FC<DashboardProps> = ({ orders, config }) => {
  // Helper para formatar data (YYYY-MM-DD) usando timezone local
  const getLocalDateString = (dateInput: Date | number) => {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return ''; // Proteção contra data inválida
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [cityFilter, setCityFilter] = useState('');

  const handleClearFilter = () => {
    setCityFilter('');
  };

  const { totalInPeriod, dailyAverage, periodLabel } = useMemo(() => {
    // 0. Pré-filtro para garantir integridade das datas
    const validOrders = orders.filter(o => {
        return o.dataCriacao && !isNaN(new Date(o.dataCriacao).getTime());
    });

    // 1. Filtra por cidade
    const filtered = cityFilter 
      ? validOrders.filter(order => order.cidade === cityFilter)
      : validOrders;

    if (filtered.length === 0) {
      return { 
        totalInPeriod: 0, 
        dailyAverage: 0,
        periodLabel: 'Nenhum dado'
      };
    }

    // 2. Determina Data Início e Fim dinamicamente baseado nos dados
    const timestamps = filtered.map(o => o.dataCriacao);
    const minDateTs = Math.min(...timestamps);
    const maxDateTs = Math.max(...timestamps);

    const startDate = getLocalDateString(minDateTs);
    const endDate = getLocalDateString(maxDateTs);

    if (!startDate || !endDate) return { totalInPeriod: 0, dailyAverage: 0, periodLabel: 'Erro na Data' };

    // 3. Cálculo de dias no intervalo para média
    const [startY, startM, startD] = startDate.split('-').map(Number);
    const [endY, endM, endD] = endDate.split('-').map(Number);
    
    // Configura datas para meio-dia para evitar problemas de fuso horário/DST ao iterar
    let currentIter = new Date(startY, startM - 1, startD, 12, 0, 0);
    const endIter = new Date(endY, endM - 1, endD, 12, 0, 0);
    
    let daysCount = 0;
    let safety = 0;

    // Loop para contar dias
    while (currentIter <= endIter && safety < 3660) {
        daysCount++;
        // Avança 1 dia
        currentIter.setDate(currentIter.getDate() + 1);
        safety++;
    }

    // Formata label do período para exibição
    const startFmt = new Date(minDateTs).toLocaleDateString('pt-BR');
    const endFmt = new Date(maxDateTs).toLocaleDateString('pt-BR');
    const label = startFmt === endFmt ? startFmt : `${startFmt} até ${endFmt}`;

    return {
        totalInPeriod: filtered.length,
        dailyAverage: daysCount > 0 ? filtered.length / daysCount : 0,
        periodLabel: label
    };
  }, [orders, cityFilter]);

  return (
    <div className="space-y-6 animate-fadeIn">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 text-lilac-900">
            <TrendingUp className="w-8 h-8" />
            <h2 className="text-3xl font-bold">Dashboard & Estatísticas</h2>
        </div>
        {cityFilter && (
            <Button 
                onClick={handleClearFilter} 
                variant="secondary" 
                size="sm" 
                icon={<RotateCcw size={16}/>}
            >
                Limpar Filtro
            </Button>
        )}
      </div>

      {/* Filtros */}
      <Card className="p-6 bg-lilac-50/50 border-lilac-100">
        <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-lilac-600 ml-1 mb-1">Filtrar por Cidade</label>
                <div className="relative">
                    <Filter className="absolute left-3 top-3 text-lilac-400" size={18} />
                    <select 
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        className="w-full pl-10 p-3 rounded-2xl border border-lilac-200 outline-none focus:border-lilac-500 focus:ring-2 focus:ring-lilac-100 text-slate-700 bg-white appearance-none cursor-pointer hover:bg-white/80 transition-colors"
                    >
                        <option value="">Todas as Cidades</option>
                        {config.cidades.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>
            
            {/* Exibe o período calculado automaticamente */}
            <div className="flex-1 w-full text-right hidden md:block">
                 <p className="text-sm text-lilac-600 font-bold">Período dos Dados:</p>
                 <p className="text-lg text-slate-700">{periodLabel}</p>
            </div>
        </div>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-lilac-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-lilac-100 text-lilac-600 flex items-center justify-center shadow-inner">
                <Activity size={32} />
            </div>
            <div>
                <p className="text-slate-500 font-medium text-sm">Registros Visualizados</p>
                <h3 className="text-3xl font-bold text-lilac-900">{totalInPeriod}</h3>
            </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-lilac-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-inner">
                <TrendingUp size={32} />
            </div>
            <div>
                <p className="text-slate-500 font-medium text-sm">Média Diária (Período)</p>
                <h3 className="text-3xl font-bold text-purple-900">{dailyAverage.toFixed(1)}</h3>
            </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-lilac-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-fuchsia-100 text-fuchsia-600 flex items-center justify-center shadow-inner">
                <Database size={32} />
            </div>
            <div>
                <p className="text-slate-500 font-medium text-sm">Total Geral (Banco)</p>
                <h3 className="text-3xl font-bold text-fuchsia-900">{orders.length}</h3>
            </div>
        </div>
      </div>
    </div>
  );
};