// furreco da sorte
import React, { useState } from 'react';
import { Flame, Search, Target, Sparkles, ShieldCheck, MoreHorizontal, BarChart3, HelpCircle, X, Calculator, Bell } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'stats' | 'history' | 'generator' | 'weekly' | 'odds' | 'responsible' | 'milhar';
  setActiveTab: (tab: 'stats' | 'history' | 'generator' | 'weekly' | 'odds' | 'responsible' | 'milhar') => void;
  unreadCount?: number;
  onOpenNotifications?: () => void;
  onOpenTour?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  unreadCount = 0,
  onOpenNotifications,
  onOpenTour,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSelectTab = (tab: 'stats' | 'history' | 'generator' | 'weekly' | 'odds' | 'responsible' | 'milhar') => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  const isMoreActive = activeTab === 'weekly' || activeTab === 'odds';

  return (
    <>
      {/* Mobile "More" Drawer / Modal */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end animate-fadeIn">
          <div
            className="fixed inset-0"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative bg-slate-900 border-t-2 border-slate-700 rounded-t-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">🍀</span>
                <span className="font-black text-white text-base">Mais Menus e Ferramentas</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => handleSelectTab('weekly')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center gap-3.5 transition-all cursor-pointer min-h-[52px] ${
                  activeTab === 'weekly'
                    ? 'bg-emerald-600/30 border-emerald-400 text-white font-black ring-1 ring-emerald-400'
                    : 'bg-slate-950/80 border-slate-800 text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0">
                  📈
                </div>
                <div>
                  <strong className="text-sm font-bold text-white block">Relatório Semanal</strong>
                  <span className="text-xs text-slate-300">Quartas e sábados consolidados da Federal</span>
                </div>
              </button>

              <button
                onClick={() => handleSelectTab('odds')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center gap-3.5 transition-all cursor-pointer min-h-[52px] ${
                  activeTab === 'odds'
                    ? 'bg-emerald-600/30 border-emerald-400 text-white font-black ring-1 ring-emerald-400'
                    : 'bg-slate-950/80 border-slate-800 text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0">
                  🧮
                </div>
                <div>
                  <strong className="text-sm font-bold text-white block">Calculadora de Probabilidades</strong>
                  <span className="text-xs text-slate-300">Chances matemáticas reais de 1º a 5º prêmio</span>
                </div>
              </button>

              {onOpenTour && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenTour();
                  }}
                  className="w-full p-3.5 rounded-2xl border border-amber-500/30 bg-amber-950/30 text-left flex items-center gap-3.5 text-amber-300 hover:bg-amber-900/40 transition-all cursor-pointer min-h-[52px]"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-lg shrink-0">
                    <HelpCircle className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-white block">Tour Guiado Furreco</strong>
                    <span className="text-xs text-amber-200/80">Aprenda a utilizar todos os recursos do app</span>
                  </div>
                </button>
              )}

              {onOpenNotifications && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenNotifications();
                  }}
                  className="w-full p-3.5 rounded-2xl border border-slate-800 bg-slate-950/80 text-left flex items-center justify-between text-slate-200 hover:bg-slate-800 transition-all cursor-pointer min-h-[52px]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-lg shrink-0">
                      <Bell className="w-5 h-5 text-slate-300" />
                    </div>
                    <div>
                      <strong className="text-sm font-bold text-white block">Notificações e Sons</strong>
                      <span className="text-xs text-slate-300">Gerenciar alertas dos sorteios Caixa</span>
                    </div>
                  </div>
                  {unreadCount > 0 && (
                    <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white font-black text-xs">
                      {unreadCount} novos
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar (Visible on mobile only, < 768px) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-xl px-1.5 py-1 flex items-center justify-around shadow-2xl safe-area-pb"
        aria-label="Navegação móvel principal"
      >
        {/* 1: Estatísticas */}
        <button
          onClick={() => handleSelectTab('stats')}
          className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer min-h-[50px] ${
            activeTab === 'stats'
              ? 'text-emerald-400 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'stats' ? 'bg-emerald-500/20 text-emerald-400' : ''}`}>
            <Flame className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold tracking-tight">Stats</span>
        </button>

        {/* 2: Concursos */}
        <button
          onClick={() => handleSelectTab('history')}
          className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer min-h-[50px] ${
            activeTab === 'history'
              ? 'text-emerald-400 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'history' ? 'bg-emerald-500/20 text-emerald-400' : ''}`}>
            <Search className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold tracking-tight">Sorteios</span>
        </button>

        {/* 3: Busca de Milhar */}
        <button
          onClick={() => handleSelectTab('milhar')}
          className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer min-h-[50px] ${
            activeTab === 'milhar'
              ? 'text-amber-400 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'milhar' ? 'bg-amber-400/20 text-amber-400' : ''}`}>
            <Target className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold tracking-tight">Milhar</span>
        </button>

        {/* 4: Palpites */}
        <button
          onClick={() => handleSelectTab('generator')}
          className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer min-h-[50px] ${
            activeTab === 'generator'
              ? 'text-amber-300 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'generator' ? 'bg-amber-400/20 text-amber-300' : ''}`}>
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold tracking-tight">Palpites</span>
        </button>

        {/* 5: Apostas Conscientes */}
        <button
          onClick={() => handleSelectTab('responsible')}
          className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer min-h-[50px] ${
            activeTab === 'responsible'
              ? 'text-emerald-300 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'responsible' ? 'bg-emerald-500/25 text-emerald-300' : ''}`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold tracking-tight">Consciente</span>
        </button>

        {/* 6: Mais */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer min-h-[50px] ${
            isMoreActive
              ? 'text-emerald-400 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${isMoreActive ? 'bg-emerald-500/20 text-emerald-400' : ''}`}>
            <MoreHorizontal className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold tracking-tight">Mais</span>
        </button>
      </nav>
    </>
  );
};
