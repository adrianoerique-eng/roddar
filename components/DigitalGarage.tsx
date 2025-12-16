import React, { useState } from 'react';
import { Truck, Tire, TireStatus } from '../types';
import TireDetailModal from './TireDetailModal';
import TruckSettingsModal from './TruckSettingsModal';
import RotationSuggestionModal from './RotationSuggestionModal';
import { Zap, Disc, Settings, CheckCircle, Info, X } from 'lucide-react';

interface DigitalGarageProps {
  truck: Truck;
  onUpdateTruck: (truck: Truck) => void;
}

const DigitalGarage: React.FC<DigitalGarageProps> = ({ truck, onUpdateTruck }) => {
  const [selectedTire, setSelectedTire] = useState<Tire | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRotationModalOpen, setIsRotationModalOpen] = useState(false);
  const [showLegendInfo, setShowLegendInfo] = useState(false);

  // Configuration for SVG Drawing
  const CONFIG = {
    canvasWidth: 380,
    cabHeight: 140,
    axleStartY: 180,
    axleGap: 90,
    wheelbaseGap: 150, // Gap between front axle and first rear axle (chassis space)
    tireWidth: 28,
    tireHeight: 48,
    chassisWidth: 70,
    railThickness: 6,
    centerX: 190,
  };

  // Calculate last axle Y position precisely
  const lastAxleY = truck.axles.length > 0 
    ? (truck.axles.length === 1 
        ? CONFIG.axleStartY 
        : CONFIG.axleStartY + CONFIG.wheelbaseGap + ((truck.axles.length - 2) * CONFIG.axleGap))
    : CONFIG.axleStartY;

  // Chassis ends slightly after the last tire (tireHeight + padding)
  const chassisEndY = lastAxleY + CONFIG.tireHeight + 10;
  
  // Calculate SVG height
  const sparesHeight = (truck.spares && truck.spares.length > 0) ? 100 : 20;
  const svgHeight = chassisEndY + sparesHeight + 20; // Extra padding at bottom

  // Check if rotation was recently applied (today) on traction axle
  const tractionAxle = truck.axles.find(a => a.type === 'TRAÇÃO') || truck.axles[1];
  const hasRecentRotation = tractionAxle?.tires.some(t => 
    t?.history.some(h => 
      h.type === 'RODIZIO' && 
      h.date.startsWith(new Date().toISOString().slice(0, 10))
    )
  ) ?? false;

  const handleApplyAutoRotation = () => {
      // Logic to perform the "X" rotation on the Traction Axle
      // 1. Find Traction Axle (or second axle as fallback)
      const axleIndex = truck.axles.findIndex(a => a.type === 'TRAÇÃO');
      const targetAxleIndex = axleIndex !== -1 ? axleIndex : 1; // Default to index 1 if not found
      
      if (targetAxleIndex >= truck.axles.length) return; // Safety check

      const newTruck = JSON.parse(JSON.stringify(truck)); // Deep clone
      const axle = newTruck.axles[targetAxleIndex];
      const axleNumber = targetAxleIndex + 1;

      if (axle.tires.length === 4) {
          // Perform Swap: Outer Left (0) <-> Inner Right (2)
          //               Outer Right (3) <-> Inner Left (1)
          
          const t0 = axle.tires[0]; // Outer Left
          const t1 = axle.tires[1]; // Inner Left
          const t2 = axle.tires[2]; // Inner Right
          const t3 = axle.tires[3]; // Outer Right

          // Swap logic
          axle.tires[0] = t2;
          axle.tires[2] = t0;
          axle.tires[1] = t3;
          axle.tires[3] = t1;

          // Update Histories and Position Metadata
          const date = new Date().toISOString(); // Use full ISO string to preserve time info
          const axIdx = targetAxleIndex;
          
          const addHistory = (tire: any, fromCode: string, toCode: string, newIdx: number) => {
              if (tire) {
                  // Add History Record with PNEU-X-Y format
                  tire.history.push({
                      id: Math.random().toString(),
                      date,
                      type: 'RODIZIO',
                      description: `Antes: ${fromCode} | Depois: ${toCode}`,
                      cost: 0
                  });

                  // Update Position Property (Keep human readable for UI display)
                  const posNames = ['Externo Esquerdo', 'Interno Esquerdo', 'Interno Direito', 'Externo Direito'];
                  tire.position = `Eixo ${axleNumber} - ${posNames[newIdx]}`;
              }
          };

          // t2 (was Inner Right/2) moved to 0 (Outer Left)
          addHistory(axle.tires[0], `PNEU-${axIdx}-2`, `PNEU-${axIdx}-0`, 0);
          
          // t0 (was Outer Left/0) moved to 2 (Inner Right)
          addHistory(axle.tires[2], `PNEU-${axIdx}-0`, `PNEU-${axIdx}-2`, 2);
          
          // t3 (was Outer Right/3) moved to 1 (Inner Left)
          addHistory(axle.tires[1], `PNEU-${axIdx}-3`, `PNEU-${axIdx}-1`, 1);
          
          // t1 (was Inner Left/1) moved to 3 (Outer Right)
          addHistory(axle.tires[3], `PNEU-${axIdx}-1`, `PNEU-${axIdx}-3`, 3);

          onUpdateTruck(newTruck);
          // Don't close immediately, let user see the result via the modal update or close manualy
          setIsRotationModalOpen(false); 
      } else {
          alert("Este caminhão não possui configuração de rodagem dupla no eixo selecionado para este rodízio automático.");
      }
  };

  const getTireStyle = (status: TireStatus) => {
    switch (status) {
      case TireStatus.NEW: return { fill: '#10b981', stroke: '#059669', glow: '#10b981' }; // Green
      case TireStatus.GOOD: return { fill: '#f59e0b', stroke: '#d97706', glow: '#f59e0b' }; // Yellow
      case TireStatus.WARNING: return { fill: '#f97316', stroke: '#ea580c', glow: '#f97316' }; // Orange
      case TireStatus.CRITICAL: return { fill: '#ef4444', stroke: '#dc2626', glow: '#ef4444' }; // Red
      default: return { fill: '#475569', stroke: '#334155', glow: 'transparent' };
    }
  };

  const renderTire = (tire: Tire | null, x: number, y: number, isHorizontal: boolean = false) => {
    const style = tire ? getTireStyle(tire.status) : { fill: '#1e293b', stroke: '#334155', glow: 'transparent' };
    
    // Dimensions swap if horizontal
    const width = isHorizontal ? CONFIG.tireHeight : CONFIG.tireWidth;
    const height = isHorizontal ? CONFIG.tireWidth : CONFIG.tireHeight;

    return (
      <g 
        key={tire ? tire.id : `empty-${x}-${y}`} 
        onClick={() => tire && setSelectedTire(tire)}
        className={`${tire ? 'cursor-pointer hover:opacity-80' : ''} transition-all duration-300`}
      >
        {/* Tire Shadow/Glow if Critical */}
        {tire && tire.status === TireStatus.CRITICAL && (
             <rect 
                x={x-2} y={y-2} width={width+4} height={height+4} 
                fill={style.glow} opacity="0.3" filter="blur(4px)" rx="6" 
             />
        )}

        {/* Tire Body Base */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={4}
          fill="#1e293b" // Dark rubber base
          stroke={tire ? 'none' : '#334155'}
          strokeWidth="1"
          strokeDasharray={tire ? 'none' : '4 2'}
        />
        
        {/* Tread Indicator (Colored strip) */}
        {tire && (
            <rect
            x={isHorizontal ? x : x + 3}
            y={isHorizontal ? y + 3 : y}
            width={isHorizontal ? width : width - 6}
            height={isHorizontal ? height - 6 : height}
            rx={2}
            fill={style.fill}
            opacity={0.9}
            />
        )}
        
        {/* Tread Grooves (Visual detail) */}
        {tire && !isHorizontal && (
            <>
                <line x1={x} y1={y+12} x2={x+width} y2={y+12} stroke="black" strokeOpacity="0.2" strokeWidth="1" />
                <line x1={x} y1={y+24} x2={x+width} y2={y+24} stroke="black" strokeOpacity="0.2" strokeWidth="1" />
                <line x1={x} y1={y+36} x2={x+width} y2={y+36} stroke="black" strokeOpacity="0.2" strokeWidth="1" />
            </>
        )}
      </g>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 animate-in fade-in slide-in-from-top duration-500 relative z-20">
        <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3 font-tech uppercase tracking-wide">
                  {truck.model} 
                  <span className="text-sm bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full font-mono border border-blue-500/30">{truck.plate}</span>
              </h2>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="text-slate-500 hover:text-white transition-colors p-1.5 hover:bg-slate-800 rounded-lg"
                title="Editar Veículo"
              >
                <Settings size={20} />
              </button>
            </div>
            <p className="text-slate-400 text-sm mt-1">Visão técnica superior. Toque no pneu para editar.</p>
        </div>
        
        {/* Interactive Legend */}
        <div className="relative group">
            <div 
                className="flex gap-4 text-xs font-medium text-slate-300 glass-panel p-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors"
                onClick={() => setShowLegendInfo(!showLegendInfo)}
            >
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>Novo</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_#eab308]"></span>Meia Vida</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_#dc2626]"></span>Crítico</div>
                <div className="border-l border-slate-600 pl-2 text-blue-400"><Info size={14} /></div>
            </div>

            {/* Legend Popover */}
            {showLegendInfo && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200 z-50">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-white text-sm uppercase">Critérios de Status</h4>
                        <button onClick={() => setShowLegendInfo(false)} className="text-slate-500 hover:text-white"><X size={14}/></button>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex gap-3">
                            <div className="w-1 h-full bg-green-500 rounded-full shrink-0"></div>
                            <div>
                                <p className="text-green-400 font-bold text-xs uppercase mb-1">Novo</p>
                                <p className="text-slate-400 text-[10px] leading-tight">
                                    • Menos de 40.000 km<br/>
                                    • Sem recapagens<br/>
                                    • Sulco &gt; 8mm
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-1 h-full bg-yellow-500 rounded-full shrink-0"></div>
                            <div>
                                <p className="text-yellow-400 font-bold text-xs uppercase mb-1">Meia Vida</p>
                                <p className="text-slate-400 text-[10px] leading-tight">
                                    • 40k a 120k km<br/>
                                    • 1 ou 2 recapagens<br/>
                                    • Sulco entre 3mm e 8mm
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-1 h-full bg-red-600 rounded-full shrink-0"></div>
                            <div>
                                <p className="text-red-400 font-bold text-xs uppercase mb-1">Crítico / Atenção</p>
                                <p className="text-slate-400 text-[10px] leading-tight">
                                    • Mais de 120.000 km<br/>
                                    • Mais de 2 recapagens<br/>
                                    • Sulco &lt; 3mm<br/>
                                    • Danos (Bolha, Estouro)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 glass-panel rounded-3xl relative overflow-y-auto flex justify-center p-8 custom-scrollbar">
        
        <svg 
            width={CONFIG.canvasWidth} 
            height={svgHeight} 
            viewBox={`0 0 ${CONFIG.canvasWidth} ${svgHeight}`}
            className="drop-shadow-2xl"
        >
            <defs>
                <linearGradient id="cabGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#e2e8f0" />
                    <stop offset="50%" stopColor="#94a3b8" />
                    <stop offset="100%" stopColor="#475569" />
                </linearGradient>
                <linearGradient id="glassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.1" />
                </linearGradient>
            </defs>

            {/* --- TRUCK CABIN (Top View) --- */}
            <g transform={`translate(${CONFIG.centerX - 50}, 20)`}>
                {/* Main Body */}
                <path d="M 0 10 Q 50 -5 100 10 L 100 90 Q 50 95 0 90 Z" fill="url(#cabGradient)" stroke="#64748b" strokeWidth="1" />
                
                {/* Windshield */}
                <path d="M 5 15 Q 50 5 95 15 L 95 35 Q 50 30 5 35 Z" fill="url(#glassGradient)" stroke="#7dd3fc" strokeWidth="0.5" />
                
                {/* Roof Detail */}
                <path d="M 20 45 L 80 45" stroke="#334155" strokeWidth="1" strokeOpacity="0.5" />
                
                {/* Mirrors */}
                <path d="M -2 25 L -12 20 L -12 40 L -2 35" fill="#334155" /> 
                <path d="M 102 25 L 112 20 L 112 40 L 102 35" fill="#334155" />
            </g>

            {/* --- CHASSIS RAILS --- */}
            {/* Left Rail */}
            <rect 
                x={CONFIG.centerX - (CONFIG.chassisWidth/2) - CONFIG.railThickness} 
                y={100} 
                width={CONFIG.railThickness} 
                height={chassisEndY - 100} 
                fill="#334155" 
                stroke="#0f172a"
            />
            {/* Right Rail */}
            <rect 
                x={CONFIG.centerX + (CONFIG.chassisWidth/2)} 
                y={100} 
                width={CONFIG.railThickness} 
                height={chassisEndY - 100} 
                fill="#334155" 
                stroke="#0f172a"
            />
            
            {/* Closing Bar (Rear) */}
            <rect 
                x={CONFIG.centerX - (CONFIG.chassisWidth/2) - CONFIG.railThickness}
                y={chassisEndY - 6}
                width={CONFIG.chassisWidth + (2 * CONFIG.railThickness)}
                height={6}
                fill="#334155"
                stroke="#0f172a"
            />

            {/* Cross Members (Grid) */}
            {Array.from({ length: Math.floor((chassisEndY - 150) / 80) }).map((_, i) => (
                <rect 
                    key={`cross-${i}`}
                    x={CONFIG.centerX - (CONFIG.chassisWidth/2)}
                    y={140 + (i * 80)}
                    width={CONFIG.chassisWidth + CONFIG.railThickness}
                    height={4}
                    fill="#1e293b"
                />
            ))}

            {/* --- AXLES & TIRES LOOP --- */}
            {truck.axles.map((axle, index) => {
                // Determine Y position. 
                // Index 0 (Front) is at axleStartY.
                // Index > 0 (Rear) are pushed down by wheelbaseGap.
                const axleY = index === 0 
                    ? CONFIG.axleStartY 
                    : CONFIG.axleStartY + CONFIG.wheelbaseGap + ((index - 1) * CONFIG.axleGap);

                const isDual = axle.tires.length > 2;
                
                return (
                    <g key={axle.id} className="animate-in fade-in zoom-in duration-700" style={{ animationDelay: `${index * 100}ms` }}>
                        {/* Axle Shaft */}
                        <rect 
                            x={CONFIG.centerX - 75} 
                            y={axleY + CONFIG.tireHeight/2 - 3} 
                            width="150" 
                            height="6" 
                            fill="#64748b" 
                        />
                        
                        {/* Render Tires */}
                        {isDual ? (
                            <>
                                {renderTire(axle.tires[0], CONFIG.centerX - 98, axleY, false)} {/* Outer L */}
                                {renderTire(axle.tires[1], CONFIG.centerX - 66, axleY, false)} {/* Inner L */}
                                {renderTire(axle.tires[2], CONFIG.centerX + 38, axleY, false)} {/* Inner R */}
                                {renderTire(axle.tires[3], CONFIG.centerX + 70, axleY, false)} {/* Outer R */}
                            </>
                        ) : (
                            <>
                                {renderTire(axle.tires[0], CONFIG.centerX - 85, axleY, false)}
                                {renderTire(axle.tires[1], CONFIG.centerX + 57, axleY, false)}
                            </>
                        )}
                        
                        {/* Axle Label */}
                         <text 
                            x={CONFIG.centerX + 125} 
                            y={axleY + CONFIG.tireHeight/2 + 4} 
                            fill="#64748b" 
                            fontSize="10" 
                            fontFamily="Rajdhani"
                            fontWeight="bold"
                            letterSpacing="1"
                        >
                            {axle.type}
                        </text>
                    </g>
                );
            })}

            {/* --- SPARES (ESTEPES) --- */}
            {truck.spares && truck.spares.length > 0 && (
                <g transform={`translate(0, ${chassisEndY + 20})`}>
                    <rect x={CONFIG.centerX - 100} y="0" width="200" height="80" rx="8" fill="#1e293b" stroke="#334155" />
                    <text 
                        x={CONFIG.centerX} 
                        y="20" 
                        fill="#94a3b8" 
                        fontSize="12" 
                        fontFamily="Rajdhani" 
                        textAnchor="middle" 
                        fontWeight="bold"
                    >
                        ESTEPES / RESERVA
                    </text>
                    
                    {truck.spares.map((spare, idx) => {
                        // Position spares horizontally centered
                        const startX = CONFIG.centerX - ((truck.spares.length * (CONFIG.tireHeight + 20)) / 2) + 10;
                        const x = startX + (idx * (CONFIG.tireHeight + 20));
                        return (
                            <g key={spare.id} transform={`translate(${x}, 35)`}>
                                {renderTire(spare, 0, 0, true)} {/* Render Horizontal */}
                            </g>
                        )
                    })}
                </g>
            )}

        </svg>

      </div>

      {/* Floating Insights */}
      <div className="absolute bottom-6 right-6 left-6 md:left-auto md:max-w-md animate-in slide-in-from-bottom duration-700 delay-500">
          <div className={`glass-panel p-4 rounded-xl shadow-2xl flex items-start gap-4 border-l-4 ${hasRecentRotation ? 'border-l-green-500' : 'border-l-blue-500'}`}>
             <div className={`${hasRecentRotation ? 'bg-green-600/20 text-green-400' : 'bg-blue-600/20 text-blue-400'} p-2 rounded-lg shrink-0`}>
                {hasRecentRotation ? <CheckCircle size={24} /> : <Zap size={24} />}
             </div>
             <div>
                 <p className="font-bold text-white text-sm mb-1 font-tech uppercase">
                    {hasRecentRotation ? 'Manutenção em Dia' : 'Inteligência RODDAR'}
                 </p>
                 <p className="text-xs text-slate-300 leading-relaxed">
                    {hasRecentRotation 
                        ? 'O rodízio sugerido foi realizado. Monitorando novos padrões de desgaste.' 
                        : 'Identificamos desgaste acelerado no eixo de Tração.'}
                    <span 
                        onClick={() => setIsRotationModalOpen(true)}
                        className={`${hasRecentRotation ? 'text-green-400' : 'text-blue-400'} font-semibold cursor-pointer hover:underline ml-1`}
                    >
                        {hasRecentRotation ? 'Ver detalhes' : 'Ver sugestão de rodízio'}
                    </span>
                 </p>
             </div>
          </div>
      </div>

      <TireDetailModal 
        tire={selectedTire} 
        onClose={() => setSelectedTire(null)} 
        truck={truck}
        onSave={onUpdateTruck}
      />

      {isSettingsOpen && (
          <TruckSettingsModal 
            truck={truck} 
            onClose={() => setIsSettingsOpen(false)} 
            onSave={onUpdateTruck} 
          />
      )}

      {isRotationModalOpen && (
          <RotationSuggestionModal 
              truck={truck}
              isApplied={hasRecentRotation}
              onClose={() => setIsRotationModalOpen(false)}
              onConfirm={handleApplyAutoRotation}
          />
      )}
    </div>
  );
};

export default DigitalGarage;