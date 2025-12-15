import React, { useState } from 'react';
import { X, Save, Truck, Gauge, FileText } from 'lucide-react';
import { Truck as TruckType } from '../types';

interface TruckSettingsModalProps {
  truck: TruckType;
  onClose: () => void;
  onSave: (updatedTruck: TruckType) => void;
}

const TruckSettingsModal: React.FC<TruckSettingsModalProps> = ({ truck, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    model: truck.model,
    plate: truck.plate,
    totalKm: truck.totalKm
  });

  const handleSave = () => {
    onSave({
      ...truck,
      model: formData.model,
      plate: formData.plate,
      totalKm: Number(formData.totalKm)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Truck className="text-blue-500" size={24} />
                Editar Veículo
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        <div className="p-6 space-y-6">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Truck size={14} /> Modelo
                </label>
                <input 
                    type="text" 
                    value={formData.model}
                    onChange={e => setFormData({...formData, model: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <FileText size={14} /> Placa
                    </label>
                    <input 
                        type="text" 
                        value={formData.plate}
                        onChange={e => setFormData({...formData, plate: e.target.value.toUpperCase()})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Gauge size={14} /> Km Total
                    </label>
                    <input 
                        type="number" 
                        value={formData.totalKm}
                        onChange={e => setFormData({...formData, totalKm: Number(e.target.value)})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                    />
                </div>
            </div>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900">
            <button 
                onClick={handleSave}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
            >
                <Save size={20} /> Salvar Alterações
            </button>
        </div>

      </div>
    </div>
  );
};

export default TruckSettingsModal;