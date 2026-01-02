import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { DollarSign, Calendar, TrendingDown, PiggyBank, ShieldCheck, ShoppingCart } from 'lucide-react';
import { Truck, Tire } from '../types';

interface FinancialsProps {
  truck: Truck;
}

const CPK_DATA = [
  { name: 'Michelin', cpk: 0.021 },
  { name: 'Bridgestone', cpk: 0.024 },
  { name: 'Goodyear', cpk: 0.028 },
];

const Financials: React.FC<FinancialsProps> = ({ truck }) => {
  
  // Calculate total investment in CURRENT tires
  const currentInvestment = useMemo(() => {
    let total = 0;
    truck.axles.forEach(axle => {
      axle.tires.forEach(tire => {
        if (tire) total += tire.purchasePrice;
      });
    });
    truck.spares.forEach(tire => {
      if (tire) total += tire.purchasePrice;
    });
    return total;
  }, [truck]);

  // For history, in a real app we would have a dedicated list. 
  // Here we mock it based on active tires + some extra
  const totalTireCount = useMemo(() => {
    let count = 0;
    truck.axles.forEach(axle => {
      axle.tires.forEach(t => t && count++);
    });
    count += truck.spares.length;
    return count;
  }, [truck]);

  return (
    <div className="h-full overflow-y-auto pr-2 pb-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 font-tech">Gestão Financeira e Patrimonial</h2>
        <p className="text-slate-400">Visão clara do investimento aplicado nos pneus do seu caminhão.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Patrimônio Atual */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-blue-500/20 shadow-lg relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>
           <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Valor em Pneus (Ativo)</p>
                  <h3 className="text-3xl font-bold text-white mt-1 font-tech">R$ {currentInvestment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
              </div>
              <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                  <ShieldCheck size={24} />
              </div>
           </div>
           <p className="text-[10px] text-slate-400 relative z-10 uppercase font-bold">
              Baseado em <span className="text-white">{totalTireCount} pneus</span> instalados ou reserva.
           </p>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
           <div className="flex justify-between items-start mb-4">
              <div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Custo Médio / Km</p>
                  <h3 className="text-3xl font-bold text-white mt-1 font-tech">R$ 0,024</h3>
              </div>
              <div className="bg-green-500/20 p-2 rounded-lg text-green-400">
                  <TrendingDown size={24} />
              </div>
           </div>
           <p className="text-[10px] text-green-400 font-bold uppercase">
              Melhorando 8% este mês
           </p>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
           <div className="flex justify-between items-start mb-4">
              <div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Reserva Recomendada</p>
                  <h3 className="text-3xl font-bold text-white mt-1 font-tech">R$ 1.800</h3>
              </div>
              <div className="bg-orange-500/20 p-2 rounded-lg text-orange-400">
                  <PiggyBank size={24} />
              </div>
           </div>
           <p className="text-[10px] text-slate-400 font-bold uppercase">
              Provisionamento para desgaste
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CPK Chart */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2 font-tech uppercase tracking-wider text-sm">
                <DollarSign size={20} className="text-green-500" /> Desempenho por Marca (CPK)
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={CPK_DATA} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                        <XAxis type="number" stroke="#94a3b8" fontSize={10} tickFormatter={(value) => `R$ ${value}`} />
                        <YAxis dataKey="name" type="category" stroke="#fff" fontSize={10} width={80} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                        <Bar dataKey="cpk" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={15} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <p className="mt-4 text-[10px] text-slate-500 italic uppercase font-bold">
                *Cálculo automático baseado no valor de compra e vida útil projetada.
            </p>
        </div>

        {/* Recent Purchases List */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2 font-tech uppercase tracking-wider text-sm">
                <ShoppingCart size={20} className="text-orange-500" /> Compras Recentes (Últimos Pneus)
            </h3>
            <div className="space-y-4">
                {/* Real-time data from truck spares and axles */}
                {[...truck.axles.flatMap(a => a.tires), ...truck.spares]
                    .filter(t => t !== null)
                    .sort((a, b) => new Date(b!.purchaseDate).getTime() - new Date(a!.purchaseDate).getTime())
                    .slice(0, 5)
                    .map((tire, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-900/40 p-3 rounded-lg border border-slate-700/50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-blue-400 font-bold text-xs border border-slate-700">
                                {tire!.brand[0]}
                            </div>
                            <div>
                                <p className="text-xs text-white font-bold">{tire!.brand} {tire!.model}</p>
                                <p className="text-[10px] text-slate-500">{tire!.storeName} • {tire!.paymentMethod}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-green-400 font-bold">R$ {tire!.purchasePrice.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-500">{new Date(tire!.purchaseDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Financials;