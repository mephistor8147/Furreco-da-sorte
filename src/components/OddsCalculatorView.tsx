import React, { useState } from 'react';
import { ShieldCheck, Calculator, HelpCircle, Trophy } from 'lucide-react';
import { LOTERIA_FEDERAL_ODDS } from '../utils/lotteryUtils';

export const OddsCalculatorView: React.FC = () => {
  const [ticketCount, setTicketCount] = useState(1);

  // Approximate chance of winning AT LEAST some prize (termination, group, dezena, etc.)
  // On a single ticket in Federal, chance of at least winning the termination (1/10) is 10%, plus approximations, groups, etc. ~ 18.3%
  const singleTicketAnyWinProb = 0.183;
  const anyWinProbPercent = (1 - Math.pow(1 - singleTicketAnyWinProb, ticketCount)) * 100;
  const mainPrizeProb = (ticketCount / 100000) * 100;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-4 h-4" />
              Matemática da Loteria Federal
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Probabilidades Oficiais de Vitória
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              A Loteria Federal é a modalidade com as maiores probabilidades de ganho entre todas as loterias da Caixa
              Econômica Federal. A cada 10 bilhetes emitidos, 1 tem garantia de restituição do valor investido!
            </p>
          </div>

          <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-xl p-4 text-center min-w-[200px]">
            <span className="text-[11px] text-emerald-300 uppercase font-bold block">
              Melhor Chance do Brasil
            </span>
            <span className="text-2xl font-black text-emerald-400 font-mono">1 em 100.000</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">para o prêmio principal</span>
          </div>
        </div>
      </div>

      {/* Interactive Simulator Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Calculator className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm sm:text-base font-bold text-white">
            Simulador de Probabilidade Acumulada
          </h3>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 sm:p-5 space-y-3 sm:space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
              <span>Quantidade de Bilhetes na Aposta:</span>
              <span className="font-mono text-base font-bold text-amber-400">
                {ticketCount} {ticketCount === 1 ? 'bilhete' : 'bilhetes'}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              value={ticketCount}
              onChange={e => setTicketCount(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>1</span>
              <span>10</span>
              <span>20</span>
              <span>30 bilhetes</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 pt-1 sm:pt-2">
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-3.5 sm:p-4">
              <span className="text-[11px] sm:text-xs text-slate-400 block">Chance de Ganhar QUALQUER Prêmio</span>
              <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 block mt-1">
                {anyWinProbPercent.toFixed(1)}%
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1 block leading-relaxed">
                Inclui 1º ao 5º, milhares, centenas, dezenas e restituição da terminação final.
              </span>
            </div>

            <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-3.5 sm:p-4">
              <span className="text-[11px] sm:text-xs text-slate-400 block">Chance do 1º Prêmio (Principal)</span>
              <span className="text-xl sm:text-2xl font-black font-mono text-amber-400 block mt-1">
                {ticketCount} em 100.000 ({mainPrizeProb.toFixed(3)}%)
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1 block leading-relaxed">
                Na Mega-Sena a chance é 1 em 50.063.860 (500 vezes mais difícil!).
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Official Odds Table / Mobile Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-white text-sm sm:text-base">
            Tabela Detalhada por Faixa de Premiação
          </h3>
          <span className="text-[10px] sm:text-xs text-slate-400">Regulamentação Caixa</span>
        </div>

        {/* Mobile View: High-density interactive cards */}
        <div className="sm:hidden space-y-2.5">
          {LOTERIA_FEDERAL_ODDS.map((odd, idx) => (
            <div
              key={idx}
              className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-xs text-slate-200">{odd.modalidade}</span>
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30 shrink-0">
                  {odd.chance}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Prêmio Médio: <strong className="text-slate-200">{odd.premioTipico}</strong></span>
                <span className="font-mono text-emerald-400 font-semibold">{odd.percentual}</span>
              </div>
              <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80 leading-relaxed">
                {odd.dica}
              </p>
            </div>
          ))}
        </div>

        {/* Tablet & Desktop View: Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-2.5 px-3 font-semibold">Faixa / Modalidade</th>
                <th className="py-2.5 px-3 font-semibold">Probabilidade</th>
                <th className="py-2.5 px-3 font-semibold">Percentual</th>
                <th className="py-2.5 px-3 font-semibold">Prêmio Médio</th>
                <th className="py-2.5 px-3 font-semibold">Como Funciona</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {LOTERIA_FEDERAL_ODDS.map((odd, idx) => (
                <tr key={idx} className="hover:bg-slate-950/50 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-200">{odd.modalidade}</td>
                  <td className="py-3 px-3 font-mono text-amber-400 font-bold">{odd.chance}</td>
                  <td className="py-3 px-3 font-mono text-emerald-400 font-medium">{odd.percentual}</td>
                  <td className="py-3 px-3 text-slate-300 font-semibold">{odd.premioTipico}</td>
                  <td className="py-3 px-3 text-slate-400 leading-relaxed">{odd.dica}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison with other Lotteries */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-6 shadow-xl">
        <h3 className="font-bold text-white text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Comparativo: Loteria Federal vs Outras Loterias Brasileiras
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-center">
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 sm:p-4">
            <span className="text-[11px] sm:text-xs font-bold text-emerald-300 block mb-1">Loteria Federal</span>
            <span className="font-mono text-base sm:text-lg font-black text-white block">1 em 100 mil</span>
            <span className="text-[9px] sm:text-[10px] text-emerald-400 font-semibold uppercase block mt-1">Mais Fácil do Brasil</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 sm:p-4">
            <span className="text-[11px] sm:text-xs font-bold text-slate-400 block mb-1">Lotofácil</span>
            <span className="font-mono text-sm sm:text-lg font-bold text-slate-200 block">1 em 3,2 mi</span>
            <span className="text-[9px] sm:text-[10px] text-slate-500 block mt-1">32x mais difícil</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 sm:p-4">
            <span className="text-[11px] sm:text-xs font-bold text-slate-400 block mb-1">Quina</span>
            <span className="font-mono text-sm sm:text-lg font-bold text-slate-200 block">1 em 24 mi</span>
            <span className="text-[9px] sm:text-[10px] text-slate-500 block mt-1">240x mais difícil</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 sm:p-4">
            <span className="text-[11px] sm:text-xs font-bold text-slate-400 block mb-1">Mega-Sena</span>
            <span className="font-mono text-sm sm:text-lg font-bold text-slate-200 block">1 em 50 mi</span>
            <span className="text-[9px] sm:text-[10px] text-slate-500 block mt-1">500x mais difícil</span>
          </div>
        </div>
      </div>
    </div>
  );
};
