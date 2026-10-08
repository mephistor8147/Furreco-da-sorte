import React, { useState } from 'react';
import { Compass, Search, Copy, ArrowRight, Sparkles } from 'lucide-react';
import { BICHO_GROUPS, getAnimalByDezena, getAnimalByGroup } from '../data/bichoTable';

interface BichoTableViewProps {
  onCopyText: (text: string, label: string) => void;
  onSelectDezenasForBet: (dezenas: string[]) => void;
}

export function BichoTableView({
  onCopyText,
  onSelectDezenasForBet,
}: BichoTableViewProps) {
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);

  const filtered = BICHO_GROUPS.filter(b => {
    if (!search) return true;
    const term = search.toLowerCase();
    const matchName = b.nome.toLowerCase().includes(term);
    const matchGroup = b.grupo.toString().includes(term);
    const matchDezena = b.dezenas.some(d => d.includes(term));
    return matchName || matchGroup || matchDezena;
  });

  const activeAnimal = selectedGroup ? getAnimalByGroup(selectedGroup) : null;

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Compass className="w-5 h-5 text-amber-400" />
          Tabela dos 25 Bichos & Puxadas
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Consulte os 25 grupos, as 4 dezenas de cada animal e as puxadas tradicionais do jogo.
        </p>
      </div>

      {/* Busca Rápida por Número, Dezena ou Bicho */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Digite qualquer dezena (ex: 42), grupo (ex: 11) ou nome do bicho..."
          className="w-full h-11 pl-10 pr-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* Detalhe do Bicho Selecionado (se houver) */}
      {activeAnimal && (
        <div className="bg-slate-900/90 border border-amber-500/40 rounded-3xl p-4 sm:p-5 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-bold text-amber-400">
                Grupo {activeAnimal.grupo.toString().padStart(2, '0')}
              </span>
              <h2 className="text-xl font-extrabold text-white">{activeAnimal.nome}</h2>
            </div>
            <button
              onClick={() => setSelectedGroup(null)}
              className="min-h-[44px] min-w-[44px] text-xs text-slate-400 hover:text-white flex items-center justify-end cursor-pointer"
            >
              Fechar
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-xs text-slate-400 block mb-1 font-semibold">
                Dezenas Oficiais do {activeAnimal.nome}:
              </span>
              <div className="flex gap-2">
                {activeAnimal.dezenas.map(d => (
                  <button
                    key={d}
                    onClick={() => onCopyText(d, `Dezena ${d} do ${activeAnimal.nome} copiada!`)}
                    className="min-h-[44px] px-3.5 py-2 bg-slate-950 border border-slate-800 hover:border-amber-400/50 rounded-xl font-mono text-base font-bold text-amber-300 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
                  >
                    <span>{d}</span>
                    <Copy className="w-3 h-3 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400 block mb-1 font-semibold">
                Puxadas Tradicionais (Bichos Atraídos):
              </span>
              <div className="grid grid-cols-3 gap-2">
                {activeAnimal.puxadas.map(g => {
                  const pux = getAnimalByGroup(g);
                  return (
                    <div key={g} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-amber-400 font-bold block">
                        Gr. {g.toString().padStart(2, '0')}
                      </span>
                      <span className="text-xs font-bold text-white block">{pux.nome}</span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        {pux.dezenas.join('·')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onSelectDezenasForBet(activeAnimal.dezenas)}
                className="min-h-[44px] px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-md shadow-amber-900/20"
              >
                <span>Usar Dezenas no Desdobrador</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid dos 25 Bichos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {filtered.map(b => (
          <div
            key={b.grupo}
            onClick={() => setSelectedGroup(b.grupo)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              selectedGroup === b.grupo
                ? 'bg-slate-900 border-amber-400 shadow-md shadow-amber-950/20'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono font-bold text-amber-400">
                Gr. {b.grupo.toString().padStart(2, '0')}
              </span>
              <span className="text-sm font-bold text-white tracking-tight">
                {b.nome}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-400">Dezenas:</span>
              <div className="flex items-center gap-1 font-mono font-bold text-xs text-amber-300">
                {b.dezenas.map(d => (
                  <span key={d} className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
