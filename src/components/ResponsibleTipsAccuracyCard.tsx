// furreco da sorte
import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Award,
  ChevronDown,
  ChevronUp,
  Percent,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  History,
  Info,
} from 'lucide-react';
import { LotteryContest } from '../types/lottery';
import { computeBichoAccuracyReport, ContestTipAudit } from '../utils/bichoStatsUtils';

interface ResponsibleTipsAccuracyCardProps {
  contests: LotteryContest[];
  onNavigateToTab?: (tab: 'stats' | 'history' | 'generator' | 'weekly' | 'odds' | 'responsible' | 'milhar') => void;
}

export const ResponsibleTipsAccuracyCard: React.FC<ResponsibleTipsAccuracyCardProps> = ({
  contests,
  onNavigateToTab,
}) => {
  const [filter, setFilter] = useState<'all' | 'cabeca' | 'cercado' | 'erro'>('all');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [visibleCount, setVisibleCount] = useState<number>(8);

  // Compute accuracy audit
  const report = useMemo(() => computeBichoAccuracyReport(contests), [contests]);

  const filteredAudits = useMemo(() => {
    if (filter === 'cabeca') {
      return report.audits.filter(a => a.hitType === 'cabeca');
    }
    if (filter === 'cercado') {
      return report.audits.filter(a => a.hitType === 'cercado' || a.hitType === 'cabeca');
    }
    if (filter === 'erro') {
      return report.audits.filter(a => a.hitType === 'erro');
    }
    return report.audits;
  }, [report.audits, filter]);

  if (report.totalAudited === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border-b border-slate-800/80 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-400 flex items-center justify-center text-slate-950 shrink-0 shadow-md shadow-emerald-950/50">
              <ShieldCheck className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Percent className="w-3 h-3" />
                  Auditoria de Backtest & Transparência Real
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {report.totalAudited} sorteios auditados
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white leading-tight mt-0.5">
                Taxas de Acertos e Erros · Dicas de Apostas Conscientes
              </h3>
            </div>
          </div>

          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('responsible')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer shrink-0 active:scale-95 shadow-sm"
              title="Ir para o menu Apostas Conscientes para ver as 3 Peças e gestão de banca"
            >
              <span>Ver Dicas Atuais</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          Validação retroativa (sem viés de futuro) das <strong className="text-white">3 Peças de Bichos</strong> recomendadas pelo menu Apostas Conscientes. Cada sorteio foi auditado comparando as sugestões estatísticas calculadas previamente com o resultado oficial apurado pela Caixa.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 space-y-5">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Acertos Cercados (1º ao 5º) */}
          <div className="bg-slate-950/70 border border-emerald-500/30 rounded-xl p-3.5 sm:p-4 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-emerald-400 mb-1">
                <span className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Acertos no 1º ao 5º (Cercado)
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                  {report.accuracyRateCercado.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ({report.totalHitsCercado}/{report.totalAudited})
                </span>
              </div>
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(report.accuracyRateCercado, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Pelo menos 1 dos 3 grupos pontuou entre os 5 prêmios oficiais da Federal.
              </p>
            </div>
          </div>

          {/* Card 2: Acertos na Cabeça (1º Prêmio) */}
          <div className="bg-slate-950/70 border border-amber-500/30 rounded-xl p-3.5 sm:p-4 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-amber-400 mb-1">
                <span className="font-bold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Acertos na Cabeça (1º Prêmio)
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
                  {report.accuracyRateCabeca.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ({report.totalHitsCabeca}/{report.totalAudited})
                </span>
              </div>
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(report.accuracyRateCabeca * 3, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Grupo indicado bateu direto no 1º prêmio principal (chance aleatória pura: 12%).
              </p>
            </div>
          </div>

          {/* Card 3: Taxa de Erros (Sem Acerto) */}
          <div className="bg-slate-950/70 border border-rose-500/30 rounded-xl p-3.5 sm:p-4 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-rose-400 mb-1">
                <span className="font-bold flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  Taxa de Erros (Sem Pontuação)
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black font-mono text-rose-400">
                  {report.errorRate.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ({report.totalErrors}/{report.totalAudited})
                </span>
              </div>
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(report.errorRate, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Concursos onde nenhum dos 3 grupos sugeridos pontuou nos 5 prêmios.
              </p>
            </div>
          </div>

          {/* Card 4: Assertividade por Peça */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 sm:p-4 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  Acertos por Tipo de Peça
                </span>
              </div>
              <div className="space-y-1.5 mt-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">🔥 Peça 1 (Alta/Quente):</span>
                  <span className="font-mono text-amber-300 font-bold">{report.piece1Rate.toFixed(0)}% ({report.piece1Hits}x)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">⏳ Peça 2 (Atrasado):</span>
                  <span className="font-mono text-cyan-300 font-bold">{report.piece2Rate.toFixed(0)}% ({report.piece2Hits}x)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">⚖️ Peça 3 (Tendência):</span>
                  <span className="font-mono text-emerald-300 font-bold">{report.piece3Rate.toFixed(0)}% ({report.piece3Hits}x)</span>
                </div>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
              Duques de Grupos pontuados: <strong className="text-amber-400 font-mono">{report.duqueHits}x</strong> ({report.duqueRate.toFixed(1)}%)
            </div>
          </div>
        </div>

        {/* Visual Stacked Performance Bar */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-1">
            <span className="font-semibold text-slate-200">
              Distribuição Visual de Resultados ({report.totalAudited} Concursos Auditados):
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-amber-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
                Cabeça ({report.totalHitsCabeca}x)
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                Cercado ({report.totalHitsCercado - report.totalHitsCabeca}x)
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                Sem Acerto ({report.totalErrors}x)
              </span>
            </div>
          </div>

          <div className="w-full h-4 bg-slate-900 rounded-lg overflow-hidden flex border border-slate-800">
            {report.totalHitsCabeca > 0 && (
              <div
                style={{ width: `${(report.totalHitsCabeca / report.totalAudited) * 100}%` }}
                className="bg-amber-400 h-full transition-all duration-500"
                title={`Acertos Cabeça: ${report.totalHitsCabeca} (${report.accuracyRateCabeca.toFixed(1)}%)`}
              />
            )}
            {report.totalHitsCercado > report.totalHitsCabeca && (
              <div
                style={{
                  width: `${((report.totalHitsCercado - report.totalHitsCabeca) / report.totalAudited) * 100}%`,
                }}
                className="bg-emerald-500 h-full transition-all duration-500"
                title={`Acertos Cercado: ${report.totalHitsCercado - report.totalHitsCabeca} (${((report.totalHitsCercado - report.totalHitsCabeca) / report.totalAudited * 100).toFixed(1)}%)`}
              />
            )}
            {report.totalErrors > 0 && (
              <div
                style={{ width: `${(report.totalErrors / report.totalAudited) * 100}%` }}
                className="bg-rose-500/80 h-full transition-all duration-500"
                title={`Sem Acerto: ${report.totalErrors} (${report.errorRate.toFixed(1)}%)`}
              />
            )}
          </div>
        </div>

        {/* Detailed Timeline Table Section */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400 shrink-0" />
              <h4 className="text-xs sm:text-sm font-bold text-white">
                Histórico de Validação Concurso a Concurso
              </h4>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  filter === 'all'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos ({report.totalAudited})
              </button>
              <button
                onClick={() => setFilter('cabeca')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  filter === 'cabeca'
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🎯 Cabeça ({report.totalHitsCabeca})
              </button>
              <button
                onClick={() => setFilter('cercado')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  filter === 'cercado'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ✨ Cercado ({report.totalHitsCercado})
              </button>
              <button
                onClick={() => setFilter('erro')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  filter === 'erro'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ❌ Erros ({report.totalErrors})
              </button>
            </div>
          </div>

          {/* List of Audited Contests */}
          <div className="space-y-2">
            {filteredAudits.slice(0, visibleCount).map((audit) => {
              const isCabeca = audit.hitType === 'cabeca';
              const isCercado = audit.hitType === 'cercado';
              const isErro = audit.hitType === 'erro';

              return (
                <div
                  key={audit.concurso}
                  className={`p-3 sm:p-3.5 rounded-xl border transition-all text-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3 ${
                    isCabeca
                      ? 'bg-amber-950/20 border-amber-500/40 shadow-sm'
                      : isCercado
                      ? 'bg-emerald-950/15 border-emerald-500/30'
                      : 'bg-slate-950/60 border-slate-800/80 opacity-90'
                  }`}
                >
                  {/* Left: Contest Info & 1st Prize Drawn */}
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-white text-xs sm:text-sm shrink-0">
                      #{audit.concurso}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono shrink-0">
                      {audit.data}
                    </span>

                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80">
                      <span className="text-slate-400 text-[10px]">1º Prêmio:</span>
                      <strong className="font-mono text-white text-xs">{audit.firstPrizeTicket}</strong>
                      <span className="text-xs">{audit.firstPrizeAnimal.emoji}</span>
                      <span className="text-[11px] text-slate-300 hidden sm:inline">
                        {audit.firstPrizeAnimal.nome} (Gr. {audit.firstPrizeAnimal.grupo})
                      </span>
                    </div>
                  </div>

                  {/* Middle: 3 Tips that were Recommended */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="text-slate-500 text-[10px] hidden md:inline">Dicas dadas:</span>
                    <span
                      className={`px-2 py-0.5 rounded font-medium border flex items-center gap-1 ${
                        audit.hitPiece1
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                      title={`Peça 1: ${audit.tips.peca1.animal.nome} (Dez. ${audit.tips.peca1.dezena})`}
                    >
                      <span>🔥 P1:</span>
                      <span>{audit.tips.peca1.animal.emoji}</span>
                      <span>Gr.{audit.tips.peca1.animal.grupo}</span>
                      {audit.hitPiece1 && <CheckCircle2 className="w-3 h-3 text-amber-400" />}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded font-medium border flex items-center gap-1 ${
                        audit.hitPiece2
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                      title={`Peça 2: ${audit.tips.peca2.animal.nome} (Dez. ${audit.tips.peca2.dezena})`}
                    >
                      <span>⏳ P2:</span>
                      <span>{audit.tips.peca2.animal.emoji}</span>
                      <span>Gr.{audit.tips.peca2.animal.grupo}</span>
                      {audit.hitPiece2 && <CheckCircle2 className="w-3 h-3 text-cyan-400" />}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded font-medium border flex items-center gap-1 ${
                        audit.hitPiece3
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                      title={`Peça 3: ${audit.tips.peca3.animal.nome} (Dez. ${audit.tips.peca3.dezena})`}
                    >
                      <span>⚖️ P3:</span>
                      <span>{audit.tips.peca3.animal.emoji}</span>
                      <span>Gr.{audit.tips.peca3.animal.grupo}</span>
                      {audit.hitPiece3 && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    </span>
                  </div>

                  {/* Right: Hit Result Badge & Details */}
                  <div className="flex items-center justify-between lg:justify-end gap-2 shrink-0">
                    {isCabeca ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 shadow-sm">
                        <Award className="w-3.5 h-3.5" />
                        <span>Acerto na Cabeça (1º)</span>
                      </span>
                    ) : isCercado ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Acerto no 1º ao 5º</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-950/40 text-rose-300 border border-rose-500/30">
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Sem Acerto (Erro)</span>
                      </span>
                    )}

                    {audit.hitDetails.length > 0 && (
                      <span className="text-[10px] text-slate-400 hidden xl:inline max-w-xs truncate" title={audit.hitDetails.join(' | ')}>
                        {audit.hitDetails[0]}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show More / Show Less Button */}
          {filteredAudits.length > 8 && (
            <div className="text-center pt-1">
              <button
                onClick={() => setVisibleCount(prev => (prev >= filteredAudits.length ? 8 : prev + 10))}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>{visibleCount >= filteredAudits.length ? 'Mostrar Menos Sorteios' : `Ver Mais Sorteios (${filteredAudits.length - visibleCount} restantes)`}</span>
                {visibleCount >= filteredAudits.length ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Transparency Footer Note */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 sm:p-4 text-[11px] text-slate-400 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-slate-200 block font-semibold">
              Por que exibimos taxas de erros com total transparência?
            </strong>
            <p className="leading-relaxed">
              Diferente de promessas ilusórias de acerto garantido, o <strong className="text-emerald-300">Furreco da Sorte</strong> atua sob os princípios do Jogo Consciente. Apresentar dados reais de assertividade (tanto acertos quanto erros) educa o apostador sobre o peso da aleatoriedade e reforça a importância de nunca ultrapassar seu orçamento de lazer (R$ 0,50 a R$ 2,00 por aposta).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
