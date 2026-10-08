import React, { useState } from 'react';
import { Copy, HelpCircle, Calculator, Check, ArrowRight, ShieldCheck, Flame, Layers } from 'lucide-react';
import { HotTip, ModalityType } from '../types/bicho';
import { TRADITIONAL_ODDS, getUniquePermutations, getCombinations } from '../utils/bichoEngine';
import { getAnimalByDezena, getAnimalByGroup } from '../data/bichoTable';

interface ModalitiesViewProps {
  hotTips: HotTip[];
  initialModality?: string;
  onCopyText: (text: string, label: string) => void;
  onOpenCombinatorWith: (modality: ModalityType, initialValues: string[]) => void;
}

export function ModalitiesView({
  hotTips,
  initialModality = 'milhar_centena',
  onCopyText,
  onOpenCombinatorWith,
}: ModalitiesViewProps) {
  const [selectedModality, setSelectedModality] = useState<ModalityType>(
    (initialModality as ModalityType) || 'milhar_centena'
  );

  const modalitiesList: { id: ModalityType; label: string; badge: string }[] = [
    { id: 'milhar', label: 'Milhar', badge: '4 Dígitos' },
    { id: 'milhar_centena', label: 'Milhar c/ Centena (MC)', badge: 'Mais Jogada' },
    { id: 'centena', label: 'Centena', badge: '3 Dígitos' },
    { id: 'centena_invertida', label: 'Centena Invertida (CI)', badge: 'Desdobrada' },
    { id: 'dezena_cercada', label: 'Dezena Cercada', badge: '1º ao 5º' },
    { id: 'dezena_combinada', label: 'Dezena Combinada', badge: 'Múltiplas' },
    { id: 'duque_dezena', label: 'Duque de Dezenas', badge: '300x' },
    { id: 'duque_grupo', label: 'Duque de Grupo', badge: '2 Bichos' },
    { id: 'terno_dezena', label: 'Terno de Dezenas', badge: '3.000x' },
    { id: 'terno_grupo', label: 'Terno de Grupo', badge: '3 Bichos' },
  ];

  const currentOdds = TRADITIONAL_ODDS[selectedModality];
  const currentTips = hotTips.filter(t => t.modalidade === selectedModality);

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-400" />
          Modalidades & Palpites Detalhados
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Escolha uma modalidade abaixo para ver as dicas quentes, cotações e desdobramentos.
        </p>
      </div>

      {/* Horizontal Scrollable Segmented Filter (Mobile thumb friendly) */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none flex gap-2">
        {modalitiesList.map(item => {
          const isSelected = selectedModality === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedModality(item.id)}
              className={`min-h-[44px] px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border shrink-0 ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md shadow-amber-900/30'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{item.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {item.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Card da Modalidade Selecionada */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-4 sm:p-6 space-y-4 shadow-xl">
        {/* Header do Card com Cotações */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {currentOdds.nome}
              </h2>
              <span className="text-xs text-amber-400 font-semibold">
                Regras & Cotação
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              {currentOdds.regra}
            </p>
          </div>

          {/* Badge de Cotação */}
          <div className="flex items-center gap-2 sm:self-start bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-medium">Cotação Típica</span>
              <span className="text-sm font-extrabold text-amber-400 font-mono">
                {currentOdds.cotacaoCabeca === currentOdds.cotacaoCercado5
                  ? `${currentOdds.cotacaoCabeca}x`
                  : `${currentOdds.cotacaoCabeca}x (1º) · ${currentOdds.cotacaoCercado5}x (1º ao 5º)`}
              </span>
            </div>
          </div>
        </div>

        {/* Palpites Gerados para Esta Modalidade */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Palpites Recomendados da Federal
            </h3>
            <span className="text-[11px] text-slate-400">
              Probabilidade Alta
            </span>
          </div>

          {currentTips.map(tip => (
            <div
              key={tip.id}
              className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white">{tip.titulo}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{tip.subtitulo}</p>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{tip.probabilidadeScore}% Confiança</span>
                </div>
              </div>

              {/* Números do Palpite */}
              {tip.modalidade === 'centena_invertida' && tip.inversoes ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Todas as {tip.inversoes.length} permutações da centena:</span>
                    <button
                      onClick={() =>
                        onCopyText(
                          tip.inversoes!.join(' · '),
                          `Centena Invertida (${tip.inversoes!.length} inversões) copiada!`
                        )
                      }
                      className="min-h-[44px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copiar Todas
                    </button>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {tip.inversoes.map((inv, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-center font-mono font-bold text-amber-300 text-sm"
                      >
                        {inv}
                      </div>
                    ))}
                  </div>
                </div>
              ) : tip.combinacoes ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Desdobramento em {tip.combinacoes.length} jogos:</span>
                    <button
                      onClick={() => {
                        const formatted = tip.combinacoes!
                          .map((c, i) => `Jogo ${i + 1}: ${c.join(' - ')}`)
                          .join('\n');
                        onCopyText(formatted, 'Combinações copiadas com sucesso!');
                      }}
                      className="min-h-[44px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copiar Desdobramento
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {tip.combinacoes.map((comb, i) => (
                      <div
                        key={i}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs"
                      >
                        <span className="text-slate-400 font-mono">#{i + 1}</span>
                        <span className="font-mono font-bold text-amber-300 text-sm">
                          {comb.join(' - ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tip.numeros.map((num, i) => {
                    return (
                      <button
                        key={i}
                        onClick={() => onCopyText(num, `Número copiado: ${num}`)}
                        className="min-h-[44px] px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-xl font-mono text-sm font-bold text-amber-300 flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
                      >
                        <span>{num}</span>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Explicação e Racional Estatístico */}
              <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{tip.explicacao}</p>
              </div>

              {/* Ação: Abrir no Desdobrador / Simulador */}
              <div className="pt-1 flex items-center justify-end">
                <button
                  onClick={() => onOpenCombinatorWith(selectedModality, tip.numeros)}
                  className="min-h-[44px] px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  Simular Lucro & Desdobrar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guia Rápido de Cada Modalidade */}
      <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-4 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Resumo das 7 Modalidades Oficiais
        </h3>
        <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
          <p>
            <strong className="text-amber-400">1. Milhar:</strong> Aposta nos 4 dígitos (ex: 8542). Pode ser seca (só no 1º prêmio, 4.000x) ou cercada do 1º ao 5º (800x por acerto).
          </p>
          <p>
            <strong className="text-amber-400">2. Milhar com Centena (MC):</strong> Combina milhar e centena numa única aposta. Se sair a milhar ganha a milhar + centena; se sair só a centena, salva com 600x.
          </p>
          <p>
            <strong className="text-amber-400">3. Centena:</strong> Aposta nos 3 últimos algarismos (ex: 542). Na cabeça paga 600x, cercada paga 120x.
          </p>
          <p>
            <strong className="text-amber-400">4. Centena Invertida (CI):</strong> Desdobra os 3 algarismos em todas as posições (ex: 542 vira 542, 524, 452, 425, 254, 245). Garante premiação em qualquer ordem!
          </p>
          <p>
            <strong className="text-amber-400">5. Dezena Cercada e Combinada:</strong> Joga dezenas de 2 dígitos valendo do 1º ao 5º prêmio, multiplicando as chances de faturar.
          </p>
          <p>
            <strong className="text-amber-400">6. Duque Combinado e Cercado:</strong> Acerte 2 dezenas (DD) ou 2 bichos (DG) entre os 5 prêmios. Desdobra grupos de 3 a 5 números.
          </p>
          <p>
            <strong className="text-amber-400">7. Terno Combinado e Cercado:</strong> Acerte 3 dezenas (TD, 3.000x) ou 3 bichos (TG, 130x) entre os 5 prêmios da Federal com desdobramento matemático total.
          </p>
        </div>
      </div>
    </div>
  );
}
