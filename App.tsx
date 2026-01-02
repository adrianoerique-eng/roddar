import React, { useState } from 'react';
import { Truck, DollarSign, Camera, MessageSquare, Menu, LayoutGrid, Settings, LogOut, MapPin } from 'lucide-react';
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

  if (!isRegistered) {
    return <Onboarding onComplete={handleRegistrationComplete} />;
  }

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
            <NavButton view="FINANCIAL" icon={DollarSign} label="Patrimônio e CPK" />
            <NavButton view="AI_ADVISOR" icon={MessageSquare} label="Consultor IA" />
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