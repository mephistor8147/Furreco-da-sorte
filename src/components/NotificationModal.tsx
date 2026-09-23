import React, { useState } from 'react';
import { Bell, Check, Trash2, X, Volume2, Sparkles, AlertCircle, Clock, Shield } from 'lucide-react';
import { PushNotification } from '../types/lottery';
import { NotificationSettings, triggerPushNotification } from '../utils/notificationService';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotification[];
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
  onAddNotification: (notification: PushNotification) => void;
  settings: NotificationSettings;
  onUpdateSettings: (settings: NotificationSettings) => void;
  onRequestPush: () => void;
  pushEnabled: boolean;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearNotifications,
  onAddNotification,
  settings,
  onUpdateSettings,
  onRequestPush,
  pushEnabled,
}) => {
  const [activeTab, setActiveTab] = useState<'lista' | 'config'>('lista');

  if (!isOpen) return null;

  // Simulate instant official result release
  const handleSimulateNewResult = () => {
    const nextConcurso = 5946;
    const newNotif: PushNotification = {
      id: `notif-${Date.now()}`,
      titulo: `Resultados Oficiais Liberados! Concurso ${nextConcurso}`,
      mensagem: `Acaba de sair o resultado oficial da Loteria Federal no Espaço da Sorte! 1º Prêmio: 39.482 (Grupo 21 - Touro).`,
      horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      lida: false,
      tipo: 'resultado',
    };

    onAddNotification(newNotif);
    triggerPushNotification(newNotif.titulo, newNotif.mensagem, settings.soundEnabled);
  };

  // Simulate next draw reminder
  const handleSimulateUpcomingDraw = () => {
    const newNotif: PushNotification = {
      id: `notif-${Date.now()}`,
      titulo: 'Sorteio da Federal em 1 Hora!',
      mensagem: 'Falta apenas 1 hora para o fechamento das apostas do Concurso 5946 da Loteria Federal. Garanta sua fração!',
      horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      lida: false,
      tipo: 'sorteio',
    };

    onAddNotification(newNotif);
    triggerPushNotification(newNotif.titulo, newNotif.mensagem, settings.soundEnabled);
  };

  // Simulate conscious tip notification
  const handleSimulateResponsibleTip = () => {
    const newNotif: PushNotification = {
      id: `notif-${Date.now()}`,
      titulo: '🛡️ Dica de Jogo Consciente & Banca',
      mensagem: 'Mantenha o teto semanal! Palpite estatístico consciente: Milhar 8291 / Centena 291 / Gr. 23 (Urso) apostando frações mínimas (R$ 0,50 a R$ 1,00).',
      horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      lida: false,
      tipo: 'dica',
    };

    onAddNotification(newNotif);
    triggerPushNotification(newNotif.titulo, newNotif.mensagem, settings.soundEnabled);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base leading-tight">Notificações & Alertas Oficiais</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">Furreco da Sorte Avisos em Tempo Real</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Subtabs */}
        <div className="flex border-b border-slate-800 px-3.5 sm:px-5 pt-2 bg-slate-950/30">
          <button
            onClick={() => setActiveTab('lista')}
            className={`pb-2.5 px-2.5 sm:px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'lista'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Avisos Recebidos ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-2.5 px-2.5 sm:px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'config'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Preferências de Alerta
          </button>
        </div>

        {/* Body Content */}
        <div className="p-3.5 sm:p-5 overflow-y-auto flex-1 space-y-3 sm:space-y-4">
          {activeTab === 'lista' ? (
            <>
              {/* Push permission trigger banner if not active */}
              {!pushEnabled && (
                <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2 text-amber-300">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="leading-snug">Ative o Push do navegador para receber resultados da Federal.</span>
                  </div>
                  <button
                    onClick={onRequestPush}
                    className="w-full xs:w-auto px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs whitespace-nowrap hover:bg-amber-400 transition-colors cursor-pointer text-center"
                  >
                    Ativar Agora
                  </button>
                </div>
              )}

              {/* Action shortcuts */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={handleSimulateNewResult}
                    className="px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/60 transition-colors flex items-center gap-1 text-[11px] sm:text-xs cursor-pointer"
                    title="Simular notificação oficial de novo resultado liberado"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Simular Resultado
                  </button>
                  <button
                    onClick={handleSimulateUpcomingDraw}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-1 text-[11px] sm:text-xs cursor-pointer"
                  >
                    <Clock className="w-3 h-3" />
                    Lembrete
                  </button>
                  <button
                    onClick={handleSimulateResponsibleTip}
                    className="px-2.5 py-1 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-500/30 hover:bg-amber-900/60 transition-colors flex items-center gap-1 text-[11px] sm:text-xs cursor-pointer"
                    title="Simular dica de jogo consciente e palpite de banca"
                  >
                    <Shield className="w-3 h-3 text-emerald-400" />
                    Dica Consciente
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[11px] sm:text-xs">
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    Marcar lidas
                  </button>
                  <span className="text-slate-700">·</span>
                  <button
                    onClick={onClearNotifications}
                    className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    Limpar
                  </button>
                </div>
              </div>

              {/* Notification List */}
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Nenhum alerta recente.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {notifications.map(notif => (
                    <div
                      key={notif.id}
                      className={`p-3.5 rounded-xl border transition-colors ${
                        notif.lida
                          ? 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                          : 'bg-slate-950 border-emerald-500/40 text-slate-200 shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={`font-bold flex items-center gap-1.5 ${notif.lida ? 'text-slate-300' : 'text-emerald-400'}`}>
                          {!notif.lida && <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />}
                          {notif.titulo}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{notif.horario}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{notif.mensagem}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Settings Tab */
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="font-semibold text-white block">Notificações Push do Navegador</span>
                  <span className="text-slate-400">Receber alertas na área de trabalho ou celular</span>
                </div>
                <button
                  onClick={onRequestPush}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                    pushEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-emerald-500 text-slate-950'
                  }`}
                >
                  {pushEnabled ? 'Ativado' : 'Ativar'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="font-semibold text-white block">Alerta de Resultados Oficiais Liberados</span>
                  <span className="text-slate-400">Notificar assim que o sorteio oficial das 19h for concluído</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.alertOnOfficialResult}
                  onChange={e => onUpdateSettings({ ...settings, alertOnOfficialResult: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="font-semibold text-white block">Aviso Prévio de Sorteio (1h antes)</span>
                  <span className="text-slate-400">Aviso às quartas e sábados às 18:00h</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.alertBeforeDraw}
                  onChange={e => onUpdateSettings({ ...settings, alertBeforeDraw: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="font-semibold text-white block">Alerta de Dezenas com Atraso Crítico</span>
                  <span className="text-slate-400">Avisar quando uma dezena ultrapassar 12 concursos sem sair</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.alertOnHotDezena}
                  onChange={e => onUpdateSettings({ ...settings, alertOnHotDezena: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="font-semibold text-white block">Efeitos Sonoros</span>
                  <span className="text-slate-400">Sons de sorteio e premiações</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={e => onUpdateSettings({ ...settings, soundEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
