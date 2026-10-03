// furreco da sorte
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StatsDashboard } from './components/StatsDashboard';
import { ContestHistoryView } from './components/ContestHistoryView';
import { SmartGeneratorCard } from './components/SmartGeneratorCard';
import { WeeklyReportView } from './components/WeeklyReportView';
import { OddsCalculatorView } from './components/OddsCalculatorView';
import { NotificationModal } from './components/NotificationModal';
import {
  getStoredNotifications,
  saveStoredNotifications,
  getStoredSettings,
  saveStoredSettings,
  requestPushPermission,
  playNotificationSound,
  triggerPushNotification,
  NotificationSettings,
} from './utils/notificationService';
import { PushNotification } from './types/lottery';
import { Compass } from 'lucide-react';
import { ResponsibleGamingCard } from './components/ResponsibleGamingCard';
import { OnboardingTourModal } from './components/OnboardingTourModal';
import { MilharLookupView } from './components/MilharLookupView';
import { useLiveLotteryContests } from './services/lotteryLiveService';
import { CaixaLiveSyncBanner } from './components/CaixaLiveSyncBanner';
import { MobileBottomNav } from './components/MobileBottomNav';

const ONBOARDING_KEY = 'furreco_onboarding_completed_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'stats' | 'history' | 'generator' | 'weekly' | 'odds' | 'responsible' | 'milhar'>('stats');
  const [statsSubTab, setStatsSubTab] = useState<'finais' | 'dezenas' | 'atrasometro' | 'bichos' | 'auditoria'>('finais');
  const [targetDezena, setTargetDezena] = useState<string | null>(null);

  const handleNavigateToTab = (
    tab: 'stats' | 'history' | 'generator' | 'weekly' | 'odds' | 'responsible' | 'milhar',
    subTab?: 'finais' | 'dezenas' | 'atrasometro' | 'bichos' | 'auditoria'
  ) => {
    setActiveTab(tab);
    if (subTab) {
      setStatsSubTab(subTab);
    }
  };

  const [notifications, setNotifications] = useState<PushNotification[]>(getStoredNotifications());
  const [settings, setSettings] = useState<NotificationSettings>(getStoredSettings());
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  // Live Caixa Econômica Federal lottery results state
  const {
    contests,
    isLive,
    isSyncing,
    lastSyncTime,
    syncError,
    latestContest,
    proximoConcurso,
    syncNow,
  } = useLiveLotteryContests();

  // Update document title in real time with live Caixa draw results
  useEffect(() => {
    if (latestContest) {
      document.title = `🍀 Furreco | Conc. ${latestContest.concurso} [1º ${latestContest.premios[0]?.bilhete || ''}] - Ao Vivo Caixa`;
    } else {
      document.title = 'Furreco da Sorte - Estatísticas e Palpites da Loteria Federal';
    }
  }, [latestContest]);

  // Auto-launch onboarding tour for new visitors
  useEffect(() => {
    try {
      const hasCompletedTour = localStorage.getItem(ONBOARDING_KEY);
      if (!hasCompletedTour) {
        const timer = setTimeout(() => {
          setIsTourOpen(true);
        }, 700);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, []);

  // Sync notifications to storage
  useEffect(() => {
    saveStoredNotifications(notifications);
  }, [notifications]);

  // Sync settings to storage & apply high-contrast class to document root
  useEffect(() => {
    saveStoredSettings(settings);
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [settings]);

  // Automated notification check on initial load (next draw detection)
  useEffect(() => {
    const hasUpcomingAlert = notifications.some(n => n.tipo === 'sorteio' && !n.lida);
    if (!hasUpcomingAlert && settings.alertBeforeDraw) {
      const timer = setTimeout(() => {
        const nextNum = proximoConcurso?.numero || (contests[0]?.concurso ? contests[0].concurso + 1 : 6106);
        const nextDate = proximoConcurso?.dataEstimada || 'Sábado';
        const nextAlert: PushNotification = {
          id: `notif-auto-${Date.now()}`,
          titulo: 'Próximo Sorteio da Federal se Aproximando!',
          mensagem: `O Concurso ${nextNum} (${nextDate}) será sorteado no Espaço da Sorte. Gere seus bilhetes da sorte no Furreco!`,
          horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          lida: false,
          tipo: 'sorteio',
        };
        setNotifications(prev => [nextAlert, ...prev]);
        if (settings.browserPushEnabled) {
          triggerPushNotification(nextAlert.titulo, nextAlert.mensagem, settings.soundEnabled);
        }
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [proximoConcurso, contests, notifications, settings]);

  const handleToggleSound = () => {
    setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
    if (!settings.soundEnabled) {
      playNotificationSound();
    }
  };

  const handleToggleHighContrast = () => {
    setSettings(prev => {
      const nextVal = !prev.highContrast;
      if (nextVal && prev.soundEnabled) {
        playNotificationSound();
      }
      return { ...prev, highContrast: nextVal };
    });
  };

  const handleEnablePush = async () => {
    const perm = await requestPushPermission();
    if (perm === 'granted') {
      setPushEnabled(true);
      setSettings(prev => ({ ...prev, browserPushEnabled: true }));
      triggerPushNotification(
        'Furreco da Sorte Conectado! 🍀',
        'Notificações ativadas com sucesso. Você receberá alertas dos resultados oficiais em primeira mão!',
        settings.soundEnabled
      );
    } else {
      setPushEnabled(false);
      setSettings(prev => ({ ...prev, browserPushEnabled: false }));
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, lida: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleAddNotification = (notif: PushNotification) => {
    setNotifications(prev => [notif, ...prev]);
  };

  const handleCloseTour = () => {
    setIsTourOpen(false);
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
    } catch {
      // ignore
    }
  };

  const handleOpenTour = () => {
    setIsTourOpen(true);
    if (settings.soundEnabled) {
      playNotificationSound();
    }
  };

  return (
    <div className={`min-h-screen flex flex-col selection:bg-emerald-500 selection:text-white ${
      settings.highContrast ? 'high-contrast bg-black text-white' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        statsSubTab={statsSubTab}
        onNavigateWithSubTab={handleNavigateToTab}
        notifications={notifications}
        onOpenNotifications={() => setIsNotifModalOpen(true)}
        soundEnabled={settings.soundEnabled}
        onToggleSound={handleToggleSound}
        onEnablePush={handleEnablePush}
        pushEnabled={pushEnabled}
        highContrast={settings.highContrast}
        onToggleHighContrast={handleToggleHighContrast}
        onOpenTour={handleOpenTour}
        latestContest={latestContest || contests[0]}
        proximoConcurso={proximoConcurso}
        isLive={isLive}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        onSyncNow={() => {
          if (settings.soundEnabled) playNotificationSound();
          syncNow(true);
        }}
      />

      {/* Main App Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-3 sm:py-6 space-y-4 sm:space-y-6 pb-24 md:pb-8">
        {/* High Contrast Accessibility Indicator Bar when active */}
        {settings.highContrast && (
          <div className="bg-black border-2 border-amber-400 text-white px-3.5 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs font-bold shadow-lg">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block animate-pulse" />
              <span className="text-amber-300">Modo Alto Contraste Ativado:</span>
              <span className="text-slate-100 font-normal hidden sm:inline">
                Tabelas, gráficos e números otimizados para máxima legibilidade visual.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsNotifModalOpen(true)}
                className="px-2.5 py-1 bg-zinc-900 border border-zinc-500 rounded text-amber-300 hover:text-white text-[11px] cursor-pointer"
              >
                Ajustar nas Configurações
              </button>
              <button
                onClick={handleToggleHighContrast}
                className="px-2.5 py-1 bg-amber-400 text-black rounded font-black text-[11px] cursor-pointer hover:bg-amber-300"
              >
                Desativar
              </button>
            </div>
          </div>
        )}

        {/* Live Caixa Econômica Federal Sync Alert (displayed only on sync warning / contingency) */}
        {syncError && (
          <CaixaLiveSyncBanner
            isLive={isLive}
            isSyncing={isSyncing}
            lastSyncTime={lastSyncTime}
            syncError={syncError}
            latestContest={contests[0]}
            onSync={() => {
              if (settings.soundEnabled) playNotificationSound();
              syncNow(true);
            }}
            highContrast={settings.highContrast}
          />
        )}

        {/* Tab 1: Stats & Charts */}
        {activeTab === 'stats' && (
          <StatsDashboard
            contests={contests}
            initialSubTab={statsSubTab}
            onSelectDezena={dez => setTargetDezena(dez)}
            onNavigateToTab={handleNavigateToTab}
          />
        )}

        {/* Tab 2: Contest History & Filters */}
        {activeTab === 'history' && (
          <ContestHistoryView
            contests={contests}
            onPlayChime={() => settings.soundEnabled && playNotificationSound()}
            onNavigateToTab={handleNavigateToTab}
          />
        )}

        {/* Tab 2.5: Milhar Lookup & Frequency Inspector */}
        {activeTab === 'milhar' && (
          <MilharLookupView
            contests={contests}
            onPlayChime={() => settings.soundEnabled && playNotificationSound()}
            onNavigateToTab={handleNavigateToTab}
            initialMilhar={
              targetDezena
                ? (contests.flatMap(c => c.premios).map(p => p.bilhete.slice(-4)).find(m => m.endsWith(targetDezena)) || targetDezena.padStart(4, '0'))
                : undefined
            }
            onSelectDezena={dez => setTargetDezena(dez)}
            highContrast={settings.highContrast}
          />
        )}

        {/* Tab 3: Smart Generator */}
        {activeTab === 'generator' && (
          <SmartGeneratorCard
            contests={contests}
            soundEnabled={settings.soundEnabled}
            onPlayChime={() => settings.soundEnabled && playNotificationSound()}
            targetDezena={targetDezena}
            onClearTargetDezena={() => setTargetDezena(null)}
            onNavigateToTab={handleNavigateToTab}
            onSelectDezena={dez => setTargetDezena(dez)}
          />
        )}

        {/* Tab 4: Weekly Report */}
        {activeTab === 'weekly' && (
          <WeeklyReportView
            contests={contests}
          />
        )}

        {/* Tab 5: Official Odds */}
        {activeTab === 'odds' && (
          <OddsCalculatorView />
        )}

        {/* Tab 6: Responsible Gaming & Bicho Tips dedicated exclusive view with live Caixa draw sync */}
        {activeTab === 'responsible' && (
          <ResponsibleGamingCard
            contests={contests}
            onPlayChime={() => settings.soundEnabled && playNotificationSound()}
            isLive={isLive}
            isSyncing={isSyncing}
            lastSyncTime={lastSyncTime}
            latestContest={contests[0]}
            proximoConcurso={proximoConcurso}
            onSyncNow={() => {
              if (settings.soundEnabled) playNotificationSound();
              syncNow(true);
            }}
          />
        )}
      </main>

      {/* App Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 sm:py-8 px-4 sm:px-6 text-xs text-slate-400 mt-8 sm:mt-12 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <span className="font-bold text-slate-200">Furreco da Sorte</span>
            <span>·</span>
            <span>Estatísticas e Probabilidades da Loteria Federal</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-slate-300">
            <button
              onClick={handleOpenTour}
              className="text-amber-400 hover:text-amber-300 font-semibold transition-colors cursor-pointer flex items-center gap-1"
              title="Rever o tour explicativo do Furreco"
            >
              <Compass className="w-3.5 h-3.5" />
              Como Usar (Tour Guiado)
            </button>
            <span>·</span>
            <span>Sorteios às Quartas e Sábados às 19h</span>
            <span>·</span>
            <button
              onClick={() => setActiveTab('responsible')}
              className="text-emerald-400/90 hover:text-emerald-300 font-semibold transition-colors cursor-pointer"
              title="Acessar o menu exclusivo de Apostas Conscientes"
            >
              Apostas Conscientes (+18)
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile-First Persistent Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        statsSubTab={statsSubTab}
        onNavigateWithSubTab={handleNavigateToTab}
        unreadCount={notifications.filter(n => !n.lida).length}
        onOpenNotifications={() => setIsNotifModalOpen(true)}
        onOpenTour={handleOpenTour}
      />

      {/* Notifications Drawer Modal */}
      <NotificationModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllRead}
        onClearNotifications={handleClearNotifications}
        onAddNotification={handleAddNotification}
        settings={settings}
        onUpdateSettings={setSettings}
        onRequestPush={handleEnablePush}
        pushEnabled={pushEnabled}
        onOpenTour={handleOpenTour}
        onNavigateToTab={handleNavigateToTab}
      />

      {/* Interactive Onboarding Tour Modal */}
      <OnboardingTourModal
        isOpen={isTourOpen}
        onClose={handleCloseTour}
        onNavigateToTab={handleNavigateToTab}
        onPlayChime={() => settings.soundEnabled && playNotificationSound()}
        highContrast={settings.highContrast}
      />
    </div>
  );
}
