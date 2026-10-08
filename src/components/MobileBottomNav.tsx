import React from 'react';
import { Flame, Layers, Calculator, History, Compass } from 'lucide-react';

export type NavTab = 'dashboard' | 'modalidades' | 'desdobrador' | 'federal' | 'bichos';

interface MobileBottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  isMobileFrame?: boolean;
}

export function MobileBottomNav({ activeTab, onChangeTab, isMobileFrame }: MobileBottomNavProps) {
  const tabs = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dicas',
      icon: Flame,
    },
    {
      id: 'modalidades' as NavTab,
      label: 'Modalidades',
      icon: Layers,
    },
    {
      id: 'desdobrador' as NavTab,
      label: 'Desdobrador',
      icon: Calculator,
    },
    {
      id: 'federal' as NavTab,
      label: 'Federal',
      icon: History,
    },
    {
      id: 'bichos' as NavTab,
      label: 'Tabela',
      icon: Compass,
    },
  ];

  return (
    <nav
      className={`fixed bottom-0 z-40 h-16 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 px-2 select-none ${
        isMobileFrame ? 'max-w-[430px] w-full left-1/2 -translate-x-1/2' : 'left-0 right-0'
      }`}
      aria-label="Navegação Principal"
    >
      <div className="grid grid-cols-5 h-full items-center">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-all cursor-pointer ${
                isActive ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-transform ${
                  isActive ? 'bg-amber-400/10 scale-110' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
