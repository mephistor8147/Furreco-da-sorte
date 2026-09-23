import React, { useState } from 'react';
import { BarChart3, TrendingUp, Flame, Snowflake, PieChart, ShieldCheck } from 'lucide-react';
import { LotteryContest } from '../types/lottery';
import {
  calculateFinalDigitStats,
  calculateDezenaStats,
  calculateParityStats,
  calculateAnimalStats,
} from '../data/mockLotteryData';

interface StatsDashboardProps {
  contests: LotteryContest[];
  onSelectDezena?: (dezena: string) => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  contests,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'finais' | 'dezenas' | 'atrasometro' | 'bichos'>('finais');

  const finalDigitStats = calculateFinalDigitStats(contests);
  const dezenaStats = calculateDezenaStats(contests);
  const parityStats = calculateParityStats(contests);
  const animalStats = calculateAnimalStats(contests);

  const maxFinalCount = Math.max(...finalDigitStats.map(s => s.count), 1);
  const topFinal = finalDigitStats[0];
  const topDezena = dezenaStats.maisFrequentes[0];
  const mostDelayed = dezenaStats.maisAtrasadas[0];
  const topBicho = animalStats[0];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* KPI Top Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
        {/* KPI 1 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 mb-1">
            <span className="truncate">Final Líder</span>
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 shrink-0" />
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400">{topFinal.digit}</span>
            <span className="text-[11px] sm:text-xs text-slate-400">
              ({topFinal.count}x · {topFinal.percentage.toFixed(0)}%)
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1.5 line-clamp-1">Mais sorteado no final do bilhete</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 mb-1">
            <span className="truncate">Dezena Quente</span>
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">{topDezena.dezena}</span>
            <span className="text-[11px] sm:text-xs text-slate-400 truncate">
              ({topDezena.count}x · {topDezena.nomeBicho})
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1.5 line-clamp-1">Maior incidência nos 5 prêmios</p>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 mb-1">
            <span className="truncate">Mais Atrasada</span>
            <Snowflake className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">{mostDelayed.dezena}</span>
            <span className="text-[11px] sm:text-xs text-cyan-300/80">
              ({mostDelayed.concursosAtrasada} conc.)
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1.5 line-clamp-1">Maior tempo sem sair</p>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 mb-1">
            <span className="truncate">Bicho Campeão</span>
            <span className="text-sm sm:text-base shrink-0">{topBicho.emoji}</span>
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-lg sm:text-xl font-bold text-white truncate">{topBicho.nome}</span>
            <span className="text-[11px] sm:text-xs text-amber-400 font-mono">
              ({topBicho.count}x)
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1.5 line-clamp-1">Mais sorteado no 1º prêmio</p>
        </div>
      </div>

      {/* Main Analysis Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-6 shadow-xl">
        {/* Sub Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-5 sm:mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                Análise Estatística & Tendências
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">Dados consolidados da Loteria Federal</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setActiveSubTab('finais')}
              className={`px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs font-semibold rounded-lg transition-colors text-center cursor-pointer ${
                activeSubTab === 'finais' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Finais (0-9)
            </button>
            <button
              onClick={() => setActiveSubTab('dezenas')}
              className={`px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs font-semibold rounded-lg transition-colors text-center cursor-pointer ${
                activeSubTab === 'dezenas' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Top Dezenas
            </button>
            <button
              onClick={() => setActiveSubTab('atrasometro')}
              className={`px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs font-semibold rounded-lg transition-colors text-center cursor-pointer ${
                activeSubTab === 'atrasometro' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Atrasômetro
            </button>
            <button
              onClick={() => setActiveSubTab('bichos')}
              className={`px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs font-semibold rounded-lg transition-colors text-center cursor-pointer ${
                activeSubTab === 'bichos' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              25 Grupos
            </button>
          </div>
        </div>

        {/* View 1: Finais 0-9 Interactive Bar Chart */}
        {activeSubTab === 'finais' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-200">
                Frequência de Ocorrência por Dígito Final (Todos os 5 Prêmios)
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 leading-relaxed">
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
            <div className="sm:hidden space-y-2 pt-2">
              {finalDigitStats.map(item => {
                const widthPercent = Math.max((item.count / maxFinalCount) * 100, 10);
                const isLeader = item.digit === topFinal.digit;

                return (
                  <div
                    key={item.digit}
                    className={`p-2 rounded-xl border flex items-center gap-2.5 transition-colors ${
                      isLeader
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : 'bg-slate-950/60 border-slate-800/80'
                    }`}
                  >
                    {/* Digit Avatar */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-base shrink-0 border ${
                        isLeader
                          ? 'bg-amber-400 text-slate-950 border-amber-300'
                          : 'bg-slate-800 text-slate-100 border-slate-700'
                      }`}
                    >
                      {item.digit}
                    </div>

                    {/* Progress Bar & Stats */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-semibold text-slate-200">
                          {item.count} vezes ({item.percentage.toFixed(1)}%)
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          {item.lastSeenContestsAgo === 0 ? 'Saiu no último!' : `${item.lastSeenContestsAgo} conc. atrás`}
                        </span>
                      </div>

                      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
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
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <PieChart className="w-4 h-4 text-emerald-400" />
                    Balanço de Paridade Geral
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">{parityStats.pares + parityStats.impares} bilhetes</span>
                </div>

                {/* Progress bar */}
                <div className="h-5 bg-slate-800 rounded-full overflow-hidden flex border border-slate-700">
                  <div
                    style={{ width: `${parityStats.percentPares}%` }}
                    className="bg-emerald-500 h-full flex items-center justify-center text-[10px] sm:text-[11px] font-bold text-slate-950 truncate px-1"
                  >
                    Pares {parityStats.percentPares.toFixed(1)}%
                  </div>
                  <div
                    style={{ width: `${parityStats.percentImpares}%` }}
                    className="bg-amber-500 h-full flex items-center justify-center text-[10px] sm:text-[11px] font-bold text-slate-950 truncate px-1"
                  >
                    Ímpares {parityStats.percentImpares.toFixed(1)}%
                  </div>
                </div>

                <p className="text-[11px] sm:text-xs text-slate-400 mt-2.5 leading-relaxed">
                  A paridade na Loteria Federal oscila muito próxima de 50/50, o que reforça a
                  recomendação de apostar em bilhetes equilibrados (com algarismos pares e ímpares mesclados).
                </p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 sm:p-4">
                <span className="font-semibold text-slate-300 text-xs flex items-center gap-1.5 mb-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Dica Estatística do Furreco
                </span>
                <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                  Os bilhetes com finais <strong className="text-amber-300">{topFinal.digit}</strong> e{' '}
                  <strong className="text-amber-300">{finalDigitStats[1]?.digit}</strong> tiveram maior aproveitamento
                  recente. Se for adquirir bilhetes na casa lotérica, priorize frações que combinem com a dezena de maior frequência.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* View 2: Top Dezenas */}
        {activeSubTab === 'dezenas' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                Top 10 Dezenas Mais Sorteadas nos Prêmios Oficiais
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Incidência direta nas duas últimas posições dos bilhetes de 1º a 5º prêmio.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {dezenaStats.maisFrequentes.map((item, index) => (
                <div
                  key={item.dezena}
                  className="bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 text-xs font-mono font-bold flex items-center justify-center">
                      #{index + 1}
                    </span>
                    <div className="w-11 h-11 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center font-mono text-xl font-black text-emerald-300">
                      {item.dezena}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">
                        {item.nomeBicho}
                      </span>
                      <span className="text-xs text-slate-400">
                        Grupo {String(item.grupo).padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black font-mono text-amber-400 block tabular-nums">
                      {item.count} vezes
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {item.concursosAtrasada === 0 ? 'Saiu no último!' : `Atraso: ${item.concursosAtrasada} conc.`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View 3: Atrasômetro */}
        {activeSubTab === 'atrasometro' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Snowflake className="w-4 h-4 text-cyan-400" />
                Atrasômetro da Federal: Dezenas com Maior Defasagem
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Dezenas que estão há mais concursos sem aparecer entre os 5 prêmios principais. Na teoria probabilística,
                dezenas frias tendem ao reequilíbrio pela média histórica.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {dezenaStats.maisAtrasadas.map((item, index) => (
                <div
                  key={item.dezena}
                  className="bg-slate-950/80 border border-cyan-950/60 hover:border-cyan-800/60 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-cyan-400 text-xs font-mono font-bold flex items-center justify-center">
                      #{index + 1}
                    </span>
                    <div className="w-11 h-11 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center font-mono text-xl font-black text-cyan-300">
                      {item.dezena}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">
                        {item.nomeBicho}
                      </span>
                      <span className="text-xs text-slate-400">
                        Grupo {String(item.grupo).padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black font-mono text-cyan-300 block">
                      {item.concursosAtrasada} concursos
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {item.lastSeenContest > 0 ? `Visto no conc. ${item.lastSeenContest}` : 'Sem registro recente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View 4: 25 Grupos do Bicho */}
        {activeSubTab === 'bichos' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                Tabela Oficial dos 25 Grupos da Loteria Federal
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Classificação dos 25 animais tradicionais associados às dezenas finais do 1º prêmio.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
              {animalStats.map(item => (
                <div
                  key={item.grupo}
                  className={`bg-slate-950/80 border rounded-xl p-3 flex flex-col items-center text-center transition-all ${
                    item.count > 0
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <span className="text-3xl mb-1">{item.emoji}</span>
                  <span className="text-xs font-bold text-white leading-tight">
                    {item.nome}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                    Grupo {String(item.grupo).padStart(2, '0')}
                  </span>

                  <div className="mt-2 pt-2 border-t border-slate-800/80 w-full flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">1º Prêmio:</span>
                    <strong className="font-mono text-amber-400">{item.count}x</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
