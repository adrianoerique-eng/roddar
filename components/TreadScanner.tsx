import React, { useState, useRef } from 'react';
import { Camera, Upload, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { analyzeTireImage, TreadAnalysisResult } from '../services/geminiService';

const TreadScanner: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<TreadAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        setResult(null);
        // Automatically start analysis
        performAnalysis(base64.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const performAnalysis = async (base64Data: string) => {
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeTireImage(base64Data);
      setResult(analysis);
    } catch (error) {
      alert("Erro ao analisar imagem.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-start p-4 overflow-y-auto">
      <div className="text-center mb-8 max-w-lg">
        <h2 className="text-2xl font-bold text-white mb-2">Leitor de Sulco por IA</h2>
        <p className="text-slate-400">
            Tire uma foto do pneu (de preferência com uma moeda no sulco) para a IA medir a profundidade automaticamente.
        </p>
      </div>

      <div className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
        
        {/* Image Area */}
        <div className="relative aspect-square bg-slate-900 flex items-center justify-center border-b border-slate-700">
            {image ? (
                <img src={image} alt="Tire Scan" className="w-full h-full object-cover" />
            ) : (
                <div className="text-center p-8">
                    <Camera size={64} className="text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500">Nenhuma imagem selecionada</p>
                </div>
            )}

            {isAnalyzing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <RefreshCw size={48} className="text-blue-500 animate-spin mb-4" />
                    <p className="text-white font-medium animate-pulse">Analisando profundidade...</p>
                </div>
            )}
        </div>

        {/* Controls */}
        {!result && (
            <div className="p-6">
                <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all"
                >
                    <Camera size={24} />
                    {image ? 'Tirar Outra Foto' : 'Tirar Foto / Upload'}
                </button>
            </div>
        )}

        {/* Results */}
        {result && (
            <div className="p-6 bg-slate-800">
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 text-center">
                        <p className="text-slate-400 text-xs uppercase font-bold">Profundidade</p>
                        <p className="text-3xl font-bold text-white">{result.estimatedDepthMm}mm</p>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 text-center">
                        <p className="text-slate-400 text-xs uppercase font-bold">Desgaste</p>
                        <p className={`text-3xl font-bold ${result.wearPercentage > 70 ? 'text-red-500' : 'text-yellow-500'}`}>
                            {result.wearPercentage}%
                        </p>
                    </div>
                </div>
                
                <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 ${result.condition === 'Crítico' ? 'bg-red-500/10 border border-red-500/30' : 'bg-green-500/10 border border-green-500/30'}`}>
                    {result.condition === 'Crítico' ? <AlertTriangle className="text-red-500 shrink-0" /> : <CheckCircle className="text-green-500 shrink-0" />}
                    <div>
                        <h4 className={`font-bold ${result.condition === 'Crítico' ? 'text-red-400' : 'text-green-400'}`}>{result.condition}</h4>
                        <p className="text-sm text-slate-300 mt-1">{result.recommendation}</p>
                    </div>
                </div>

                <button 
                    onClick={() => { setImage(null); setResult(null); }}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                    Nova Leitura
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default TreadScanner;