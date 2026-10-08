import React, { useState } from 'react';
import { Calculator, Sparkles, Copy, RefreshCw, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { ModalityType } from '../types/bicho';
import { getUniquePermutations, getCombinations, TRADITIONAL_ODDS, simulateBet } from '../utils/bichoEngine';
import { BICHO_GROUPS, getAnimalByDezena, getAnimalByGroup } from '../data/bichoTable';

interface CombinatorViewProps {
  initialModality?: ModalityType;
  initialValues?: string[];
  onCopyText: (text: string, label: string) => void;
}

export function CombinatorView({
  initialModality = 'centena_invertida',
  initialValues = ['542'],
  onCopyText,
}: CombinatorViewProps) {
  const [modality, setModality] = useState<ModalityType>(initialModality);
  const [betPerGame, setBetPerGame] = useState<number>(2.0);
  const [isCercado, setIsCercado] = useState<boolean>(true);

  // Estados de entrada para cada tipo
  const [ciInput, setCiInput] = useState<string>(
    initialValues[0] && initialValues[0].length === 3 ? initialValues[0] : '542'
  );
  const [milharInput, setMilharInput] = useState<string>('8542');
  const [selectedDezenas, setSelectedDezenas] = useState<string[]>(['42', '18', '38', '10']);
  const [selectedGrupos, setSelectedGrupos] = useState<number[]>([11, 5, 10, 15]); // Cavalo, Cachorro, Coelho, Jacaré

  // Cálculos dinâmicos
  let generatedItems: string[][] = [];
  let displayTitle = '';
  let displayCountText = '';

  if (modality === 'centena_invertida') {
    const raw = ciInput.replace(/\D/g, '').slice(0, 3);
    const perms = raw.length === 3 ? getUniquePermutations(raw) : [];
    generatedItems = perms.map(p => [p]);
    displayTitle = `Inversões dos Dígitos [${raw}]`;
    displayCountText = `${perms.length} permutações geradas`;
  } else if (modality === 'milhar' || modality === 'milhar_centena') {
    const cleanM = milharInput.replace(/\D/g, '').slice(0, 4);
    generatedItems = [[cleanM]];
    displayTitle = modality === 'milhar_centena' ? `Milhar com Centena: ${cleanM}` : `Milhar: ${cleanM}`;
    displayCountText = '1 aposta direta';
  } else if (modality === 'duque_dezena') {
    const combs = getCombinations(selectedDezenas, 2);
    generatedItems = combs;
    displayTitle = `Duque de Dezenas Combinado (${selectedDezenas.length} dezenas selecionadas)`;
    displayCountText = `${combs.length} duplas combinadas`;
  } else if (modality === 'duque_grupo') {
    const combs = getCombinations(selectedGrupos.map(g => getAnimalByGroup(g).nome), 2);
    generatedItems = combs;
    displayTitle = `Duque de Grupo Combinado (${selectedGrupos.length} bichos selecionados)`;
    displayCountText = `${combs.length} duplas de bichos`;
  } else if (modality === 'terno_dezena') {
    const combs = getCombinations(selectedDezenas, 3);
    generatedItems = combs;
    displayTitle = `Terno de Dezenas Combinado (${selectedDezenas.length} dezenas selecionadas)`;
    displayCountText = `${combs.length} ternos combinados`;
  } else if (modality === 'terno_grupo') {
    const combs = getCombinations(selectedGrupos.map(g => getAnimalByGroup(g).nome), 3);
    generatedItems = combs;
    displayTitle = `Terno de Grupo Combinado (${selectedGrupos.length} bichos selecionados)`;
    displayCountText = `${combs.length} ternos de bichos`;
  } else if (modality === 'dezena_combinada') {
    generatedItems = selectedDezenas.map(d => [d]);
    displayTitle = `Dezenas Combinadas (${selectedDezenas.length} dezenas)`;
    displayCountText = `${selectedDezenas.length} apostas independentes`;
  } else {
    // Centena ou Dezena cercada
    generatedItems = [[ciInput.slice(0, 3) || '542']];
    displayTitle = 'Centena';
    displayCountText = '1 jogo';
  }

  const odds = TRADITIONAL_ODDS[modality];
  const totalJogos = Math.max(1, generatedItems.length);
  const valorTotalAposta = totalJogos * betPerGame;
  const retornoPotencial = betPerGame * (isCercado ? odds.cotacaoCercado5 : odds.cotacaoCabeca);

  const handleCopyFormattedGames = () => {
    const lines = [
      `🍀 APOSTA DESDOBRADA - BICHO DA FEDERAL`,
      `Modalidade: ${odds.nome} (${isCercado ? 'Cercado 1º ao 5º' : 'Na Cabeça'})`,
      `Valor por jogo: R$ ${betPerGame.toFixed(2)} | Total: R$ ${valorTotalAposta.toFixed(2)}`,
      `Jogos Gerados (${totalJogos}):`,
      ...generatedItems.map((item, idx) => `  ${(idx + 1).toString().padStart(2, '0')}. ${item.join(' - ')}`),
      ``,
      `Retorno estimado por acerto: R$ ${retornoPotencial.toFixed(2)}`,
    ];
    onCopyText(lines.join('\n'), `${totalJogos} jogos formatados copiados!`);
  };

  const toggleDezena = (dez: string) => {
    if (selectedDezenas.includes(dez)) {
      if (selectedDezenas.length > 2) {
        setSelectedDezenas(prev => prev.filter(d => d !== dez));
      }
    } else {
      if (selectedDezenas.length < 8) {
        setSelectedDezenas(prev => [...prev, dez].sort());
      }
    }
  };

  const toggleGrupo = (gr: number) => {
    if (selectedGrupos.includes(gr)) {
      if (selectedGrupos.length > 2) {
        setSelectedGrupos(prev => prev.filter(g => g !== gr));
      }
    } else {
      if (selectedGrupos.length < 8) {
        setSelectedGrupos(prev => [...prev, gr].sort((a, b) => a - b));
      }
    }
  };

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Calculator className="w-5 h-5 text-amber-400" />
          Desdobrador & Simulador de Jogos
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Calcule inversões de centenas, combinações de duques e ternos com retorno estimado em tempo real.
        </p>
      </div>

      {/* Seletor de Modalidade */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4">
        <label className="text-xs font-bold text-slate-300 block">
          Selecione a Modalidade do Desdobramento:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { id: 'centena_invertida' as ModalityType, label: 'Centena Invertida (CI)' },
            { id: 'milhar_centena' as ModalityType, label: 'Milhar c/ Centena (MC)' },
            { id: 'duque_dezena' as ModalityType, label: 'Duque de Dezenas (DD)' },
            { id: 'duque_grupo' as ModalityType, label: 'Duque de Grupo (DG)' },
            { id: 'terno_dezena' as ModalityType, label: 'Terno de Dezenas (TD)' },
            { id: 'terno_grupo' as ModalityType, label: 'Terno de Grupo (TG)' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setModality(opt.id)}
              className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold transition-all border text-left cursor-pointer ${
                modality === opt.id
                  ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-900/20'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Painel de Entrada de Acordo com a Modalidade */}
        <div className="pt-2 border-t border-slate-800/80 space-y-3">
          {modality === 'centena_invertida' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-300">
                  Dígitos da Centena (3 dígitos):
                </span>
                <button
                  onClick={() => setCiInput('542')}
                  className="min-h-[44px] text-xs text-amber-400 font-medium hover:underline flex items-center cursor-pointer"
                >
                  Usar Palpite Quente (542)
                </button>
              </div>
              <input
                type="text"
                maxLength={3}
                value={ciInput}
                onChange={e => setCiInput(e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="Ex: 542"
                className="w-full h-12 bg-slate-950 border border-slate-800 rounded-xl px-4 text-xl font-mono font-bold text-amber-300 tracking-widest text-center focus:outline-none focus:border-amber-400"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Dígitos distintos (ex: 542) geram 6 inversões. Dois dígitos iguais (ex: 554) geram 3 inversões.
              </p>
            </div>
          )}

          {modality === 'milhar_centena' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-300">
                  Milhar com Centena (4 dígitos):
                </span>
                <button
                  onClick={() => setMilharInput('8542')}
                  className="min-h-[44px] text-xs text-amber-400 font-medium hover:underline flex items-center cursor-pointer"
                >
                  Usar Palpite Quente (8542)
                </button>
              </div>
              <input
                type="text"
                maxLength={4}
                value={milharInput}
                onChange={e => setMilharInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="Ex: 8542"
                className="w-full h-12 bg-slate-950 border border-slate-800 rounded-xl px-4 text-xl font-mono font-bold text-amber-300 tracking-widest text-center focus:outline-none focus:border-amber-400"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Aposta na Milhar {milharInput || '8542'} com cobertura simultânea da centena {(milharInput || '8542').slice(-3)}.
              </p>
            </div>
          )}

          {(modality === 'duque_dezena' || modality === 'terno_dezena') && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-300">
                  Selecione as Dezenas para Combinar ({selectedDezenas.length}/8):
                </span>
                <button
                  onClick={() => setSelectedDezenas(['42', '18', '38', '10', '04'])}
                  className="min-h-[44px] text-xs text-amber-400 font-medium hover:underline flex items-center cursor-pointer"
                >
                  Preencher com Quentes
                </button>
              </div>

              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
                {['04', '10', '18', '22', '38', '42', '55', '67', '74', '81', '88', '90'].map(d => {
                  const isSel = selectedDezenas.includes(d);
                  return (
                    <button
                      key={d}
                      onClick={() => toggleDezena(d)}
                      className={`min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-colors cursor-pointer border ${
                        isSel
                          ? 'bg-amber-400 text-slate-950 border-amber-400 font-extrabold'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Dezenas ativas: {selectedDezenas.join(', ')} · Desdobramento automático em pares ou trios.
              </p>
            </div>
          )}

          {(modality === 'duque_grupo' || modality === 'terno_grupo') && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-300">
                  Selecione os Bichos para Combinar ({selectedGrupos.length}/8):
                </span>
                <button
                  onClick={() => setSelectedGrupos([11, 3, 10, 15, 24])}
                  className="min-h-[44px] text-xs text-amber-400 font-medium hover:underline flex items-center cursor-pointer"
                >
                  Preencher Puxadas do 1º
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-40 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
                {BICHO_GROUPS.slice(0, 16).map(b => {
                  const isSel = selectedGrupos.includes(b.grupo);
                  return (
                    <button
                      key={b.grupo}
                      onClick={() => toggleGrupo(b.grupo)}
                      className={`min-h-[44px] px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer border truncate ${
                        isSel
                          ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-mono font-bold mr-1">{b.grupo.toString().padStart(2, '0')}</span>
                      <span>{b.nome}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ajuste de Valor da Aposta e Tipo Cercado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">
                Valor por Jogo (R$):
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 5, 10].map(v => (
                  <button
                    key={v}
                    onClick={() => setBetPerGame(v)}
                    className={`min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl text-xs font-bold cursor-pointer border ${
                      betPerGame === v
                        ? 'bg-amber-400 text-slate-950 border-amber-400'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    R$ {v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">
                Abrangência da Aposta:
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCercado(false)}
                  className={`min-h-[44px] flex-1 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer border ${
                    !isCercado
                      ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                      : 'bg-slate-950 text-slate-300 border-slate-800'
                  }`}
                >
                  Na Cabeça (1º)
                </button>
                <button
                  onClick={() => setIsCercado(true)}
                  className={`min-h-[44px] flex-1 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer border ${
                    isCercado
                      ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                      : 'bg-slate-950 text-slate-300 border-slate-800'
                  }`}
                >
                  Cercado (1º ao 5º)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo Financeiro da Simulação */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Qtd. de Jogos</span>
            <span className="text-xl font-extrabold text-white font-mono tabular-nums">
              {totalJogos}
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Custo Total</span>
            <span className="text-xl font-extrabold text-amber-400 font-mono tabular-nums">
              R$ {valorTotalAposta.toFixed(2)}
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Cotação Estimada</span>
            <span className="text-xl font-extrabold text-emerald-400 font-mono tabular-nums">
              {isCercado ? odds.cotacaoCercado5 : odds.cotacaoCabeca}x
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Retorno por Acerto</span>
            <span className="text-xl font-extrabold text-emerald-300 font-mono tabular-nums">
              R$ {retornoPotencial.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Lista dos Jogos Desdobrados */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-white">{displayTitle}</h3>
              <p className="text-[11px] text-slate-400">{displayCountText}</p>
            </div>
            <button
              onClick={handleCopyFormattedGames}
              className="min-h-[44px] px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-900/20 active:scale-95 transition-transform"
            >
              <Copy className="w-3.5 h-3.5" />
              Copiar Todos os Jogos
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-1">
            {generatedItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs"
              >
                <span className="text-slate-500 font-mono font-bold">#{idx + 1}</span>
                <span className="font-mono font-bold text-amber-300 text-sm">
                  {item.join(' - ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
