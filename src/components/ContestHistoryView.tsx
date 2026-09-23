import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Search, Filter, CheckCircle, Award, Calendar, Sparkles, X } from 'lucide-react';
import { LotteryContest, TicketCheckResult } from '../types/lottery';
import { formatTicket, formatCurrency, checkTicketAgainstContest, ANIMAL_GROUPS } from '../utils/lotteryUtils';

interface ContestHistoryViewProps {
  contests: LotteryContest[];
  onPlayChime?: () => void;
}

export const ContestHistoryView: React.FC<ContestHistoryViewProps> = ({
  contests,
  onPlayChime,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'exact' | 'milhar' | 'centena' | 'dezena' | 'final'>('all');
  const [animalFilter, setAnimalFilter] = useState<number | null>(null);
  const [prizeFilter, setPrizeFilter] = useState<'all' | '1'>('all');

  // Quick Ticket Checker State
  const [checkerTicket, setCheckerTicket] = useState('');
  const [checkerResults, setCheckerResults] = useState<TicketCheckResult[] | null>(null);
  const [hasSearchedChecker, setHasSearchedChecker] = useState(false);

  // Filter contests based on active criteria
  const filteredContests = contests.filter(contest => {
    // 1. Search term match
    if (searchTerm.trim()) {
      const term = searchTerm.trim().replace(/\D/g, '');
      const contestMatch = contest.concurso.toString().includes(searchTerm.trim());

      // Check numbers in prizes
      const hasNumberMatch = contest.premios.some(p => {
        if (prizeFilter === '1' && p.ordem !== 1) return false;

        if (!term) return false;
        if (filterType === 'exact') return p.bilhete === term.padStart(5, '0');
        if (filterType === 'milhar') return p.bilhete.slice(-4) === term.slice(-4);
        if (filterType === 'centena') return p.bilhete.slice(-3) === term.slice(-3);
        if (filterType === 'dezena') return p.bilhete.slice(-2) === term.slice(-2);
        if (filterType === 'final') return p.bilhete.slice(-1) === term.slice(-1);

        return p.bilhete.includes(term);
      });

      if (!contestMatch && !hasNumberMatch) {
        return false;
      }
    }

    // 2. Animal filter
    if (animalFilter !== null) {
      if (contest.bichoPrincipal.grupo !== animalFilter) {
        return false;
      }
    }

    return true;
  });

  // Run user ticket check across all recent contests
  const handleCheckUserTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkerTicket.trim()) return;

    if (onPlayChime) onPlayChime();

    const results: TicketCheckResult[] = [];
    contests.forEach(contest => {
      const res = checkTicketAgainstContest(checkerTicket, contest);
      if (res.hasWon) {
        results.push(res);
      }
    });

    setCheckerResults(results);
    setHasSearchedChecker(true);

    if (results.length > 0) {
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#f59e0b', '#3b82f6'],
        });
      } catch {
        // ignore
      }
    }
  };

  const highlightMatch = (ticketStr: string) => {
    if (!searchTerm.trim()) return ticketStr;
    const term = searchTerm.trim().replace(/\D/g, '');
    if (!term || !ticketStr.includes(term)) return ticketStr;

    const parts = ticketStr.split(term);
    return (
      <>
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {part}
            {i < parts.length - 1 && (
              <span className="bg-amber-400 text-slate-950 font-black px-0.5 rounded">
                {term}
              </span>
            )}
          </React.Fragment>
        ))}
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Quick Ticket Checker Section */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-amber-950/80 border border-emerald-500/30 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
          <div>
            <span className="text-[11px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Verificador Instantâneo de Prêmios
            </span>
            <h2 className="text-base sm:text-xl font-bold text-white mt-0.5">
              Comprou um bilhete? Veja se você ganhou!
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-1 leading-relaxed">
              Digite os 5 algarismos do seu bilhete para conferir 1º ao 5º prêmio, milhar, centena, dezena, terminação e bicho.
            </p>
          </div>

          {/* Checker Input Form - Mobile Friendly Full Width */}
          <form onSubmit={handleCheckUserTicket} className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2 md:mt-0">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                maxLength={6}
                value={checkerTicket}
                onChange={e => setCheckerTicket(e.target.value.replace(/\D/g, ''))}
                placeholder="Ex: 48291"
                className="w-full bg-slate-950 text-white font-mono text-xl sm:text-lg font-bold px-4 py-3 sm:py-2.5 rounded-xl border border-emerald-500/40 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder:text-slate-600 placeholder:text-sm tracking-widest text-center min-h-[46px]"
              />
            </div>
            <button
              type="submit"
              className="py-3 sm:py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-400 text-slate-950 font-bold text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all shadow-md shadow-emerald-950/40 whitespace-nowrap cursor-pointer min-h-[46px] flex items-center justify-center"
            >
              Conferir Bilhete
            </button>
          </form>
        </div>

        {/* Checker Results Box */}
        {hasSearchedChecker && checkerResults !== null && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 animate-fadeIn">
            {checkerResults.length > 0 ? (
              <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3.5 sm:p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="font-bold text-white text-xs sm:text-sm">
                      Sensacional! Seu bilhete {formatTicket(checkerTicket)} foi premiado!
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setHasSearchedChecker(false);
                      setCheckerTicket('');
                    }}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {checkerResults.map((r, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/90 border border-emerald-500/30 rounded-lg p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs"
                    >
                      <div>
                        <strong className="text-amber-300 font-bold block sm:inline mr-2">
                          Concurso {r.contest.concurso} ({r.contest.data}):
                        </strong>
                        <span className="text-slate-200">{r.description}</span>
                      </div>
                      <span className="font-mono text-emerald-400 font-black text-sm tabular-nums">
                        {formatCurrency(r.prizeValue)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 sm:p-4 flex items-center justify-between">
                <p className="text-xs text-slate-400 leading-relaxed">
                  O bilhete <strong className="text-white font-mono">{formatTicket(checkerTicket)}</strong> não obteve
                  premiação nos últimos {contests.length} concursos. Continue confiante no próximo sorteio!
                </p>
                <button
                  onClick={() => {
                    setHasSearchedChecker(false);
                    setCheckerTicket('');
                  }}
                  className="text-slate-500 hover:text-white text-xs ml-3 p-1 shrink-0"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Smart Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-3 sm:space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 sm:gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por concurso (ex: 5945) ou número (ex: 48.291, 291, 91)..."
              className="w-full bg-slate-950 text-white pl-10 pr-8 py-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs sm:text-sm placeholder:text-slate-500 min-h-[42px]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Match Mode Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto text-xs scrollbar-none">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors shrink-0 cursor-pointer ${
                filterType === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Qualquer
            </button>
            <button
              onClick={() => setFilterType('exact')}
              className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors shrink-0 cursor-pointer ${
                filterType === 'exact' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Exato (5d)
            </button>
            <button
              onClick={() => setFilterType('centena')}
              className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors shrink-0 cursor-pointer ${
                filterType === 'centena' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Centena (3d)
            </button>
            <button
              onClick={() => setFilterType('dezena')}
              className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors shrink-0 cursor-pointer ${
                filterType === 'dezena' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dezena (2d)
            </button>
            <button
              onClick={() => setFilterType('final')}
              className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors shrink-0 cursor-pointer ${
                filterType === 'final' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Final (1d)
            </button>
          </div>
        </div>

        {/* Secondary Filter Row: Animals & Prize filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              Bicho:
            </span>
            <select
              value={animalFilter === null ? '' : animalFilter}
              onChange={e => setAnimalFilter(e.target.value === '' ? null : Number(e.target.value))}
              className="bg-slate-950 text-slate-200 border border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 max-w-[200px] text-xs"
            >
              <option value="">Todos os 25 Bichos</option>
              {ANIMAL_GROUPS.map(g => (
                <option key={g.grupo} value={g.grupo}>
                  {g.emoji} Grupo {String(g.grupo).padStart(2, '0')} - {g.nome}
                </option>
              ))}
            </select>

            <span className="hidden sm:inline text-slate-600">·</span>

            <button
              onClick={() => setPrizeFilter(prizeFilter === 'all' ? '1' : 'all')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors font-medium cursor-pointer ${
                prizeFilter === '1'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {prizeFilter === '1' ? 'Apenas 1º Prêmio' : 'Todos os 5 Prêmios'}
            </button>
          </div>

          <div className="text-slate-400 text-[11px] sm:text-xs">
            Exibindo <strong className="text-white">{filteredContests.length}</strong> concurso(s)
          </div>
        </div>
      </div>

      {/* Contests List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredContests.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center text-slate-500">
            <span className="text-4xl block mb-2 opacity-50">🔍</span>
            <h3 className="text-base font-bold text-slate-300">Nenhum resultado encontrado</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Tente ajustar os termos de pesquisa ou remover os filtros aplicados para visualizar outros concursos.
            </p>
          </div>
        ) : (
          filteredContests.map(contest => (
            <div
              key={contest.concurso}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-3.5 sm:p-5 shadow-lg transition-all"
            >
              {/* Contest Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 font-mono font-bold text-emerald-300 text-xs sm:text-sm">
                    Concurso {contest.concurso}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{contest.data} ({contest.diaSemana})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300 text-[11px] sm:text-xs">
                    <span className="hidden xs:inline">1º Prêmio:</span>
                    <span className="text-base">{contest.bichoPrincipal.emoji}</span>
                    <strong className="text-white">{contest.bichoPrincipal.nome}</strong>
                    <span className="text-slate-500 font-mono">(G{contest.bichoPrincipal.grupo})</span>
                  </div>
                </div>
              </div>

              {/* 5 Prize Tickets Grid (Responsive 2 cols on mobile, 5 cols on desktop) */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3">
                {contest.premios.map((p, index) => {
                  const isFirst = p.ordem === 1;
                  const animal = contest.todosBichos[index] || contest.bichoPrincipal;

                  return (
                    <div
                      key={p.ordem}
                      className={`rounded-xl p-2.5 sm:p-3.5 transition-all border ${
                        isFirst
                          ? 'col-span-2 md:col-span-1 bg-gradient-to-b from-amber-950/40 via-slate-950 to-slate-950 border-amber-500/40 shadow-md'
                          : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] sm:text-[11px] mb-1 sm:mb-2">
                        <span className={`font-bold uppercase ${isFirst ? 'text-amber-400' : 'text-slate-400'}`}>
                          {p.ordem}º Prêmio
                        </span>
                        {isFirst && <Award className="w-3.5 h-3.5 text-amber-400" />}
                      </div>

                      {/* Ticket Number */}
                      <div className="text-center py-1">
                        <span className={`font-mono text-xl sm:text-2xl font-black tracking-wider block ${
                          isFirst ? 'text-amber-300 text-2xl sm:text-2xl' : 'text-white'
                        }`}>
                          {highlightMatch(formatTicket(p.bilhete))}
                        </span>
                      </div>

                      {/* Prize Value & Animal */}
                      <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] sm:text-[11px]">
                        <span className="font-mono text-emerald-400 font-semibold truncate">
                          {formatCurrency(p.valorPremio)}
                        </span>
                        <span className="text-slate-400 flex items-center gap-1 shrink-0" title={animal.nome}>
                          <span>{animal.emoji}</span>
                          <span className="truncate max-w-[50px] sm:max-w-[60px] hidden xs:inline">{animal.nome}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
