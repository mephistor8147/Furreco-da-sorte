import React, { useState } from 'react';
import { Calendar, TrendingUp, Copy, Check, Printer, FileText, ArrowRight } from 'lucide-react';
import { LotteryContest } from '../types/lottery';
import { generateWeeklyReports } from '../data/mockLotteryData';
import { formatCurrency, formatTicket } from '../utils/lotteryUtils';

interface WeeklyReportViewProps {
  contests: LotteryContest[];
}

export const WeeklyReportView: React.FC<WeeklyReportViewProps> = ({ contests }) => {
  const weeklyReports = generateWeeklyReports(contests);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (weeklyReports.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        Nenhum relatório semanal disponível no momento.
      </div>
    );
  }

  const currentReport = weeklyReports[selectedWeekIndex] || weeklyReports[0];

  const handleCopyReport = () => {
    const text = `📊 *FURRECO DA SORTE - RELATÓRIO SEMANAL DA LOTERIA FEDERAL*\n` +
      `📅 ${currentReport.semana}\n\n` +
      `💰 Total Distribuído em Prêmios: ${formatCurrency(currentReport.totalDistribuido)}\n` +
      `🏆 Bicho Destaque: ${currentReport.bichoDestaque.nome} (${currentReport.bichoDestaque.emoji})\n` +
      `🎯 Dezenas Repetidas: ${currentReport.dezenasRepetidas.length > 0 ? currentReport.dezenasRepetidas.join(', ') : 'Nenhuma repetição'}\n` +
      `🔢 Finais Mais Fortes: ${currentReport.finaisMaisFrequentes.join(', ')}\n` +
      `⚖️ Paridade: ${currentReport.balancoParidade.pares} Pares / ${currentReport.balancoParidade.impares} Ímpares\n\n` +
      `📌 Concursos Analisados:\n` +
      currentReport.concursos.map(c => `• Conc. ${c.concurso} (${c.diaSemana}): 1º Prêmio ${formatTicket(c.premios[0].bilhete)} (${c.bichoPrincipal.nome})`).join('\n') +
      `\n\n🍀 Acesse Furreco da Sorte para estatísticas e palpites completos!`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Selector & Actions Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
              Desempenho Semanal Comparativo
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white leading-tight">Relatório Consolidado dos Sorteios</h2>
          </div>
        </div>

        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full sm:w-auto">
          {/* Week Selector Dropdown */}
          <select
            value={selectedWeekIndex}
            onChange={e => setSelectedWeekIndex(Number(e.target.value))}
            className="bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500 min-h-[40px]"
          >
            {weeklyReports.map((rep, idx) => (
              <option key={idx} value={idx}>
                {rep.semana}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyReport}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer min-h-[40px]"
              title="Copiar relatório para WhatsApp / Telegram"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 border border-emerald-500/30 cursor-pointer min-h-[40px]"
              title="Imprimir relatório"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Report Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-8 shadow-xl space-y-4 sm:space-y-6">
        {/* Report Header */}
        <div className="border-b border-slate-800 pb-4 sm:pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-amber-400 text-[11px] sm:text-xs font-mono font-bold uppercase mb-1">
              <Calendar className="w-3.5 h-3.5" />
              {currentReport.semana}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Balanço Semanal da Loteria Federal
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
              {currentReport.destaqueTexto}
            </p>
          </div>

          <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-left sm:text-right">
            <span className="text-[10px] sm:text-[11px] text-slate-400 block uppercase font-medium">
              Premiação Total na Semana
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 tabular-nums">
              {formatCurrency(currentReport.totalDistribuido)}
            </span>
          </div>
        </div>

        {/* Weekly Metric Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Highlight 1: Dezenas Repetidas */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 block mb-1">Dezenas com Repetição</span>
            {currentReport.dezenasRepetidas.length > 0 ? (
              <div className="flex items-center gap-2 flex-wrap mt-1">
                {currentReport.dezenasRepetidas.map(d => (
                  <span
                    key={d}
                    className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-sm border border-amber-500/40"
                  >
                    {d}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-sm font-semibold text-slate-400">Nenhuma repetição direta</span>
            )}
            <p className="text-[11px] text-slate-500 mt-2">
              Incidência idêntica em mais de um prêmio na mesma semana
            </p>
          </div>

          {/* Highlight 2: Finais Mais Fortes */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 block mb-1">Finais Mais Frequentes</span>
            <div className="flex items-center gap-2 mt-1">
              {currentReport.finaisMaisFrequentes.map(fin => (
                <span
                  key={fin}
                  className="w-7 h-7 rounded-full bg-emerald-950 text-emerald-300 font-mono font-bold text-sm flex items-center justify-center border border-emerald-500/30"
                >
                  {fin}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Dígitos finais com melhor restituição nos bilhetes
            </p>
          </div>

          {/* Highlight 3: Paridade Semanal */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 block mb-1">Equilíbrio de Paridade</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-bold text-emerald-400">
                {currentReport.balancoParidade.pares} Pares
              </span>
              <span className="text-slate-600">/</span>
              <span className="text-sm font-bold text-amber-400">
                {currentReport.balancoParidade.impares} Ímpares
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Distribuição nos 5 prêmios dos sorteios da semana
            </p>
          </div>
        </div>

        {/* Comparison Table Between Contests of the Week */}
        <div className="pt-2">
          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Comparativo Direto entre os Concursos da Semana
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentReport.concursos.map(c => (
              <div
                key={c.concurso}
                className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-emerald-400">
                      Concurso {c.concurso}
                    </span>
                    <span className="text-xs text-slate-400">({c.diaSemana} - {c.data})</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    1º: {c.bichoPrincipal.emoji} {c.bichoPrincipal.nome}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {c.premios.map(p => (
                    <div
                      key={p.ordem}
                      className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-900/60 border border-slate-800/60"
                    >
                      <span className="text-slate-400 font-medium">{p.ordem}º Prêmio</span>
                      <span className="font-mono font-bold text-white tracking-wider">
                        {formatTicket(p.bilhete)}
                      </span>
                      <span className="font-mono text-emerald-400 font-medium">
                        {formatCurrency(p.valorPremio)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Furreco Weekly Takeaway */}
        <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-200">
          <span className="text-xl">🍀</span>
          <div>
            <strong className="text-amber-300 font-bold block mb-0.5">
              Conclusão da Equipe Furreco para a Próxima Semana:
            </strong>
            Com base no comportamento desta semana, a dispersão dos finais aponta para retorno de terminações médias (4, 5 e 6).
            Ao montar seus jogos com o Gerador do Furreco, experimente combinar a estratégia "Equilíbrio" com uma dezena atrasada.
          </div>
        </div>
      </div>
    </div>
  );
};
