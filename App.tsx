import React, { useState, useRef, useEffect } from 'react';
import { Send, Scale, Sparkles, AlertCircle } from 'lucide-react';
import { Country, Message, Attachment } from './types';
import { sendMessageToGemini } from './services/geminiService';
import CountrySelector from './components/CountrySelector';
import MessageBubble from './components/MessageBubble';
import FileUploader from './components/FileUploader';

const App: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(Country.USA);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: "Listen to me closely. Paying full taxes is optional if you know where to look. I'm your strategist. I don't just file forms; I find money. What jurisdiction are we dealing with today? And what expenses are we trying to justify?",
      groundingSources: []
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clear chat when country changes
  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
    setMessages([{
      id: Date.now().toString(),
      role: 'model',
      content: `Alright, we're in ${country} mode. The laws here have holes in them big enough to drive a truck through. What's the situation? Upload your docs if you have them.`,
      groundingSources: []
    }]);
  };

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && attachments.length === 0) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      attachments: [...attachments],
      groundingSources: []
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setAttachments([]); // Clear attachments after sending
    setIsLoading(true);

    const result = await sendMessageToGemini(
      userMessage.content,
      messages, // Pass history
      userMessage.attachments || [],
      selectedCountry
    );

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      content: result.text,
      groundingSources: result.groundingSources
    };

    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans selection:bg-fuchsia-200">
      
      {/* Header */}
      <header className="sticky top-0 z-10 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-2 rounded-lg shadow-lg neon-blue-shadow">
              <Scale className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Tax<span className="text-cyan-600">Saul</span> AI
              </h1>
              <p className="text-xs text-fuchsia-600 font-medium neon-magenta-text">
                "Aggressive Strategies. Legally Defensible."
              </p>
            </div>
          </div>
          
          <CountrySelector 
            selected={selectedCountry} 
            onSelect={handleCountryChange} 
            disabled={isLoading}
          />
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 w-full max-w-5xl mx-auto custom-scrollbar">
        <div className="space-y-6 pb-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          
          {isLoading && (
            <div className="flex justify-start w-full">
               <div className="bg-white border-l-4 border-l-fuchsia-500 px-6 py-4 rounded-r-2xl rounded-bl-2xl shadow-sm flex items-center space-x-3">
                 <div className="flex space-x-1">
                   <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-75"></div>
                   <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-150"></div>
                   <div className="w-2 h-2 bg-cyan-600 rounded-full animate-bounce delay-300"></div>
                 </div>
                 <span className="text-sm text-slate-500 italic">Reviewing current tax codes for loopholes...</span>
               </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="w-full bg-white border-t border-slate-200 px-4 py-4 relative">
        <div className="max-w-5xl mx-auto relative">
          
          {/* Disclaimer */}
          <div className="absolute -top-10 left-0 right-0 flex justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
             <div className="bg-yellow-50 text-yellow-700 text-[10px] px-2 py-1 rounded border border-yellow-200 flex items-center shadow-sm">
                <AlertCircle className="w-3 h-3 mr-1" />
                <span>AI makes mistakes. Verify all claims with a licensed CPA.</span>
             </div>
          </div>

          <div className="flex items-end gap-2 bg-slate-50 border border-slate-300 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-100 rounded-2xl p-2 transition-all shadow-sm">
            
            <FileUploader attachments={attachments} setAttachments={setAttachments} />
            
            <textarea
              className="flex-1 max-h-40 min-h-[44px] bg-transparent resize-none outline-none py-3 px-2 text-slate-800 placeholder-slate-400 text-sm md:text-base"
              placeholder={`Ask about ${selectedCountry} tax loopholes...`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            
            <button
              onClick={handleSendMessage}
              disabled={isLoading || (!inputValue.trim() && attachments.length === 0)}
              className="p-3 bg-gradient-to-r from-fuchsia-600 to-fuchsia-500 text-white rounded-xl shadow-lg hover:shadow-fuchsia-300/50 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <Sparkles className="w-5 h-5 animate-pulse" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="text-center mt-2 text-[10px] text-slate-400">
            Powered by Claude Opus 4.6
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;