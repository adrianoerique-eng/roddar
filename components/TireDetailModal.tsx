import React, { useState, useRef, useEffect } from 'react';
import { Tire, TireStatus, Truck, MaintenanceRecord, calculateTireStatus } from '../types';
import { X, AlertTriangle, Activity, PenTool, TrendingUp, History, Camera, ArrowLeft, RefreshCw, CheckCircle, Save, Gauge, RotateCw, Edit } from 'lucide-react';
import { analyzeTireImage, TreadAnalysisResult } from '../services/geminiService';

interface TireDetailModalProps {
  tire: Tire | null;
  truck: Truck;
  onClose: () => void;
  onSave: (truck: Truck) => void;
}

type ModalView = 'DETAILS' | 'SCANNER' | 'OCCURRENCE' | 'PRESSURE' | 'ROTATION' | 'EDIT';

const TireDetailModal: React.FC<TireDetailModalProps> = ({ tire: initialTire, truck, onClose, onSave }) => {
  const [currentTire, setCurrentTire] = useState<Tire | null>(initialTire);
  const [viewMode, setViewMode] = useState<ModalView>('DETAILS');
  
  // Scanner State
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<TreadAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Module Forms State
  const [occurrenceType, setOccurrenceType] = useState('FURO');
  const [occurrenceDesc, setOccurrenceDesc] = useState('');
  const [occurrenceDate, setOccurrenceDate] = useState(new Date().toISOString().slice(0, 16));

  const [pressureValue, setPressureValue] = useState(initialTire?.pressure || 110);
  const [pressureDate, setPressureDate] = useState(new Date().toISOString().slice(0, 16));

  const [rotationTargetId, setRotationTargetId] = useState('');

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
      brand: '',
      model: '',
      dot: '',
      size: '',
      purchasePrice: 0,
      currentKm: 0
  });

  useEffect(() => {
    setCurrentTire(initialTire);
    setViewMode('DETAILS');
    setScanResult(null);
    setImage(null);
    if(initialTire) setPressureValue(initialTire.pressure);
  }, [initialTire]);

  if (!currentTire) return null;

  const statusColor = 
    currentTire.status === TireStatus.NEW ? 'text-green-500' :
    currentTire.status === TireStatus.GOOD ? 'text-yellow-500' :
    'text-red-500';

  // --- ACTIONS ---

  const handleUpdateTire = (updates: Partial<Tire>) => {
    if (!currentTire) return;

    // We need to find this tire in the Truck structure and update it
    const updatedTruck = { ...truck, axles: [...truck.axles] };
    
    // Helper to traverse and update
    let found = false;
    for (const axle of updatedTruck.axles) {
        const tireIndex = axle.tires.findIndex(t => t?.id === currentTire.id);
        if (tireIndex !== -1 && axle.tires[tireIndex]) {
             axle.tires[tireIndex] = { ...axle.tires[tireIndex]!, ...updates };
             found = true;
             // Update local state to reflect changes immediately
             setCurrentTire(axle.tires[tireIndex]);
             break;
        }
    }
    
    if (!found && updatedTruck.spares) {
         const spareIndex = updatedTruck.spares.findIndex(t => t.id === currentTire.id);
         if (spareIndex !== -1) {
             updatedTruck.spares[spareIndex] = { ...updatedTruck.spares[spareIndex], ...updates };
             setCurrentTire(updatedTruck.spares[spareIndex]);
             found = true;
         }
    }

    if (found) {
        onSave(updatedTruck);
    }
  };

  const handleStartEdit = () => {
      setEditFormData({
          brand: currentTire.brand,
          model: currentTire.model,
          dot: currentTire.dot,
          size: currentTire.size,
          purchasePrice: currentTire.purchasePrice,
          currentKm: currentTire.currentKm
      });
      setViewMode('EDIT');
  };

  const handleSaveEdit = () => {
      // Create temporary object to calculate status
      const tempData: Tire = { ...currentTire, ...editFormData };
      const newStatus = calculateTireStatus(tempData);
      
      handleUpdateTire({ ...editFormData, status: newStatus });
      setViewMode('DETAILS');
  };

  const saveOccurrence = () => {
    const newRecord: MaintenanceRecord = {
        id: Math.random().toString(36).substr(2, 9),
        date: occurrenceDate,
        type: occurrenceType as any,
        description: occurrenceDesc,
        cost: 0
    };
    
    const updatedHistory = [...currentTire.history, newRecord];
    const tempTire = { ...currentTire, history: updatedHistory };
    
    // Recalculate status based on new history (e.g., if damage is structural)
    const newStatus = calculateTireStatus(tempTire);
    
    const updates: Partial<Tire> = {
        history: updatedHistory,
        status: newStatus
    };

    handleUpdateTire(updates);
    setViewMode('DETAILS');
    setOccurrenceDesc('');
  };

  const savePressure = () => {
      // Just log it for now, maybe add a history record type for pressure later
       const newRecord: MaintenanceRecord = {
        id: Math.random().toString(36).substr(2, 9),
        date: pressureDate,
        type: 'PRESSAO',
        description: `Ajuste de pressão: ${pressureValue} PSI`,
        cost: 0
    };
    handleUpdateTire({ pressure: pressureValue, history: [...currentTire.history, newRecord] });
    setViewMode('DETAILS');
  };

  const performRotation = () => {
      if (!rotationTargetId) return;

      const newTruck = JSON.parse(JSON.stringify(truck)); // Deep clone
      
      // Find Source (Current Tire)
      let source: { list: any[], index: number, type: 'AXLE' | 'SPARE', axleId?: string, posName: string } | null = null;
      
      // Find Target
      let target: { list: any[], index: number, type: 'AXLE' | 'SPARE', axleId?: string, posName: string } | null = null;

      // Helper to find location
      const findLoc = (id: string, truckObj: Truck) => {
          for(let i=0; i<truckObj.axles.length; i++) {
              const ax = truckObj.axles[i];
              const idx = ax.tires.findIndex(t => t?.id === id || (t === null && id === `empty-${ax.id}-${idx}`)); // Handling empty slots if we implemented them, but simplified here
              
              if (idx !== -1) {
                  // Construct position name
                  let posName = `Eixo ${i+1} - `;
                  if (ax.tires.length === 2) {
                      posName += idx === 0 ? 'Esq' : 'Dir';
                  } else {
                      const pos = ['Esq Externo', 'Esq Interno', 'Dir Interno', 'Dir Externo'];
                      posName += pos[idx];
                  }
                  return { list: ax.tires, index: idx, type: 'AXLE' as const, axleId: ax.id, posName };
              }
          }
           // Check spares
           const spIdx = truckObj.spares.findIndex(t => t.id === id);
           if (spIdx !== -1) {
               return { list: truckObj.spares, index: spIdx, type: 'SPARE' as const, posName: `Estepe ${spIdx+1}` };
           }
           return null;
      };

      source = findLoc(currentTire.id, newTruck);
      target = findLoc(rotationTargetId, newTruck);

      if (source && target) {
          // Swap logic
          const tempTire = source.list[source.index];
          const targetTire = target.list[target.index]; // Might be null if we allowed empty slots, but currently we initialize all

          source.list[source.index] = targetTire;
          target.list[target.index] = tempTire;

          // Update position metadata inside the tire objects
          if (tempTire) tempTire.position = target.posName;
          if (targetTire) targetTire.position = source.posName;

          // Add history
          const date = new Date().toISOString().slice(0,10);
          if (tempTire) {
              tempTire.history.push({
                  id: Math.random().toString(), date, type: 'RODIZIO',
                  description: `Antes: ${source.posName} | Depois: ${target.posName}`, cost: 0
              });
          }
          if (targetTire) {
               targetTire.history.push({
                  id: Math.random().toString(), date, type: 'RODIZIO',
                  description: `Antes: ${target.posName} | Depois: ${source.posName}`, cost: 0
              });
          }

          onSave(newTruck);
          onClose(); // Close modal on rotation as the tire moved context
      }
  };


  // --- Scanner Logic ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        setScanResult(null);
        performAnalysis(base64.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const performAnalysis = async (base64Data: string) => {
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeTireImage(base64Data);
      setScanResult(analysis);
    } catch (error) {
      alert("Erro ao analisar imagem.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyScanResult = () => {
    if (scanResult) {
        // Use helper to determine logic, but override status temporarily with scan result until confirmed
        const tempTire = { ...currentTire, treadDepth: scanResult.estimatedDepthMm };
        const updatedStatus = calculateTireStatus(tempTire);
        
        handleUpdateTire({
            treadDepth: scanResult.estimatedDepthMm,
            status: updatedStatus
        });
        setViewMode('DETAILS');
    }
  };

  // Helper to generate rotation options
  const getRotationOptions = () => {
      const options: {id: string, label: string}[] = [];
      truck.axles.forEach((axle, axIdx) => {
          axle.tires.forEach((t, tIdx) => {
              if (t && t.id === currentTire.id) return; // Skip self
              let label = `Eixo ${axIdx + 1} - `;
              if (axle.tires.length === 2) {
                   label += tIdx === 0 ? 'Esquerdo' : 'Direito';
              } else {
                   const pos = ['Esq Externo', 'Esq Interno', 'Dir Interno', 'Dir Externo'];
                   label += pos[tIdx];
              }
              // If there is a tire there, show its ID/Brand, otherwise 'Vazio'
              label += t ? ` (${t.brand})` : ' (Vazio)';
              options.push({ id: t ? t.id : `empty-${axle.id}-${tIdx}`, label }); // Simplified: assuming valid tires for now
          });
      });
      
      truck.spares.forEach((t, idx) => {
          if (t && t.id === currentTire.id) return;
          options.push({ id: t.id, label: `Estepe ${idx + 1} (${t.brand})` });
      });

      return options;
  };


  // --- RENDER HELPERS ---
  const BackHeader = ({ title }: { title: string }) => (
      <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setViewMode('DETAILS')} className="p-2 -ml-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400">
             <ArrowLeft size={20} />
          </button>
          <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-start bg-slate-900">
            <div className="flex items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="bg-blue-600 text-xs px-2 py-1 rounded font-mono">RG: {currentTire.id}</span>
                        {currentTire.brand} {currentTire.model}
                        {viewMode === 'DETAILS' && (
                            <button onClick={handleStartEdit} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors ml-2" title="Editar dados do pneu">
                                <Edit size={16} />
                            </button>
                        )}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Instalado em: {currentTire.purchaseDate} • DOT: {currentTire.dot}</p>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* --- VIEW: DETAILS --- */}
        {viewMode === 'DETAILS' && (
            <div className="p-6 overflow-y-auto space-y-6">
                
                {/* Vital Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
                        <p className="text-slate-400 text-xs uppercase font-bold mb-1">Status</p>
                        <p className={`font-bold ${statusColor}`}>{currentTire.status}</p>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-1 opacity-20 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => setViewMode('PRESSURE')}>
                             <PenTool size={12} className="text-slate-400" />
                        </div>
                        <p className="text-slate-400 text-xs uppercase font-bold mb-1">Pressão</p>
                        <p className="text-white font-bold text-lg">{currentTire.pressure} PSI</p>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
                        <p className="text-slate-400 text-xs uppercase font-bold mb-1">Sulco Atual</p>
                        <p className="text-white font-bold text-lg">{currentTire.treadDepth} mm</p>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
                        <p className="text-slate-400 text-xs uppercase font-bold mb-1">Km Rodado</p>
                        <p className="text-white font-bold text-lg">{(currentTire.currentKm - currentTire.initialKm).toLocaleString()} km</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div>
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Activity size={18} className="text-blue-400" />
                        Registro Rápido
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                         <button 
                            onClick={() => setViewMode('SCANNER')}
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-3 rounded-lg border border-blue-500/30 transition-all font-bold shadow-lg shadow-blue-900/20 col-span-2 md:col-span-1"
                        >
                             <Camera size={18} /> Scanner de Sulco (IA)
                        </button>
                        <button 
                            onClick={() => setViewMode('OCCURRENCE')}
                            className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-lg border border-slate-600 transition-all"
                        >
                             <AlertTriangle size={16} /> Ocorrência
                        </button>
                        <button 
                             onClick={() => setViewMode('PRESSURE')}
                             className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-lg border border-slate-600 transition-all"
                        >
                             <Gauge size={16} /> Pressão Manual
                        </button>
                        <button 
                            onClick={() => setViewMode('ROTATION')}
                            className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-lg border border-slate-600 transition-all"
                        >
                             <RotateCw size={16} /> Rodízio
                        </button>
                    </div>
                </div>
                 
                 {/* Mini History */}
                 {currentTire.history.length > 0 && (
                     <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                         <h4 className="text-xs uppercase font-bold text-slate-500 mb-2">Últimos Registros</h4>
                         <div className="space-y-3">
                             {currentTire.history.slice().reverse().slice(0, 3).map((rec, idx) => (
                                 <div key={idx} className="border-b border-slate-800 pb-2 last:border-0 last:pb-0">
                                     <div className="flex justify-between items-center mb-1">
                                         <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${rec.type === 'RODIZIO' ? 'bg-blue-900/30 text-blue-400 border border-blue-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                                             {rec.type}
                                         </span>
                                         <span className="text-xs text-slate-500">{new Date(rec.date).toLocaleDateString()}</span>
                                     </div>
                                     <p className="text-xs text-slate-300 pl-1">{rec.description}</p>
                                 </div>
                             ))}
                         </div>
                     </div>
                 )}
            </div>
        )}

        {/* --- VIEW: EDIT --- */}
        {viewMode === 'EDIT' && (
            <div className="p-6 overflow-y-auto">
                <BackHeader title="Editar Dados do Pneu" />
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Marca</label>
                            <input 
                                type="text" 
                                value={editFormData.brand} 
                                onChange={e => setEditFormData({...editFormData, brand: e.target.value})} 
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Modelo</label>
                            <input 
                                type="text" 
                                value={editFormData.model} 
                                onChange={e => setEditFormData({...editFormData, model: e.target.value})} 
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">DOT (Fab.)</label>
                            <input 
                                type="text" 
                                value={editFormData.dot} 
                                onChange={e => setEditFormData({...editFormData, dot: e.target.value})} 
                                placeholder="0000"
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Medida</label>
                            <input 
                                type="text" 
                                value={editFormData.size} 
                                onChange={e => setEditFormData({...editFormData, size: e.target.value})} 
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Preço Compra (R$)</label>
                            <input 
                                type="number" 
                                value={editFormData.purchasePrice} 
                                onChange={e => setEditFormData({...editFormData, purchasePrice: Number(e.target.value)})} 
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">KM Atual</label>
                            <input 
                                type="number" 
                                value={editFormData.currentKm} 
                                onChange={e => setEditFormData({...editFormData, currentKm: Number(e.target.value)})} 
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <button 
                        onClick={handleSaveEdit}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg mt-4 transition-colors flex items-center justify-center gap-2"
                    >
                        <Save size={20} /> Salvar Alterações
                    </button>
                </div>
            </div>
        )}

        {/* --- VIEW: OCCURRENCE --- */}
        {viewMode === 'OCCURRENCE' && (
            <div className="p-6 overflow-y-auto">
                <BackHeader title="Registrar Ocorrência" />
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Tipo de Ocorrência</label>
                        <select 
                            value={occurrenceType}
                            onChange={e => setOccurrenceType(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="FURO">Furo</option>
                            <option value="BOLHA">Bolha / Deformação</option>
                            <option value="DESGASTE_IRREGULAR">Desgaste Irregular</option>
                            <option value="CORTE">Corte na Banda/Lateral</option>
                            <option value="ESTOURO">Estouro</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Data e Hora</label>
                        <input 
                            type="datetime-local" 
                            value={occurrenceDate}
                            onChange={e => setOccurrenceDate(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Observações</label>
                        <textarea 
                            value={occurrenceDesc}
                            onChange={e => setOccurrenceDesc(e.target.value)}
                            rows={3}
                            placeholder="Descreva o que houve..."
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <button 
                        onClick={saveOccurrence}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg mt-4 transition-colors"
                    >
                        Registrar Ocorrência
                    </button>
                </div>
            </div>
        )}

        {/* --- VIEW: PRESSURE --- */}
        {viewMode === 'PRESSURE' && (
            <div className="p-6 overflow-y-auto">
                <BackHeader title="Ajuste de Pressão" />
                <div className="flex flex-col items-center justify-center py-6">
                    <div className="w-32 h-32 rounded-full border-4 border-blue-500 flex items-center justify-center mb-6 relative">
                        <div className="text-center">
                            <span className="text-3xl font-bold text-white">{pressureValue}</span>
                            <span className="block text-xs text-blue-400 uppercase font-bold">PSI</span>
                        </div>
                    </div>
                    
                    <input 
                        type="range" 
                        min="0" max="150" 
                        value={pressureValue}
                        onChange={e => setPressureValue(Number(e.target.value))}
                        className="w-full max-w-xs mb-8 accent-blue-500"
                    />

                    <div className="w-full max-w-xs space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Data da Calibragem</label>
                            <input 
                                type="datetime-local" 
                                value={pressureDate}
                                onChange={e => setPressureDate(e.target.value)}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <button 
                            onClick={savePressure}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors"
                        >
                            Salvar Calibragem
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- VIEW: ROTATION --- */}
        {viewMode === 'ROTATION' && (
            <div className="p-6 overflow-y-auto">
                <BackHeader title="Realizar Rodízio" />
                
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Posição Atual</p>
                        <p className="text-white font-bold text-lg">{currentTire.position || "Desconhecida"}</p>
                    </div>
                    <ArrowLeft size={20} className="text-slate-600 rotate-180" />
                </div>

                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Mover Para (Trocar com)</label>
                        <select 
                            value={rotationTargetId}
                            onChange={e => setRotationTargetId(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="">Selecione a nova posição...</option>
                            {getRotationOptions().map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-500 mt-2">
                            *Ao selecionar, este pneu será trocado de lugar com o pneu da posição escolhida.
                        </p>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg flex gap-3">
                        <History className="text-yellow-500 shrink-0" size={20} />
                        <div className="text-sm text-slate-300">
                            <p className="font-bold text-yellow-500 mb-1">Histórico de Posições</p>
                            {currentTire.history.filter(h => h.type === 'RODIZIO').length === 0 ? (
                                <p>Nenhum rodízio registrado.</p>
                            ) : (
                                <ul className="list-disc list-inside text-xs space-y-1 mt-1">
                                    {currentTire.history.filter(h => h.type === 'RODIZIO').slice(-3).map((h, i) => (
                                        <li key={i}>{h.date.slice(0,10)}: {h.description}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <button 
                        onClick={performRotation}
                        disabled={!rotationTargetId}
                        className="w-full bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <RotateCw size={20} /> Confirmar Rodízio
                    </button>
                </div>
            </div>
        )}

        {/* --- VIEW: SCANNER --- */}
        {viewMode === 'SCANNER' && (
            <div className="p-6 overflow-y-auto flex flex-col h-full">
                 <BackHeader title="Scanner de Profundidade" />

                 <div className="flex-1 flex flex-col items-center">
                    {/* Camera/Image Area */}
                    <div className="relative w-full max-w-sm aspect-square bg-slate-900 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden mb-6 group">
                        {image ? (
                            <img src={image} alt="Tire Scan" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center p-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <Camera size={48} className="text-slate-600 mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
                                <p className="text-slate-500 text-sm">Toque para capturar</p>
                            </div>
                        )}

                        {isAnalyzing && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                                <RefreshCw size={32} className="text-blue-500 animate-spin mb-3" />
                                <p className="text-white font-medium animate-pulse text-sm">Analisando...</p>
                            </div>
                        )}

                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Controls & Results */}
                    {scanResult ? (
                        <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom duration-500">
                             <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center">
                                    <p className="text-slate-400 text-[10px] uppercase font-bold">Profundidade</p>
                                    <p className="text-2xl font-bold text-white">{scanResult.estimatedDepthMm} mm</p>
                                </div>
                                <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center">
                                    <p className="text-slate-400 text-[10px] uppercase font-bold">Condição</p>
                                    <p className={`text-md font-bold ${scanResult.condition === 'Crítico' ? 'text-red-500' : 'text-green-500'}`}>
                                        {scanResult.condition}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600 mb-4 text-sm text-slate-300">
                                {scanResult.recommendation}
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-1 py-3 rounded-lg bg-slate-700 text-white font-medium hover:bg-slate-600 transition-colors"
                                >
                                    Refazer
                                </button>
                                <button 
                                    onClick={applyScanResult}
                                    className="flex-1 py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-500 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Save size={18} /> Salvar
                                </button>
                            </div>
                        </div>
                    ) : (
                         image && !isAnalyzing && (
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-6 rounded-lg transition-colors"
                            >
                                Tentar Outra Foto
                            </button>
                         )
                    )}
                 </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default TireDetailModal;