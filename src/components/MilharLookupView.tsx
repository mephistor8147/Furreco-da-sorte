import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { LotteryContest } from '../types/lottery';
import { analyzeMilhar, formatCurrency } from '../utils/lotteryUtils';

interface MilharLookupViewProps {
  contests: LotteryContest[];
  onPlayChime?: () => void;
  onNavigateToTab?: (tab: 'stats' | 'history' | 'generator' | 'weekly' | 'odds' | 'responsible') => void;
  highContrast?: boolean;
}

// Popular and recent thousands to suggest
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
  highContrast,
}) => {
  const [inputMilhar, setInputMilhar] = useState('8291');
  const [searchedMilhar, setSearchedMilhar] = useState('8291');
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'concursos' | 'parciais' | 'probabilidades'>('concursos');

  // Compute full analysis for searched milhar
  const analysis = useMemo(() => {
    return analyzeMilhar(searchedMilhar, contests);
  }, [searchedMilhar, contests]);

  // Handle Search Submission
  const handleSearch = (milharToSearch?: string) => {
    const target = milharToSearch !== undefined ? milharToSearch : inputMilhar;
    const clean = target.replace(/\D/g, '').padStart(4, '0').slice(-4);
    setInputMilhar(clean);
    setSearchedMilhar(clean);

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

  const handleCopy = () => {
    navigator.clipboard.writeText(analysis.milhar);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-emerald-950/80 border border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30">
                <Search className="w-3.5 h-3.5" />
                Busca de Milhar Específica
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                {contests.length} Concursos Analisados ({contests.length * 5} Prêmios)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1.5 flex items-center gap-2">
              <span>Auditoria e Frequência de Milhar</span>
              <span className="text-amber-400 text-lg">🍀</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Consulte qualquer número de 4 dígitos (0000 a 9999). Saiba quantas vezes a milhar foi sorteada
              na cabeça ou nos 5 prêmios, a probabilidade matemática exata para o próximo sorteio e a taxa de frequência observada.
            </p>
          </div>

          {/* Quick random generator button */}
          <button
            onClick={handleRandomMilhar}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0"
          >
            <Shuffle className="w-4 h-4 text-amber-400" />
            <span>Sortear Milhar Aleatória</span>
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
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
                maxLength={4}
                value={inputMilhar}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  setInputMilhar(val);
                }}
                placeholder="Digite a milhar (ex: 8291, 4918, 3574)"
                className="w-full pl-11 pr-24 py-3 bg-slate-950/90 border-2 border-slate-700 focus:border-amber-400 rounded-xl text-white font-mono text-lg font-black tracking-widest placeholder:text-slate-500 placeholder:text-sm placeholder:font-sans placeholder:tracking-normal focus:outline-none transition-colors"
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-xs font-mono text-slate-400 pointer-events-none">
                {inputMilhar.length}/4 dígitos
              </span>
            </div>

            <button
              type="submit"
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm transition-all shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
              <span>Consultar Milhar</span>
            </button>
          </form>

          {/* Quick Suggestions Chips */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Sugestões rápidas:</span>
            {SUGGESTED_MILHARES.map(item => (
              <button
                key={item.milhar}
                onClick={() => handleSearch(item.milhar)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                  searchedMilhar === item.milhar
                    ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:border-slate-600'
                }`}
                title={item.label}
              >
                <span>{item.milhar}</span>
                <span className="ml-1.5 text-[9px] font-sans font-normal opacity-75">
                  ({item.tag})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Analysis Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
        {/* Milhar Identity Strip */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-3.5">
            {/* Visual Milhar Digits Display */}
            <div className="flex items-center gap-1">
              {analysis.milhar.split('').map((digit, i) => (
                <div
                  key={i}
                  className="w-10 h-12 sm:w-11 sm:h-13 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-amber-400/60 flex items-center justify-center font-mono font-black text-xl sm:text-2xl text-amber-300 shadow-inner"
                >
                  {digit}
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-white">
                  Milhar {analysis.milhar}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Copiar Milhar"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>Centena: <strong className="text-white font-mono">{analysis.centena}</strong></span>
                <span>·</span>
                <span>Dezena: <strong className="text-white font-mono">{analysis.dezena}</strong></span>
              </p>
            </div>
          </div>

          {/* Animal representation of this milhar */}
          <div className="flex items-center gap-3 bg-slate-900/90 p-2.5 sm:px-4 sm:py-2.5 rounded-xl border border-slate-800 shrink-0">
            <span className="text-2xl sm:text-3xl">{analysis.animal.emoji}</span>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Bicho Correspondente
              </span>
              <strong className="text-white text-xs sm:text-sm font-bold block">
                {analysis.animal.nome} (Grupo {analysis.animal.grupo})
              </strong>
              <span className="text-[10px] text-slate-400 font-mono">
                Dezenas do Grupo: {analysis.animal.dezenas.join(', ')}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Primary KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* KPI 1: Quantas vezes foi sorteada */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Vezes Sorteada
              </span>
              <Award className="w-4 h-4 text-amber-400" />
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
            <div className="pt-2 border-t border-slate-800/80">
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
                  ? '🔥 Milhar com Múltiplas Saídas'
                  : analysis.totalHits === 1
                  ? '✨ Premiada no Histórico'
                  : '⏳ Inédita nos Concursos Analisados'}
              </span>
            </div>
          </div>

          {/* KPI 2: Taxa de Frequência Observada */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Taxa de Frequência
              </span>
              <Percent className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="my-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                  {analysis.contestFrequencyPercent.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-400">dos concursos</span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {analysis.totalHits} de {analysis.totalContestsAnalyzed} concursos analisados ({analysis.prizeFrequencyPercent.toFixed(2)}% dos bilhetes)
              </span>
            </div>
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Média teórica 1º ao 5º:</span>
                <span className="font-mono text-slate-300 font-semibold">0,050%</span>
              </div>
            </div>
          </div>

          {/* KPI 3: Probabilidade Atual Próximo Sorteio */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Probabilidade Próximo Sorteio
              </span>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div className="my-2">
              <div className="text-sm font-bold text-white flex items-center justify-between">
                <span>1º Prêmio (Cabeça):</span>
                <span className="font-mono text-amber-300">1 em 10.000 (0,01%)</span>
              </div>
              <div className="text-sm font-bold text-white flex items-center justify-between mt-1">
                <span>Cercada (1º ao 5º):</span>
                <span className="font-mono text-emerald-300">1 em 2.000 (0,05%)</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400 block">
                Independência estatística garantida pela Caixa Econômica.
              </span>
            </div>
          </div>

          {/* KPI 4: Atraso / Último Concurso */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Atraso / Ciclo
              </span>
              <Clock className="w-4 h-4 text-purple-400" />
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
                    Última saída: Concurso {analysis.lastSeenContest}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-lg font-bold text-slate-300 block">
                    Sem saída recente
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Não saiu nos últimos {analysis.totalContestsAnalyzed} concursos
                  </span>
                </>
              )}
            </div>
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400 block">
                Ciclo matemático médio: 2.000 concursos para 1º ao 5º
              </span>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('concursos')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'concursos'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Concursos Sorteados ({analysis.totalHits})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('parciais')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'parciais'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Raio-X: Centena ({analysis.centenaHits}x) & Dezena ({analysis.dezenaHits}x)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('probabilidades')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'probabilidades'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Tabela de Probabilidades & Cotações</span>
          </button>
        </div>

        {/* SubTab 1: Concursos Sorteados */}
        {activeSubTab === 'concursos' && (
          <div className="space-y-4">
            {analysis.occurrences.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>
                    A milhar <strong className="text-amber-400 font-mono">{analysis.milhar}</strong> foi sorteada em{' '}
                    <strong className="text-white">{analysis.occurrences.length}</strong> {analysis.occurrences.length === 1 ? 'concurso' : 'concursos'}:
                  </span>
                  <span className="text-[11px] font-mono">
                    Valores Oficiais da Loteria Federal
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysis.occurrences.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all ${
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
                            Concurso {item.concurso}
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

                      {/* Extra context: animal & betting ratio */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1 text-slate-300">
                          <span>{item.animal.emoji}</span>
                          <span>{item.animal.nome} (Gr. {item.animal.grupo})</span>
                        </span>
                        <span className="text-amber-300/90 font-mono">
                          {item.isFirstPrize ? 'Cotação Banca: ~4.000x' : 'Cotação Banca: ~800x'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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
                    Nenhum dos {analysis.totalContestsAnalyzed} concursos recentes da base sorteou a milhar exata{' '}
                    <strong className="text-amber-400 font-mono">{analysis.milhar}</strong>.
                    Isto é absolutamente normal: como existem 10.000 milhares e saem apenas 5 por sorteio, são necessários em média 2.000 concursos para que todas saiam!
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveSubTab('parciais')}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Ver Ocorrências da Centena ({analysis.centena}) e Dezena ({analysis.dezena})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SubTab 2: Raio-X Centena e Dezena */}
        {activeSubTab === 'parciais' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Desdobramento da Milhar {analysis.milhar}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mesmo quando a milhar de 4 dígitos não sai inteira, sua Centena e Dezena pontuam com alta frequência.
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

            {analysis.partialOccurrences.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
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
                    {analysis.partialOccurrences.map((part, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-white">
                          #{part.concurso}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 font-sans">
                          {part.data}
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            part.ordem === 1 ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-800 text-slate-300'
                          }`}>
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
                Nenhuma centena ou dezena registrada para estes parâmetros na amostra atual.
              </div>
            )}
          </div>
        )}

        {/* SubTab 3: Tabela de Probabilidades & Cotações */}
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
              <table className="w-full text-left text-xs">
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
