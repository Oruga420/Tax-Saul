import React from 'react';
import { Country } from '../types';
import { Globe } from 'lucide-react';

interface CountrySelectorProps {
  selected: Country;
  onSelect: (country: Country) => void;
  disabled: boolean;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({ selected, onSelect, disabled }) => {
  return (
    <div className="relative inline-block text-left z-20">
      <div className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm border border-cyan-200 rounded-full px-4 py-2 shadow-sm neon-blue-shadow transition-all hover:bg-white">
        <Globe className="w-4 h-4 text-cyan-500" />
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2">Jurisdiction:</span>
        <select
          value={selected}
          onChange={(e) => onSelect(e.target.value as Country)}
          disabled={disabled}
          className="appearance-none bg-transparent font-bold text-slate-800 outline-none cursor-pointer disabled:cursor-not-allowed"
        >
          {Object.values(Country).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="pointer-events-none text-slate-400">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CountrySelector;