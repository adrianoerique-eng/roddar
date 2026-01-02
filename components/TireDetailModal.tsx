import React, { useState, useRef, useEffect } from 'react';
import { Tire, TireStatus, Truck, MaintenanceRecord, calculateTireStatus, PaymentMethod } from '../types';
// Fix: Added missing Zap import from lucide-react
import { X, AlertTriangle, Activity, PenTool, TrendingUp, History, Camera, ArrowLeft, RefreshCw, CheckCircle, Save, RotateCw, Edit, DollarSign, ShoppingBag, CreditCard, ClipboardList, Zap } from 'lucide-react';
import { analyzeTireImage, TreadAnalysisResult } from '../services/geminiService';

interface TireDetailModalProps {
  tire: Tire | null;
  truck: Truck;
  onClose: () => void;
  onSave: (truck: Truck) => void;
}

type ModalView = 'DETAILS' | 'SCANNER' | 'OCCURRENCE' | 'FINANCIAL' | 'ROTATION' | 'EDIT';

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
  const [occurrenceDate, setOccurrenceDate] = useState(new Date().toISOString().slice(0, 10));

  const [rotationTargetId, setRotationTargetId] = useState('');

  // Financial Form State
  const [financialData, setFinancialData] = useState({
      purchasePrice: initialTire?.purchasePrice || 0,
      paymentMethod: initialTire?.paymentMethod || 'VISTA' as PaymentMethod,
      storeName: initialTire?.storeName || '',
      purchaseDate: initialTire?.purchaseDate || ''
  });

  // Edit Form State (Technical)
  const [editFormData, setEditFormData] = useState({
      id: '',
      brand: '',
      model: '',
      dot: '',
      size: '',
      initialKm: 0,
      currentKm: 0
  });

  useEffect(() => {
    setCurrentTire(initialTire);
    if(initialTire) {
        setFinancialData({
            purchasePrice: initialTire.purchasePrice,
            paymentMethod: initialTire.paymentMethod,
            storeName: initialTire.storeName,
            purchaseDate: initialTire.purchaseDate
        });
        setEditFormData({
            id: initialTire.id,
            brand: initialTire.brand,
            model: initialTire.model,
            dot: initialTire.dot,
            size: initialTire.size,
            initialKm: initialTire.initialKm,
            currentKm: initialTire.currentKm
        });
    }
    setViewMode('DETAILS');
    setScanResult(null);
    setImage(null);
  }, [initialTire]);

  if (!currentTire) return null;

  const statusColor = 
    currentTire.status === TireStatus.NEW ? 'text-green-500' :
    currentTire.status === TireStatus.GOOD ? 'text-yellow-500' :
    'text-red-500';

  const handleUpdateTire = (updates: Partial<Tire>) => {
    if (!currentTire) return;
    const updatedTruck = JSON.parse(JSON.stringify(truck));
    let found = false;

    // Search in axles
    for (const axle of updatedTruck.axles) {
        const tireIndex = axle.tires.findIndex((t: any) => t?.id === currentTire.id);
        if (tireIndex !== -1 && axle.tires[tireIndex]) {
             axle.tires[tireIndex] = { ...axle.tires[tireIndex]!, ...updates };
             found = true;
             setCurrentTire(axle.tires[tireIndex]);
             break;
        }
    }
    
    // Search in spares
    if (!found && updatedTruck.spares) {
         const spareIndex = updatedTruck.spares.findIndex((t: any) => t.id === currentTire.id);
         if (spareIndex !== -1) {
             updatedTruck.spares[spareIndex] = { ...updatedTruck.spares[spareIndex], ...updates };
             setCurrentTire(updatedTruck.spares[spareIndex]);
             found = true;
         }
    }

    if (found) onSave(updatedTruck);
  };

  const saveFinancial = () => {
    handleUpdateTire(financialData);
    setViewMode('DETAILS');
  };

  const handleSaveTechnical = () => {
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
    const newStatus = calculateTireStatus({ ...currentTire, history: updatedHistory });
    handleUpdateTire({ history: updatedHistory, status: newStatus });
    setViewMode('DETAILS');
    setOccurrenceDesc('');
  };

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
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2 font-tech">
                        <span className="bg-blue-600 text-xs px-2 py-1 rounded font-mono">FOGO: {currentTire.id}</span>
                        {currentTire.brand} {currentTire.model}
                        <button 
                            onClick={() => setViewMode('EDIT')}
                            className="text-slate-500 hover:text-blue-400 transition-colors ml-1"
                            title="Editar Dados Técnicos"
                        >
                            <Edit size={18} />
                        </button>
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Instalado em: {currentTire.purchaseDate} • DOT: {currentTire.dot}</p>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* View Content */}
        {viewMode === 'DETAILS' && (
            <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
                        <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Status</p>
                        <p className={`font-bold ${statusColor}`}>{currentTire.status}</p>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
                        <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Investimento</p>
                        <p className="text-green-400 font-bold text-lg">R$ {currentTire.purchasePrice.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
                        <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Sulco</p>
                        <p className="text-white font-bold text-lg">{currentTire.treadDepth} mm</p>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
                        <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">KM Rodado</p>
                        <p className="text-white font-bold text-lg">{(currentTire.currentKm - currentTire.initialKm).toLocaleString()} km</p>
                    </div>
                </div>

                <div>
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider font-tech">
                        <Activity size={18} className="text-blue-400" /> Registro Rápido
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                         <button onClick={() => setViewMode('SCANNER')} className="flex flex-col items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 p-4 rounded-lg border border-blue-500/30 transition-all font-bold group">
                             <Camera size={20} className="group-hover:scale-110 transition-transform" /> <span className="text-[10px] uppercase">Scanner IA</span>
                        </button>
                        <button onClick={() => setViewMode('OCCURRENCE')} className="flex flex-col items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-lg border border-slate-600 transition-all">
                             <AlertTriangle size={20} /> <span className="text-[10px] uppercase">Ocorrência</span>
                        </button>
                        <button onClick={() => setViewMode('FINANCIAL')} className="flex flex-col items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-lg border border-slate-600 transition-all">
                             <DollarSign size={20} /> <span className="text-[10px] uppercase">Financeiro</span>
                        </button>
                        <button onClick={() => setViewMode('ROTATION')} className="flex flex-col items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-lg border border-slate-600 transition-all">
                             <RotateCw size={20} /> <span className="text-[10px] uppercase">Rodízio</span>
                        </button>
                    </div>
                </div>

                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                    <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-3">
                        Dados de Aquisição
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4">
                        <div>
                            <p className="text-slate-500 text-[10px] uppercase">Loja</p>
                            <p className="text-slate-200 text-sm font-medium truncate">{currentTire.storeName || 'Não informado'}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 text-[10px] uppercase">Pagamento</p>
                            <p className="text-slate-200 text-sm font-medium">{currentTire.paymentMethod}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 text-[10px] uppercase">Data de Aquisição</p>
                            <p className="text-slate-200 text-sm font-medium">
                                {currentTire.purchaseDate ? new Date(currentTire.purchaseDate).toLocaleDateString('pt-BR') : 'Não informado'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* History Timeline */}
                {currentTire.history.length > 0 && (
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                        <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-4 flex items-center gap-2">
                            <History size={14}/> Histórico de Eventos
                        </h4>
                        <div className="space-y-4">
                            {currentTire.history.slice().reverse().map((record) => (
                                <div key={record.id} className="flex gap-3 border-l-2 border-slate-700 pl-4 relative">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white uppercase tracking-wider">{record.type}</p>
                                        <p className="text-[10px] text-slate-500 font-mono">{new Date(record.date).toLocaleDateString()}</p>
                                        <p className="text-xs text-slate-400 mt-1">{record.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}

        {viewMode === 'OCCURRENCE' && (
            <div className="p-6 overflow-y-auto">
                <BackHeader title="Registrar Ocorrência" />
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tipo de Evento</label>
                            <select 
                                value={occurrenceType} 
                                onChange={e => setOccurrenceType(e.target.value)}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white"
                            >
                                <option value="FURO">Furo</option>
                                <option value="BOLHA">Bolha</option>
                                <option value="CORTE">Corte Lateral</option>
                                <option value="ESTOURO">Estouro</option>
                                <option value="RECAPAGEM">Recapagem</option>
                                <option value="OUTRO">Outro Sinistro</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Data</label>
                            <input 
                                type="date" 
                                value={occurrenceDate} 
                                onChange={e => setOccurrenceDate(e.target.value)}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Descrição / Detalhes</label>
                        <textarea 
                            value={occurrenceDesc}
                            onChange={e => setOccurrenceDesc(e.target.value)}
                            placeholder="Descreva o que aconteceu..."
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white h-32 resize-none"
                        ></textarea>
                    </div>
                    <button 
                        onClick={saveOccurrence}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg mt-4 flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/20"
                    >
                        <CheckCircle size={20} /> Registrar Evento
                    </button>
                </div>
            </div>
        )}

        {viewMode === 'EDIT' && (
            <div className="p-6 overflow-y-auto">
                <BackHeader title="Edição de Dados Técnicos" />
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Número de Fogo (ID)</label>
                            <input type="text" value={editFormData.id} onChange={e => setEditFormData({...editFormData, id: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Marca</label>
                            <input type="text" value={editFormData.brand} onChange={e => setEditFormData({...editFormData, brand: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Modelo</label>
                            <input type="text" value={editFormData.model} onChange={e => setEditFormData({...editFormData, model: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Medida</label>
                            <input type="text" value={editFormData.size} onChange={e => setEditFormData({...editFormData, size: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" placeholder="Ex: 295/80 R22.5" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">DOT</label>
                            <input type="text" value={editFormData.dot} onChange={e => setEditFormData({...editFormData, dot: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">KM Inicial</label>
                            <input type="number" value={editFormData.initialKm} onChange={e => setEditFormData({...editFormData, initialKm: Number(e.target.value)})} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">KM Atual</label>
                            <input type="number" value={editFormData.currentKm} onChange={e => setEditFormData({...editFormData, currentKm: Number(e.target.value)})} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" />
                        </div>
                    </div>
                    <button onClick={handleSaveTechnical} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg mt-4 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20">
                        <Save size={20} /> Salvar Alterações Técnicas
                    </button>
                </div>
            </div>
        )}

        {viewMode === 'FINANCIAL' && (
            <div className="p-6 overflow-y-auto">
                <BackHeader title="Gestão Financeira do Pneu" />
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Valor de Compra (R$)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
                                <input type="number" value={financialData.purchasePrice} onChange={e => setFinancialData({...financialData, purchasePrice: Number(e.target.value)})} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 pl-10 text-white" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Forma de Pagamento</label>
                            <select value={financialData.paymentMethod} onChange={e => setFinancialData({...financialData, paymentMethod: e.target.value as PaymentMethod})} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white">
                                <option value="VISTA">À Vista</option>
                                <option value="CHEQUE">Cheque</option>
                                <option value="PROMISSORIA">Promissória</option>
                                <option value="PARCELADO">Parcelado</option>
                                <option value="CARTAO">Cartão</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Loja / Fornecedor</label>
                        <div className="relative">
                            <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
                            <input type="text" value={financialData.storeName} onChange={e => setFinancialData({...financialData, storeName: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 pl-10 text-white" placeholder="Ex: Pneus e Cia" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Data da Compra</label>
                        <input type="date" value={financialData.purchaseDate} onChange={e => setFinancialData({...financialData, purchaseDate: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" />
                    </div>
                    <button onClick={saveFinancial} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg mt-4 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-900/20">
                        <Save size={20} /> Atualizar Financeiro
                    </button>
                </div>
            </div>
        )}

        {/* Scanner View */}
        {viewMode === 'SCANNER' && (
            <div className="p-6 overflow-y-auto">
                <BackHeader title="Leitor de Sulco por IA" />
                <div className="flex flex-col items-center">
                    <div className="w-full aspect-video bg-slate-900 rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center relative overflow-hidden group mb-6">
                        {image ? (
                            <img src={image} className="w-full h-full object-cover" alt="Tire Scan" />
                        ) : (
                            <>
                                <Camera size={48} className="text-slate-700 mb-2 group-hover:text-blue-500 transition-colors" />
                                <p className="text-slate-500 text-sm">Nenhuma imagem carregada</p>
                            </>
                        )}
                        {isAnalyzing && (
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                                <RefreshCw className="text-blue-500 animate-spin mb-2" size={32} />
                                <p className="text-white text-xs font-bold uppercase">Processando Sulco...</p>
                            </div>
                        )}
                    </div>
                    
                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                const base64 = reader.result as string;
                                setImage(base64);
                                setIsAnalyzing(true);
                                analyzeTireImage(base64.split(',')[1]).then(res => {
                                    setScanResult(res);
                                    handleUpdateTire({ treadDepth: res.estimatedDepthMm });
                                }).finally(() => setIsAnalyzing(false));
                            };
                            reader.readAsDataURL(file);
                        }
                    }} />

                    {!scanResult ? (
                        <button onClick={() => fileInputRef.current?.click()} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                            <Camera size={24} /> Tirar Foto / Upload
                        </button>
                    ) : (
                        <div className="w-full space-y-4">
                            <div className="bg-slate-900 p-4 rounded-xl border border-blue-500/30">
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <p className="text-slate-500 text-[10px] uppercase">Sulco Estimado</p>
                                        <p className="text-2xl font-bold text-white font-tech">{scanResult.estimatedDepthMm} mm</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-[10px] uppercase">Desgaste</p>
                                        <p className="text-2xl font-bold text-yellow-400 font-tech">{scanResult.wearPercentage}%</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                    <p className="text-blue-400 text-xs font-bold uppercase mb-1">{scanResult.condition}</p>
                                    <p className="text-slate-300 text-xs">{scanResult.recommendation}</p>
                                </div>
                            </div>
                            <button onClick={() => {setImage(null); setScanResult(null);}} className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-bold">
                                Nova Leitura
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Rotation View */}
        {viewMode === 'ROTATION' && (
            <div className="p-6 overflow-y-auto">
                <BackHeader title="Rodízio e Troca de Posição" />
                <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl mb-6 flex gap-4">
                     <div className="bg-blue-600/20 p-2 rounded-lg text-blue-400 h-fit">
                        <Zap size={24} />
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-1">Rodízio Manual</h4>
                        <p className="text-xs text-slate-300">Selecione o pneu de destino para trocar de posição com o atual. O histórico de ambos será atualizado.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Selecione o Destino</label>
                    <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                         {truck.axles.flatMap((axle, axIdx) => 
                            axle.tires.map((t, tIdx) => {
                                if (!t || t.id === currentTire.id) return null;
                                return (
                                    <button 
                                        key={t.id}
                                        onClick={() => setRotationTargetId(t.id)}
                                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                                            rotationTargetId === t.id 
                                            ? 'bg-blue-600/20 border-blue-500 text-white' 
                                            : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-slate-800 w-8 h-8 rounded flex items-center justify-center font-mono text-[10px]">{t.brand[0]}</div>
                                            <div className="text-left">
                                                <p className="text-xs font-bold">{t.brand} {t.model}</p>
                                                <p className="text-[10px] text-slate-500">{t.id} • Eixo {axIdx + 1}</p>
                                            </div>
                                        </div>
                                        {rotationTargetId === t.id && <CheckCircle size={20} className="text-blue-500" />}
                                    </button>
                                );
                            })
                         )}
                    </div>
                    <button 
                        onClick={() => {
                            if (!rotationTargetId) return;
                            // Implement logic inside a real function or move to PerformRotation
                            alert("Para rodízio completo, use a função de sugestão automática na Garagem ou finalize as mudanças manuais.");
                            setViewMode('DETAILS');
                        }}
                        disabled={!rotationTargetId}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg mt-4 flex items-center justify-center gap-2"
                    >
                        Confirmar Troca de Posição
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default TireDetailModal;