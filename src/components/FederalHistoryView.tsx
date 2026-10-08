import React, { useState } from 'react';
import { History, Calendar, Trophy, ChevronRight, Check, Search, TrendingUp, Sparkles, RefreshCw } from 'lucide-react';
import { FederalContest } from '../types/bicho';
import { getAnimalByGroup } from '../data/bichoTable';
import { analyzeFederalContests } from '../utils/bichoEngine';

interface FederalHistoryViewProps {
  contests: FederalContest[];
  selectedContest: FederalContest;
  onSelectContest: (contest: FederalContest) => void;
  isSyncing?: boolean;
  onSyncFederal?: () => void;
}

export function FederalHistoryView({
  contests,
  selectedContest,
  onSelectContest,
  isSyncing = false,
  onSyncFederal,
}: FederalHistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [historyTab, setHistoryTab] = useState<'sorteios' | 'atrasometro' | 'frequencia'>('sorteios');

  const stats = analyzeFederalContests(contests);

  const filteredContests = contests.filter(c => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const matchNum = c.concurso.toString().includes(term);
    const matchAnimal = c.premios.some(p => p.bichoNome.toLowerCase().includes(term));
    const matchBilhete = c.premios.some(p => p.bilhete.includes(term));
    return matchNum || matchAnimal || matchBilhete;
  });

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Title & Sync Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            Sorteios da Loteria Federal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Consulte os resultados oficiais dos 5 prêmios e aprofunde nas estatísticas de frequência e atraso.
          </p>
        </div>

        {onSyncFederal && (
          <button
            onClick={onSyncFederal}
            disabled={isSyncing}
            className={`min-h-[44px] px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all self-start sm:self-auto shrink-0 shadow-md ${
              isSyncing
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-950/30'
            }`}
            title="Sincronizar resultados com a Caixa Econômica Federal"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Buscando...' : 'Atualizar na Caixa'}</span>
          </button>
        )}
      </div>

      {/* Sub-Tabs (Segmented control) */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => setHistoryTab('sorteios')}
          className={`min-h-[44px] flex-1 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            historyTab === 'sorteios' ? 'bg-amber-400 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Últimos Concursos
        </button>
        <button
          onClick={() => setHistoryTab('atrasometro')}
          className={`min-h-[44px] flex-1 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            historyTab === 'atrasometro' ? 'bg-amber-400 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Atrasômetro
        </button>
        <button
          onClick={() => setHistoryTab('frequencia')}
          className={`min-h-[44px] flex-1 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            historyTab === 'frequencia' ? 'bg-amber-400 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Mais Frequentes
        </button>
      </div>

      {historyTab === 'sorteios' && (
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por concurso, número ou bicho (ex: 6106 ou Cavalo)..."
              className="w-full h-11 pl-10 pr-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Lista de Concursos */}
          <div className="space-y-3">
            {filteredContests.map(c => {
              const isSelected = selectedContest.concurso === c.concurso;
              const p1 = c.premios[0];
              const animal1 = getAnimalByGroup(p1.grupo);

              return (
                <div
                  key={c.concurso}
                  className={`rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? 'bg-slate-900/90 border-amber-500/50 shadow-lg shadow-amber-950/20'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        Concurso {c.concurso}
                      </span>
                      <span className="text-[11px] text-slate-400">· {c.data}</span>
                    </div>

                    <button
                      onClick={() => onSelectContest(c)}
                      className={`min-h-[44px] px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Base Ativa</span>
                        </>
                      ) : (
                        <span>Usar como Base</span>
                      )}
                    </button>
                  </div>

                  {/* 1º Prêmio com destaque */}
                  <div className="bg-slate-950 rounded-xl p-2.5 mb-2.5 flex items-center justify-between border border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-400">1º Prêmio:</span>
                      <span className="font-mono text-base font-extrabold text-white">
                        {p1.milhar}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">({p1.dezena})</span>
                    </div>
                    <span className="text-xs font-bold text-amber-300">
                      Gr. {p1.grupo.toString().padStart(2, '0')} · {animal1.nome}
                    </span>
                  </div>

                  {/* 2º ao 5º Prêmios */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {c.premios.slice(1).map(p => {
                      const an = getAnimalByGroup(p.grupo);
                      return (
                        <div key={p.ordem} className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 text-xs">
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>{p.ordem}º Prêmio</span>
                            <span className="font-mono text-slate-300">{p.dezena}</span>
                          </div>
                          <div className="font-mono font-bold text-slate-100 text-sm mt-0.5">
                            {p.milhar}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">
                            {an.nome}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {historyTab === 'atrasometro' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <h2 className="text-sm font-bold text-white mb-1">
              Grupos Mais Atrasados na Federal
            </h2>
            <p className="text-xs text-slate-400 mb-3">
              Quantidade de sorteios consecutivos em que o grupo não apareceu em nenhum dos 5 prêmios.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {stats.gruposMaisAtrasados.map(g => (
                <div key={g.grupo} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-white block">
                      Gr. {g.grupo.toString().padStart(2, '0')} · {g.nome}
                    </span>
                    <span className="text-[10px] text-slate-400">Saídas: {g.total}x</span>
                  </div>
                  <span className={`font-mono text-xs font-bold px-2 py-1 rounded-lg ${
                    g.atraso > 2 ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {g.atraso} conc.
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <h2 className="text-sm font-bold text-white mb-1">
              Dezenas Mais Atrasadas (Ciclo Quente)
            </h2>
            <p className="text-xs text-slate-400 mb-3">
              Dezenas com maior probabilidade de retorno estatístico por tempo decorrido.
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {stats.dezenasMaisAtrasadas.slice(0, 12).map(d => (
                <div key={d.dezena} className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-center">
                  <span className="font-mono text-lg font-bold text-amber-300 block">{d.dezena}</span>
                  <span className="text-[10px] text-slate-400 block">{d.bicho}</span>
                  <span className="text-[9px] text-rose-400 font-semibold block mt-1">{d.atraso} sorteios</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {historyTab === 'frequencia' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <h2 className="text-sm font-bold text-white mb-1">
              Dezenas Mais Frequentes da Federal
            </h2>
            <p className="text-xs text-slate-400 mb-3">
              Dezenas que mais pontuaram nos 5 prêmios oficiais da Federal nos últimos sorteios.
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {stats.dezenasMaisFrequentes.slice(0, 12).map(d => (
                <div key={d.dezena} className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-center">
                  <span className="font-mono text-lg font-bold text-emerald-300 block">{d.dezena}</span>
                  <span className="text-[10px] text-slate-400 block">{d.bicho}</span>
                  <span className="text-[9px] text-emerald-400 font-semibold block mt-1">{d.total} saídas</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <h2 className="text-sm font-bold text-white mb-1">
              Bichos Mais Frequentes da Federal
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {stats.gruposMaisFrequentes.slice(0, 8).map(g => (
                <div key={g.grupo} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-white block">
                      Gr. {g.grupo.toString().padStart(2, '0')} · {g.nome}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-lg">
                    {g.total} saídas
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
