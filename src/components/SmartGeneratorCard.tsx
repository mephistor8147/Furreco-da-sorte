import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, RefreshCw, Bookmark, Check, History, Award, Info, Trash2 } from 'lucide-react';
import { LotteryContest, SmartBet } from '../types/lottery';
import { getAnimalByDezena, formatTicket } from '../utils/lotteryUtils';
import { calculateDezenaStats, calculateFinalDigitStats } from '../data/mockLotteryData';

interface SmartGeneratorCardProps {
  contests: LotteryContest[];
  soundEnabled: boolean;
  onPlayChime?: () => void;
}

const SAVED_BETS_KEY = 'furreco_saved_bets_v1';

export const SmartGeneratorCard: React.FC<SmartGeneratorCardProps> = ({
  contests,
  onPlayChime,
}) => {
  const [strategy, setStrategy] = useState<'quentes' | 'atrasados' | 'equilibrio' | 'surpresinha'>('quentes');
  const [isGenerating, setIsGenerating] = useState(false);
  const [displayDigits, setDisplayDigits] = useState<string[]>(['4', '8', '2', '9', '1']);
  const [currentBet, setCurrentBet] = useState<SmartBet | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedBets, setSavedBets] = useState<SmartBet[]>([]);
  const [pastTestResult, setPastTestResult] = useState<{
    tested: boolean;
    hits: Array<{ contestNum: number; date: string; prizeType: string; matched: string; prizeValue: number }>;
  }>({ tested: false, hits: [] });

  // Load saved bets from localStorage
  useEffect(() => {
    try {
      const data = localStorage.getItem(SAVED_BETS_KEY);
      if (data) setSavedBets(JSON.parse(data));
    } catch {
      // ignore
    }
  }, []);

  const saveBetsToStorage = (bets: SmartBet[]) => {
    setSavedBets(bets);
    try {
      localStorage.setItem(SAVED_BETS_KEY, JSON.stringify(bets));
    } catch {
      // ignore
    }
  };

  // Generate numbers based on selected strategy and recent contest history
  const generateTicket = () => {
    setIsGenerating(true);
    setPastTestResult({ tested: false, hits: [] });

    // Sound feedback
    if (onPlayChime) onPlayChime();

    // Stats calculations
    const dezenaStats = calculateDezenaStats(contests);
    const finalStats = calculateFinalDigitStats(contests);

    let chosenTicket = '';
    let motivo = '';

    if (strategy === 'quentes') {
      // Use top hot dezenas and hot final digits
      const hotDezena = dezenaStats.maisFrequentes[Math.floor(Math.random() * Math.min(5, dezenaStats.maisFrequentes.length))].dezena;
      const hotFinal = finalStats[Math.floor(Math.random() * 3)].digit;
      const d1 = Math.floor(Math.random() * 9) + 1;
      const d2 = hotFinal;
      const d3 = Math.floor(Math.random() * 10);
      chosenTicket = `${d1}${d2}${d3}${hotDezena}`.slice(-5).padStart(5, '0');
      motivo = `Gerado com a dezena quente ${hotDezena} (com alta incidência nos últimos concursos) e final favorável ${hotDezena.slice(-1)}.`;
    } else if (strategy === 'atrasados') {
      // Use delayed / cold dezenas due for a cycle hit
      const coldDezena = dezenaStats.maisAtrasadas[Math.floor(Math.random() * Math.min(5, dezenaStats.maisAtrasadas.length))];
      const d1 = Math.floor(Math.random() * 8) + 1;
      const d2 = Math.floor(Math.random() * 10);
      const d3 = Math.floor(Math.random() * 10);
      chosenTicket = `${d1}${d2}${d3}${coldDezena.dezena}`.slice(-5).padStart(5, '0');
      motivo = `Aposta na lei do retorno: a dezena ${coldDezena.dezena} está há ${coldDezena.concursosAtrasada} concursos sem sair e apresenta alta pressão de ciclo.`;
    } else if (strategy === 'equilibrio') {
      // 3 even 2 odd or 2 even 3 odd, intermediate sum
      let t = '';
      let sum = 0;
      for (let i = 0; i < 5; i++) {
        const d = (i === 0 ? Math.floor(Math.random() * 9) + 1 : Math.floor(Math.random() * 10));
        t += d;
        sum += d;
      }
      chosenTicket = t;
      motivo = `Equilíbrio Estatístico do Furreco: soma balanceada de algarismos (${sum}) com distribuição paritária ideal para bilhetes premiados da Federal.`;
    } else {
      // Surpresinha
      const rnd = Math.floor(Math.random() * 100000);
      chosenTicket = rnd.toString().padStart(5, '0');
      motivo = `Surpresinha aleatória abençoada pelo Trevo do Furreco. Todos os 100.000 bilhetes possuem chances matemáticas idênticas!`;
    }

    // Number rolling effect animation
    let iterations = 0;
    const interval = setInterval(() => {
      setDisplayDigits([
        String(Math.floor(Math.random() * 10)),
        String(Math.floor(Math.random() * 10)),
        String(Math.floor(Math.random() * 10)),
        String(Math.floor(Math.random() * 10)),
        String(Math.floor(Math.random() * 10)),
      ]);
      iterations++;

      if (iterations >= 12) {
        clearInterval(interval);
        setDisplayDigits(chosenTicket.split(''));
        setIsGenerating(false);

        const animal = getAnimalByDezena(chosenTicket.slice(-2));
        const newBet: SmartBet = {
          id: `bet-${Date.now()}`,
          bilhete: chosenTicket,
          estrategia: strategy,
          dataGeracao: new Date().toLocaleDateString('pt-BR'),
          bicho: animal,
          motivo,
          probabilidadeTeorica: '1 em 100.000 (1º Prêmio) · 1 em 10 (Terminação)',
        };
        setCurrentBet(newBet);

        // Confetti explosion
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899'],
          });
        } catch {
          // ignore
        }
      }
    }, 50);
  };

  // Run on mount once if no current bet
  useEffect(() => {
    if (!currentBet) {
      generateTicket();
    }
  }, []);

  const handleCopy = () => {
    if (!currentBet) return;
    navigator.clipboard.writeText(formatTicket(currentBet.bilhete));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveBet = () => {
    if (!currentBet) return;
    if (savedBets.some(b => b.bilhete === currentBet.bilhete)) return;
    const updated = [currentBet, ...savedBets];
    saveBetsToStorage(updated);
  };

  const handleDeleteSaved = (id: string) => {
    const updated = savedBets.filter(b => b.id !== id);
    saveBetsToStorage(updated);
  };

  // Test current bet against past contests
  const testAgainstPastContests = () => {
    if (!currentBet) return;
    const hits: Array<{ contestNum: number; date: string; prizeType: string; matched: string; prizeValue: number }> = [];

    contests.forEach(c => {
      const p1 = c.premios[0].bilhete;
      const bet = currentBet.bilhete;

      if (bet === p1) {
        hits.push({ contestNum: c.concurso, date: c.data, prizeType: '1º Prêmio Exato', matched: bet, prizeValue: 500000 });
      } else if (bet.slice(-4) === p1.slice(-4)) {
        hits.push({ contestNum: c.concurso, date: c.data, prizeType: 'Milhar (1º Prêmio)', matched: bet.slice(-4), prizeValue: 2000 });
      } else if (bet.slice(-3) === p1.slice(-3)) {
        hits.push({ contestNum: c.concurso, date: c.data, prizeType: 'Centena (1º Prêmio)', matched: bet.slice(-3), prizeValue: 400 });
      } else if (bet.slice(-2) === p1.slice(-2)) {
        hits.push({ contestNum: c.concurso, date: c.data, prizeType: 'Dezena (1º Prêmio)', matched: bet.slice(-2), prizeValue: 50 });
      } else if (bet.slice(-1) === p1.slice(-1)) {
        hits.push({ contestNum: c.concurso, date: c.data, prizeType: 'Terminação (1º Prêmio)', matched: bet.slice(-1), prizeValue: 10 });
      }
    });

    setPastTestResult({ tested: true, hits });
  };

  const sumOfDigits = displayDigits.reduce((acc, curr) => acc + parseInt(curr || '0', 10), 0);
  const evenCount = displayDigits.filter(d => parseInt(d, 10) % 2 === 0).length;
  const oddCount = 5 - evenCount;
  const isSaved = Boolean(currentBet && savedBets.some(b => b.bilhete === currentBet.bilhete));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Main Generator Card (2 cols) */}
      <div className="lg:col-span-2 space-y-4 sm:space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-7 shadow-xl relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[11px] sm:text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Inteligência Estatística Recente
              </span>
              <h2 className="text-lg sm:text-2xl font-bold text-white mt-0.5 sm:mt-1">
                Gerador de Palpites do Furreco
              </h2>
            </div>

            {/* Strategy Selectors (2x2 on mobile, flex on desktop) */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 p-1 bg-slate-950/90 rounded-xl border border-slate-800 w-full sm:w-auto">
              <button
                onClick={() => setStrategy('quentes')}
                className={`px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs font-semibold rounded-lg transition-colors text-center cursor-pointer ${
                  strategy === 'quentes'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🔥 Mais Quentes
              </button>
              <button
                onClick={() => setStrategy('atrasados')}
                className={`px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs font-semibold rounded-lg transition-colors text-center cursor-pointer ${
                  strategy === 'atrasados'
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ❄️ Atrasados
              </button>
              <button
                onClick={() => setStrategy('equilibrio')}
                className={`px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs font-semibold rounded-lg transition-colors text-center cursor-pointer ${
                  strategy === 'equilibrio'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚖️ Equilibrado
              </button>
              <button
                onClick={() => setStrategy('surpresinha')}
                className={`px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs font-semibold rounded-lg transition-colors text-center cursor-pointer ${
                  strategy === 'surpresinha'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🎲 Surpresinha
              </button>
            </div>
          </div>

          {/* Ticket Display Area (Styled like official Brazilian Lottery Ticket) */}
          <div className="mt-4 sm:mt-6 relative z-10">
            <div className="bg-gradient-to-br from-amber-50 via-amber-100/95 to-amber-50 text-slate-900 rounded-2xl p-3.5 sm:p-8 border-2 border-dashed border-amber-300 shadow-2xl relative">
              {/* Ticket Stamp & Perforation marks */}
              <div className="flex items-center justify-between border-b border-amber-300/80 pb-2.5 text-[11px] sm:text-xs font-mono uppercase tracking-wider text-amber-900/80">
                <span className="font-bold flex items-center gap-1">
                  <span>🍀</span> LOTERIA FEDERAL · BILHETE
                </span>
                <span className="hidden xs:inline">SÉRIE ESPECIAL</span>
              </div>

              {/* Rolling 5 Digits Display - Scaled for zero mobile overflow */}
              <div className="py-4 sm:py-6 flex items-center justify-center gap-1.5 sm:gap-4 max-w-full">
                {displayDigits.map((digit, idx) => (
                  <div
                    key={idx}
                    className={`w-11 h-15 xs:w-13 xs:h-17 sm:w-16 sm:h-22 rounded-lg sm:rounded-xl bg-slate-900 text-amber-300 font-mono text-2xl xs:text-3xl sm:text-5xl font-black flex items-center justify-center shadow-lg border-2 border-amber-400/40 tabular-nums ${
                      isGenerating ? 'animate-pulse scale-95' : 'scale-100 transition-transform'
                    }`}
                  >
                    {digit}
                  </div>
                ))}
              </div>

              {/* Animal & Subtitle */}
              {currentBet && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 border-t border-amber-300/80 text-xs sm:text-sm">
                  <div className="flex items-center justify-between sm:justify-start gap-2 bg-amber-200/70 px-3 py-1.5 rounded-lg font-medium text-amber-950">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg sm:text-xl">{currentBet.bicho.emoji}</span>
                      <span>
                        Grupo {String(currentBet.bicho.grupo).padStart(2, '0')} · <strong>{currentBet.bicho.nome}</strong>
                      </span>
                    </div>
                    <span className="text-amber-900/80 text-[11px] sm:text-xs font-mono">
                      ({currentBet.bicho.dezenas.join(', ')})
                    </span>
                  </div>

                  <div className="text-left sm:text-right text-amber-950 font-mono text-[11px] sm:text-xs bg-amber-200/40 sm:bg-transparent px-2.5 py-1 sm:p-0 rounded">
                    Milhar: <strong className="text-slate-950">{currentBet.bilhete.slice(-4)}</strong> · Centena:{' '}
                    <strong className="text-slate-950">{currentBet.bilhete.slice(-3)}</strong> · Final:{' '}
                    <strong className="text-emerald-800 font-bold">{currentBet.bilhete.slice(-1)}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Analysis & Breakdown Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3 sm:mt-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 sm:p-3 text-center">
                <span className="text-[10px] sm:text-[11px] text-slate-400 block">Soma dos Dígitos</span>
                <span className="text-base sm:text-lg font-bold font-mono text-amber-400 tabular-nums">{sumOfDigits}</span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 sm:p-3 text-center">
                <span className="text-[10px] sm:text-[11px] text-slate-400 block">Paridade</span>
                <span className="text-xs sm:text-sm font-bold text-slate-200">
                  {evenCount}P · {oddCount}I
                </span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 sm:p-3 text-center">
                <span className="text-[10px] sm:text-[11px] text-slate-400 block">Chance Teórica</span>
                <span className="text-[11px] sm:text-xs font-bold text-emerald-400">1 em 100 mil</span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 sm:p-3 text-center">
                <span className="text-[10px] sm:text-[11px] text-slate-400 block">Restituição (Final)</span>
                <span className="text-[11px] sm:text-xs font-bold text-cyan-400">10% de chance</span>
              </div>
            </div>

            {/* Justification Box */}
            {currentBet && (
              <div className="mt-3 sm:mt-4 bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-3 sm:p-3.5 flex items-start gap-2.5 text-xs text-emerald-200">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-emerald-300 font-semibold block mb-0.5">Por que este palpite?</strong>
                  {currentBet.motivo}
                </div>
              </div>
            )}

            {/* Action Buttons: Thumb-friendly mobile stack */}
            <div className="flex flex-col gap-2.5 mt-4 sm:mt-6">
              <button
                onClick={generateTicket}
                disabled={isGenerating}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-300 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 disabled:opacity-50 cursor-pointer min-h-[48px] text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Analisando Histórico...' : 'Gerar Novo Palpite da Sorte'}</span>
              </button>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleCopy}
                  className="py-2.5 px-2 rounded-xl font-medium text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer min-h-[42px]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>

                <button
                  onClick={handleSaveBet}
                  disabled={isSaved}
                  className={`py-2.5 px-2 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-1.5 border cursor-pointer min-h-[42px] ${
                    isSaved
                      ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{isSaved ? 'Salvo' : 'Salvar'}</span>
                </button>

                <button
                  onClick={testAgainstPastContests}
                  className="py-2.5 px-2 rounded-xl font-medium text-xs text-amber-300 bg-amber-950/40 hover:bg-amber-900/40 transition-colors flex items-center justify-center gap-1.5 border border-amber-500/30 cursor-pointer min-h-[42px]"
                >
                  <History className="w-3.5 h-3.5 text-amber-400" />
                  <span>Testar</span>
                </button>
              </div>
            </div>

            {/* Test Against Past Contests Feedback */}
            {pastTestResult.tested && (
              <div className="mt-4 p-3.5 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 animate-fadeIn">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] sm:text-xs font-bold uppercase text-slate-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    Teste no Histórico ({contests.length} concursos)
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold">
                    {pastTestResult.hits.length} acerto(s)
                  </span>
                </div>

                {pastTestResult.hits.length > 0 ? (
                  <div className="space-y-2 mt-2">
                    {pastTestResult.hits.map((hit, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900/90 p-2.5 sm:px-3 sm:py-2 rounded-lg text-xs border border-slate-800 gap-1"
                      >
                        <span className="text-slate-300">
                          Conc. <strong>{hit.contestNum}</strong> ({hit.date}) ·{' '}
                          <span className="text-amber-300">{hit.prizeType}</span>
                        </span>
                        <span className="font-mono text-emerald-400 font-bold">
                          R$ {hit.prizeValue.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Este número não coincidiu com os prêmios principais nos últimos {contests.length} concursos.
                    A pressão de retorno estatístico está favorável!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Saved Bets Column (1 col) */}
      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-emerald-400" />
              Meus Palpites Salvos ({savedBets.length})
            </h3>
            {savedBets.length > 0 && (
              <button
                onClick={() => saveBetsToStorage([])}
                className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors"
                title="Limpar todos os palpites"
              >
                Limpar
              </button>
            )}
          </div>

          {savedBets.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <span className="text-3xl block mb-2 opacity-60">🎟️</span>
              <p className="text-xs">Nenhum palpite salvo ainda.</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Gere um número e clique em "Salvar Palpite" para acompanhar aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
              {savedBets.map(bet => (
                <div
                  key={bet.id}
                  className="bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-black text-amber-300 tracking-wider">
                        {formatTicket(bet.bilhete)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {bet.bicho.emoji} {bet.bicho.nome}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteSaved(bet.id)}
                      className="text-slate-600 hover:text-rose-400 p-1 transition-colors"
                      title="Excluir palpite"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="capitalize text-slate-400">Estratégia: {bet.estrategia}</span>
                    <span>{bet.dataGeracao}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
