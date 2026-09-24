import React, { useState } from 'react';
import { RefreshCw, Radio, CheckCircle2, AlertTriangle, Building2, Sparkles } from 'lucide-react';
import { LotteryContest } from '../types/lottery';

interface CaixaLiveSyncBannerProps {
  isLive: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncError: string | null;
  latestContest?: LotteryContest;
  onSync: () => void;
  highContrast?: boolean;
}

export const CaixaLiveSyncBanner: React.FC<CaixaLiveSyncBannerProps> = ({
  isLive,
  isSyncing,
  lastSyncTime,
  syncError,
  latestContest,
  onSync,
  highContrast,
}) => {
  const [justSynced, setJustSynced] = useState(false);

  const handleSyncClick = () => {
    onSync();
    setJustSynced(true);
    setTimeout(() => setJustSynced(false), 3000);
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Sincronizando agora...';
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div
      className={`rounded-2xl p-3.5 sm:p-4 border transition-all ${
        highContrast
          ? 'bg-black border-2 border-emerald-400 text-white'
          : 'bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border-emerald-500/40 shadow-lg'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          {/* Animated pulsing live indicator */}
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 shrink-0 mt-0.5 sm:mt-0">
            <Radio className={`w-4 h-4 text-emerald-400 ${isSyncing ? 'animate-spin' : 'animate-pulse'}`} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                Dados Oficiais Loterias Caixa Econômica Federal
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Tempo Real
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-xs text-slate-300">
              {latestContest ? (
                <>
                  <span className="font-bold text-white font-mono">
                    Último Sorteio Oficial: Concurso {latestContest.concurso} ({latestContest.data})
                  </span>
                  <span className="text-slate-500 hidden sm:inline">·</span>
                  <span className="text-slate-400">
                    1º Prêmio: <strong className="text-amber-300 font-mono">{latestContest.premios[0]?.bilhete}</strong> ({latestContest.bichoPrincipal?.nome} {latestContest.bichoPrincipal?.emoji})
                  </span>
                </>
              ) : (
                <span>Carregando apuração oficial da Caixa...</span>
              )}
            </div>
          </div>
        </div>

        {/* Right side controls: Last sync time & sync button */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
          <div className="text-left sm:text-right text-[11px] text-slate-400">
            <span className="block font-mono">
              {isSyncing ? 'Buscando na Caixa...' : `Atualizado às ${formatLastSync(lastSyncTime)}`}
            </span>
            {syncError ? (
              <span className="text-amber-400 text-[10px] flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                Modo contingência
              </span>
            ) : (
              <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Sincronizado com o Espaço da Sorte
              </span>
            )}
          </div>

          <button
            onClick={handleSyncClick}
            disabled={isSyncing}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shrink-0 active:scale-95 ${
              isSyncing
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : justSynced
                ? 'bg-emerald-500 text-slate-950 font-black'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-emerald-900/50'
            }`}
            title="Buscar resultados mais recentes diretamente na Caixa Econômica Federal"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Atualizando...' : justSynced ? 'Atualizado!' : 'Atualizar Caixa'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
