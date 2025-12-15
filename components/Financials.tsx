import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { DollarSign, Calendar, TrendingDown, PiggyBank } from 'lucide-react';

const CPK_DATA = [
  { name: 'Michelin', cpk: 0.021 },
  { name: 'Bridgestone', cpk: 0.024 },
  { name: 'Goodyear', cpk: 0.028 },
  { name: 'Importado', cpk: 0.035 },
];

const PREDICTION_DATA = [
  { month: 'Ago', cost: 0 },
  { month: 'Set', cost: 0 },
  { month: 'Out', cost: 200 },
  { month: 'Nov', cost: 0 },
  { month: 'Dez', cost: 5800 }, // Big cost predicted
  { month: 'Jan', cost: 0 },
];

const Financials: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto pr-2 pb-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Planejamento Financeiro</h2>
        <p className="text-slate-400">Previsão de custos e análise de desempenho por marca.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
           <div className="flex justify-between items-start mb-4">
              <div>
                  <p className="text-slate-400 text-sm font-medium uppercase">Custo Médio / Km</p>
                  <h3 className="text-3xl font-bold text-white mt-1">R$ 0,026</h3>
              </div>
              <div className="bg-green-500/20 p-2 rounded-lg text-green-400">
                  <TrendingDown size={24} />
              </div>
           </div>
           <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="font-bold">-12%</span> vs. média do mercado
           </p>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
           <div className="flex justify-between items-start mb-4">
              <div>
                  <p className="text-slate-400 text-sm font-medium uppercase">Previsão Dezembro</p>
                  <h3 className="text-3xl font-bold text-white mt-1">R$ 5.800</h3>
              </div>
              <div className="bg-orange-500/20 p-2 rounded-lg text-orange-400">
                  <Calendar size={24} />
              </div>
           </div>
           <p className="text-xs text-orange-400">
              Troca prevista: 2 pneus de tração
           </p>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4"></div>
           <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                  <p className="text-slate-400 text-sm font-medium uppercase">Sugestão de Reserva</p>
                  <h3 className="text-3xl font-bold text-white mt-1">R$ 1.450/mês</h3>
              </div>
              <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                  <PiggyBank size={24} />
              </div>
           </div>
           <p className="text-xs text-slate-400 relative z-10">
              Para cobrir gastos até Dezembro sem juros.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CPK Chart */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                <DollarSign size={20} className="text-green-500" />
                Desempenho por Marca (CPK)
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={CPK_DATA} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                        <XAxis type="number" stroke="#94a3b8" fontSize={12} tickFormatter={(value) => `R$ ${value}`} />
                        <YAxis dataKey="name" type="category" stroke="#fff" fontSize={12} width={80} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                            formatter={(value: number) => [`R$ ${value}`, 'Custo por Km']}
                        />
                        <Bar dataKey="cpk" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <p className="mt-4 text-xs text-slate-400 italic">
                *Michelin apresenta o menor custo por km rodado, apesar do maior custo de aquisição.
            </p>
        </div>

        {/* Forecast Chart */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                <Calendar size={20} className="text-orange-500" />
                Fluxo de Caixa Futuro
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={PREDICTION_DATA}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                            formatter={(value: number) => [`R$ ${value}`, 'Gasto Previsto']}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="cost" name="Gasto Estimado" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
             <p className="mt-4 text-xs text-slate-400 italic">
                *Pico em Dezembro referente à troca dos pneus de tração (limite TWI).
            </p>
        </div>
      </div>
    </div>
  );
};

export default Financials;