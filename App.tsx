import React, { useState, useEffect } from 'react';
import { Truck, DollarSign, Camera, MessageSquare, Menu, LayoutGrid, Settings, LogOut, MapPin, Key, ExternalLink, ShieldAlert, Sparkles } from 'lucide-react';
import DigitalGarage from './components/DigitalGarage';
import Financials from './components/Financials';
import AIAssistant from './components/AIAssistant';
import Onboarding from './components/Onboarding';
import SettingsModal from './components/SettingsModal';
import TripManager from './components/TripManager';
import { ViewState, Truck as TruckType, Owner } from './types';

const App: React.FC = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [truckData, setTruckData] = useState<TruckType | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('GARAGE');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Resilient check for API Key
  const [hasApiKey, setHasApiKey] = useState<boolean>(() => {
    const envKey = process.env.API_KEY;
    return !!(envKey && envKey !== "undefined" && envKey.length > 5);
  });
  
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      // If we don't have it via process.env, check the specialized bridge
      if (!hasApiKey && window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const selected = await window.aistudio.hasSelectedApiKey();
        if (selected) setHasApiKey(true);
      }
    };
    checkKey();
  }, [hasApiKey]);

  const handleOpenKeySelector = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      // Optimization: trigger a check or assume success to let user in
      setHasApiKey(true);
    }
  };

  const handleRegistrationComplete = (data: TruckType) => {
    setTruckData(data);
    setIsRegistered(true);
  };

  const handleTruckUpdate = (updatedTruck: TruckType) => {
    setTruckData(updatedTruck);
  };

  const handleOwnerUpdate = (updatedOwner: Owner) => {
    if (truckData) {
      setTruckData({ ...truckData, owner: updatedOwner });
    }
    setIsSettingsOpen(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const DevelopmentLabel = ({ text }: { text: string }) => (
    <div className="flex flex-col leading-none">
        <span>{text}</span>
        <span className="text-[10px] text-slate-500 font-sans font-normal normal-case mt-0.5">
            (em <span className="text-red-500 font-bold">desenvolvimento</span>)
        </span>
    </div>
  );

  // 1. Key Selection Screen (If no key detected and not in demo mode)
  if (!hasApiKey && !isDemoMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] p-6">
        <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-blue-500/20 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
          
          <div className="bg-blue-600/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-400 border border-blue-500/30">
            <Key size={32} />
          </div>

          <h1 className="text-3xl font-bold text-white mb-2 font-tech uppercase tracking-wider">Acesso RODDAR IA</h1>
          <p className="text-slate-400 text-sm mb-8">
            Para utilizar a inteligência artificial, análise de sulco e assistente de frotas, é necessário conectar sua chave de API do Google Gemini.
          </p>

          <div className="space-y-4">
              <button 
                onClick={handleOpenKeySelector}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-900/40"
              >
                Configurar Acesso <ExternalLink size={18} />
              </button>

              <button 
                onClick={() => setIsDemoMode(true)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-700"
              >
                <Sparkles size={18} className="text-blue-400" /> Continuar em Modo de Demonstração
              </button>
          </div>

          <div className="mt-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-left">
             <div className="flex items-center gap-2 text-yellow-500 mb-2">
                <ShieldAlert size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Aviso de Faturamento</span>
             </div>
             <p className="text-[10px] text-slate-500 leading-relaxed">
               Certifique-se de selecionar uma chave de um projeto GCP com faturamento ativo. Consulte a <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-blue-400 hover:underline">documentação de faturamento</a> para mais informações.
             </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Onboarding Screen
  if (!isRegistered) {
    return <Onboarding onComplete={handleRegistrationComplete} />;
  }

  // 3. Main Dashboard
  const NavButton = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: React.ReactNode }) => (
    <button
      onClick={() => { setCurrentView(view); setIsMobileMenuOpen(false); }}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full group relative overflow-hidden
        ${currentView === view 
          ? 'text-white bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
          : 'text-slate-400 hover:text-white hover:bg-white/5'}
      `}
    >
      <Icon size={20} className={currentView === view ? 'text-blue-400' : ''} />
      <span className="font-medium font-tech tracking-wide text-left">{label}</span>
      {currentView === view && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-l-full shadow-[0_0_10px_#3b82f6]"></div>}
    </button>
  );

  return (
    <div className="flex h-screen bg-[#0B0F19] overflow-hidden">
      <aside className="hidden md:flex flex-col w-72 bg-[#0B0F19]/80 backdrop-blur-xl border-r border-white/5 p-6 z-10 relative">
        <div className="flex items-center gap-3 mb-12 px-2">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 w-10 h-10 rounded-lg flex items-center justify-center border border-white/10">
                <Truck className="text-white" size={20} />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight font-tech">RODDAR</h1>
                <p className="text-[10px] text-blue-400 font-medium leading-tight mt-0.5 uppercase tracking-tighter">Gestão Inteligente de Pneus</p>
            </div>
        </div>

        <nav className="flex-1 space-y-2">
            <NavButton view="GARAGE" icon={LayoutGrid} label="Garagem Digital" />
            <NavButton view="TRIP" icon={MapPin} label="Controle de Viagens" />
            <NavButton view="FINANCIAL" icon={DollarSign} label={<DevelopmentLabel text="Financeiro" />} />
            <NavButton view="AI_ADVISOR" icon={MessageSquare} label={<DevelopmentLabel text="Consultar" />} />
        </nav>

        <div className="mt-auto">
            {truckData && (
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white border border-white/10 shrink-0 overflow-hidden">
                        {truckData.owner.photo ? <img src={truckData.owner.photo} className="w-full h-full object-cover" /> : getInitials(truckData.owner.driverName)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate font-tech">{truckData.owner.driverName}</p>
                        <p className="text-[10px] text-slate-500 truncate">{truckData.plate}</p>
                    </div>
                    <button onClick={() => setIsSettingsOpen(true)} className="text-slate-400 hover:text-white transition-colors p-1"><Settings size={18} /></button>
                </div>
            )}
        </div>
      </aside>

      <main className="flex-1 h-full relative overflow-hidden flex flex-col pt-16 md:pt-0 z-10">
         <div className="flex-1 p-4 md:p-8 overflow-hidden h-full">
            {currentView === 'GARAGE' && truckData && <DigitalGarage truck={truckData} onUpdateTruck={handleTruckUpdate} />}
            {currentView === 'TRIP' && truckData && <TripManager truck={truckData} onUpdateTruck={handleTruckUpdate} />}
            {currentView === 'FINANCIAL' && truckData && <Financials truck={truckData} />}
            {currentView === 'AI_ADVISOR' && <AIAssistant />}
         </div>
      </main>

      {isSettingsOpen && truckData && <SettingsModal owner={truckData.owner} onClose={() => setIsSettingsOpen(false)} onSave={handleOwnerUpdate} />}
    </div>
  );
};

export default App;