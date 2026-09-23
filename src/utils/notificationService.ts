import { PushNotification } from '../types/lottery';

const NOTIFICATIONS_STORAGE_KEY = 'furreco_notificacoes_v1';
const SETTINGS_STORAGE_KEY = 'furreco_notif_settings_v1';

export interface NotificationSettings {
  browserPushEnabled: boolean;
  alertOnOfficialResult: boolean;
  alertBeforeDraw: boolean;
  alertOnHotDezena: boolean;
  soundEnabled: boolean;
}

export const DEFAULT_SETTINGS: NotificationSettings = {
  browserPushEnabled: false,
  alertOnOfficialResult: true,
  alertBeforeDraw: true,
  alertOnHotDezena: true,
  soundEnabled: true,
};

export const INITIAL_NOTIFICATIONS: PushNotification[] = [
  {
    id: 'notif-1',
    titulo: 'Resultados Oficiais Liberados! Concurso 5945',
    mensagem: 'O 1º prêmio saiu para o bilhete 48.291 (Grupo 23 - Urso). Confira se você foi premiado!',
    horario: '19/09/2026 19:15',
    lida: false,
    tipo: 'resultado',
  },
  {
    id: 'notif-2',
    titulo: 'Próximo Sorteio da Federal Disponível!',
    mensagem: 'Concurso 5946 será realizado na Quarta-feira às 19:00h no Espaço da Sorte.',
    horario: 'Hoje 09:00',
    lida: false,
    tipo: 'sorteio',
  },
  {
    id: 'notif-3',
    titulo: 'Alerta de Dezena Atrasada: 88 (Tigre)',
    mensagem: 'A dezena 88 está há 14 concursos sem sair em nenhum dos 5 prêmios. Chance estatística aumentada.',
    horario: 'Ontem 14:30',
    lida: true,
    tipo: 'atraso',
  },
];

// Play pleasant web audio chime
export function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // AudioContext blocked or not supported
  }
}

export function getStoredNotifications(): PushNotification[] {
  try {
    const data = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {
    // fallback
  }
  return INITIAL_NOTIFICATIONS;
}

export function saveStoredNotifications(notifs: PushNotification[]) {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
  } catch {
    // ignore
  }
}

export function getStoredSettings(): NotificationSettings {
  try {
    const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (data) return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch {
    // fallback
  }
  return DEFAULT_SETTINGS;
}

export function saveStoredSettings(settings: NotificationSettings) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return await Notification.requestPermission();
}

export function triggerPushNotification(title: string, body: string, sound = true) {
  if (sound) {
    playNotificationSound();
  }

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'furreco-loteria',
      });
    } catch {
      // Notification failed
    }
  }
}
