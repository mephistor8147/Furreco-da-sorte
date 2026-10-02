// furreco da sorte
import React, { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Search,
  Sparkles,
  Award,
  Calendar,
  Clock,
  Flame,
  CheckCircle2,
  Copy,
  Check,
  Shuffle,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Percent,
  Layers,
  ArrowRight,
  ShieldAlert,
  X,
  Calculator,
  Trophy,
  Filter,
  ArrowUpRight,
  Coins,
  RefreshCw,
  Share2,
} from 'lucide-react';
import { LotteryContest } from '../types/lottery';
import {
  analyzeMilhar,
  formatCurrency,
  getMilharPermutations,
  getTopMilharesFromContests,
  getAnimalByDezena,
} from '../utils/lotteryUtils';

interface MilharLookupViewProps {
  contests: LotteryContest[];
  onPlayChime?: () => void;
  onNavigateToTab?: (
    tab: 'stats' | 'history' | 'generator' | 'weekly' | 'odds' | 'responsible' | 'milhar',
    subTab?: 'finais' | 'dezenas' | 'atrasometro' | 'bichos' | 'auditoria'
  ) => void;
  initialMilhar?: string;
  onSelectDezena?: (dezena: string) => void;
  highContrast?: boolean;
}

// Popular and recent thousands to suggest with contextual tags
const SUGGESTED_MILHARES = [
  { milhar: '8291', label: '1º Prêmio Concurso 5945', tag: 'Recente' },
  { milhar: '4918', label: 'Sorteada 2x (5944 e 5941)', tag: '2x Premiada' },
  { milhar: '3574', label: '1º Prêmio Concurso 5944', tag: 'Recente' },
  { milhar: '5923', label: '1º Prêmio Concurso 5943', tag: 'Recente' },
  { milhar: '3104', label: '2º Prêmio Concurso 5945', tag: 'Cercada' },
  { milhar: '2447', label: '1º Prêmio Concurso 5942', tag: 'Recente' },
  { milhar: '0000', label: 'Milhar da Vaca (Gr. 25)', tag: 'Especial' },
  { milhar: '7777', label: 'Milhar Quádrupla do Peru', tag: 'Curiosidade' },
];

export const MilharLookupView: React.FC<MilharLookupViewProps> = ({
  contests,
  onPlayChime,
  onNavigateToTab,
  initialMilhar,
  onSelectDezena,
}) => {
  const [inputMilhar, setInputMilhar] = useState('8291');
  const [searchedMilhar, setSearchedMilhar] = useState('8291');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<
    'concursos' | 'parciais' | 'inversao' | 'simulador' | 'ranking' | 'probabilidades'
  >('concursos');

  // Filters for sub-sections
  const [prizeFilter, setPrizeFilter] = useState<'todos' | 'cabeca' | 'cercada'>('todos');
  const [partialFilter, setPartialFilter] = useState<'todos' | 'centena' | 'dezena'>('todos');
  const [inversaoFilter, setInversaoFilter] = useState<'todas' | 'sorteadas' | 'ineditas'>('todas');
  const [rankingFilter, setRankingFilter] = useState<'todas' | 'multiplas' | 'cabeca'>('todas');

  // Simulator state
  const [simuladorValor, setSimuladorValor] = useState<number>(5.0);
  const [simuladorModalidade, setSimuladorModalidade] = useState<
    'cabeca' | 'cercada' | 'invertida_cabeca' | 'invertida_cercada' | 'combinada'
  >('cabeca');

  // Sync initialMilhar prop when provided or changed externally
  useEffect(() => {
    if (initialMilhar) {
      const clean = initialMilhar.replace(/\D/g, '').padStart(4, '0').slice(-4);
      setInputMilhar(clean);
      setSearchedMilhar(clean);
    }
  }, [initialMilhar]);

  // Compute full analysis for the searched milhar
  const analysis = useMemo(() => {
    return analyzeMilhar(searchedMilhar, contests);
  }, [searchedMilhar, contests]);

  // Compute all unique mathematical permutations for this milhar
  const permutations = useMemo(() => {
    return getMilharPermutations(searchedMilhar);
  }, [searchedMilhar]);

  // Top milhares across all loaded contests
  const topMilharesList = useMemo(() => {
    return getTopMilharesFromContests(contests);
  }, [contests]);

  // Cross-reference permutations with draw history
  const permutationsData = useMemo(() => {
    const drawMap = new Map<string, { concurso: number; ordem: number; isFirstPrize: boolean; data: string }[]>();
    contests.forEach(c => {
      c.premios.forEach(p => {
        const m = p.bilhete.slice(-4);
        const list = drawMap.get(m) || [];
        list.push({
          concurso: c.concurso,
          ordem: p.ordem,
          isFirstPrize: p.ordem === 1,
          data: c.data,
        });
        drawMap.set(m, list);
      });
    });

    return permutations.map(perm => {
      const draws = drawMap.get(perm) || [];
      const animal = getAnimalByDezena(perm.slice(-2));
      return {
        perm,
        animal,
        draws,
        totalHits: draws.length,
        hasFirstPrize: draws.some(d => d.isFirstPrize),
      };
    });
  }, [permutations, contests]);

  // Handle Search Submission
  const handleSearch = (milharToSearch?: string) => {
    const target = milharToSearch !== undefined ? milharToSearch : inputMilhar;
    const clean = target.replace(/\D/g, '').padStart(4, '0').slice(-4);
    setInputMilhar(clean);
    setSearchedMilhar(clean);

    if (onSelectDezena) {
      onSelectDezena(clean.slice(-2));
    }

    if (onPlayChime) onPlayChime();

    const result = analyzeMilhar(clean, contests);
    if (result.totalHits > 0) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#3b82f6'],
        });
      } catch {
        // ignore
      }
    }
  };

  // Generate random 4-digit milhar
  const handleRandomMilhar = () => {
    const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    setInputMilhar(rand);
    handleSearch(rand);
  };

  // Generic copy helper with temporary toast notification
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(label);
    if (onPlayChime) onPlayChime();
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  // Formatted share summary
  const handleShareSummary = () => {
    const statusText =
      analysis.totalHits > 0
        ? `Sorteada ${analysis.totalHits}x (${analysis.firstPrizeHits}x na cabeça)`
        : 'Inédita nos concursos recentes';

    const text = `🍀 *Furreco da Sorte - Auditoria da Milhar ${analysis.milhar}*\n` +
      `🐾 Bicho: ${analysis.animal.nome} ${analysis.animal.emoji} (Grupo ${analysis.animal.grupo})\n` +
      `📊 Frequência: ${statusText}\n` +
      `⏱️ Atraso: ${analysis.concursosAtraso} concursos\n` +
      `🎯 Probabilidade: 1 em 10.000 (0,01%) Cabeça | 1 em 2.000 (0,05%) Cercada\n` +
      `🔍 Conferido na Loteria Federal via Furreco da Sorte`;

    handleCopyText(text, 'Resumo copiado para o WhatsApp!');
  };

  // Palpite generator action
  const handleGenerateTicketAction = () => {
    const ticketText = `Bilhete Sugerido: Milhar ${analysis.milhar} | Centena ${analysis.centena} | Grupo ${analysis.animal.grupo} (${analysis.animal.nome})`;
    handleCopyText(ticketText, 'Palpite gerado e copiado!');
    if (onNavigateToTab) {
      setTimeout(() => {
        onNavigateToTab('generator');
      }, 400);
    }
  };

  // Filtered occurrences
  const filteredOccurrences = useMemo(() => {
    if (prizeFilter === 'cabeca') {
      return analysis.occurrences.filter(o => o.isFirstPrize);
    }
    if (prizeFilter === 'cercada') {
      return analysis.occurrences.filter(o => !o.isFirstPrize);
    }
    return analysis.occurrences;
  }, [analysis.occurrences, prizeFilter]);

  // Filtered partials
  const filteredPartials = useMemo(() => {
    if (partialFilter === 'centena') {
      return analysis.partialOccurrences.filter(p => p.matchedType === 'centena');
    }
    if (partialFilter === 'dezena') {
      return analysis.partialOccurrences.filter(p => p.matchedType === 'dezena');
    }
    return analysis.partialOccurrences;
  }, [analysis.partialOccurrences, partialFilter]);

  // Filtered permutations
  const filteredPermutations = useMemo(() => {
    if (inversaoFilter === 'sorteadas') {
      return permutationsData.filter(p => p.totalHits > 0);
    }
    if (inversaoFilter === 'ineditas') {
      return permutationsData.filter(p => p.totalHits === 0);
    }
    return permutationsData;
  }, [permutationsData, inversaoFilter]);

  // Filtered ranking
  const filteredRanking = useMemo(() => {
    if (rankingFilter === 'multiplas') {
      return topMilharesList.filter(t => t.totalHits >= 2);
    }
    if (rankingFilter === 'cabeca') {
      return topMilharesList.filter(t => t.firstPrizeHits > 0);
    }
    return topMilharesList;
  }, [topMilharesList, rankingFilter]);

  // Simulator calculation
  const simuladorCalculation = useMemo(() => {
    const numPerms = permutations.length;
    let multiplier = 4000;
    let probabilityText = '1 em 10.000 (0,01%)';
    let modalidadeLabel = 'Milhar na Cabeça (1º Prêmio)';
    let custoPorCombinacao = simuladorValor;

    if (simuladorModalidade === 'cabeca') {
      multiplier = 4000;
      probabilityText = '1 em 10.000 (0,01%)';
      modalidadeLabel = 'Milhar Seca / Cabeça (1º Prêmio)';
    } else if (simuladorModalidade === 'cercada') {
      multiplier = 800;
      probabilityText = '1 em 2.000 (0,05%)';
      modalidadeLabel = 'Milhar Cercada (1º ao 5º Prêmio)';
    } else if (simuladorModalidade === 'invertida_cabeca') {
      multiplier = 4000 / numPerms;
      probabilityText = `${numPerms} em 10.000 (${((numPerms / 10000) * 100).toFixed(2)}%)`;
      modalidadeLabel = `Milhar Invertida na Cabeça (${numPerms} combinações)`;
      custoPorCombinacao = simuladorValor / numPerms;
    } else if (simuladorModalidade === 'invertida_cercada') {
      multiplier = 800 / numPerms;
      probabilityText = `${numPerms} em 2.000 (${((numPerms / 2000) * 100).toFixed(2)}%)`;
      modalidadeLabel = `Milhar Invertida do 1º ao 5º (${numPerms} combinações)`;
      custoPorCombinacao = simuladorValor / numPerms;
    } else if (simuladorModalidade === 'combinada') {
      multiplier = 2000; // Milhar 1º ao 5º + Centena
      probabilityText = 'Múltiplas Faixas de Premiação';
      modalidadeLabel = 'Milhar e Centena Combinadas';
    }

    const premioBruto = simuladorValor * multiplier;
    const lucroLiquido = premioBruto - simuladorValor;

    return {
      multiplier,
      premioBruto,
      lucroLiquido,
      probabilityText,
      modalidadeLabel,
      custoPorCombinacao,
      numPerms,
    };
  }, [simuladorValor, simuladorModalidade, permutations.length]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Toast Notification for Copies and Actions */}
      {copiedNotification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 stroke-[3]" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* Header Banner & Search Controls */}
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-emerald-950/80 border border-amber-500/30 rounded-2xl p-3.5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30">
                <Search className="w-3.5 h-3.5" />
                Auditoria de Milhar Específica
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {contests.length} Concursos · {contests.length * 5} Prêmios
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-white mt-1.5 flex items-center gap-2">
              <span>Auditoria e Frequência de Milhar</span>
              <span className="text-amber-400 text-lg">🍀</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Consulte qualquer número de 4 dígitos (0000 a 9999). Saiba se a milhar já saiu na cabeça ou
              nos 5 prêmios, desdobre em milhar invertida, simule cotações e verifique o atraso.
            </p>
          </div>

          {/* Quick Random Generator Button */}
          <button
            onClick={handleRandomMilhar}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0 min-h-[44px]"
            title="Sortear uma milhar aleatória de 0000 a 9999"
          >
            <Shuffle className="w-4 h-4 text-amber-400" />
            <span>Sortear Aleatória</span>
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-amber-400" />
              </div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={inputMilhar}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  setInputMilhar(val);
                }}
                placeholder="Digite a milhar (ex: 8291, 4918, 3574)"
                className="w-full pl-11 pr-20 py-3 bg-slate-950/90 border-2 border-slate-700 focus:border-amber-400 rounded-xl text-white font-mono text-lg font-black tracking-widest placeholder:text-slate-500 placeholder:text-xs sm:placeholder:text-sm placeholder:font-sans placeholder:tracking-normal focus:outline-none transition-colors min-h-[44px]"
              />
              <div className="absolute inset-y-0 right-2.5 flex items-center gap-1.5">
                {inputMilhar.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setInputMilhar('')}
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Limpar"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <span className="text-[11px] font-mono text-slate-400 pointer-events-none">
                  {inputMilhar.length}/4
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="py-3 px-5 sm:px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
              <span>Consultar Milhar</span>
            </button>
          </form>

          {/* Quick Suggestions Chips with horizontal scroll on small devices */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 shrink-0 mr-1">
              Sugestões rápidas:
            </span>
            {SUGGESTED_MILHARES.map(item => (
              <button
                key={item.milhar}
                onClick={() => handleSearch(item.milhar)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border shrink-0 min-h-[32px] flex items-center gap-1 active:scale-95 ${
                  searchedMilhar === item.milhar
                    ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:border-slate-600'
                }`}
                title={item.label}
              >
                <span>{item.milhar}</span>
                <span className="text-[9px] font-sans font-normal opacity-75 hidden xs:inline">
                  ({item.tag})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Analysis Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-6 shadow-xl space-y-5 sm:space-y-6">
        {/* Milhar Identity Strip */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-3.5 sm:p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            {/* Visual Milhar Digits Display */}
            <div className="flex items-center gap-1">
              {analysis.milhar.split('').map((digit, i) => (
                <div
                  key={i}
                  className="w-9 h-11 sm:w-11 sm:h-13 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-amber-400/60 flex items-center justify-center font-mono font-black text-xl sm:text-2xl text-amber-300 shadow-inner"
                >
                  {digit}
                </div>
              ))}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-white">
                  Milhar {analysis.milhar}
                </span>
                <button
                  onClick={() => handleCopyText(analysis.milhar, 'Milhar copiada!')}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Copiar Milhar"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-400 flex flex-wrap items-center gap-1.5">
                <span>
                  Centena:{' '}
                  <strong className="text-white font-mono">{analysis.centena}</strong>
                </span>
                <span>·</span>
                <span>
                  Dezena:{' '}
                  <strong className="text-white font-mono">{analysis.dezena}</strong>
                </span>
              </p>
            </div>
          </div>

          {/* Animal representation of this milhar with interactive actions */}
          <div className="flex items-center justify-between sm:justify-start gap-3 bg-slate-900/90 p-2.5 sm:px-4 sm:py-2.5 rounded-xl border border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl sm:text-3xl">{analysis.animal.emoji}</span>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Bicho Correspondente
                </span>
                <strong className="text-white text-xs sm:text-sm font-bold block">
                  {analysis.animal.nome} (Grupo {analysis.animal.grupo})
                </strong>
                <span className="text-[10px] text-slate-400 font-mono">
                  Dezenas: {analysis.animal.dezenas.join(', ')}
                </span>
              </div>
            </div>

            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('stats', 'atrasometro')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-bold transition-all border border-slate-700 cursor-pointer shrink-0"
                title="Ver grupo deste animal no Atrasômetro"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Action Ribbon: Quick Tools for this Milhar */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
          <button
            onClick={() => handleCopyText(analysis.milhar, 'Milhar copiada!')}
            className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 active:scale-95 border border-slate-800 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px]"
          >
            <Copy className="w-3.5 h-3.5 text-amber-400" />
            <span>Copiar Milhar</span>
          </button>

          <button
            onClick={handleGenerateTicketAction}
            className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-emerald-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 active:scale-95 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px]"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Palpite Furreco</span>
          </button>

          <button
            onClick={() => setActiveSubTab('inversao')}
            className={`flex-1 sm:flex-none px-3 py-2 rounded-xl active:scale-95 border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] ${
              activeSubTab === 'inversao'
                ? 'bg-amber-400 text-slate-950 border-amber-400'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-800'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Inverter Milhar ({permutations.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('simulador')}
            className={`flex-1 sm:flex-none px-3 py-2 rounded-xl active:scale-95 border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] ${
              activeSubTab === 'simulador'
                ? 'bg-amber-400 text-slate-950 border-amber-400'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-800'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulador de Retorno</span>
          </button>

          <button
            onClick={handleShareSummary}
            className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 active:scale-95 border border-slate-800 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px]"
            title="Copiar relatório formatado para WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Compartilhar</span>
          </button>
        </div>

        {/* 4 Primary KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* KPI 1: Quantas vezes foi sorteada */}
          <div
            onClick={() => setActiveSubTab('concursos')}
            className="p-3.5 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Vezes Sorteada
              </span>
              <Award className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="my-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                  {analysis.totalHits}
                </span>
                <span className="text-xs text-slate-400">
                  {analysis.totalHits === 1 ? 'vez' : 'vezes'}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {analysis.firstPrizeHits > 0
                  ? `🏆 ${analysis.firstPrizeHits}x na cabeça (1º prêmio)`
                  : 'Nenhuma na cabeça'}
                {analysis.secondaryPrizeHits > 0 && ` · ${analysis.secondaryPrizeHits}x nos 2º-5º`}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                  analysis.totalHits >= 2
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    : analysis.totalHits === 1
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {analysis.totalHits >= 2
                  ? '🔥 Múltiplas Saídas'
                  : analysis.totalHits === 1
                  ? '✨ Premiada'
                  : '⏳ Inédita no Período'}
              </span>
              <span className="text-[10px] text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Ver concursos →
              </span>
            </div>
          </div>

          {/* KPI 2: Taxa de Frequência Observada */}
          <div
            onClick={() => setActiveSubTab('probabilidades')}
            className="p-3.5 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Taxa de Frequência
              </span>
              <Percent className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="my-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                  {analysis.contestFrequencyPercent.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-400">dos concursos</span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {analysis.totalHits} de {analysis.totalContestsAnalyzed} concursos ({analysis.prizeFrequencyPercent.toFixed(2)}% dos bilhetes)
              </span>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <span>Média esperada:</span>
              <span className="font-mono text-slate-300 font-semibold">0,050%</span>
            </div>
          </div>

          {/* KPI 3: Probabilidade Próximo Sorteio */}
          <div
            onClick={() => setActiveSubTab('simulador')}
            className="p-3.5 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Probabilidade
              </span>
              <TrendingUp className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="my-2 space-y-1">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>1º Prêmio:</span>
                <span className="font-mono text-amber-300">1 em 10.000</span>
              </div>
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>Cercada (1º-5º):</span>
                <span className="font-mono text-emerald-300">1 em 2.000</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Cotação: ~4.000x</span>
              <span className="text-[10px] text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Simular →
              </span>
            </div>
          </div>

          {/* KPI 4: Atraso / Ciclo */}
          <div
            onClick={() => {
              if (onNavigateToTab) {
                onNavigateToTab('stats', 'atrasometro');
              }
            }}
            className="p-3.5 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Atraso / Ciclo
              </span>
              <Clock className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="my-2">
              {analysis.lastSeenContest ? (
                <>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-purple-300">
                      {analysis.concursosAtraso}
                    </span>
                    <span className="text-xs text-slate-400">
                      {analysis.concursosAtraso === 1 ? 'concurso atrás' : 'concursos atrás'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Última saída: Concurso #{analysis.lastSeenContest}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-base sm:text-lg font-bold text-slate-300 block">
                    Sem saída recente
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Não saiu nos {analysis.totalContestsAnalyzed} concursos
                  </span>
                </>
              )}
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] text-purple-400 font-semibold">
                Abrir Atrasômetro Federal
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs Bar */}
        <div className="border-b border-slate-800 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveSubTab('concursos')}
            className={`pb-2.5 pt-1 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeSubTab === 'concursos'
                ? 'border-amber-400 text-amber-300 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Concursos Sorteados ({analysis.totalHits})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('inversao')}
            className={`pb-2.5 pt-1 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeSubTab === 'inversao'
                ? 'border-amber-400 text-amber-300 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Inversão de Milhar ({permutations.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('simulador')}
            className={`pb-2.5 pt-1 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeSubTab === 'simulador'
                ? 'border-amber-400 text-amber-300 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Simulador de Apostas</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ranking')}
            className={`pb-2.5 pt-1 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeSubTab === 'ranking'
                ? 'border-amber-400 text-amber-300 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Top Milhares Federal ({topMilharesList.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('parciais')}
            className={`pb-2.5 pt-1 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeSubTab === 'parciais'
                ? 'border-amber-400 text-amber-300 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Raio-X Centena & Dezena ({analysis.centenaHits + analysis.dezenaHits})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('probabilidades')}
            className={`pb-2.5 pt-1 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeSubTab === 'probabilidades'
                ? 'border-amber-400 text-amber-300 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Tabela de Cotações</span>
          </button>
        </div>

        {/* TAB 1: Concursos Sorteados */}
        {activeSubTab === 'concursos' && (
          <div className="space-y-4">
            {/* Filter Sub-Bar */}
            {analysis.occurrences.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 font-semibold mr-1">Filtrar por:</span>
                  <button
                    onClick={() => setPrizeFilter('todos')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      prizeFilter === 'todos'
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Todos ({analysis.occurrences.length})
                  </button>
                  <button
                    onClick={() => setPrizeFilter('cabeca')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      prizeFilter === 'cabeca'
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    1º Prêmio ({analysis.firstPrizeHits})
                  </button>
                  <button
                    onClick={() => setPrizeFilter('cercada')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      prizeFilter === 'cercada'
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    2º ao 5º ({analysis.secondaryPrizeHits})
                  </button>
                </div>

                <span className="text-xs text-slate-400 font-mono">
                  Valores Oficiais da Loteria Federal
                </span>
              </div>
            )}

            {filteredOccurrences.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {filteredOccurrences.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                      item.isFirstPrize
                        ? 'bg-gradient-to-br from-amber-950/60 to-slate-900 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            item.isFirstPrize
                              ? 'bg-amber-400 text-slate-950 font-black'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {item.ordem}º Prêmio {item.isFirstPrize ? '(Cabeça)' : ''}
                        </span>
                        <span className="text-xs font-mono font-bold text-white">
                          Concurso #{item.concurso}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {item.data} · {item.diaSemana}
                      </span>
                    </div>

                    {/* Ticket Visual Breakdown */}
                    <div className="flex items-center justify-between bg-slate-900/90 p-3 rounded-lg border border-slate-800 my-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Bilhete Completo (5 dígitos)</span>
                        <div className="font-mono text-lg font-black tracking-wider flex items-center gap-0.5 mt-0.5">
                          <span className="text-slate-500">{item.bilheteCompleto.charAt(0)}</span>
                          <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1 rounded">
                            {analysis.milhar}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Prêmio Oficial</span>
                        <strong className="text-emerald-400 font-mono text-sm block">
                          {formatCurrency(item.valorPremio)}
                        </strong>
                      </div>
                    </div>

                    {/* Extra context: animal & betting ratio & action buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                      <span className="flex items-center gap-1 text-slate-300">
                        <span>{item.animal.emoji}</span>
                        <span>{item.animal.nome} (Gr. {item.animal.grupo})</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyText(item.bilheteCompleto, 'Bilhete copiado!')}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold cursor-pointer transition-colors"
                          title="Copiar número do bilhete completo"
                        >
                          Copiar Bilhete
                        </button>
                        {onNavigateToTab && (
                          <button
                            onClick={() => onNavigateToTab('history')}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold cursor-pointer transition-colors"
                            title="Ver concurso completo no Histórico"
                          >
                            Ver Concurso
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 sm:p-8 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 mx-auto flex items-center justify-center text-slate-400">
                  <Clock className="w-6 h-6 text-amber-400/70" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="text-base font-bold text-white">
                    Milhar {analysis.milhar} não sorteada nesta amostragem
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Nenhum dos {analysis.totalContestsAnalyzed} concursos recentes sorteou a milhar exata{' '}
                    <strong className="text-amber-400 font-mono">{analysis.milhar}</strong>.
                    Isso é estatisticamente normal: como existem 10.000 milhares e saem apenas 5 por sorteio, são necessários em média 2.000 concursos para que todas saiam!
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => setActiveSubTab('inversao')}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Ver Inversões Desta Milhar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setActiveSubTab('parciais')}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Ver Centena ({analysis.centena}) e Dezena ({analysis.dezena})</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Inversão de Milhar (Permutador e Desdobramento) */}
        {activeSubTab === 'inversao' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  <span>Desdobramento: Milhar Invertida ({permutations.length} Combinações)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Todas as variações matemáticas formadas pelos 4 dígitos ({analysis.milhar.split('').join(', ')}).
                  Confira quais permutações já foram sorteadas na Federal!
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setInversaoFilter('todas')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    inversaoFilter === 'todas'
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Todas ({permutations.length})
                </button>
                <button
                  onClick={() => setInversaoFilter('sorteadas')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    inversaoFilter === 'sorteadas'
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Sorteadas ({permutationsData.filter(p => p.totalHits > 0).length})
                </button>
                <button
                  onClick={() => setInversaoFilter('ineditas')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    inversaoFilter === 'ineditas'
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Inéditas ({permutationsData.filter(p => p.totalHits === 0).length})
                </button>
              </div>
            </div>

            {/* Permutations Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {filteredPermutations.map(item => (
                <div
                  key={item.perm}
                  className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                    item.perm === searchedMilhar
                      ? 'bg-amber-950/40 border-amber-400/80 ring-1 ring-amber-400/50'
                      : item.totalHits > 0
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-base font-black text-white tracking-wider">
                        {item.perm}
                      </span>
                      <span className="text-base" title={`${item.animal.nome} (Gr. ${item.animal.grupo})`}>
                        {item.animal.emoji}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                      {item.animal.nome}
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    {item.totalHits > 0 ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {item.hasFirstPrize ? '🏆 1º Prêmio' : `✨ ${item.totalHits}x`}
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-500">Inédita</span>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyText(item.perm, `Milhar ${item.perm} copiada!`)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Copiar esta variação"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleSearch(item.perm)}
                        className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold transition-colors"
                        title="Inspecionar esta variação"
                      >
                        Ver
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Simulador de Apostas & Cotação */}
        {activeSubTab === 'simulador' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Simulador de Prêmio e Retorno Financeiro para a Milhar {analysis.milhar}
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Calcule o prêmio bruto, o lucro líquido e o custo por combinação de acordo com o valor
                que deseja apostar e a modalidade escolhida.
              </p>

              {/* Value Presets + Custom Input */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Valor da Aposta (R$):
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {[1, 2, 5, 10, 20, 50, 100].map(val => (
                    <button
                      key={val}
                      onClick={() => setSimuladorValor(val)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[36px] ${
                        simuladorValor === val
                          ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                          : 'bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      R$ {val},00
                    </button>
                  ))}
                  <div className="relative">
                    <span className="absolute inset-y-0 left-2.5 flex items-center text-xs text-slate-400 font-mono">
                      R$
                    </span>
                    <input
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={simuladorValor}
                      onChange={e => setSimuladorValor(Math.max(0.5, parseFloat(e.target.value) || 0))}
                      className="w-24 pl-8 pr-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs font-bold focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Modalidade Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Modalidade de Jogo:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  <button
                    onClick={() => setSimuladorModalidade('cabeca')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      simuladorModalidade === 'cabeca'
                        ? 'bg-amber-950/40 border-amber-400 ring-1 ring-amber-400/50'
                        : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-white block">1º Prêmio (Cabeça)</strong>
                      <span className="text-xs font-mono font-black text-amber-300">4.000x</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Premiação máxima se a milhar sair no 1º prêmio.
                    </span>
                  </button>

                  <button
                    onClick={() => setSimuladorModalidade('cercada')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      simuladorModalidade === 'cercada'
                        ? 'bg-amber-950/40 border-amber-400 ring-1 ring-amber-400/50'
                        : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-white block">Cercada (1º ao 5º)</strong>
                      <span className="text-xs font-mono font-black text-emerald-400">800x</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Concorre nos 5 prêmios oficiais da Caixa.
                    </span>
                  </button>

                  <button
                    onClick={() => setSimuladorModalidade('invertida_cabeca')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      simuladorModalidade === 'invertida_cabeca'
                        ? 'bg-amber-950/40 border-amber-400 ring-1 ring-amber-400/50'
                        : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-white block">Invertida Cabeça</strong>
                      <span className="text-xs font-mono font-black text-blue-400">
                        ~{(4000 / permutations.length).toFixed(1)}x
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Rateio entre as {permutations.length} permutações.
                    </span>
                  </button>

                  <button
                    onClick={() => setSimuladorModalidade('invertida_cercada')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      simuladorModalidade === 'invertida_cercada'
                        ? 'bg-amber-950/40 border-amber-400 ring-1 ring-amber-400/50'
                        : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-white block">Invertida Cercada</strong>
                      <span className="text-xs font-mono font-black text-purple-400">
                        ~{(800 / permutations.length).toFixed(1)}x
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Concorre nos 5 prêmios com todas as inversões.
                    </span>
                  </button>

                  <button
                    onClick={() => setSimuladorModalidade('combinada')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer sm:col-span-2 lg:col-span-1 ${
                      simuladorModalidade === 'combinada'
                        ? 'bg-amber-950/40 border-amber-400 ring-1 ring-amber-400/50'
                        : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-white block">Milhar + Centena</strong>
                      <span className="text-xs font-mono font-black text-rose-400">Combinada</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Ganha se acertar a milhar cheia ou a centena final.
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Results Display KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Prêmio Bruto Estimado
                </span>
                <strong className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 block my-1">
                  {formatCurrency(simuladorCalculation.premioBruto)}
                </strong>
                <span className="text-[11px] text-slate-400 block">
                  Multiplicador da banca: {simuladorCalculation.multiplier.toFixed(1)}x
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Lucro Líquido
                </span>
                <strong className="text-2xl sm:text-3xl font-black font-mono text-amber-300 block my-1">
                  {formatCurrency(simuladorCalculation.lucroLiquido)}
                </strong>
                <span className="text-[11px] text-slate-400 block">
                  Após dedução do valor apostado ({formatCurrency(simuladorValor)})
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Probabilidade Matemática
                </span>
                <strong className="text-lg sm:text-xl font-black font-mono text-white block my-1">
                  {simuladorCalculation.probabilityText}
                </strong>
                <span className="text-[11px] text-slate-400 block">
                  Sorteio auditado pela Caixa Econômica Federal
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-xs text-amber-200">
                  Aposte com responsabilidade. Loterias devem ser tratadas como entretenimento.
                </span>
              </div>

              <button
                onClick={() => {
                  const betSummary = `Aposta Simulada: Milhar ${analysis.milhar} | Modalidade: ${simuladorCalculation.modalidadeLabel} | Valor: ${formatCurrency(simuladorValor)} | Retorno: ${formatCurrency(simuladorCalculation.premioBruto)}`;
                  handleCopyText(betSummary, 'Simulação copiada com sucesso!');
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Simulação</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: Top Milhares da Federal (Ranking Geral) */}
        {activeSubTab === 'ranking' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Ranking: Milhares Mais Premiadas na Federal</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Todas as milhares que já apareceram nos {contests.length} concursos analisados da base.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setRankingFilter('todas')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    rankingFilter === 'todas'
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Todas ({topMilharesList.length})
                </button>
                <button
                  onClick={() => setRankingFilter('multiplas')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    rankingFilter === 'multiplas'
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Repetidas 2x+ ({topMilharesList.filter(t => t.totalHits >= 2).length})
                </button>
                <button
                  onClick={() => setRankingFilter('cabeca')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    rankingFilter === 'cabeca'
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  1º Prêmio ({topMilharesList.filter(t => t.firstPrizeHits > 0).length})
                </button>
              </div>
            </div>

            {/* Grid of Top Milhares Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredRanking.map(item => (
                <div
                  key={item.milhar}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                    item.milhar === searchedMilhar
                      ? 'bg-amber-950/40 border-amber-400 ring-1 ring-amber-400/50'
                      : item.firstPrizeHits > 0
                      ? 'bg-slate-900 border-amber-500/40'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-lg font-black text-amber-300 tracking-wider">
                        {item.milhar}
                      </span>
                      <span className="text-xl" title={item.animal.nome}>
                        {item.animal.emoji}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                      <span>
                        {item.animal.nome} (Gr. {item.animal.grupo})
                      </span>
                      <span className="font-bold text-white font-mono">
                        {item.totalHits}x sorteada
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-1 text-[10px]">
                      {item.firstPrizeHits > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40">
                          🏆 {item.firstPrizeHits}x na cabeça
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        Conc: {item.contests.join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleCopyText(item.milhar, `Milhar ${item.milhar} copiada!`)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Copiar
                    </button>
                    <button
                      onClick={() => handleSearch(item.milhar)}
                      className="flex-1 py-1 rounded bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition-colors cursor-pointer text-center"
                    >
                      Inspecionar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: Raio-X Centena & Dezena */}
        {activeSubTab === 'parciais' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Desdobramento Parcial da Milhar {analysis.milhar}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mesmo quando a milhar não sai inteira, sua Centena e Dezena pontuam com alta frequência.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-emerald-400">
                  Centena {analysis.centena}: <strong>{analysis.centenaHits}x</strong>
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-amber-400">
                  Dezena {analysis.dezena}: <strong>{analysis.dezenaHits}x</strong>
                </span>
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPartialFilter('todos')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  partialFilter === 'todos'
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Todas ({analysis.partialOccurrences.length})
              </button>
              <button
                onClick={() => setPartialFilter('centena')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  partialFilter === 'centena'
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Centena {analysis.centena} ({analysis.partialOccurrences.filter(p => p.matchedType === 'centena').length})
              </button>
              <button
                onClick={() => setPartialFilter('dezena')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  partialFilter === 'dezena'
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Dezena {analysis.dezena} ({analysis.partialOccurrences.filter(p => p.matchedType === 'dezena').length})
              </button>
            </div>

            {filteredPartials.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs min-w-[560px]">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Concurso</th>
                      <th className="py-2.5 px-3">Data</th>
                      <th className="py-2.5 px-3">Prêmio</th>
                      <th className="py-2.5 px-3">Tipo de Acerto</th>
                      <th className="py-2.5 px-3">Bilhete Sorteado</th>
                      <th className="py-2.5 px-3 text-right">Valor Oficial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-mono">
                    {filteredPartials.map((part, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-white">
                          #{part.concurso}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 font-sans">
                          {part.data}
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              part.ordem === 1
                                ? 'bg-amber-400/20 text-amber-300'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {part.ordem}º Prêmio
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          {part.matchedType === 'centena' ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Centena {analysis.centena}
                            </span>
                          ) : (
                            <span className="text-amber-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Dezena {analysis.dezena}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {part.bilheteCompleto.slice(0, -part.matchedDigits.length)}
                          <span className="font-black text-amber-300 bg-amber-400/20 px-1 rounded">
                            {part.matchedDigits}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                          {formatCurrency(part.valorPremio)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                Nenhuma ocorrência registrada para os filtros selecionados.
              </div>
            )}
          </div>
        )}

        {/* TAB 6: Tabela de Probabilidades & Cotações */}
        {activeSubTab === 'probabilidades' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Matemática da Milhar na Loteria Federal</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Na Loteria Federal, cada concurso possui 100.000 bilhetes (de 00.000 a 99.999).
                Portanto, existem exatamente 10.000 milhares distintas (0000 a 9999).
                Veja abaixo como se comparam as chances e retornos:
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs min-w-[560px]">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3.5">Modalidade</th>
                    <th className="py-3 px-3.5">Probabilidade Teórica</th>
                    <th className="py-3 px-3.5">Porcentagem</th>
                    <th className="py-3 px-3.5">Ciclo Médio Esperado</th>
                    <th className="py-3 px-3.5 text-right">Cotação Típica em Bancas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-mono">
                  <tr className="bg-amber-950/20 hover:bg-amber-950/40">
                    <td className="py-3 px-3.5 font-bold text-amber-300 font-sans">
                      Milhar na Cabeça (1º Prêmio)
                    </td>
                    <td className="py-3 px-3.5 text-white font-bold">1 em 10.000</td>
                    <td className="py-3 px-3.5 text-amber-400 font-bold">0,0100%</td>
                    <td className="py-3 px-3.5 text-slate-300 font-sans">10.000 sorteios</td>
                    <td className="py-3 px-3.5 text-right text-emerald-400 font-bold font-sans">
                      4.000x (R$ 4.000 / R$ 1)
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/50">
                    <td className="py-3 px-3.5 font-bold text-emerald-300 font-sans">
                      Milhar Cercada (1º ao 5º Prêmio)
                    </td>
                    <td className="py-3 px-3.5 text-white font-bold">1 em 2.000</td>
                    <td className="py-3 px-3.5 text-emerald-400 font-bold">0,0500%</td>
                    <td className="py-3 px-3.5 text-slate-300 font-sans">2.000 sorteios</td>
                    <td className="py-3 px-3.5 text-right text-emerald-400 font-bold font-sans">
                      800x (R$ 800 / R$ 1)
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/50">
                    <td className="py-3 px-3.5 font-semibold text-slate-200 font-sans">
                      Centena na Cabeça (1º Prêmio)
                    </td>
                    <td className="py-3 px-3.5 text-white">1 em 1.000</td>
                    <td className="py-3 px-3.5 text-slate-300">0,1000%</td>
                    <td className="py-3 px-3.5 text-slate-400 font-sans">1.000 sorteios</td>
                    <td className="py-3 px-3.5 text-right text-slate-200 font-sans">
                      600x (R$ 600 / R$ 1)
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/50">
                    <td className="py-3 px-3.5 font-semibold text-slate-200 font-sans">
                      Centena Cercada (1º ao 5º)
                    </td>
                    <td className="py-3 px-3.5 text-white">1 em 200</td>
                    <td className="py-3 px-3.5 text-slate-300">0,5000%</td>
                    <td className="py-3 px-3.5 text-slate-400 font-sans">200 sorteios</td>
                    <td className="py-3 px-3.5 text-right text-slate-200 font-sans">
                      120x (R$ 120 / R$ 1)
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/50">
                    <td className="py-3 px-3.5 font-semibold text-slate-200 font-sans">
                      Dezena na Cabeça (1º Prêmio)
                    </td>
                    <td className="py-3 px-3.5 text-white">1 em 100</td>
                    <td className="py-3 px-3.5 text-slate-300">1,0000%</td>
                    <td className="py-3 px-3.5 text-slate-400 font-sans">100 sorteios</td>
                    <td className="py-3 px-3.5 text-right text-slate-200 font-sans">
                      60x (R$ 60 / R$ 1)
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/50">
                    <td className="py-3 px-3.5 font-semibold text-slate-200 font-sans">
                      Dezena Cercada (1º ao 5º)
                    </td>
                    <td className="py-3 px-3.5 text-white">1 em 20</td>
                    <td className="py-3 px-3.5 text-slate-300">5,0000%</td>
                    <td className="py-3 px-3.5 text-slate-400 font-sans">20 sorteios</td>
                    <td className="py-3 px-3.5 text-right text-slate-200 font-sans">
                      12x (R$ 12 / R$ 1)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Practical Advice Banner */}
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-amber-300">
                  Dica de Especialista do Furreco:
                </strong>
                <span>
                  Jogar na milhar "cercada" (1º ao 5º) multiplica sua chance de acerto por 5 vezes (passa de 1 em 10.000 para 1 em 2.000),
                  pagando ainda um excelente multiplicador de 800 vezes o valor apostado.
                  Lembre-se sempre de apostar com controle e consciência recreativa.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
