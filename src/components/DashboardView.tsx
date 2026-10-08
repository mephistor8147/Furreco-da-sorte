import React from 'react';
import { Flame, Copy, ArrowRight, TrendingUp, Sparkles, Trophy, Zap, Compass, RefreshCw } from 'lucide-react';
import { FederalContest, HotTip } from '../types/bicho';
import { getAnimalByGroup } from '../data/bichoTable';
import { analyzeFederalContests } from '../utils/bichoEngine';

interface DashboardViewProps {
  contest: FederalContest;
  allContests: FederalContest[];
  hotTips: HotTip[];
  onSelectModality: (modality: string) => void;
  onCopyText: (text: string, label: string) => void;
  bannerImage: string;
  isSyncing?: boolean;
  lastSyncTime?: string | null;
  onSyncFederal?: () => void;
}

export function DashboardView({
  contest,
  allContests,
  hotTips,
  onSelectModality,
  onCopyText,
  bannerImage,
  isSyncing = false,
  lastSyncTime,
  onSyncFederal,
}: DashboardViewProps) {
  const p1 = contest.premios[0];
  const animalP1 = getAnimalByGroup(p1.grupo);
  const puxadas = animalP1.puxadas.map(g => getAnimalByGroup(g));
  const stats = analyzeFederalContests(allContests);

  const milharTip = hotTips.find(t => t.modalidade === 'milhar');
  const mcTip = hotTips.find(t => t.modalidade === 'milhar_centena');
  const ciTip = hotTips.find(t => t.modalidade === 'centena_invertida');
  const duqueTip = hotTips.find(t => t.modalidade === 'duque_dezena');
  const ternoTip = hotTips.find(t => t.modalidade === 'terno_grupo');

  const handleCopyAllDailyTips = () => {
    const lines = [
      `🍀 PALPITES QUENTES - BICHO DA FEDERAL`,
      `Base: Concurso ${contest.concurso} (${contest.data})`,
      `1º Prêmio: ${p1.milhar} - Gr. ${p1.grupo.toString().padStart(2, '0')} (${animalP1.nome})`,
      ``,
      `🎯 MILHAR: ${milharTip?.numeros.slice(0, 3).join(' - ') || '9842 - 8418'}`,
      `🎯 MILHAR COM CENTENA (MC): ${mcTip?.numeros[0] || '8542 (MC)'}`,
      `🎯 CENTENA INVERTIDA (CI): ${ciTip?.inversoes?.slice(0, 6).join(' · ') || '542 · 524 · 452'}`,
      `🎯 DUQUE DE DEZENAS: ${duqueTip?.numeros.join(' - ') || '42 - 18 - 38'}`,
      `🎯 TERNO DE GRUPO: ${ternoTip?.numeros.slice(0, 3).join(' + ') || 'Cavalo + Coelho + Jacaré'}`,
      ``,
      `Aposte com consciência. Boa sorte! 🍀`,
    ];
    onCopyText(lines.join('\n'), 'Todos os palpites do dia copiados!');
  };

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Visual Hero Banner with Scrim */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
        <div className="relative h-44 sm:h-52 w-full bg-slate-950">
          <img
            src={bannerImage}
            alt="Loteria Federal e Jogo do Bicho"
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
            onError={e => {
              // Fallback graceful background if image load issues arise
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>

        <div className="absolute inset-0 p-5 flex flex-col justify-end">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
            <Flame className="w-4 h-4 fill-amber-400" />
            <span>Palpites de Alta Probabilidade</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="text-slate-300">Base Loteria Federal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Dicas Quentes do Bicho
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 mt-1 line-clamp-2">
            Desdobramentos estatísticos para Milhar, Centena Invertida, Duques e Ternos baseados no Concurso {contest.concurso}.
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleCopyAllDailyTips}
              className="min-h-[44px] px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-900/30 flex items-center gap-2 active:scale-95 transition-transform cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              Copiar Palpites do Dia
            </button>
            <button
              onClick={() => onSelectModality('milhar_centena')}
              className="min-h-[44px] px-3 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Ver Modalidades</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Resultado Base da Loteria Federal (1º ao 5º Prêmio) */}
      <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Último Sorteio da Federal ({contest.concurso})
            </h2>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              · {contest.data} · Oficial Caixa
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {lastSyncTime && (
              <span className="text-[10px] text-slate-400 hidden xs:inline">
                Sincronizado às {lastSyncTime}
              </span>
            )}
            <button
              onClick={onSyncFederal}
              disabled={isSyncing}
              className={`min-h-[44px] px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95 ${
                isSyncing
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-950/30'
              }`}
              title="Buscar sorteio mais recente na Caixa Econômica Federal"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Atualizando...' : 'Atualizar Resultado da Federal'}</span>
            </button>
          </div>
        </div>

        {/* 1º Prêmio Destacado na Cabeça */}
        <div className="bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-950 border border-amber-500/30 rounded-2xl p-3.5 mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-amber-300">1º Prêmio (Na Cabeça)</span>
            <span className="text-[11px] text-amber-400/80 font-mono">Bilhete: {p1.bilhete}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white font-mono tracking-tight tabular-nums">
                {p1.milhar}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                (Centena <strong className="text-slate-200">{p1.centena}</strong> · Dezena <strong className="text-amber-400">{p1.dezena}</strong>)
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-amber-300 block">
                Gr. {p1.grupo.toString().padStart(2, '0')} · {animalP1.nome}
              </span>
              <span className="text-[10px] text-slate-400">
                Dezenas: {animalP1.dezenas.join(', ')}
              </span>
            </div>
          </div>
        </div>

        {/* 2º ao 5º Prêmios */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {contest.premios.slice(1).map(pr => {
            const animal = getAnimalByGroup(pr.grupo);
            return (
              <div
                key={pr.ordem}
                className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>{pr.ordem}º Prêmio</span>
                  <span className="font-mono text-slate-300 font-semibold">{pr.dezena}</span>
                </div>
                <div className="font-mono text-base font-bold text-white tabular-nums">
                  {pr.milhar}
                </div>
                <div className="text-[11px] text-slate-300 font-medium truncate mt-1">
                  Gr. {pr.grupo} · {animal.nome}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Puxadas Tradicionais da Federal */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Puxadas do {animalP1.nome} (1º Prêmio)
            </h3>
          </div>
          <span className="text-[11px] text-emerald-400/90 font-medium">
            Alta atração
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Pela tabela tradicional de puxadas, quando sai {animalP1.nome} na cabeça, os bichos mais atraídos para os próximos sorteios são:
        </p>

        <div className="grid grid-cols-3 gap-2">
          {puxadas.map(b => (
            <div
              key={b.grupo}
              className="bg-slate-950/80 border border-emerald-500/20 rounded-xl p-2 text-center"
            >
              <div className="text-xs font-bold text-emerald-300">
                Gr. {b.grupo.toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-white font-semibold truncate">
                {b.nome}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {b.dezenas.join('·')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cards de Destaque das Modalidades Requisitadas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Palpites por Modalidade
          </h2>
          <span className="text-[11px] text-slate-400">
            Prontos para apostar
          </span>
        </div>

        {/* 1. Milhar & Milhar com Centena (MC) */}
        <div className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 transition-colors rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400">MILHAR COM CENTENA (MC)</span>
              <span className="text-[11px] text-emerald-400 font-medium">Top Retorno</span>
            </div>
            <button
              onClick={() => onSelectModality('milhar_centena')}
              className="min-h-[44px] min-w-[44px] text-xs text-amber-400 font-semibold hover:underline flex items-center justify-end"
            >
              Detalhes & Cotação
            </button>
          </div>
          <p className="text-xs text-slate-400 mb-2">
            Aposte na milhar com cobertura direta da centena (4.600x na cabeça ou 920x cercada).
          </p>
          <div className="flex flex-wrap gap-2">
            {mcTip?.numeros.map((num, i) => (
              <button
                key={i}
                onClick={() => onCopyText(num, `Palpite MC copiado: ${num}`)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl font-mono text-sm font-bold text-amber-300 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
                title="Toque para copiar"
              >
                <span>{num}</span>
                <Copy className="w-3 h-3 text-slate-500" />
              </button>
            ))}
          </div>
        </div>

        {/* 2. Centena Invertida (CI) */}
        <div className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/30 transition-colors rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-400">CENTENA INVERTIDA (CI)</span>
              <span className="text-[11px] text-slate-400">6 permutações</span>
            </div>
            <button
              onClick={() => onSelectModality('centena_invertida')}
              className="min-h-[44px] min-w-[44px] text-xs text-indigo-400 font-semibold hover:underline flex items-center justify-end"
            >
              Ver Inversões
            </button>
          </div>
          <p className="text-xs text-slate-400 mb-2">
            Ganha se os 3 números saírem em qualquer ordem na cabeça ou cercado.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ciTip?.inversoes?.slice(0, 6).map((inv, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs font-semibold text-slate-200"
              >
                {inv}
              </span>
            ))}
          </div>
        </div>

        {/* 3. Duque e Terno Combinado e Cercado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Duque de Dezenas */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-rose-400">DUQUE COMBINADO (1º AO 5º)</span>
              <span className="text-[11px] text-slate-400">300x</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Dezenas com maior atração para formarem duplas premiadas.
            </p>
            <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-rose-300">
              {duqueTip?.numeros.map((d, i) => (
                <span key={i} className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg">
                  {d}
                </span>
              ))}
            </div>
            <button
              onClick={() => onSelectModality('duque_dezena')}
              className="mt-3 text-xs text-rose-400 hover:underline font-semibold cursor-pointer block"
            >
              Ver 6 combinações formadas →
            </button>
          </div>

          {/* Terno de Grupo */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-emerald-400">TERNO COMBINADO & CERCADO</span>
              <span className="text-[11px] text-slate-400">130x / 3000x</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Terno de bichos convergentes nos 5 prêmios da Federal.
            </p>
            <div className="flex flex-wrap gap-1 text-xs font-medium text-emerald-300">
              {ternoTip?.numeros.slice(0, 4).map((b, i) => (
                <span key={i} className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg">
                  {b}
                </span>
              ))}
            </div>
            <button
              onClick={() => onSelectModality('terno_grupo')}
              className="mt-3 text-xs text-emerald-400 hover:underline font-semibold cursor-pointer block"
            >
              Ver desdobramento completo →
            </button>
          </div>
        </div>
      </div>

      {/* Atrasômetro Resumo */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white">Dezenas Mais Atrasadas na Federal</h3>
          </div>
          <span className="text-[10px] text-slate-400">Ciclo de Repetição</span>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          {stats.dezenasMaisAtrasadas.slice(0, 4).map(item => (
            <div key={item.dezena} className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="font-mono text-base font-extrabold text-amber-300 block">{item.dezena}</span>
              <span className="text-[10px] text-slate-400 block">{item.bicho}</span>
              <span className="text-[9px] text-rose-400 font-semibold block mt-0.5">{item.atraso} sorteios sem sair</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
