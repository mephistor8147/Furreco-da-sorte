// furreco da sorte
import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Flame,
  Snowflake,
  PieChart,
  ShieldCheck,
  Search,
  Filter,
  Copy,
  Check,
  Sparkles,
  Target,
  ArrowRight,
  AlertTriangle,
  Info,
  Clock,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { LotteryContest } from '../types/lottery';
import {
  calculateFinalDigitStats,
  calculateDezenaStats,
  calculateAnimalDelayStats,
  calculateFinalDelayStats,
  calculateParityStats,
  calculateAnimalStats,
} from '../data/mockLotteryData';
import { ResponsibleTipsAccuracyCard } from './ResponsibleTipsAccuracyCard';

interface StatsDashboardProps {
  contests: LotteryContest[];
  onSelectDezena?: (dezena: string) => void;
  onNavigateToTab?: (tab: 'stats' | 'history' | 'generator' | 'weekly' | 'odds' | 'responsible' | 'milhar', subTab?: 'finais' | 'dezenas' | 'atrasometro' | 'bichos' | 'auditoria') => void;
  initialSubTab?: 'finais' | 'dezenas' | 'atrasometro' | 'bichos' | 'auditoria';
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  contests,
  onSelectDezena,
  onNavigateToTab,
  initialSubTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'finais' | 'dezenas' | 'atrasometro' | 'bichos' | 'auditoria'>(
    initialSubTab || 'finais'
  );

  // Sync with initialSubTab if navigated externally (e.g. from Notifications or Mobile drawer)
  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Atrasômetro specific states
  const [atrasoCategory, setAtrasoCategory] = useState<'dezenas' | 'bichos' | 'finais'>('dezenas');
  const [atrasoScope, setAtrasoScope] = useState<'geral' | 'cabeca'>('geral');
  const [atrasoSeverityFilter, setAtrasoSeverityFilter] = useState<'all' | 'critico' | 'alto' | 'moderado' | 'recente'>('all');
  const [atrasoSearch, setAtrasoSearch] = useState('');
  const [showAllDezenas, setShowAllDezenas] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedListMessage, setCopiedListMessage] = useState(false);

  // Base stats calculations
  const finalDigitStats = useMemo(() => calculateFinalDigitStats(contests), [contests]);
  const dezenaStats = useMemo(() => calculateDezenaStats(contests, 'geral'), [contests]);
  const parityStats = useMemo(() => calculateParityStats(contests), [contests]);
  const animalStats = useMemo(() => calculateAnimalStats(contests), [contests]);

  // Atrasômetro specific calculations with scope toggle
  const atrasoDezenaStats = useMemo(() => calculateDezenaStats(contests, atrasoScope), [contests, atrasoScope]);
  const atrasoAnimalStats = useMemo(() => calculateAnimalDelayStats(contests, atrasoScope), [contests, atrasoScope]);
  const atrasoFinalStats = useMemo(() => calculateFinalDelayStats(contests, atrasoScope), [contests, atrasoScope]);

  const totalAnalyzed = contests.length;
  const latestContest = contests[0];
  const latestContestNum = latestContest?.concurso || 6105;

  const maxFinalCount = Math.max(...finalDigitStats.map(s => s.count), 1);
  const topFinal = finalDigitStats[0];

  const getDezenaSeverity = (delay: number, scope: 'geral' | 'cabeca') => {
    if (scope === 'cabeca') {
      if (delay >= 50) return { label: 'CRÍTICO', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', type: 'critico' };
      if (delay >= 30) return { label: 'ALTO', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', type: 'alto' };
      if (delay >= 15) return { label: 'MODERADO', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', type: 'moderado' };
      return { label: 'RECENTE', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', type: 'recente' };
    } else {
      if (delay >= 12) return { label: 'CRÍTICO', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', type: 'critico' };
      if (delay >= 8) return { label: 'ALTO', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', type: 'alto' };
      if (delay >= 4) return { label: 'MODERADO', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', type: 'moderado' };
      return { label: 'RECENTE', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', type: 'recente' };
    }
  };

  const getAnimalSeverity = (delay: number, scope: 'geral' | 'cabeca') => {
    if (scope === 'cabeca') {
      if (delay >= 18) return { label: 'CRÍTICO', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', type: 'critico' };
      if (delay >= 10) return { label: 'ALTO', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', type: 'alto' };
      if (delay >= 5) return { label: 'MODERADO', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', type: 'moderado' };
      return { label: 'RECENTE', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', type: 'recente' };
    } else {
      if (delay >= 6) return { label: 'CRÍTICO', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', type: 'critico' };
      if (delay >= 4) return { label: 'ALTO', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', type: 'alto' };
      if (delay >= 2) return { label: 'MODERADO', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', type: 'moderado' };
      return { label: 'RECENTE', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', type: 'recente' };
    }
  };

  const getFinalSeverity = (delay: number, scope: 'geral' | 'cabeca') => {
    if (scope === 'cabeca') {
      if (delay >= 10) return { label: 'CRÍTICO', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', type: 'critico' };
      if (delay >= 6) return { label: 'ALTO', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', type: 'alto' };
      if (delay >= 3) return { label: 'MODERADO', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', type: 'moderado' };
      return { label: 'RECENTE', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', type: 'recente' };
    } else {
      if (delay >= 4) return { label: 'CRÍTICO', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', type: 'critico' };
      if (delay >= 3) return { label: 'ALTO', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', type: 'alto' };
      if (delay >= 2) return { label: 'MODERADO', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', type: 'moderado' };
      return { label: 'RECENTE', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', type: 'recente' };
    }
  };

  const handleCopyItem = (text: string, id: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleCopyTopList = () => {
    const scopeLabel = atrasoScope === 'cabeca' ? '1º Prêmio (Na Cabeça)' : '1º ao 5º Prêmio (Geral)';
    let text = `❄️ ATRASÔMETRO DA LOTERIA FEDERAL - CONCURSO #${latestContestNum}\n`;
    text += `Modalidade: ${scopeLabel} · Base: ${totalAnalyzed} concursos auditados Caixa\n\n`;

    if (atrasoCategory === 'dezenas') {
      text += `TOP 10 DEZENAS MAIS ATRASADAS:\n`;
      atrasoDezenaStats.maisAtrasadas.slice(0, 10).forEach((item, idx) => {
        text += `${idx + 1}º. Dezena ${item.dezena} (${item.nomeBicho} - Gr. ${String(item.grupo).padStart(2, '0')}) -> Atraso: ${item.concursosAtrasada} concursos\n`;
      });
    } else if (atrasoCategory === 'bichos') {
      text += `TOP 10 BICHOS MAIS ATRASADOS:\n`;
      atrasoAnimalStats.slice(0, 10).forEach((item, idx) => {
        text += `${idx + 1}º. Grupo ${String(item.grupo).padStart(2, '0')} ${item.nome} ${item.emoji} -> Atraso: ${item.concursosAtrasado} concursos\n`;
      });
    } else {
      text += `FINAIS (0-9) MAIS ATRASADOS:\n`;
      atrasoFinalStats.forEach((item, idx) => {
        text += `${idx + 1}º. Final ${item.digit} -> Atraso: ${item.concursosAtrasado} concursos\n`;
      });
    }
    text += `\nConsulte o Furreco da Sorte para estatísticas completas!`;

    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedListMessage(true);
      setTimeout(() => setCopiedListMessage(false), 2500);
    }
  };

  const filteredDezenas = useMemo(() => {
    return atrasoDezenaStats.todas
      .filter(item => {
        if (atrasoSearch.trim()) {
          const q = atrasoSearch.trim().toLowerCase();
          const matchNum = item.dezena.includes(q);
          const matchBicho = item.nomeBicho.toLowerCase().includes(q);
          const matchGroup = String(item.grupo).padStart(2, '0').includes(q) || String(item.grupo) === q;
          if (!matchNum && !matchBicho && !matchGroup) return false;
        }
        if (atrasoSeverityFilter !== 'all') {
          const sev = getDezenaSeverity(item.concursosAtrasada, atrasoScope);
          if (sev.type !== atrasoSeverityFilter) return false;
        }
        return true;
      })
      .sort((a, b) => b.concursosAtrasada - a.concursosAtrasada || a.count - b.count);
  }, [atrasoDezenaStats, atrasoSearch, atrasoSeverityFilter, atrasoScope]);

  const filteredAnimals = useMemo(() => {
    return atrasoAnimalStats
      .filter(item => {
        if (atrasoSearch.trim()) {
          const q = atrasoSearch.trim().toLowerCase();
          const matchName = item.nome.toLowerCase().includes(q);
          const matchGroup = String(item.grupo).padStart(2, '0').includes(q) || String(item.grupo) === q;
          const matchDez = item.dezenas.some(d => d.includes(q));
          if (!matchName && !matchGroup && !matchDez) return false;
        }
        if (atrasoSeverityFilter !== 'all') {
          const sev = getAnimalSeverity(item.concursosAtrasado, atrasoScope);
          if (sev.type !== atrasoSeverityFilter) return false;
        }
        return true;
      });
  }, [atrasoAnimalStats, atrasoSearch, atrasoSeverityFilter, atrasoScope]);

  const filteredFinals = useMemo(() => {
    return atrasoFinalStats
      .filter(item => {
        if (atrasoSearch.trim()) {
          const q = atrasoSearch.trim().toLowerCase();
          if (!item.digit.toString().includes(q)) return false;
        }
        if (atrasoSeverityFilter !== 'all') {
          const sev = getFinalSeverity(item.concursosAtrasado, atrasoScope);
          if (sev.type !== atrasoSeverityFilter) return false;
        }
        return true;
      });
  }, [atrasoFinalStats, atrasoSearch, atrasoSeverityFilter, atrasoScope]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Analysis Container - Top of dashboard is directly interactive */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-5 shadow-xl">
        {/* Streamlined Sub-Navigation Bar - Direct top access on mobile */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto scrollbar-none mb-4 sm:mb-6">
          <button
            onClick={() => setActiveSubTab('finais')}
            className={`px-3 py-2.5 text-xs sm:text-sm font-extrabold rounded-lg transition-all text-center cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5 shrink-0 ${
              activeSubTab === 'finais'
                ? 'bg-emerald-600 text-white shadow-md font-black ring-1 ring-emerald-400/50'
                : 'text-slate-200 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>📊</span>
            <span>Finais (0-9)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('dezenas')}
            className={`px-3 py-2.5 text-xs sm:text-sm font-extrabold rounded-lg transition-all text-center cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5 shrink-0 ${
              activeSubTab === 'dezenas'
                ? 'bg-emerald-600 text-white shadow-md font-black ring-1 ring-emerald-400/50'
                : 'text-slate-200 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>🔥</span>
            <span>Top Dezenas</span>
          </button>
          <button
            onClick={() => setActiveSubTab('atrasometro')}
            className={`px-3 py-2.5 text-xs sm:text-sm font-extrabold rounded-lg transition-all text-center cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5 shrink-0 ${
              activeSubTab === 'atrasometro'
                ? 'bg-emerald-600 text-white shadow-md font-black ring-1 ring-emerald-400/50'
                : 'text-slate-200 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>❄️</span>
            <span>Atrasômetro</span>
          </button>
          <button
            onClick={() => setActiveSubTab('bichos')}
            className={`px-3 py-2.5 text-xs sm:text-sm font-extrabold rounded-lg transition-all text-center cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5 shrink-0 ${
              activeSubTab === 'bichos'
                ? 'bg-emerald-600 text-white shadow-md font-black ring-1 ring-emerald-400/50'
                : 'text-slate-200 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>🐾</span>
            <span>25 Grupos</span>
          </button>
          <button
            onClick={() => setActiveSubTab('auditoria')}
            className={`px-3 py-2.5 text-xs sm:text-sm font-extrabold rounded-lg transition-all text-center cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5 shrink-0 border ${
              activeSubTab === 'auditoria'
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-black ring-2 ring-amber-300'
                : 'text-amber-300 hover:text-white hover:bg-amber-950/40 border-amber-500/40 bg-amber-500/10'
            }`}
          >
            <span>🛡️</span>
            <span>Taxa de Acertos (Dicas)</span>
          </button>
        </div>

        {/* View 1: Finais 0-9 Interactive Bar Chart */}
        {activeSubTab === 'finais' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Frequência de Ocorrência por Dígito Final (Todos os 5 Prêmios)
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed font-medium">
                Total de 5 prêmios × {contests.length} concursos analisados ({contests.length * 5} bilhetes).
                O dígito final determina a restituição (terminação) do valor do bilhete.
              </p>
            </div>

            {/* Desktop / Tablet Column Chart (Hidden on small mobile) */}
            <div className="hidden sm:grid sm:grid-cols-10 gap-2 sm:gap-3 items-end pt-8 pb-2">
              {finalDigitStats.map(item => {
                const heightPercent = Math.max((item.count / maxFinalCount) * 100, 15);
                const isLeader = item.digit === topFinal.digit;

                return (
                  <div key={item.digit} className="flex flex-col items-center group">
                    <div className="mb-2 text-[11px] font-mono text-slate-300 font-semibold opacity-80 group-hover:opacity-100 transition-opacity">
                      {item.count}x
                    </div>

                    <div className="w-full bg-slate-950/80 rounded-t-lg h-44 flex items-end p-1 border border-slate-800 group-hover:border-slate-700 transition-colors">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded transition-all duration-500 flex flex-col justify-between items-center py-1 text-[10px] font-mono font-bold ${
                          isLeader
                            ? 'bg-gradient-to-t from-amber-500 to-emerald-400 text-slate-950 shadow-lg shadow-emerald-900/30'
                            : 'bg-gradient-to-t from-slate-700 to-emerald-600 text-white'
                        }`}
                      >
                        <span>{item.percentage.toFixed(0)}%</span>
                      </div>
                    </div>

                    <div className={`mt-2 w-8 h-8 rounded-full flex items-center justify-center font-mono font-black text-sm border ${
                      isLeader
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow'
                        : 'bg-slate-800 text-slate-200 border-slate-700'
                    }`}>
                      {item.digit}
                    </div>

                    <span className="text-[10px] text-slate-500 mt-1">
                      {item.lastSeenContestsAgo === 0 ? 'Último' : `${item.lastSeenContestsAgo}c atrás`}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Mobile-Optimized Horizontal Bars (Ultra clean, readable & thumb-friendly) */}
            <div className="sm:hidden space-y-2.5 pt-2">
              {finalDigitStats.map(item => {
                const widthPercent = Math.max((item.count / maxFinalCount) * 100, 10);
                const isLeader = item.digit === topFinal.digit;

                return (
                  <div
                    key={item.digit}
                    className={`p-2.5 rounded-xl border flex items-center gap-3 transition-colors ${
                      isLeader
                        ? 'bg-amber-950/30 border-amber-500/50 shadow-md ring-1 ring-amber-500/20'
                        : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    {/* Digit Avatar */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-black text-xl shrink-0 border ${
                        isLeader
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                          : 'bg-slate-800 text-white border-slate-700'
                      }`}
                    >
                      {item.digit}
                    </div>

                    {/* Progress Bar & Stats */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="font-black text-white">
                          {item.count} vezes <span className="text-amber-300">({item.percentage.toFixed(1)}%)</span>
                        </span>
                        <span className="text-slate-200 text-xs font-bold">
                          {item.lastSeenContestsAgo === 0 ? 'Saiu no último!' : `${item.lastSeenContestsAgo} conc. atrás`}
                        </span>
                      </div>

                      <div className="h-3.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          style={{ width: `${widthPercent}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            isLeader ? 'bg-gradient-to-r from-amber-400 to-emerald-400' : 'bg-emerald-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Parity Breakdown within Finals */}
            <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 sm:p-4">
                <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                  <span className="font-bold text-slate-100 flex items-center gap-1.5">
                    <PieChart className="w-4 h-4 text-emerald-400" />
                    Balanço de Paridade Geral
                  </span>
                  <span className="text-slate-300 font-mono text-xs font-semibold">{parityStats.pares + parityStats.impares} bilhetes</span>
                </div>

                {/* Progress bar */}
                <div className="h-6 bg-slate-800 rounded-full overflow-hidden flex border border-slate-700">
                  <div
                    style={{ width: `${parityStats.percentPares}%` }}
                    className="bg-emerald-500 h-full flex items-center justify-center text-xs font-bold text-slate-950 truncate px-2"
                  >
                    Pares {parityStats.percentPares.toFixed(1)}%
                  </div>
                  <div
                    style={{ width: `${parityStats.percentImpares}%` }}
                    className="bg-amber-500 h-full flex items-center justify-center text-xs font-bold text-slate-950 truncate px-2"
                  >
                    Ímpares {parityStats.percentImpares.toFixed(1)}%
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 mt-2.5 leading-relaxed font-medium">
                  A paridade na Loteria Federal oscila muito próxima de 50/50, o que reforça a
                  recomendação de apostar em bilhetes equilibrados (com algarismos pares e ímpares mesclados).
                </p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 sm:p-4">
                <span className="font-bold text-slate-100 text-xs sm:text-sm flex items-center gap-1.5 mb-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Dica Estatística do Furreco
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  Os bilhetes com finais <strong className="text-amber-300 font-bold">{topFinal.digit}</strong> e{' '}
                  <strong className="text-amber-300 font-bold">{finalDigitStats[1]?.digit}</strong> tiveram maior aproveitamento
                  recente. Se for adquirir bilhetes na casa lotérica, priorize frações que combinem com a dezena de maior frequência.
                </p>
              </div>
            </div>

            {/* Quick Audit Link CTA below chart */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/70 p-3.5 sm:p-4 rounded-xl border border-emerald-500/30">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm">
                <span className="text-xl">🛡️</span>
                <span className="text-slate-200 font-medium">
                  Confira a auditoria retroativa com taxas de acertos e erros dos palpites:
                </span>
              </div>
              <button
                onClick={() => setActiveSubTab('auditoria')}
                className="px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-sm"
              >
                Ver Taxa de Acertos das Dicas →
              </button>
            </div>
          </div>
        )}

        {/* View 2: Top Dezenas */}
        {activeSubTab === 'dezenas' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Top 10 Dezenas Mais Sorteadas nos Prêmios Oficiais
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 font-medium">
                Incidência direta nas duas últimas posições dos bilhetes de 1º a 5º prêmio.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {dezenaStats.maisFrequentes.map((item, index) => (
                <div
                  key={item.dezena}
                  className="bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3.5 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-slate-800 text-slate-100 text-xs font-mono font-black flex items-center justify-center shrink-0">
                      #{index + 1}
                    </span>
                    <div className="w-13 h-13 rounded-xl bg-emerald-950/70 border border-emerald-500/50 flex items-center justify-center font-mono text-2xl sm:text-3xl font-black text-emerald-300 shrink-0 shadow-sm">
                      {item.dezena}
                    </div>
                    <div>
                      <span className="text-base sm:text-lg font-black text-white block">
                        {item.nomeBicho}
                      </span>
                      <span className="text-xs sm:text-sm text-slate-200 font-bold">
                        Grupo {String(item.grupo).padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-lg sm:text-xl font-black font-mono text-amber-300 block tabular-nums">
                      {item.count} vezes
                    </span>
                    <span className="text-xs sm:text-sm text-slate-200 font-semibold">
                      {item.concursosAtrasada === 0 ? 'Saiu no último!' : `Atraso: ${item.concursosAtrasada} conc.`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/70 p-3.5 sm:p-4 rounded-xl border border-emerald-500/30">
              <span className="text-xs sm:text-sm text-slate-200 font-medium">
                🛡️ As dezenas quentes alimentam as dicas de 3 Peças do Furreco:
              </span>
              <button
                onClick={() => setActiveSubTab('auditoria')}
                className="px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-sm"
              >
                Ver Auditoria de Acertos →
              </button>
            </div>
          </div>
        )}

        {/* View 3: Atrasômetro da Federal (Completo, Auditado e Interativo) */}
        {activeSubTab === 'atrasometro' && (
          <div className="space-y-4 sm:space-y-5">
            {/* Header & Description */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-base sm:text-xl font-black text-white flex items-center gap-2">
                  <Snowflake className="w-5 h-5 text-cyan-400 animate-pulse" />
                  Atrasômetro Oficial da Loteria Federal
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 mt-1 font-medium leading-relaxed">
                  Mapeamento em tempo real das dezenas, grupos de bichos e finais com maior tempo sem sair.
                  Base auditada dos sorteios oficiais da Caixa Econômica Federal.
                </p>
              </div>

              {/* Action buttons: Copy List & Live Indicator */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyTopList}
                  className="px-3 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Copiar lista resumida das maiores defasagens para WhatsApp ou anotações"
                >
                  {copiedListMessage ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Lista Copiada!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Top 10</span>
                    </>
                  )}
                </button>

                <div className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 hidden sm:flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
                  <span>Base #{latestContestNum}</span>
                </div>
              </div>
            </div>

            {/* Quick KPI Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
              <div className="bg-slate-950/80 border border-cyan-900/40 rounded-xl p-3">
                <span className="text-[11px] font-bold text-cyan-300 block uppercase tracking-wide">
                  Dezena Mais Fria
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <strong className="text-2xl sm:text-3xl font-black font-mono text-white">
                    {atrasoDezenaStats.maisAtrasadas[0]?.dezena || '--'}
                  </strong>
                  <span className="text-xs text-slate-300 font-bold">
                    {atrasoDezenaStats.maisAtrasadas[0]?.nomeBicho || ''}
                  </span>
                </div>
                <span className="text-[11px] text-cyan-400 font-semibold block mt-0.5">
                  {atrasoDezenaStats.maisAtrasadas[0]?.concursosAtrasada || 0} concursos sem sair
                </span>
              </div>

              <div className="bg-slate-950/80 border border-amber-900/40 rounded-xl p-3">
                <span className="text-[11px] font-bold text-amber-300 block uppercase tracking-wide">
                  Bicho Mais Atrasado
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <strong className="text-2xl sm:text-3xl font-black text-white">
                    {atrasoAnimalStats[0]?.emoji} {atrasoAnimalStats[0]?.nome || '--'}
                  </strong>
                </div>
                <span className="text-[11px] text-amber-400 font-semibold block mt-0.5">
                  Grupo {String(atrasoAnimalStats[0]?.grupo || 0).padStart(2, '0')} · {atrasoAnimalStats[0]?.concursosAtrasado || 0} conc.
                </span>
              </div>

              <div className="bg-slate-950/80 border border-emerald-900/40 rounded-xl p-3">
                <span className="text-[11px] font-bold text-emerald-300 block uppercase tracking-wide">
                  Amostra Caixa
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <strong className="text-2xl sm:text-3xl font-black font-mono text-white">
                    {totalAnalyzed}
                  </strong>
                  <span className="text-xs text-slate-300 font-bold">concursos</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold block mt-0.5">
                  {totalAnalyzed * 5} prêmios auditados
                </span>
              </div>

              <div className="bg-slate-950/80 border border-rose-900/40 rounded-xl p-3">
                <span className="text-[11px] font-bold text-rose-300 block uppercase tracking-wide">
                  Alertas Críticos
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <strong className="text-2xl sm:text-3xl font-black font-mono text-rose-400">
                    {atrasoCategory === 'dezenas'
                      ? atrasoDezenaStats.todas.filter(d => getDezenaSeverity(d.concursosAtrasada, atrasoScope).type === 'critico').length
                      : atrasoCategory === 'bichos'
                        ? atrasoAnimalStats.filter(a => getAnimalSeverity(a.concursosAtrasado, atrasoScope).type === 'critico').length
                        : atrasoFinalStats.filter(f => getFinalSeverity(f.concursosAtrasado, atrasoScope).type === 'critico').length}
                  </strong>
                  <span className="text-xs text-rose-300 font-bold">em alta defasagem</span>
                </div>
                <span className="text-[11px] text-rose-400/90 font-semibold block mt-0.5">
                  Pressão estatística de ciclo
                </span>
              </div>
            </div>

            {/* Controls Bar: Category Selector + Scope Selector (1-5 vs Cabeça) */}
            <div className="bg-slate-950 p-2 sm:p-3 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                {/* 1. Category Switcher */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => {
                      setAtrasoCategory('dezenas');
                      setShowAllDezenas(false);
                    }}
                    className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      atrasoCategory === 'dezenas'
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>🔢</span>
                    <span>Dezenas (00-99)</span>
                  </button>

                  <button
                    onClick={() => setAtrasoCategory('bichos')}
                    className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      atrasoCategory === 'bichos'
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>🐾</span>
                    <span>25 Bichos</span>
                  </button>

                  <button
                    onClick={() => setAtrasoCategory('finais')}
                    className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      atrasoCategory === 'finais'
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>🎯</span>
                    <span>Finais (0-9)</span>
                  </button>
                </div>

                {/* 2. Prize Scope Toggle (Geral vs Na Cabeça) */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
                  <span className="text-[11px] font-bold text-slate-400 px-2 hidden xs:inline">Faixa:</span>
                  <button
                    onClick={() => setAtrasoScope('geral')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      atrasoScope === 'geral'
                        ? 'bg-emerald-600 text-white font-black shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                    title="Análise em todos os 5 prêmios da Loteria Federal (Cercado)"
                  >
                    1º ao 5º Prêmio (Geral)
                  </button>
                  <button
                    onClick={() => setAtrasoScope('cabeca')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      atrasoScope === 'cabeca'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                    title="Análise restrita exclusivamente ao 1º Prêmio (Na Cabeça)"
                  >
                    1º Prêmio (Na Cabeça)
                  </button>
                </div>
              </div>

              {/* Search input + Severity Filter Pills */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-900">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={atrasoSearch}
                    onChange={e => setAtrasoSearch(e.target.value)}
                    placeholder={
                      atrasoCategory === 'dezenas'
                        ? 'Buscar dezena (ex: 74, 92), animal ou grupo...'
                        : atrasoCategory === 'bichos'
                          ? 'Buscar animal (ex: Leão, Águia, Urso) ou grupo...'
                          : 'Buscar dígito final (0 a 9)...'
                    }
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-medium"
                  />
                  {atrasoSearch && (
                    <button
                      onClick={() => setAtrasoSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Severity filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                  <button
                    onClick={() => setAtrasoSeverityFilter('all')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                      atrasoSeverityFilter === 'all'
                        ? 'bg-slate-200 text-slate-950 font-black'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setAtrasoSeverityFilter('critico')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all border ${
                      atrasoSeverityFilter === 'critico'
                        ? 'bg-rose-500 text-white font-black border-rose-400'
                        : 'text-rose-300 hover:bg-rose-950/40 border-rose-500/30'
                    }`}
                  >
                    ❄️ Crítico
                  </button>
                  <button
                    onClick={() => setAtrasoSeverityFilter('alto')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all border ${
                      atrasoSeverityFilter === 'alto'
                        ? 'bg-amber-400 text-slate-950 font-black border-amber-300'
                        : 'text-amber-300 hover:bg-amber-950/40 border-amber-500/30'
                    }`}
                  >
                    ⚠️ Alto
                  </button>
                  <button
                    onClick={() => setAtrasoSeverityFilter('moderado')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all border ${
                      atrasoSeverityFilter === 'moderado'
                        ? 'bg-cyan-500 text-slate-950 font-black border-cyan-400'
                        : 'text-cyan-300 hover:bg-cyan-950/40 border-cyan-500/30'
                    }`}
                  >
                    Moderado
                  </button>
                  <button
                    onClick={() => setAtrasoSeverityFilter('recente')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all border ${
                      atrasoSeverityFilter === 'recente'
                        ? 'bg-emerald-600 text-white font-black border-emerald-400'
                        : 'text-emerald-300 hover:bg-emerald-950/40 border-emerald-500/30'
                    }`}
                  >
                    Recente
                  </button>
                </div>
              </div>
            </div>

            {/* CATEGORY 1: DEZENAS (00-99) */}
            {atrasoCategory === 'dezenas' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300 font-semibold px-1">
                  <span>
                    Exibindo {atrasoSearch.trim() || showAllDezenas ? filteredDezenas.length : Math.min(12, filteredDezenas.length)} de {filteredDezenas.length} dezenas
                  </span>
                  <span className="text-cyan-400 font-bold">
                    {atrasoScope === 'cabeca' ? 'Escopo: 1º Prêmio' : 'Escopo: 1º ao 5º Prêmio'}
                  </span>
                </div>

                {filteredDezenas.length === 0 ? (
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-2">
                    <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                    <p className="text-sm font-bold text-white">Nenhuma dezena encontrada com esses filtros.</p>
                    <p className="text-xs">Tente buscar por outro número ou alterar o filtro de gravidade.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(atrasoSearch.trim() || showAllDezenas ? filteredDezenas : filteredDezenas.slice(0, 12)).map((item, index) => {
                      const severity = getDezenaSeverity(item.concursosAtrasada, atrasoScope);
                      return (
                        <div
                          key={item.dezena}
                          className={`bg-slate-950/90 border rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between gap-3 transition-all hover:border-cyan-600/70 shadow-md ${
                            severity.type === 'critico'
                              ? 'border-rose-500/40 bg-rose-950/15'
                              : severity.type === 'alto'
                                ? 'border-amber-500/35 bg-amber-950/10'
                                : 'border-slate-800/90 hover:bg-slate-900/60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            {/* Left: Rank + Number badge + Animal Info */}
                            <div className="flex items-center gap-3">
                              <span className="w-7 h-7 rounded-full bg-slate-800 text-cyan-300 text-xs font-mono font-black flex items-center justify-center shrink-0">
                                #{index + 1}
                              </span>

                              <div className="w-13 h-13 rounded-2xl bg-cyan-950/80 border-2 border-cyan-400/60 flex items-center justify-center font-mono text-2xl sm:text-3xl font-black text-cyan-300 shrink-0 shadow-inner">
                                {item.dezena}
                              </div>

                              <div>
                                <span className="text-base sm:text-lg font-black text-white block leading-tight">
                                  {item.nomeBicho}
                                </span>
                                <span className="text-xs text-slate-300 font-bold">
                                  Grupo {String(item.grupo).padStart(2, '0')}
                                </span>
                              </div>
                            </div>

                            {/* Right: Severity Badge + Delay Count */}
                            <div className="text-right shrink-0">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black border uppercase mb-1 ${severity.color}`}>
                                {severity.label}
                              </span>

                              <span className="text-base sm:text-lg font-black font-mono text-white block">
                                {item.concursosAtrasada === 0
                                  ? 'Saiu no último!'
                                  : item.concursosAtrasada === 1
                                    ? '1 concurso'
                                    : `${item.concursosAtrasada} concursos`}
                              </span>

                              <span className="text-xs text-slate-300 font-semibold block">
                                {item.lastSeenContest > 0 && !item.isNeverSeenInSample
                                  ? `Conc. #${item.lastSeenContest} (${item.lastSeenDate || ''})`
                                  : `+${totalAnalyzed} conc. (Estimativa histórica)`}
                              </span>
                            </div>
                          </div>

                          {/* Action footer inside card */}
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                            <span className="text-[11px] text-slate-400 font-medium">
                              {item.count > 0 ? `${item.count}x na amostra analisada` : 'Sem saída recente'}
                            </span>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() =>
                                  handleCopyItem(
                                    `Dezena ${item.dezena} (${item.nomeBicho} - Grupo ${String(item.grupo).padStart(2, '0')}) · Atraso de ${item.concursosAtrasada} concursos na Loteria Federal`,
                                    `dez-${item.dezena}`
                                  )
                                }
                                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                                title="Copiar informações"
                              >
                                {copiedId === `dez-${item.dezena}` ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-300">Copiado</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 text-slate-400" />
                                    <span>Copiar</span>
                                  </>
                                )}
                              </button>

                              {onNavigateToTab && (
                                <button
                                  onClick={() => {
                                    if (onSelectDezena) onSelectDezena(item.dezena);
                                    onNavigateToTab('generator');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 hover:text-white border border-emerald-500/40 text-[11px] font-black flex items-center gap-1 cursor-pointer transition-all"
                                  title="Gerar palpite com esta dezena atrasada"
                                >
                                  <Sparkles className="w-3 h-3 text-amber-300" />
                                  <span>Palpite</span>
                                </button>
                              )}

                              {onNavigateToTab && (
                                <button
                                  onClick={() => {
                                    if (onSelectDezena) onSelectDezena(item.dezena);
                                    onNavigateToTab('milhar');
                                  }}
                                  className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                                  title="Ver estatísticas completas de milhar"
                                >
                                  <Target className="w-3 h-3 text-cyan-400" />
                                  <span>Milhar</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Show all / Show less toggle */}
                {!atrasoSearch.trim() && filteredDezenas.length > 12 && (
                  <div className="text-center pt-2">
                    <button
                      onClick={() => setShowAllDezenas(!showAllDezenas)}
                      className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                    >
                      {showAllDezenas ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          <span>Mostrar Apenas as Top 12 Mais Atrasadas</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          <span>Ver Todas as 100 Dezenas da Federal (00 a 99)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* CATEGORY 2: 25 BICHOS (GRUPOS 01 A 25) */}
            {atrasoCategory === 'bichos' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300 font-semibold px-1">
                  <span>
                    Exibindo {filteredAnimals.length} de 25 grupos de animais da Federal
                  </span>
                  <span className="text-cyan-400 font-bold">
                    {atrasoScope === 'cabeca' ? 'Escopo: 1º Prêmio (Cabeça)' : 'Escopo: 1º ao 5º Prêmio'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredAnimals.map((item, index) => {
                    const severity = getAnimalSeverity(item.concursosAtrasado, atrasoScope);
                    return (
                      <div
                        key={item.grupo}
                        className={`bg-slate-950/90 border rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between gap-3 transition-all hover:border-cyan-600/70 shadow-md ${
                          severity.type === 'critico'
                            ? 'border-rose-500/40 bg-rose-950/15'
                            : severity.type === 'alto'
                              ? 'border-amber-500/35 bg-amber-950/10'
                              : 'border-slate-800/90 hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-full bg-slate-800 text-cyan-300 text-xs font-mono font-black flex items-center justify-center shrink-0">
                              #{index + 1}
                            </span>

                            <div className="text-3xl sm:text-4xl shrink-0 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
                              {item.emoji}
                            </div>

                            <div>
                              <span className="text-base sm:text-lg font-black text-white block leading-tight">
                                {item.nome}
                              </span>
                              <span className="text-xs text-slate-300 font-bold block">
                                Grupo {String(item.grupo).padStart(2, '0')}
                              </span>
                              <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                                Dez: {item.dezenas.join(' · ')}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black border uppercase mb-1 ${severity.color}`}>
                              {severity.label}
                            </span>

                            <span className="text-base sm:text-lg font-black font-mono text-white block">
                              {item.concursosAtrasado === 0
                                ? 'Saiu no último!'
                                : item.concursosAtrasado === 1
                                  ? '1 concurso'
                                  : `${item.concursosAtrasado} concursos`}
                            </span>

                            <span className="text-xs text-slate-300 font-semibold block">
                              {item.lastSeenContest > 0 && !item.isNeverSeenInSample
                                ? `Conc. #${item.lastSeenContest} (${item.lastSeenDate})`
                                : `Sem saída em +${totalAnalyzed} conc.`}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                          <span className="text-[11px] text-slate-400 font-medium">
                            {item.totalHits}x no total ({item.cabecaHits}x na cabeça)
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() =>
                                handleCopyItem(
                                  `Grupo ${String(item.grupo).padStart(2, '0')} (${item.nome} ${item.emoji}) - Dezenas: ${item.dezenas.join(', ')} · Atraso de ${item.concursosAtrasado} concursos na Federal`,
                                  `bicho-${item.grupo}`
                                )
                              }
                              className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                            >
                              {copiedId === `bicho-${item.grupo}` ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-300">Copiado</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-slate-400" />
                                  <span>Copiar</span>
                                </>
                              )}
                            </button>

                            {onNavigateToTab && (
                              <button
                                onClick={() => {
                                  if (onSelectDezena) onSelectDezena(item.dezenas[0]);
                                  onNavigateToTab('generator');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 hover:text-white border border-emerald-500/40 text-[11px] font-black flex items-center gap-1 cursor-pointer transition-all"
                              >
                                <Sparkles className="w-3 h-3 text-amber-300" />
                                <span>Palpite</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CATEGORY 3: FINAIS (0 A 9) */}
            {atrasoCategory === 'finais' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300 font-semibold px-1">
                  <span>Exibindo 10 Dígitos Finais (0 a 9) da Loteria Federal</span>
                  <span className="text-cyan-400 font-bold">
                    {atrasoScope === 'cabeca' ? 'Escopo: 1º Prêmio (Terminação Principal)' : 'Escopo: 1º ao 5º Prêmio'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  {filteredFinals.map((item, index) => {
                    const severity = getFinalSeverity(item.concursosAtrasado, atrasoScope);
                    return (
                      <div
                        key={item.digit}
                        className={`bg-slate-950/90 border rounded-2xl p-3.5 text-center flex flex-col items-center justify-between gap-2.5 transition-all hover:border-cyan-500 shadow-md ${
                          severity.type === 'critico'
                            ? 'border-rose-500/50 bg-rose-950/20'
                            : severity.type === 'alto'
                              ? 'border-amber-500/40 bg-amber-950/15'
                              : 'border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11px] font-mono font-bold text-slate-400">
                            #{index + 1}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-black uppercase border ${severity.color}`}>
                            {severity.label}
                          </span>
                        </div>

                        <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border-2 border-cyan-400/50 flex items-center justify-center font-mono text-3xl font-black text-cyan-300 shadow-inner my-1">
                          {item.digit}
                        </div>

                        <div>
                          <strong className="text-sm font-bold text-white block">
                            Final {item.digit}
                          </strong>
                          <span className="text-xs font-mono font-black text-cyan-300 block">
                            {item.concursosAtrasado === 0
                              ? 'Saiu no último!'
                              : item.concursosAtrasado === 1
                                ? '1 conc. atrás'
                                : `${item.concursosAtrasado} conc. atrás`}
                          </span>
                        </div>

                        <div className="w-full pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                          {item.totalHits}x na amostra
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Educational & Responsible Gaming Footer */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white block font-bold mb-0.5">
                    Como funciona a teoria do Atrasômetro na Loteria Federal:
                  </strong>
                  Na teoria das probabilidades, cada concurso é um evento independente. No entanto, em séries temporais longas,
                  a Lei dos Grandes Números indica que frequências tendem à média teórica (regressão à média).
                  O Atrasômetro é uma ferramenta analítica de suporte, sem garantia de resultado. Jogue com moderação (+18).
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                <span className="text-xs text-slate-400 font-medium">
                  🛡️ Acompanhe o histórico de acertos das dezenas atrasadas:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveSubTab('auditoria')}
                    className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-sm"
                  >
                    Ver Auditoria de Acertos →
                  </button>
                  {onNavigateToTab && (
                    <button
                      onClick={() => onNavigateToTab('responsible')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-sm"
                    >
                      Apostas Conscientes (+18)
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View 4: 25 Grupos do Bicho */}
        {activeSubTab === 'bichos' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Tabela Oficial dos 25 Grupos da Loteria Federal
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 font-medium">
                Classificação dos 25 animais tradicionais associados às dezenas finais do 1º prêmio.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
              {animalStats.map(item => (
                <div
                  key={item.grupo}
                  className={`bg-slate-950/80 border rounded-xl p-3.5 flex flex-col items-center text-center transition-all ${
                    item.count > 0
                      ? 'border-emerald-500/50 bg-emerald-950/30 shadow-md ring-1 ring-emerald-500/20'
                      : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <span className="text-4xl sm:text-5xl mb-1.5">{item.emoji}</span>
                  <span className="text-base sm:text-lg font-black text-white leading-tight">
                    {item.nome}
                  </span>
                  <span className="text-xs sm:text-sm font-mono text-slate-200 font-bold mt-0.5">
                    Grupo {String(item.grupo).padStart(2, '0')}
                  </span>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 w-full flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-200 font-semibold">1º Prêmio:</span>
                    <strong className="font-mono text-amber-300 text-base font-black">{item.count}x</strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/70 p-3.5 sm:p-4 rounded-xl border border-emerald-500/30">
              <span className="text-xs sm:text-sm text-slate-200 font-medium">
                🐾 Compare a pontuação dos 25 grupos com o histórico de acertos:
              </span>
              <button
                onClick={() => setActiveSubTab('auditoria')}
                className="px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-sm"
              >
                Ver Auditoria de Acertos →
              </button>
            </div>
          </div>
        )}

        {/* View 5: Auditoria Completa de Taxas de Acertos e Erros (Apostas Conscientes) */}
        {activeSubTab === 'auditoria' && (
          <div className="space-y-4 animate-fadeIn">
            <ResponsibleTipsAccuracyCard
              contests={contests}
              onNavigateToTab={onNavigateToTab}
            />
          </div>
        )}
      </div>
    </div>
  );
};

