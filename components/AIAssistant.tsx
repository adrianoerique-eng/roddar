import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { getSmartAdvisorResponse } from '../services/geminiService';

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Olá, estradeiro! Sou o RODDAR AI. Posso ajudar com calibragem, rodízio ou análise de custos. Qual a dúvida de hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const aiResponse = await getSmartAdvisorResponse(userMsg, "Caminhão Volvo FH 540, Carregado com Grãos, Pneus Michelin e Bridgestone.");
    
    setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
      <div className="p-4 bg-slate-900 border-b border-slate-700 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg">
            <Bot size={20} className="text-white" />
        </div>
        <div>
            <h3 className="font-bold text-white">Consultor RODDAR</h3>
            <p className="text-xs text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
            </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-slate-700 text-slate-200 rounded-bl-none'
                }`}>
                    {msg.text}
                </div>
            </div>
        ))}
        {isLoading && (
             <div className="flex justify-start">
                <div className="bg-slate-700 p-3 rounded-2xl rounded-bl-none flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-slate-400" />
                    <span className="text-xs text-slate-400">Pensando...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-700">
        <div className="flex gap-2">
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ex: Qual a calibragem para carga pesada?"
                className="flex-1 bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button 
                onClick={handleSend}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg transition-colors disabled:opacity-50"
            >
                <Send size={20} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;