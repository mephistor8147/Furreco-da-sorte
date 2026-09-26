import React, { useState, useEffect } from 'react';
import { Bell, Sparkles, Clock, CheckCircle2, Volume2, VolumeX, Flame, ShieldCheck, Contrast, HelpCircle, RefreshCw, Radio } from 'lucide-react';
import { getNextDrawDate } from '../utils/lotteryUtils';
import { PushNotification, LotteryContest } from '../types/lottery';
import { NextContestLiveInfo } from '../services/lotteryLiveService';

interface HeaderProps {
  activeTab: 'stats' | 'history' | 'generator' | 'weekly' | 'odds' | 'responsible' | 'milhar';
  setActiveTab: (tab: 'stats' | 'history' | 'generator' | 'weekly' | 'odds' | 'responsible' | 'milhar') => void;
  notifications: PushNotification[];
  onOpenNotifications: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onEnablePush: () => void;
  pushEnabled: boolean;
  highContrast?: boolean;
  onToggleHighContrast?: () => void;
  onOpenTour?: () => void;
  // Real-time Caixa props
  latestContest?: LotteryContest;
  proximoConcurso?: NextContestLiveInfo | null;
  isLive?: boolean;
  isSyncing?: boolean;
  lastSyncTime?: Date | null;
  onSyncNow?: () => void;
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
  onOpenTour,
  latestContest,
  proximoConcurso,
  isLive = true,
  isSyncing = false,
  lastSyncTime,
  onSyncNow,
}) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [nextDrawInfo, setNextDrawInfo] = useState(() => getNextDrawDate(latestContest));

  // Update countdown timer to next draw in real time
  useEffect(() => {
    const updateCountdown = () => {
      const next = getNextDrawDate(latestContest);
      setNextDrawInfo(next);
      const diff = next.date.getTime() - new Date().getTime();
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [latestContest]);

  const unreadCount = notifications.filter(n => !n.lida).length;

  // Real-time next draw details
  const displayNextConcurso = proximoConcurso?.numero || nextDrawInfo.concursoEstimado;
  const displayNextDiaSemana = proximoConcurso?.diaSemana || nextDrawInfo.diaSemana;
  const displayNextPremio = proximoConcurso?.premioEstimado || nextDrawInfo.premioEstimado;

  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 shadow-xl">
      {/* Top Banner: Real-Time Caixa Status Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950/90 border-b border-emerald-500/20 px-3 sm:px-4 py-1.5 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-1.5 sm:gap-2">
          
          {/* Left section: Real-time Live Badge & Last Official Draw */}
          <div className="flex items-center flex-wrap gap-2 text-[11px] sm:text-xs">
            {/* Live indicator badge */}
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-bold text-[10px] tracking-wide shrink-0 border ${
              isLive
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isSyncing ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  isSyncing ? 'bg-amber-400' : 'bg-emerald-500'
                }`} />
              </span>
              <span>{isSyncing ? 'ATUALIZANDO' : 'CAIXA AO VIVO'}</span>
            </span>

            {/* Latest Result Pill */}
            {latestContest && (
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-slate-400 hidden sm:inline">Última Apuração:</span>
                <span className="text-white font-bold">Conc. {latestContest.concurso}</span>
                <span className="text-slate-500">({latestContest.data})</span>
                <span className="bg-black/60 px-1.5 py-0.5 rounded border border-emerald-500/30 text-amber-300 font-mono font-bold tracking-wider">
                  1º {latestContest.premios[0]?.bilhete}
                </span>
                <span className="hidden sm:inline text-slate-300 text-[11px]">
                  {latestContest.bichoPrincipal?.nome} {latestContest.bichoPrincipal?.emoji}
                </span>
              </div>
            )}

            <span className="hidden lg:inline text-slate-600">|</span>

            {/* Next Draw Info */}
            <div className="hidden lg:flex items-center gap-1.5 text-slate-300">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                <Clock className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Próximo Sorteio:</span>
              </span>
              <span className="text-white font-bold">
                Conc. {displayNextConcurso} ({displayNextDiaSemana})
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-amber-400 font-medium">
                {displayNextPremio}
              </span>
            </div>
          </div>

          {/* Right section: Countdown, Instant Sync Button & Alerts */}
          <div className="flex items-center justify-between md:justify-end gap-2 text-xs">
            {/* Real-time countdown timer */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 hidden xs:inline">Faltam:</span>
              <div className="flex items-center gap-1 font-mono text-[11px] sm:text-xs text-amber-300 bg-black/60 px-2 py-0.5 rounded border border-amber-500/30 tabular-nums shrink-0 shadow-inner">
                <span>{String(timeLeft.hours).padStart(2, '0')}h</span>:
                <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>:
                <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
              </div>
            </div>

            {/* Fast Sync button */}
            {onSyncNow && (
              <button
                onClick={onSyncNow}
                disabled={isSyncing}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700/80 transition-all cursor-pointer shadow-sm shrink-0"
                title="Sincronizar agora em tempo real com a Caixa Econômica Federal"
              >
                <RefreshCw className={`w-3 h-3 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isSyncing ? 'Buscando...' : 'Sincronizar'}</span>
              </button>
            )}

            {/* Push notification toggle */}
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
              <span>{pushEnabled ? 'Push Ativo' : 'Alertas'}</span>
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
            <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white leading-tight">
                Furreco <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300">da Sorte</span>
              </h1>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Federal
              </span>
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border ${
                isLive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                <span>{isSyncing ? 'Sincronizando' : isLive ? 'Caixa Ao Vivo' : 'Offline'}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[11px] sm:text-xs text-slate-400 hidden xs:block">
                Estatísticas, probabilidades e apuração oficial da Caixa Econômica Federal em tempo real
              </p>
              {lastSyncTime && (
                <span className="hidden md:inline-flex text-[10px] text-slate-500 font-mono items-center gap-1">
                  · Checado às {lastSyncTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Zone: Tour, Contrast, Sound & Notification Bell */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onOpenTour && (
            <button
              onClick={onOpenTour}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-slate-300 hover:text-amber-300 hover:bg-slate-800 transition-all border border-slate-700/70 bg-slate-900/60 cursor-pointer min-h-[38px] flex items-center justify-center gap-1.5 shadow-sm"
              title="Tour Interativo: Como usar o Furreco"
              aria-label="Abrir tour guiado do aplicativo"
            >
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="hidden sm:inline text-xs font-bold text-slate-200">Como Usar</span>
            </button>
          )}

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

      {/* Real-Time Official Results Ticker Strip (5 Prizes) */}
      {latestContest && (
        <div className="bg-slate-950/85 border-t border-b border-emerald-500/20 py-1.5 px-3 sm:px-6 overflow-x-auto scrollbar-none text-[11px] sm:text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 min-w-max md:min-w-0">
            <div className="flex items-center gap-2 shrink-0">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase tracking-wider border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Oficial Caixa #{latestContest.concurso} ({latestContest.data}):
              </span>
            </div>

            <div className="flex items-center gap-3 text-slate-300">
              {latestContest.premios.slice(0, 5).map((premio, idx) => (
                <div key={premio.ordem} className="flex items-center gap-1.5 shrink-0">
                  <span className="text-slate-400 font-medium text-[10px]">{idx + 1}º</span>
                  <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] border ${
                    idx === 0
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 shadow-sm'
                      : 'bg-slate-800/80 text-white border-slate-700'
                  }`}>
                    {premio.bilhete}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {latestContest.todosBichos?.[idx]?.nome} {latestContest.todosBichos?.[idx]?.emoji}
                  </span>
                  {idx < 4 && <span className="text-slate-700 ml-1">·</span>}
                </div>
              ))}
            </div>

            {/* Location & Sorteio Tag */}
            <div className="hidden xl:flex items-center gap-2 text-[10px] text-slate-400 ml-auto shrink-0 font-medium">
              <span>{latestContest.local || 'Espaço da Sorte, SP'}</span>
              <span>·</span>
              <span className="text-emerald-400">100% Auditado</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6">
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1.5 scrollbar-none px-1.5">
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
            onClick={() => setActiveTab('milhar')}
            className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer border ${
              activeTab === 'milhar'
                ? 'bg-amber-400 text-slate-950 font-black border-amber-400 shadow-md shadow-amber-900/40 ring-1 ring-amber-300'
                : 'text-amber-300 hover:text-amber-100 hover:bg-slate-800/70 border-amber-400/40 bg-amber-400/10'
            }`}
          >
            <span className="text-xs sm:text-sm">🎯</span>
            <span>Busca de Milhar</span>
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
