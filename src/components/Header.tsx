import React, { useState, useEffect } from 'react';
import { Bell, Sparkles, Clock, CheckCircle2, Volume2, VolumeX, Flame, ShieldCheck, Contrast } from 'lucide-react';
import { getNextDrawDate } from '../utils/lotteryUtils';
import { PushNotification } from '../types/lottery';

interface HeaderProps {
  activeTab: 'stats' | 'history' | 'generator' | 'weekly' | 'odds' | 'responsible';
  setActiveTab: (tab: 'stats' | 'history' | 'generator' | 'weekly' | 'odds' | 'responsible') => void;
  notifications: PushNotification[];
  onOpenNotifications: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onEnablePush: () => void;
  pushEnabled: boolean;
  highContrast?: boolean;
  onToggleHighContrast?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  notifications,
  onOpenNotifications,
  soundEnabled,
  onToggleSound,
  onEnablePush,
  pushEnabled,
  highContrast,
  onToggleHighContrast,
}) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [nextDrawInfo, setNextDrawInfo] = useState(getNextDrawDate());

  // Countdown timer to next draw
  useEffect(() => {
    const updateCountdown = () => {
      const next = getNextDrawDate();
      setNextDrawInfo(next);
      const diff = next.date.getTime() - new Date().getTime();
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.lida).length;

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      {/* Top Banner: Next Draw Status Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950/90 border-b border-emerald-500/20 px-3 sm:px-4 py-1.5 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex items-center justify-between sm:justify-start gap-2 text-[11px] sm:text-xs">
            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold shrink-0">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse" />
              <span className="hidden xs:inline">Próximo Sorteio:</span>
              <span className="xs:hidden">Próximo:</span>
            </span>
            <span className="text-white font-medium truncate">
              Conc. {nextDrawInfo.concursoEstimado} ({nextDrawInfo.diaSemana})
            </span>
            <span className="hidden md:inline text-slate-500">·</span>
            <span className="hidden md:inline text-amber-400 font-medium">
              Prêmio Estimado: {nextDrawInfo.premioEstimado}
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
            <div className="flex items-center gap-1 font-mono text-[11px] sm:text-xs text-amber-300 bg-black/50 px-2 py-0.5 rounded border border-amber-500/20 tabular-nums shrink-0">
              <span>{String(timeLeft.hours).padStart(2, '0')}h</span>:
              <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>:
              <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
            </div>

            <button
              onClick={onEnablePush}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                pushEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 animate-pulse'
              }`}
              title={pushEnabled ? 'Notificações push ativadas' : 'Clique para ativar notificações push de novos resultados'}
            >
              {pushEnabled ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Bell className="w-3 h-3 text-amber-400" />}
              <span>{pushEnabled ? 'Push Ativo' : 'Ativar Alertas'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-3">
        {/* Brand Zone */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-amber-400 flex items-center justify-center shadow-lg shadow-emerald-900/30 border border-emerald-400/40 shrink-0">
            <span className="text-lg sm:text-xl" role="img" aria-label="Trevo">🍀</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white leading-tight">
                Furreco <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300">da Sorte</span>
              </h1>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Federal
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 hidden xs:block">
              Estatísticas, probabilidades e palpites da Loteria Federal
            </p>
          </div>
        </div>

        {/* Action Zone: Contrast, Sound & Notification Bell */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onToggleHighContrast && (
            <button
              onClick={onToggleHighContrast}
              className={`p-2 sm:p-2.5 rounded-xl transition-colors cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center border ${
                highContrast
                  ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md ring-2 ring-amber-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-slate-700/60'
              }`}
              title={highContrast ? 'Alto Contraste Ativado (Clique para desativar)' : 'Ativar Modo Alto Contraste (Acessibilidade)'}
              aria-label="Alternar modo de alto contraste"
            >
              <Contrast className={`w-4 h-4 ${highContrast ? 'text-slate-950 stroke-[2.5]' : 'text-slate-400'}`} />
            </button>
          )}

          <button
            onClick={onToggleSound}
            className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
            title={soundEnabled ? 'Desativar sons' : 'Ativar sons'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={onOpenNotifications}
            className="relative p-2 sm:p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/60 cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
            title="Central de Notificações e Configurações"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-rose-500 text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center animate-bounce shadow-md">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6">
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1.5 scrollbar-none border-t border-slate-800/80 px-1.5">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Estatísticas</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span className="text-xs sm:text-sm">🔍</span>
            <span>Concursos</span>
          </button>

          <button
            onClick={() => setActiveTab('generator')}
            className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'generator'
                ? 'bg-gradient-to-r from-amber-500 to-emerald-600 text-white shadow-md shadow-amber-900/30'
                : 'text-amber-300 hover:text-amber-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
            <span>Palpites Furreco</span>
          </button>

          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'weekly'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span className="text-xs sm:text-sm">📈</span>
            <span>Relatório Semanal</span>
          </button>

          <button
            onClick={() => setActiveTab('odds')}
            className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'odds'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span className="text-xs sm:text-sm">🧮</span>
            <span>Probabilidades</span>
          </button>

          <button
            onClick={() => setActiveTab('responsible')}
            className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'responsible'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            <span>Jogo Consciente & Bancas</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
