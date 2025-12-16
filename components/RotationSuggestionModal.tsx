import React from 'react';
import { X, ArrowRight, RefreshCw, AlertTriangle, CheckCircle, Zap, ShieldCheck } from 'lucide-react';
import { Truck, Tire } from '../types';

interface RotationSuggestionModalProps {
  truck: Truck;
  isApplied?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const RotationSuggestionModal: React.FC<RotationSuggestionModalProps> = ({ truck, isApplied = false, onClose, onConfirm }) => {
  
  // Logic to find the Traction axle
  const tractionAxle = truck.axles.find(a => a.type === 'TRAÇÃO') || truck.axles[1];
  const hasDualTires = tractionAxle && tractionAxle.tires.length === 4;

  // Get specific tires if available (Assuming standard 4-tire layout: OL, IL, IR, OR)
  const tOL = tractionAxle?.tires[0]; // Outer Left
  const tIL = tractionAxle?.tires[1]; // Inner Left
  const tIR = tractionAxle?.tires[2]; // Inner Right
  const tOR = tractionAxle?.tires[3]; // Outer Right

  const renderTireBadge = (tire: Tire | null | undefined, positionLabel: string, showCheck: boolean = false) => (
    <div className="flex flex-col">
        <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm md:text-base">{positionLabel}</span>
            {showCheck && <CheckCircle size={14} className="text-green-500" />}
        </div>
        {tire && (
            <span className="text-xs text-slate-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 w-fit mt-1">
                {tire.brand} • {tire.id}
            </span>
        )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
            <h2 className={`text-xl font-bold flex items-center gap-2 ${isApplied ? 'text-green-500' : 'text-white'}`}>
                {isApplied ? <ShieldCheck size={24} /> : <Zap className="text-blue-500 fill-blue-500" size={24} />}
                {isApplied ? 'Rodízio Concluído' : 'Sugestão de Rodízio Inteligente'}
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
            
            {/* Diagnosis/Success Card */}
            <div className={`border p-4 rounded-xl mb-6 flex gap-4 ${isApplied ? 'bg-green-900/20 border-green-500/30' : 'bg-blue-900/20 border-blue-500/30'}`}>
                <div className={`p-3 rounded-lg h-fit ${isApplied ? 'bg-green-600/20' : 'bg-blue-600/20'}`}>
                    {isApplied ? <CheckCircle className="text-green-400" size={24} /> : <AlertTriangle className="text-blue-400" size={24} />}
                </div>
                <div>
                    <h3 className="font-bold text-white text-lg mb-1">
                        {isApplied ? 'Procedimento Realizado' : 'Desgaste Acentuado na Tração'}
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                        {isApplied 
                            ? 'A configuração de pneus deste eixo já foi otimizada conforme a sugestão da IA. O desgaste está sendo monitorado para garantir a efetividade da troca.'
                            : <>A IA detectou que os pneus <strong>externos</strong> do eixo de tração estão desgastando <span className="text-red-400 font-bold">15% mais rápido</span> que os internos. Isso é comum em rotas com muitas curvas ou acostamento irregular.</>
                        }
                    </p>
                </div>
            </div>

            {/* The Strategy */}
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">
                {isApplied ? 'Configuração Atual do Eixo (Otimizada)' : 'Plano de Ação Sugerido: RODÍZIO EM X'}
            </h3>
            
            <div className="space-y-3 mb-8">
                {hasDualTires ? (
                    isApplied ? (
                        // Applied View: Just list the tires in current position
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50">
                                {renderTireBadge(tOL, "Externo Esquerdo", true)}
                             </div>
                             <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50">
                                {renderTireBadge(tIL, "Interno Esquerdo", true)}
                             </div>
                             <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50">
                                {renderTireBadge(tIR, "Interno Direito", true)}
                             </div>
                             <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50">
                                {renderTireBadge(tOR, "Externo Direito", true)}
                             </div>
                        </div>
                    ) : (
                        // Suggestion View: Arrows
                        <>
                            {/* Move 1: Outer Left -> Inner Right */}
                            <div className="bg-slate-800 p-4 rounded-xl flex items-center justify-between border border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="hidden md:block bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded self-start">Eixo Tração</div>
                                    {renderTireBadge(tOL, "Externo Esquerdo")}
                                </div>
                                <ArrowRight className="text-blue-500 mx-2" size={20} />
                                <div className="flex items-center gap-3 text-right md:text-left">
                                    <div className="flex flex-col items-end md:items-start">
                                        <span className="text-white font-bold text-sm md:text-base">Interno Direito</span>
                                        <span className="bg-blue-900/30 text-blue-400 text-[10px] px-2 py-0.5 rounded border border-blue-500/30 mt-1">
                                            Posição Ideal
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Move 2: Outer Right -> Inner Left */}
                            <div className="bg-slate-800 p-4 rounded-xl flex items-center justify-between border border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="hidden md:block bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded self-start">Eixo Tração</div>
                                    {renderTireBadge(tOR, "Externo Direito")}
                                </div>
                                <ArrowRight className="text-blue-500 mx-2" size={20} />
                                <div className="flex items-center gap-3 text-right md:text-left">
                                    <div className="flex flex-col items-end md:items-start">
                                        <span className="text-white font-bold text-sm md:text-base">Interno Esquerdo</span>
                                        <span className="bg-blue-900/30 text-blue-400 text-[10px] px-2 py-0.5 rounded border border-blue-500/30 mt-1">
                                            Posição Ideal
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )
                ) : (
                    <div className="text-center text-slate-500 py-4 border border-dashed border-slate-700 rounded-xl">
                        Configuração de pneus não compatível com a sugestão automática (Necessário eixo duplo).
                    </div>
                )}
            </div>

            {/* Impact Projection */}
            {!isApplied && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-900/10 border border-green-500/20 p-4 rounded-xl text-center">
                        <p className="text-green-500 font-bold text-2xl">+12.000 km</p>
                        <p className="text-slate-400 text-xs uppercase">Ganho de Vida Útil</p>
                    </div>
                    <div className="bg-green-900/10 border border-green-500/20 p-4 rounded-xl text-center">
                        <p className="text-green-500 font-bold text-2xl">R$ 480,00</p>
                        <p className="text-slate-400 text-xs uppercase">Economia Estimada</p>
                    </div>
                </div>
            )}

        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900 flex gap-4">
            <button 
                onClick={onClose}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-all"
            >
                {isApplied ? 'Fechar' : 'Ignorar'}
            </button>
            {!isApplied && (
                <button 
                    onClick={onConfirm}
                    className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                >
                    <RefreshCw size={20} /> Executar Rodízio Agora
                </button>
            )}
        </div>

      </div>
    </div>
  );
};

export default RotationSuggestionModal;