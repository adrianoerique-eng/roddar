import React, { useState } from 'react';
import { MapPin, Navigation, Calendar, Clock, CheckCircle, Truck as TruckIcon, ArrowRight, AlertTriangle, Edit2, History, X } from 'lucide-react';
import { Truck, Trip, calculateTireStatus } from '../types';

interface TripManagerProps {
  truck: Truck;
  onUpdateTruck: (truck: Truck) => void;
}

const TripManager: React.FC<TripManagerProps> = ({ truck, onUpdateTruck }) => {
  // Form State for New Trip
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [distance, setDistance] = useState<number | ''>('');
  
  // Date States
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 16));
  const [arrivalDate, setArrivalDate] = useState('');
  
  // Edit Mode State for Active Trip
  const [isEditing, setIsEditing] = useState(false);
  const [editDistance, setEditDistance] = useState<number>(0);
  const [editOrigin, setEditOrigin] = useState('');
  const [editDestination, setEditDestination] = useState('');

  const activeTrip = truck.activeTrip;

  const handleStartTrip = () => {
      if (!origin || !destination || !distance || !startDate || !arrivalDate) return;

      const newTrip: Trip = {
          id: Math.random().toString(36).substr(2, 9),
          origin,
          destination,
          distanceKm: Number(distance),
          startDate: startDate,
          plannedArrivalDate: arrivalDate,
          status: 'ACTIVE'
      };

      onUpdateTruck({
          ...truck,
          activeTrip: newTrip
      });
      
      // Clear form
      setOrigin('');
      setDestination('');
      setDistance('');
      setArrivalDate('');
  };

  const handleFinishTrip = () => {
      if (!activeTrip) return;

      const tripKm = activeTrip.distanceKm;
      
      // Deep clone truck to update
      const updatedTruck = JSON.parse(JSON.stringify(truck)) as Truck;

      // 1. Update Truck Odometer
      updatedTruck.totalKm += tripKm;

      // 2. Update Tires (Only installed tires, not spares)
      updatedTruck.axles.forEach(axle => {
          axle.tires.forEach((tire) => {
              if (tire) {
                  tire.currentKm += tripKm;
                  // Recalculate status based on new KM
                  tire.status = calculateTireStatus(tire);
              }
          });
      });

      // 3. Archive Trip to History
      const completedTrip: Trip = {
          ...activeTrip,
          status: 'COMPLETED',
          completedDate: new Date().toISOString()
      };
      
      // Ensure tripHistory array exists
      if (!updatedTruck.tripHistory) {
          updatedTruck.tripHistory = [];
      }
      updatedTruck.tripHistory.unshift(completedTrip); // Add to top of list

      // 4. Clear Active Trip
      updatedTruck.activeTrip = null;

      // 5. Save
      onUpdateTruck(updatedTruck);
  };

  const startEditing = () => {
      if (activeTrip) {
          setEditDistance(activeTrip.distanceKm);
          setEditOrigin(activeTrip.origin);
          setEditDestination(activeTrip.destination);
          setIsEditing(true);
      }
  };

  const saveEdit = () => {
      if (activeTrip) {
          const updatedTrip = {
              ...activeTrip,
              origin: editOrigin,
              destination: editDestination,
              distanceKm: editDistance
          };
          onUpdateTruck({
              ...truck,
              activeTrip: updatedTrip
          });
          setIsEditing(false);
      }
  };

  const formatDateTime = (isoString: string) => {
      if (!isoString) return '--/-- --:--';
      return new Date(isoString).toLocaleString('pt-BR', { 
          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
      });
  };

  return (
    <div className="h-full overflow-y-auto pr-2 pb-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Gestão de Viagens</h2>
        <p className="text-slate-400">Controle suas rotas e atualize automaticamente o KM dos pneus e do caminhão.</p>
      </div>

      {!activeTrip ? (
          /* --- PLANNING MODE --- */
          <div className="max-w-3xl mx-auto">
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-xl mb-8">
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
                      <div className="bg-blue-600/20 p-2 rounded-lg text-blue-400">
                          <Navigation size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-white">Registrar Nova Viagem</h3>
                  </div>

                  <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                          {/* Visual connector line */}
                          <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-600 z-10 bg-slate-800 rounded-full p-1">
                              <ArrowRight size={20} />
                          </div>

                          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-blue-500"></div> Origem
                              </label>
                              <input 
                                  type="text" 
                                  placeholder="Ex: Fortaleza-CE"
                                  className="w-full bg-transparent text-white font-medium focus:outline-none placeholder:text-slate-600"
                                  value={origin}
                                  onChange={e => setOrigin(e.target.value)}
                              />
                          </div>

                          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                  <MapPin size={12} className="text-red-500" /> Destino
                              </label>
                              <input 
                                  type="text" 
                                  placeholder="Ex: São Paulo-SP"
                                  className="w-full bg-transparent text-white font-medium focus:outline-none placeholder:text-slate-600"
                                  value={destination}
                                  onChange={e => setDestination(e.target.value)}
                              />
                          </div>
                      </div>

                      {/* Dates Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                  <Calendar size={12} /> Saída
                              </label>
                              <input 
                                  type="datetime-local" 
                                  className="w-full bg-transparent text-white font-medium focus:outline-none placeholder:text-slate-600"
                                  value={startDate}
                                  onChange={e => setStartDate(e.target.value)}
                              />
                          </div>
                          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                  <Clock size={12} /> Chegada Prevista
                              </label>
                              <input 
                                  type="datetime-local" 
                                  className="w-full bg-transparent text-white font-medium focus:outline-none placeholder:text-slate-600"
                                  value={arrivalDate}
                                  onChange={e => setArrivalDate(e.target.value)}
                              />
                          </div>
                      </div>

                      {/* Manual Distance Section */}
                      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                           <div className="flex justify-between items-center mb-4">
                               <p className="text-sm text-slate-400">Distância Total (KM)</p>
                           </div>
                           
                           <div className="relative">
                                <input 
                                    type="number" 
                                    value={distance}
                                    onChange={e => setDistance(Number(e.target.value))}
                                    placeholder="0"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-right pr-12 font-mono text-lg focus:border-blue-500 focus:outline-none"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">KM</span>
                           </div>
                           
                           <p className="text-xs text-slate-500 mt-2">
                               *Informe a distância exata. Você poderá editar se necessário antes de concluir a viagem.
                           </p>
                      </div>

                      <button 
                          onClick={handleStartTrip}
                          disabled={!distance || !origin || !destination || !arrivalDate}
                          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                      >
                          <TruckIcon size={20} /> Iniciar Viagem
                      </button>
                  </div>
              </div>
          </div>
      ) : (
          /* --- ACTIVE TRIP MODE --- */
          <div className="max-w-3xl mx-auto space-y-6 mb-8">
              
              {/* Active Status Card */}
              <div className="bg-gradient-to-br from-blue-900/40 to-slate-900 border border-blue-500/30 p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
                  
                  {isEditing ? (
                      /* Editing Mode */
                      <div className="space-y-4 animate-in fade-in">
                          <div className="flex justify-between items-center mb-4">
                              <h3 className="text-white font-bold">Corrigir Dados da Viagem</h3>
                              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <input type="text" value={editOrigin} onChange={e => setEditOrigin(e.target.value)} className="bg-slate-800 border border-slate-700 rounded p-2 text-white" placeholder="Origem" />
                              <input type="text" value={editDestination} onChange={e => setEditDestination(e.target.value)} className="bg-slate-800 border border-slate-700 rounded p-2 text-white" placeholder="Destino" />
                          </div>
                          <div>
                              <label className="text-xs text-slate-400">Distância (KM)</label>
                              <input type="number" value={editDistance} onChange={e => setEditDistance(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white" />
                          </div>
                          <button onClick={saveEdit} className="w-full bg-green-600 text-white font-bold py-2 rounded">Salvar Correção</button>
                      </div>
                  ) : (
                      /* Display Mode */
                      <>
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-3">
                                <span className="flex h-3 w-3 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                <span className="text-green-400 font-bold uppercase tracking-widest text-xs">Viagem em Andamento</span>
                            </div>
                            <button onClick={startEditing} className="text-slate-400 hover:text-white flex items-center gap-1 text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700">
                                <Edit2 size={12} /> Editar
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                            <div className="text-center md:text-left">
                                <p className="text-slate-400 text-sm mb-1">Origem</p>
                                <p className="text-2xl font-bold text-white">{activeTrip.origin}</p>
                                <p className="text-xs text-slate-500 mt-1">{formatDateTime(activeTrip.startDate)}</p>
                            </div>
                            
                            <div className="flex-1 w-full md:w-auto flex items-center gap-2 px-4">
                                <div className="h-[2px] flex-1 bg-slate-700 relative">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-2 text-slate-400 text-xs font-mono">
                                        {activeTrip.distanceKm} km
                                    </div>
                                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500"></div>
                                    <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                </div>
                            </div>

                            <div className="text-center md:text-right">
                                <p className="text-slate-400 text-sm mb-1">Destino</p>
                                <p className="text-2xl font-bold text-white">{activeTrip.destination}</p>
                                <p className="text-xs text-slate-500 mt-1 uppercase font-bold">Chegada Prevista: <span className="text-white">{formatDateTime(activeTrip.plannedArrivalDate)}</span></p>
                            </div>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                            <Clock className="text-blue-400 shrink-0 mt-0.5" size={18} />
                            <div>
                                <p className="text-blue-200 font-bold text-sm">Lembrete de Chegada Ativo</p>
                                <p className="text-blue-300/70 text-xs mt-1">
                                    O sistema irá atualizar automaticamente a quilometragem de todos os pneus instalados assim que você confirmar a chegada.
                                </p>
                            </div>
                        </div>
                      </>
                  )}
              </div>

              {/* Action */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-xl text-center">
                  <h3 className="text-white font-bold mb-2">Já chegou ao destino?</h3>
                  <p className="text-slate-400 text-sm mb-6">
                      Ao confirmar, adicionaremos <span className="text-white font-bold">{activeTrip.distanceKm} km</span> ao odômetro do caminhão e a cada pneu rodante.
                  </p>
                  
                  <button 
                      onClick={handleFinishTrip}
                      className="w-full md:w-auto px-8 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 mx-auto"
                  >
                      <CheckCircle size={20} /> Confirmar Chegada e Atualizar Tudo
                  </button>
              </div>
          </div>
      )}

      {/* --- HISTORY SECTION --- */}
      <div className="max-w-3xl mx-auto mt-12 border-t border-slate-800 pt-8">
          <div className="flex items-center gap-2 mb-6">
              <History size={20} className="text-slate-500" />
              <h3 className="text-lg font-bold text-white">Histórico de Viagens</h3>
          </div>

          <div className="space-y-4">
              {truck.tripHistory && truck.tripHistory.length > 0 ? (
                  truck.tripHistory.map((trip, idx) => (
                      <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                              <div className="flex items-center gap-2 text-white font-bold mb-1">
                                  <span>{trip.origin}</span>
                                  <ArrowRight size={14} className="text-slate-500" />
                                  <span>{trip.destination}</span>
                              </div>
                              <p className="text-xs text-slate-500">
                                  {new Date(trip.startDate).toLocaleDateString()}
                              </p>
                          </div>
                          <div className="flex items-center gap-4">
                               <div className="text-right">
                                  <p className="text-xs text-slate-400 uppercase">Distância</p>
                                  <p className="text-white font-mono font-bold">{trip.distanceKm} km</p>
                               </div>
                               <div className="text-right">
                                  <p className="text-xs text-slate-400 uppercase">Status</p>
                                  <p className="text-green-400 text-xs font-bold border border-green-500/30 bg-green-500/10 px-2 py-1 rounded">CONCLUÍDA</p>
                               </div>
                          </div>
                      </div>
                  ))
              ) : (
                  <div className="text-center py-8 text-slate-600 border border-dashed border-slate-800 rounded-xl">
                      Nenhuma viagem registrada no histórico.
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default TripManager;