import React from 'react';
import { Sparkles, Share2, Smartphone, Monitor, RefreshCw } from 'lucide-react';

interface MobileTopBarProps {
  concursoAtual: number;
  dataConcurso: string;
  isMobileFrame: boolean;
  isSyncing: boolean;
  onToggleFrame: () => void;
  onShareApp: () => void;
  onSyncFederal: () => void;
}

export function MobileTopBar({
  concursoAtual,
  dataConcurso,
  isMobileFrame,
  isSyncing,
  onToggleFrame,
  onShareApp,
  onSyncFederal,
}: MobileTopBarProps) {
  return (
    <header className="sticky top-0 z-30 h-14 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 flex items-center justify-between select-none">
      {/* Zone 1: Brand Wordmark (Single text element) */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md shadow-amber-900/30 shrink-0">
          <Sparkles className="w-4 h-4 text-slate-950" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-white leading-none">
            Bicho da Federal
          </span>
          <span className="text-[11px] text-amber-400/90 font-medium leading-none mt-0.5">
            Dicas & Palpites Quentes
          </span>
        </div>
      </div>

      {/* Zone 2: Federal Draw Metadata */}
      <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
        <span className="text-slate-300 font-semibold">Conc. {concursoAtual}</span>
        <span aria-hidden="true">·</span>
        <span>{dataConcurso}</span>
      </div>

      {/* Zone 3: Primary Actions (Touch-friendly >= 44x44px) */}
      <div className="flex items-center gap-1">
        {/* Botão de Atualizar Resultado da Federal */}
        <button
          onClick={onSyncFederal}
          disabled={isSyncing}
          className={`min-h-[44px] px-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer text-xs font-semibold ${
            isSyncing
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
          }`}
          title="Atualizar resultado da Federal na Caixa Econômica"
          aria-label="Atualizar resultado da Federal"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="hidden xs:inline">
            {isSyncing ? 'Buscando...' : 'Atualizar'}
          </span>
        </button>

        <button
          onClick={onToggleFrame}
          className="min-h-[44px] min-w-[44px] p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 transition-colors flex items-center justify-center cursor-pointer"
          title={isMobileFrame ? 'Visualização Ampla' : 'Visualização em Celular'}
          aria-label="Alternar visualização"
        >
          {isMobileFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
        </button>

        <button
          onClick={onShareApp}
          className="min-h-[44px] min-w-[44px] p-2 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-slate-900/80 transition-colors flex items-center justify-center cursor-pointer"
          title="Compartilhar Palpites"
          aria-label="Compartilhar"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
