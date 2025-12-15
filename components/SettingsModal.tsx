import React, { useState, useRef } from 'react';
import { X, Save, User, MapPin, Phone, Mail, Briefcase, Camera } from 'lucide-react';
import { Owner } from '../types';

interface SettingsModalProps {
  owner: Owner;
  onClose: () => void;
  onSave: (updatedOwner: Owner) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ owner, onClose, onSave }) => {
  const [formData, setFormData] = useState<Owner>({ ...owner });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onSave(formData);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setFormData({ ...formData, photo: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Briefcase className="text-blue-500" size={24} />
                Configurações do Perfil
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
            
            {/* Photo Edit */}
            <div className="flex flex-col items-center">
                 <div 
                    className="w-20 h-20 rounded-full bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center overflow-hidden relative group cursor-pointer hover:border-blue-500 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {formData.photo ? (
                        <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-slate-500 font-bold text-lg">{formData.driverName.charAt(0)}</div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={20} className="text-white" />
                    </div>
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="text-blue-400 text-xs mt-2 hover:underline">Alterar Foto</button>
                <input 
                    type="file" 
                    accept="image/*" 
                    hidden 
                    ref={fileInputRef} 
                    onChange={handlePhotoUpload} 
                />
            </div>

            {/* Form fields */}
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <User size={14} /> Condutor Principal
                </label>
                <input 
                    type="text" 
                    value={formData.driverName}
                    onChange={e => setFormData({...formData, driverName: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
            </div>

             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Briefcase size={14} /> Empresa / Proprietário (Opcional)
                </label>
                <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
            </div>

             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <MapPin size={14} /> Localização
                </label>
                <div className="grid grid-cols-1 gap-3">
                    <input 
                        type="text" 
                        placeholder="Cidade"
                        value={formData.city}
                        onChange={e => setFormData({...formData, city: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                    />
                     <div className="grid grid-cols-3 gap-3">
                        <input 
                            type="text" 
                            placeholder="Rua"
                            className="col-span-2 w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                            value={formData.street}
                            onChange={e => setFormData({...formData, street: e.target.value})}
                        />
                        <input 
                            type="text" 
                            placeholder="Nº"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                            value={formData.number}
                            onChange={e => setFormData({...formData, number: e.target.value})}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Phone size={14} /> Telefone
                    </label>
                    <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Mail size={14} /> E-mail
                    </label>
                    <input 
                        type="email" 
                        value={formData.email || ''}
                        onChange={e => setFormData({...formData, email: e.target.value})}
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

export default SettingsModal;