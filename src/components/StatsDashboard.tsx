// furreco da sorte
import React, { useState } from 'react';
import { BarChart3, TrendingUp, Flame, Snowflake, PieChart, ShieldCheck } from 'lucide-react';
import { LotteryContest } from '../types/lottery';
import {
  calculateFinalDigitStats,
  calculateDezenaStats,
  calculateParityStats,
  calculateAnimalStats,
} from '../data/mockLotteryData';
import { ResponsibleTipsAccuracyCard } from './ResponsibleTipsAccuracyCard';

interface StatsDashboardProps {
  contests: LotteryContest[];
  onSelectDezena?: (dezena: string) => void;
  onNavigateToTab?: (tab: 'stats' | 'history' | 'generator' | 'weekly' | 'odds' | 'responsible' | 'milhar') => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  contests,
  onNavigateToTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'finais' | 'dezenas' | 'atrasometro' | 'bichos' | 'auditoria'>('finais');

  const finalDigitStats = calculateFinalDigitStats(contests);
  const dezenaStats = calculateDezenaStats(contests);
  const parityStats = calculateParityStats(contests);
  const animalStats = calculateAnimalStats(contests);

  const maxFinalCount = Math.max(...finalDigitStats.map(s => s.count), 1);
  const topFinal = finalDigitStats[0];

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

        {/* View 3: Atrasômetro */}
        {activeSubTab === 'atrasometro' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Snowflake className="w-5 h-5 text-cyan-400" />
                Atrasômetro da Federal: Dezenas com Maior Defasagem
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 font-medium leading-relaxed">
                Dezenas que estão há mais concursos sem aparecer entre os 5 prêmios principais. Na teoria probabilística,
                dezenas frias tendem ao reequilíbrio pela média histórica.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {dezenaStats.maisAtrasadas.map((item, index) => (
                <div
                  key={item.dezena}
                  className="bg-slate-950/80 border border-cyan-950/60 hover:border-cyan-800/60 rounded-xl p-3.5 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-slate-800 text-cyan-300 text-xs font-mono font-black flex items-center justify-center shrink-0">
                      #{index + 1}
                    </span>
                    <div className="w-13 h-13 rounded-xl bg-cyan-950/70 border border-cyan-500/50 flex items-center justify-center font-mono text-2xl sm:text-3xl font-black text-cyan-300 shrink-0 shadow-sm">
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
                    <span className="text-base sm:text-lg font-black font-mono text-cyan-300 block">
                      {item.concursosAtrasada} concursos
                    </span>
                    <span className="text-xs sm:text-sm text-slate-200 font-semibold">
                      {item.lastSeenContest > 0 ? `Visto no conc. ${item.lastSeenContest}` : 'Sem registro recente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/70 p-3.5 sm:p-4 rounded-xl border border-cyan-500/30">
              <span className="text-xs sm:text-sm text-slate-200 font-medium">
                ❄️ Atrasos são acompanhados na Peça 2 de Apostas Conscientes:
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

