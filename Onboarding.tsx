import React, { useState, useRef } from 'react';
import { Truck, ArrowRight, Plus, Minus, Check, Disc, User, MapPin, Phone, Briefcase, Camera } from 'lucide-react';
import { Truck as TruckType, Axle, TireStatus, Tire } from '../types';
import { createTire } from '../constants';

interface OnboardingProps {
  onComplete: (truck: TruckType) => void;
}

interface SpareConfig {
    id: string;
    brand: string;
    status: TireStatus;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  
  // Step 1: Owner Data
  const [ownerData, setOwnerData] = useState({
    name: '', // Now Optional (Company/Owner)
    driverName: '', // Now Required (Main Driver)
    photo: '',
    city: '',
    street: '',
    number: '',
    phone: '',
    email: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2: Truck Data
  const [formData, setFormData] = useState({
    plate: '',
    model: '',
    totalKm: ''
  });

  // Step 3: Axles
  const [axles, setAxles] = useState<Axle[]>([
    { id: 'axle-1', type: 'DIANTEIRO', tires: [null, null] },
    { id: 'axle-2', type: 'TRAÇÃO', tires: [null, null, null, null] }
  ]);
  
  // Step 4: Spares (Individual Configuration)
  const [sparesList, setSparesList] = useState<SpareConfig[]>([]);

  const handleAddAxle = () => {
    const newAxle: Axle = {
      id: `axle-${axles.length + 1}`,
      type: 'TRUCK',
      tires: [null, null, null, null] // Default to dual tires for rear axles
    };
    setAxles([...axles, newAxle]);
  };

  const handleRemoveAxle = () => {
    if (axles.length > 2) {
      setAxles(axles.slice(0, -1));
    }
  };

  const toggleAxleType = (index: number) => {
    // Toggle between Single (2 tires) and Dual (4 tires)
    const newAxles = [...axles];
    const currentTires = newAxles[index].tires;
    
    if (currentTires.length === 2) {
        newAxles[index].tires = [null, null, null, null];
    } else {
        newAxles[index].tires = [null, null];
    }
    setAxles(newAxles);
  };

  // Spare Handlers
  const addSpare = () => {
      setSparesList([...sparesList, { 
          id: Math.random().toString(36).substr(2, 9), 
          brand: 'Genérico', 
          status: TireStatus.NEW 
      }]);
  };

  const removeSpare = () => {
      if (sparesList.length > 0) {
          setSparesList(sparesList.slice(0, -1));
      }
  };

  const updateSpare = (index: number, field: keyof SpareConfig, value: any) => {
      const newList = [...sparesList];
      newList[index] = { ...newList[index], [field]: value };
      setSparesList(newList);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setOwnerData({ ...ownerData, photo: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSubmit = () => {
    // Generate axle tires
    const finalAxles = axles.map((axle, idx) => ({
        ...axle,
        tires: axle.tires.map((_, tIdx) => 
             createTire(`PNEU-${idx}-${tIdx}`, 'Genérico', TireStatus.NEW, 0, 0)
        )
    }));

    // Generate spare tires from specific config
    const spares: Tire[] = sparesList.map((config, i) => 
        createTire(`STP-${i}`, config.brand, config.status, 0, 0)
    );

    const newTruck: TruckType = {
      id: 'truck-new',
      plate: formData.plate.toUpperCase(),
      model: formData.model,
      totalKm: Number(formData.totalKm),
      axles: finalAxles,
      spares: spares,
      owner: ownerData,
      tripHistory: []
    };

    onComplete(newTruck);
  };

  // Validation helpers
  const isOwnerDataValid = ownerData.driverName && ownerData.city && ownerData.phone;
  // Step 2 Validation: Model, Plate AND Total KM are now required.
  const isVehicleDataValid = formData.model && formData.plate && formData.totalKm !== '';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-[#0B0F19] to-[#0B0F19]">
      
      {/* Branding Header */}
      <div className="text-center mb-8 animate-in fade-in slide-in-from-top duration-700">
        <div className="flex items-center justify-center gap-4 mb-3">
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-40"></div>
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 w-16 h-16 rounded-2xl flex items-center justify-center relative z-10 border border-white/10 shadow-2xl">
                    <Truck className="text-white" size={32} />
                </div>
            </div>
            <h1 className="text-6xl font-bold text-white tracking-tighter font-tech">RODDAR</h1>
        </div>
        <p className="text-blue-200/70 text-lg font-medium tracking-wide">Gestão inteligente de pneus do caminhão</p>
      </div>

      <div className="w-full max-w-2xl">
        
        {/* Progress */}
        <div className="flex justify-between items-center mb-8 px-4">
             <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-500' : 'text-slate-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step >= 1 ? 'border-blue-500 bg-blue-500/20' : 'border-slate-700'}`}>1</div>
                <span className="font-tech uppercase tracking-wider text-xs md:text-sm hidden md:inline">Proprietário</span>
            </div>
            <div className="h-[1px] flex-1 mx-2 bg-slate-800"></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-500' : 'text-slate-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step >= 2 ? 'border-blue-500 bg-blue-500/20' : 'border-slate-700'}`}>2</div>
                <span className="font-tech uppercase tracking-wider text-xs md:text-sm hidden md:inline">Veículo</span>
            </div>
            <div className="h-[1px] flex-1 mx-2 bg-slate-800"></div>
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-500' : 'text-slate-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step >= 3 ? 'border-blue-500 bg-blue-500/20' : 'border-slate-700'}`}>3</div>
                <span className="font-tech uppercase tracking-wider text-xs md:text-sm hidden md:inline">Eixos</span>
            </div>
            <div className="h-[1px] flex-1 mx-2 bg-slate-800"></div>
            <div className={`flex items-center gap-2 ${step >= 4 ? 'text-blue-500' : 'text-slate-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step >= 4 ? 'border-blue-500 bg-blue-500/20' : 'border-slate-700'}`}>4</div>
                <span className="font-tech uppercase tracking-wider text-xs md:text-sm hidden md:inline">Estepe</span>
            </div>
        </div>

        <div className="glass-panel p-8 rounded-2xl shadow-2xl relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -z-10"></div>

            {/* STEP 1: PROPRIETÁRIO */}
            {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right duration-500">
                    <h2 className="text-3xl font-bold text-white mb-2 font-tech">Cadastro do Proprietário</h2>
                    <p className="text-slate-400 mb-6">Vamos começar cadastrando o responsável pela frota.</p>
                    
                    {/* Photo Upload */}
                    <div className="flex flex-col items-center mb-8">
                        <div 
                            className="w-24 h-24 rounded-full bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center overflow-hidden relative group cursor-pointer hover:border-blue-500 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {ownerData.photo ? (
                                <img src={ownerData.photo} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <Camera size={32} className="text-slate-500 group-hover:text-blue-500 transition-colors" />
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-xs font-bold">Alterar</span>
                            </div>
                        </div>
                        <p className="text-slate-500 text-xs mt-2 font-medium">Foto do Perfil (Opcional)</p>
                        <input 
                            type="file" 
                            accept="image/*" 
                            hidden 
                            ref={fileInputRef} 
                            onChange={handlePhotoUpload} 
                        />
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <User size={14} /> Condutor Principal
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="Quem dirige?"
                                    value={ownerData.driverName}
                                    onChange={e => setOwnerData({...ownerData, driverName: e.target.value})}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Briefcase size={14} /> Empresa (Opcional)
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="Nome da empresa"
                                    value={ownerData.name}
                                    onChange={e => setOwnerData({...ownerData, name: e.target.value})}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <MapPin size={14} /> Endereço
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input 
                                    type="text" 
                                    placeholder="Cidade"
                                    value={ownerData.city}
                                    onChange={e => setOwnerData({...ownerData, city: e.target.value})}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                                />
                                 <input 
                                    type="text" 
                                    placeholder="Rua"
                                    value={ownerData.street}
                                    onChange={e => setOwnerData({...ownerData, street: e.target.value})}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                                />
                                 <input 
                                    type="text" 
                                    placeholder="Nº"
                                    value={ownerData.number}
                                    onChange={e => setOwnerData({...ownerData, number: e.target.value})}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Phone size={14} /> Telefone
                                </label>
                                <input 
                                    type="tel" 
                                    placeholder="(00) 00000-0000"
                                    value={ownerData.phone}
                                    onChange={e => setOwnerData({...ownerData, phone: e.target.value})}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                                />
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">E-mail (Opcional)</label>
                                <input 
                                    type="email" 
                                    placeholder="contato@email.com"
                                    value={ownerData.email}
                                    onChange={e => setOwnerData({...ownerData, email: e.target.value})}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 flex justify-end">
                        <button 
                            onClick={() => isOwnerDataValid ? setStep(2) : null}
                            className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all ${
                                isOwnerDataValid 
                                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40' 
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                        >
                            Próximo <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 2: VEICULO */}
            {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right duration-500">
                    <h2 className="text-3xl font-bold text-white mb-2 font-tech">Cadastro do Veículo</h2>
                    <p className="text-slate-400 mb-8">Agora os dados do caminhão.</p>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Modelo do Caminhão</label>
                            <input 
                                type="text" 
                                placeholder="Ex: Volvo FH 540"
                                value={formData.model}
                                onChange={e => setFormData({...formData, model: e.target.value})}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Placa</label>
                                <input 
                                    type="text" 
                                    placeholder="ABC-1234"
                                    value={formData.plate}
                                    onChange={e => setFormData({...formData, plate: e.target.value})}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Km Atual (Obrigatório)</label>
                                <input 
                                    type="number" 
                                    placeholder="0"
                                    value={formData.totalKm}
                                    onChange={e => setFormData({...formData, totalKm: e.target.value})}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 flex justify-between">
                        <button onClick={() => setStep(1)} className="text-slate-400 hover:text-white">Voltar</button>
                        <button 
                            onClick={() => isVehicleDataValid ? setStep(3) : null}
                            disabled={!isVehicleDataValid}
                            className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all ${
                                isVehicleDataValid 
                                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40' 
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                            }`}
                        >
                            Próximo <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 3: EIXOS */}
            {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right duration-500">
                    <h2 className="text-3xl font-bold text-white mb-2 font-tech">Configuração de Eixos</h2>
                    <p className="text-slate-400 mb-8">Quantos eixos e pneus seu caminhão possui?</p>

                    <div className="flex items-center justify-center mb-8 bg-slate-900/50 rounded-2xl py-8 border border-slate-800/50">
                        {/* Simple SVG Preview of configuration */}
                        <div className="flex flex-col items-center gap-1">
                             {/* Cabin */}
                             <div className="w-16 h-12 bg-slate-700 rounded-t-lg mb-1 border border-slate-600"></div>
                             {axles.map((axle, idx) => (
                                 <div key={idx} className="flex items-center gap-4 relative group cursor-pointer" onClick={() => toggleAxleType(idx)}>
                                     {/* Left Tires */}
                                     <div className="flex gap-1">
                                         <div className="w-4 h-10 bg-blue-600/80 rounded-sm"></div>
                                         {axle.tires.length > 2 && <div className="w-4 h-10 bg-blue-600/80 rounded-sm"></div>}
                                     </div>
                                     {/* Axle */}
                                     <div className="w-20 h-2 bg-slate-600 rounded"></div>
                                     {/* Right Tires */}
                                     <div className="flex gap-1">
                                         {axle.tires.length > 2 && <div className="w-4 h-10 bg-blue-600/80 rounded-sm"></div>}
                                         <div className="w-4 h-10 bg-blue-600/80 rounded-sm"></div>
                                     </div>

                                     {/* Hover Hint */}
                                     <div className="absolute -right-24 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
                                         {axle.tires.length === 2 ? 'Simples' : 'Duplo'}
                                     </div>
                                 </div>
                             ))}
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 mb-10">
                         <button 
                            onClick={handleRemoveAxle}
                            disabled={axles.length <= 2}
                            className="p-4 rounded-xl bg-slate-800 hover:bg-red-900/20 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors disabled:opacity-30"
                         >
                             <Minus size={24} />
                         </button>
                         <div className="flex flex-col items-center justify-center px-4">
                             <span className="text-2xl font-bold text-white font-tech">{axles.length}</span>
                             <span className="text-xs text-slate-500 uppercase">Eixos</span>
                         </div>
                         <button 
                            onClick={handleAddAxle}
                            className="p-4 rounded-xl bg-slate-800 hover:bg-green-900/20 text-slate-400 hover:text-green-400 border border-slate-700 transition-colors"
                         >
                             <Plus size={24} />
                         </button>
                    </div>

                    <div className="flex justify-between items-center">
                         <button onClick={() => setStep(2)} className="text-slate-400 hover:text-white">Voltar</button>
                         <button 
                            onClick={() => setStep(4)}
                            className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40 transition-all"
                        >
                            Próximo <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 4: ESTEPE */}
            {step === 4 && (
                <div className="animate-in fade-in slide-in-from-right duration-500 flex flex-col h-full max-h-[600px]">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2 font-tech">Estepes (Sobressalentes)</h2>
                        <p className="text-slate-400 mb-6">Configure cada pneu de estepe individualmente.</p>
                    </div>

                    {/* Counter */}
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 mb-6 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                                 <Disc size={20} className="text-slate-400" />
                             </div>
                             <span className="text-white font-bold">Quantidade</span>
                         </div>
                         <div className="flex items-center gap-3 bg-slate-800 rounded-lg p-1 border border-slate-700">
                            <button 
                                onClick={removeSpare}
                                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                            >
                                <Minus size={18} />
                            </button>
                            <span className="w-8 text-center font-bold text-xl">{sparesList.length}</span>
                            <button 
                                onClick={addSpare}
                                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable list of spares */}
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-6 custom-scrollbar">
                        {sparesList.length === 0 && (
                            <div className="text-center py-8 text-slate-600 border-2 border-dashed border-slate-800 rounded-xl">
                                Nenhum estepe adicionado.
                            </div>
                        )}
                        
                        {sparesList.map((spare, index) => (
                            <div key={spare.id} className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 animate-in slide-in-from-bottom duration-300">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider">Estepe #{index + 1}</h4>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Marca / Modelo</label>
                                        <input 
                                            type="text" 
                                            value={spare.brand}
                                            onChange={(e) => updateSpare(index, 'brand', e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Estado</label>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => updateSpare(index, 'status', TireStatus.NEW)}
                                                className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold border transition-all ${
                                                    spare.status === TireStatus.NEW 
                                                    ? 'bg-green-500/20 border-green-500 text-green-400' 
                                                    : 'bg-slate-900 border-slate-700 text-slate-500 hover:bg-slate-800'
                                                }`}
                                            >
                                                Novo
                                            </button>
                                            <button 
                                                onClick={() => updateSpare(index, 'status', TireStatus.GOOD)}
                                                className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold border transition-all ${
                                                    spare.status === TireStatus.GOOD 
                                                    ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' 
                                                    : 'bg-slate-900 border-slate-700 text-slate-500 hover:bg-slate-800'
                                                }`}
                                            >
                                                M. Vida
                                            </button>
                                            <button 
                                                onClick={() => updateSpare(index, 'status', TireStatus.WARNING)}
                                                className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold border transition-all ${
                                                    spare.status === TireStatus.WARNING 
                                                    ? 'bg-red-500/20 border-red-500 text-red-400' 
                                                    : 'bg-slate-900 border-slate-700 text-slate-500 hover:bg-slate-800'
                                                }`}
                                            >
                                                Refor.
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center mt-auto">
                         <button onClick={() => setStep(3)} className="text-slate-400 hover:text-white">Voltar</button>
                         <button 
                            onClick={handleSubmit}
                            className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40 transition-all"
                        >
                            Finalizar Cadastro <Check size={20} />
                        </button>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default Onboarding;