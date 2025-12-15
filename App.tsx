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

  // Handle registration completion
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
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
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
      <div className={`absolute inset-0 bg-blue-500/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ${currentView === view ? 'hidden' : ''}`}></div>
      <Icon size={20} className={currentView === view ? 'text-blue-400' : ''} />
      <span className="font-medium font-tech tracking-wide text-left">{label}</span>
      {currentView === view && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-l-full shadow-[0_0_10px_#3b82f6]"></div>}
      {/* Active Trip Indicator Dot */}
      {view === 'TRIP' && truckData?.activeTrip && (
          <span className="absolute top-3 right-3 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></span>
      )}
    </button>
  );

  const DevelopmentLabel = ({ text }: { text: string }) => (
    <div className="flex flex-col leading-none">
        <span>{text}</span>
        <span className="text-[10px] text-slate-500 font-sans font-normal normal-case mt-0.5">
            (em <span className="text-red-500 font-bold">desenvolvimento</span>)
        </span>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0B0F19] overflow-hidden">
      
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-72 bg-[#0B0F19]/80 backdrop-blur-xl border-r border-white/5 p-6 z-10 relative">
        <div className="flex items-center gap-3 mb-12 px-2">
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-lg opacity-40"></div>
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 w-10 h-10 rounded-lg flex items-center justify-center relative z-10 border border-white/10">
                    <Truck className="text-white" size={20} />
                </div>
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight font-tech">RODDAR</h1>
                <p className="text-[10px] text-blue-400 font-medium leading-tight mt-0.5">O pneu certo, no lugar certo, na hora certa.</p>
            </div>
        </div>

        <nav className="flex-1 space-y-2">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest px-4 mb-2 font-tech">Menu Principal</p>
            <NavButton view="GARAGE" icon={LayoutGrid} label="Garagem" />
            <NavButton view="TRIP" icon={MapPin} label="Viagem" />
            <NavButton view="FINANCIAL" icon={DollarSign} label={<DevelopmentLabel text="Financeiro" />} />
            <NavButton view="AI_ADVISOR" icon={MessageSquare} label={<DevelopmentLabel text="Consultar" />} />
        </nav>

        <div className="mt-auto">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/5 backdrop-blur-md">
                {truckData && (
                <div className="flex items-center gap-3">
                    {/* Avatar / Photo */}
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white border border-white/10 shrink-0 overflow-hidden">
                        {truckData.owner.photo ? (
                            <img src={truckData.owner.photo} alt={truckData.owner.driverName} className="w-full h-full object-cover" />
                        ) : (
                            getInitials(truckData.owner.driverName)
                        )}
                    </div>
                    
                    {/* Info Text */}
                    <div className="flex-1 min-w-0">
                        {/* 1. Driver Name */}
                        <p className="text-sm font-bold text-white truncate font-tech" title={truckData.owner.driverName}>
                            {truckData.owner.driverName}
                        </p>
                        
                        {/* 2. Company (if distinct) & City */}
                        <p className="text-xs text-slate-500 truncate" title={`${truckData.owner.name} • ${truckData.owner.city}`}>
                             {truckData.owner.name && truckData.owner.name !== truckData.owner.driverName ? (
                                 <span className="text-blue-400">{truckData.owner.name}</span>
                             ) : null}
                             {truckData.owner.name && truckData.owner.name !== truckData.owner.driverName ? ' • ' : ''}
                             {truckData.owner.city}
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => setIsSettingsOpen(true)}
                        className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded-lg"
                    >
                        <Settings size={18} />
                    </button>
                </div>
                )}
            </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0B0F19]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
             <div className="bg-blue-600 w-8 h-8 rounded flex items-center justify-center">
                <Truck className="text-white" size={18} />
            </div>
            <h1 className="text-xl font-bold text-white font-tech">RODDAR</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300 p-2">
            <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#0B0F19]/95 backdrop-blur-xl pt-24 px-6 md:hidden flex flex-col">
             <nav className="space-y-4">
                <NavButton view="GARAGE" icon={LayoutGrid} label="Garagem" />
                <NavButton view="TRIP" icon={MapPin} label="Viagem" />
                <NavButton view="FINANCIAL" icon={DollarSign} label={<DevelopmentLabel text="Financeiro" />} />
                <NavButton view="AI_ADVISOR" icon={MessageSquare} label={<DevelopmentLabel text="Consultar" />} />
            </nav>

            <div className="mt-auto mb-8 border-t border-white/10 pt-6">
                {truckData && (
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white border border-white/10 shrink-0 overflow-hidden">
                            {truckData.owner.photo ? (
                                <img src={truckData.owner.photo} alt={truckData.owner.driverName} className="w-full h-full object-cover" />
                            ) : (
                                getInitials(truckData.owner.driverName)
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-base font-bold text-white truncate font-tech">{truckData.owner.driverName}</p>
                            <p className="text-sm text-slate-500 truncate">
                                {truckData.owner.name && truckData.owner.name !== truckData.owner.driverName ? `${truckData.owner.name} • ` : ''} 
                                {truckData.owner.city}
                            </p>
                        </div>
                        <button 
                            onClick={() => { setIsMobileMenuOpen(false); setIsSettingsOpen(true); }}
                            className="text-slate-400 hover:text-white transition-colors p-2"
                        >
                            <Settings size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 h-full relative overflow-hidden flex flex-col pt-16 md:pt-0 z-10">
         <div className="flex-1 p-4 md:p-8 overflow-hidden h-full">
            {currentView === 'GARAGE' && truckData && <DigitalGarage truck={truckData} onUpdateTruck={handleTruckUpdate} />}
            {currentView === 'TRIP' && truckData && <TripManager truck={truckData} onUpdateTruck={handleTruckUpdate} />}
            {currentView === 'FINANCIAL' && <Financials />}
            {currentView === 'AI_ADVISOR' && <AIAssistant />}
         </div>
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && truckData && (
        <SettingsModal 
            owner={truckData.owner}
            onClose={() => setIsSettingsOpen(false)}
            onSave={handleOwnerUpdate}
        />
      )}
    </div>
  );
};

export default App;