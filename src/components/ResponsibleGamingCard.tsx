import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Sparkles,
  Calculator,
  ChevronRight,
  ChevronLeft,
  Pause,
  Play,
  Copy,
  Check,
  Coins,
  Flame,
  HelpCircle,
  TrendingDown,
  RefreshCw,
  HeartHandshake,
} from 'lucide-react';
import { LotteryContest } from '../types/lottery';
import { computeBichoStatistics, BichoBetSuggestion } from '../utils/bichoStatsUtils';

interface ResponsibleGamingCardProps {
  contests: LotteryContest[];
  onPlayChime?: () => void;
}

// Curated responsible gaming tips
const RESPONSIBLE_TIPS = [
  {
    id: 1,
    titulo: 'Regra de Ouro: Loteria é Lazer, Jamais Investimento',
    subtitulo: 'Aposte apenas pequenas quantias destinadas a diversão',
    conteudo:
      'Loterias e bancas de bicho são jogos de azar puramente probabilísticos. Nunca encare apostas como fonte de renda, forma de quitar dívidas ou investimento futuro. Se ganhar, comemore; se perder, considere o custo de um café ou entretenimento recreativo.',
    tag: 'Mentalidade Saudável',
    cor: 'emerald',
  },
  {
    id: 2,
    titulo: 'Defina seu Teto Semanal Antes de Olhar os Números',
    subtitulo: 'Estipule um limite financeiro inegociável',
    conteudo:
      'Antes de ir à lotérica ou banca, determine o valor máximo absoluto da semana (ex: R$ 5,00 a R$ 10,00). Nunca aumente a quantia durante a aposta ou após um resultado adverso. O autocontrole financeiro é sua maior vitória.',
    tag: 'Gestão de Gastos',
    cor: 'amber',
  },
  {
    id: 3,
    titulo: 'Evite a Armadilha da ‘Recuperação de Perdas’',
    subtitulo: 'Cada sorteio é um evento independente',
    conteudo:
      'Tentar ‘correr atrás do prejuízo’ aumentando apostas imediatas é o erro estatístico e psicológico mais perigoso. Os globos não têm memória. Aceite o resultado e volte a apostar apenas no próximo mês ou semana programada.',
    tag: 'Prevenção de Impulso',
    cor: 'rose',
  },
  {
    id: 4,
    titulo: 'Aposte em Frações Mínimas (Centavos e Moedas)',
    subtitulo: 'Diversão máxima com desembolso mínimo',
    conteudo:
      'Nas bancas tradicionais e na Federal, você pode apostar frações de R$ 0,50 a R$ 1,00 em modalidades como Centena Cercada ou Grupo. O prazer de torcer e conferir é exatamente o mesmo apostando R$ 1,00 ou R$ 50,00!',
    tag: 'Estratégia Consciente',
    cor: 'cyan',
  },
  {
    id: 5,
    titulo: 'Transparência e Harmonia Familiar',
    subtitulo: 'Nunca esconda gastos com jogos de quem você ama',
    conteudo:
      'Se você sente vergonha, culpa ou necessidade de esconder seus gastos com loterias do seu parceiro ou família, isso é um indicativo claro de alerta. Mantenha as apostas abertas, leves e transparentes.',
    tag: 'Bem-Estar Pessoal',
    cor: 'indigo',
  },
  {
    id: 6,
    titulo: 'A Ilusão do ‘Quase Acertei’',
    subtitulo: 'Errar por um número não significa que o próximo virá',
    conteudo:
      'Se você jogou a dezena 91 e saiu 92, isso não é um sinal místico de que na próxima você ganha. Cada bilhete possui exatamente a mesma chance matemática. Mantenha os pés no chão e divirta-se sem ansiedade.',
    tag: 'Fato Probabilístico',
    cor: 'purple',
  },
];

export const ResponsibleGamingCard: React.FC<ResponsibleGamingCardProps> = ({
  contests,
  onPlayChime,
}) => {
  // Navigation subtabs
  const [activeSection, setActiveSection] = useState<'tips' | 'bicho' | 'budget' | 'selfcheck'>('bicho');

  // Tip carousel states
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  // Weekly budget calculator state
  const [weeklyBudget, setWeeklyBudget] = useState<number>(10);
  const [selectedBetUnit, setSelectedBetUnit] = useState<number>(1);

  // Bicho suggestions states
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Self check quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, boolean>>({});

  // Compute live statistics for bicho
  const bichoStats = useMemo(() => computeBichoStatistics(contests), [contests]);

  const currentTip = RESPONSIBLE_TIPS[currentTipIndex];
  const currentSuggestion: BichoBetSuggestion | undefined = bichoStats.suggestions[selectedSuggestionIndex];

  // Auto-rotation timer for tips (every 18s)
  useEffect(() => {
    if (!isAutoPlay || isMinimized) return;

    const intervalTime = 18000;
    const stepTime = 180;
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += stepTime;
      setProgress(Math.min((elapsed / intervalTime) * 100, 100));

      if (elapsed >= intervalTime) {
        elapsed = 0;
        setProgress(0);
        setCurrentTipIndex(prev => (prev + 1) % RESPONSIBLE_TIPS.length);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [isAutoPlay, isMinimized, currentTipIndex]);

  const handleNextTip = () => {
    setProgress(0);
    setCurrentTipIndex(prev => (prev + 1) % RESPONSIBLE_TIPS.length);
  };

  const handlePrevTip = () => {
    setProgress(0);
    setCurrentTipIndex(prev => (prev - 1 + RESPONSIBLE_TIPS.length) % RESPONSIBLE_TIPS.length);
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    if (onPlayChime) onPlayChime();
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleCopyFullBet = (sug: BichoBetSuggestion) => {
    const text = `🍀 PALPITE CONSCIENTE FURRECO DA SORTE 🍀
Bicho: ${sug.animal.emoji} ${sug.animal.nome} (Grupo ${String(sug.animal.grupo).padStart(2, '0')})
Milhar: ${sug.milhar}
Centena: ${sug.centena}
Dezena: ${sug.dezena}
Duque de Dezenas: ${sug.duqueSugerido.join(' e ')}
Terno de Dezenas: ${sug.ternoSugerido.join(' - ')}
Valor Consciente Sugerido: R$ 1,00 a R$ 2,00
Lembre-se: Jogue com responsabilidade (+18). Diversão sem exageros!`;
    handleCopyText(text, `full-${sug.id}`);
  };

  // Minimized floating banner view
  if (isMinimized) {
    return (
      <div className="bg-slate-900/95 border border-emerald-500/30 rounded-2xl p-3 sm:p-4 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all animate-fadeIn">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <span className="text-emerald-400 font-bold">Jogo Responsável:</span>
              <span className="truncate max-w-xs sm:max-w-md">{currentTip.titulo}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Palpites estatísticos para bancas de bicho e controle de orçamento ativos.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={() => setIsMinimized(false)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Expandir Painel</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all">
      {/* Top Header with Progress Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 p-3.5 sm:p-5 relative">
        {/* Subtle auto-play progress bar */}
        {isAutoPlay && (
          <div
            className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-400 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-900/60 to-amber-900/40 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <Shield className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 font-semibold tracking-wide uppercase">
                <span>Central de Consciência & Estatística</span>
                <span aria-hidden="true">·</span>
                <span>Jogo Responsável +18</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                Dicas de Aposta Consciente & Palpites de Bicho
              </h2>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            {/* Auto-play toggle & Tip navigators */}
            <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-lg p-1 text-xs">
              <button
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  isAutoPlay ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500 hover:text-slate-300'
                }`}
                title={isAutoPlay ? 'Pausar rotação periódica' : 'Iniciar rotação periódica'}
              >
                {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handlePrevTip}
                className="p-1.5 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Dica anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="text-[10px] font-mono text-slate-400 px-1 tabular-nums">
                {currentTipIndex + 1}/{RESPONSIBLE_TIPS.length}
              </span>

              <button
                onClick={handleNextTip}
                className="p-1.5 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Próxima dica"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Minimize button */}
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 text-xs font-medium transition-colors cursor-pointer"
              title="Recolher painel"
            >
              Recolher
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pt-3 mt-3 border-t border-slate-800/80 scrollbar-none">
          <button
            onClick={() => setActiveSection('bicho')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
              activeSection === 'bicho'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Palpites para Bancas (Milhar/Centena/Dezena)</span>
          </button>

          <button
            onClick={() => setActiveSection('tips')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
              activeSection === 'tips'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Regras de Autocontrole</span>
          </button>

          <button
            onClick={() => setActiveSection('budget')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
              activeSection === 'budget'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
            <span>Calculadora de Teto Semanal</span>
          </button>

          <button
            onClick={() => setActiveSection('selfcheck')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
              activeSection === 'selfcheck'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
            <span>Autoavaliação & Apoio</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-3.5 sm:p-6 space-y-5">
        {/* SECTION 1: Dicas Estatísticas de Banca de Bicho (Milhar, Centena, Dezenas) */}
        {activeSection === 'bicho' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Context Notice */}
            <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3.5 text-xs text-amber-200/90 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-amber-300 block">
                  Estatísticas Recentes da Federal Aplicadas às Bancas Tradicionais
                </span>
                <p className="text-[11px] leading-relaxed text-amber-200/80">
                  Os palpites abaixo são calculados a partir dos sorteios oficiais mais recentes da Loteria Federal (quartas e sábados). 
                  Jogue sempre com valores simbólicos (R$ 0,50 a R$ 2,00). Nunca arrisque quantias significativas!
                </p>
              </div>
            </div>

            {/* Suggestions Selector Chips */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Selecione a Estratégia do Palpite:</span>
                <span className="text-[11px] text-slate-400">
                  {bichoStats.totalContestsAnalyzed} concursos analisados
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {bichoStats.suggestions.map((sug, idx) => (
                  <button
                    key={sug.id}
                    onClick={() => setSelectedSuggestionIndex(idx)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedSuggestionIndex === idx
                        ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md shadow-emerald-950'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base" role="img" aria-label={sug.animal.nome}>
                        {sug.animal.emoji}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-amber-400">
                        Gr. {String(sug.animal.grupo).padStart(2, '0')}
                      </span>
                    </div>
                    <span className="text-xs font-bold block text-white truncate">
                      {sug.animal.nome}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                      {sug.tipo === 'quente' ? '🔥 Em Alta' : sug.tipo === 'atrasado' ? '⏳ Atrasado' : '⚖️ Equilíbrio'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Suggestion Details Box */}
            {currentSuggestion && (
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-2xl shadow-lg">
                      {currentSuggestion.animal.emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono text-emerald-400 font-bold">
                          Grupo {String(currentSuggestion.animal.grupo).padStart(2, '0')}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-400">
                          Dezenas: {currentSuggestion.animal.dezenas.join(', ')}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-white">
                        {currentSuggestion.titulo}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopyFullBet(currentSuggestion)}
                    className="self-start sm:self-center py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-900/30 cursor-pointer shrink-0"
                  >
                    {copiedKey === `full-${currentSuggestion.id}` ? (
                      <Check className="w-4 h-4 text-slate-950" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-950" />
                    )}
                    <span>
                      {copiedKey === `full-${currentSuggestion.id}` ? 'Copiado para o WhatsApp!' : 'Copiar Palpite Completo'}
                    </span>
                  </button>
                </div>

                <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                  <strong className="text-amber-400">Fundamento Estatístico:</strong> {currentSuggestion.motivoEstatistico}
                </p>

                {/* Core Suggested Numbers: Milhar, Centena, Dezena */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Milhar */}
                  <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-3.5 relative overflow-hidden group">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span className="font-semibold text-amber-300">Milhar Sugerida (4 dígitos)</span>
                      <button
                        onClick={() => handleCopyText(currentSuggestion.milhar, 'milhar')}
                        className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
                        title="Copiar milhar"
                      >
                        {copiedKey === 'milhar' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="font-mono text-2xl sm:text-3xl font-black text-amber-400 tracking-wider">
                      {currentSuggestion.milhar}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>Cota na Cabeça: ~4.000x</span>
                      <span>No 1º ao 5º: ~800x</span>
                    </div>
                  </div>

                  {/* Centena */}
                  <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-3.5 relative overflow-hidden group">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span className="font-semibold text-emerald-300">Centena Quente (3 dígitos)</span>
                      <button
                        onClick={() => handleCopyText(currentSuggestion.centena, 'centena')}
                        className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
                        title="Copiar centena"
                      >
                        {copiedKey === 'centena' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="font-mono text-2xl sm:text-3xl font-black text-emerald-400 tracking-wider">
                      {currentSuggestion.centena}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>Cota na Cabeça: ~600x</span>
                      <span>No 1º ao 5º: ~120x</span>
                    </div>
                  </div>

                  {/* Dezena */}
                  <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-3.5 relative overflow-hidden group">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span className="font-semibold text-cyan-300">Dezena Foco (2 dígitos)</span>
                      <button
                        onClick={() => handleCopyText(currentSuggestion.dezena, 'dezena')}
                        className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
                        title="Copiar dezena"
                      >
                        {copiedKey === 'dezena' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="font-mono text-2xl sm:text-3xl font-black text-cyan-400 tracking-wider">
                      {currentSuggestion.dezena}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>Cota na Cabeça: ~60x</span>
                      <span>No 1º ao 5º: ~12x</span>
                    </div>
                  </div>
                </div>

                {/* Combinações Recomendadas: Duque e Terno de Dezenas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 block">
                      Duque de Dezenas Recomendado:
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-white">
                        {currentSuggestion.duqueSugerido.join(' + ')}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        Paga ~300x (Aposte R$ 0,50 a R$ 1,00)
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 block">
                      Terno de Dezenas Recomendado:
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-white">
                        {currentSuggestion.ternoSugerido.join(' + ')}
                      </span>
                      <span className="text-[10px] text-amber-400 font-mono">
                        Paga ~3.000x (Aposta mínima simbólica)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Modalidades Clássicas e Doses Conscientes */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Como Jogar com Segurança nesta Opção:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {currentSuggestion.modalidadesRecomendadas.map((mod, mIdx) => (
                      <div
                        key={mIdx}
                        className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-1 text-xs"
                      >
                        <span className="font-bold text-emerald-400 block">{mod.nome}</span>
                        <p className="text-[11px] text-slate-400 leading-snug">{mod.explicacao}</p>
                        <div className="pt-1 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                          <span className="text-slate-500 font-mono">{mod.multiplicador}</span>
                          <span className="text-amber-300 font-semibold">{mod.valorConscienteSugerido}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Top Hot / Top Delayed Animals Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Top 5 Bichos Mais Frequentes (Últimos Concursos)</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  {bichoStats.hotAnimals.map((ha, idx) => (
                    <div key={idx} className="flex items-center justify-between text-slate-300 py-0.5 border-b border-slate-900 last:border-0">
                      <span className="flex items-center gap-1.5">
                        <span>{ha.animal.emoji}</span>
                        <strong className="text-white">{ha.animal.nome}</strong>
                        <span className="text-slate-500 text-[10px]">Gr. {ha.animal.grupo}</span>
                      </span>
                      <span className="font-mono text-emerald-400 text-[11px]">
                        {ha.totalCount}x nos prêmios ({ha.cabecaCount}x no 1º)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Top 5 Bichos Mais Atrasados (Em Espera)</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  {bichoStats.delayedAnimals.map((da, idx) => (
                    <div key={idx} className="flex items-center justify-between text-slate-300 py-0.5 border-b border-slate-900 last:border-0">
                      <span className="flex items-center gap-1.5">
                        <span>{da.animal.emoji}</span>
                        <strong className="text-white">{da.animal.nome}</strong>
                        <span className="text-slate-500 text-[10px]">Gr. {da.animal.grupo}</span>
                      </span>
                      <span className="font-mono text-amber-400 text-[11px]">
                        {da.concursosAtrasado} concursos sem sair
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: Dicas Rotativas de Jogo Responsável */}
        {activeSection === 'tips' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Current Featured Tip */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-4 sm:p-6 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  {currentTip.tag}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Dica {currentTipIndex + 1} de {RESPONSIBLE_TIPS.length}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">
                {currentTip.titulo}
              </h3>
              <p className="text-xs text-amber-300 font-medium">
                {currentTip.subtitulo}
              </p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {currentTip.conteudo}
              </p>

              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Próxima dica em instantes ou clique nos botões acima</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleNextTip}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>Próxima Dica</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Grid of All 6 Golden Rules */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Todas as Regras de Ouro da Aposta Consciente
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {RESPONSIBLE_TIPS.map((tip, idx) => (
                  <div
                    key={tip.id}
                    onClick={() => {
                      setCurrentTipIndex(idx);
                      setProgress(0);
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      currentTipIndex === idx
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-200">{tip.titulo}</span>
                      <span className="font-mono text-[10px] text-emerald-400">#{idx + 1}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {tip.conteudo}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: Calculadora de Teto Semanal & Controle de Gastos */}
        {activeSection === 'budget' && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-400" />
                Simulador de Orçamento Semanal Saudável
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Calcule quantas apostas fracionadas e seguras cabem no seu limite recreativo sem apertar suas finanças.
              </p>
            </div>

            {/* Budget Presets & Custom Slider */}
            <div className="space-y-3 bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Seu Teto Semanal para Lazer:</span>
                <span className="font-mono text-lg font-bold text-emerald-400">
                  R$ {weeklyBudget},00 / semana
                </span>
              </div>

              {/* Fast buttons */}
              <div className="flex flex-wrap gap-2">
                {[5, 10, 15, 20, 30].map(val => (
                  <button
                    key={val}
                    onClick={() => setWeeklyBudget(val)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      weeklyBudget === val
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    R$ {val},00
                  </button>
                ))}
              </div>

              <input
                type="range"
                min="2"
                max="50"
                step="1"
                value={weeklyBudget}
                onChange={e => setWeeklyBudget(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>R$ 2,00 (mínimo)</span>
                <span>R$ 25,00</span>
                <span>R$ 50,00 (máximo recreativo)</span>
              </div>
            </div>

            {/* Calculated Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-3.5 space-y-1">
                <span className="text-[11px] text-slate-400 block">Apostas de R$ 1,00 (Centena / Milhar)</span>
                <span className="font-mono text-2xl font-black text-emerald-400 block">
                  {Math.floor(weeklyBudget / 1)} apostas
                </span>
                <span className="text-[10px] text-slate-500 block leading-tight">
                  Permite jogar 1 ou 2 palpites em cada um dos 2 concursos semanais da Federal.
                </span>
              </div>

              <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-3.5 space-y-1">
                <span className="text-[11px] text-slate-400 block">Apostas Fracionadas de R$ 0,50</span>
                <span className="font-mono text-2xl font-black text-cyan-400 block">
                  {Math.floor(weeklyBudget / 0.5)} apostas
                </span>
                <span className="text-[10px] text-slate-500 block leading-tight">
                  Ideal para cercar centenas do 1º ao 5º prêmio com risco financeiro mínimo.
                </span>
              </div>

              <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-3.5 space-y-1">
                <span className="text-[11px] text-slate-400 block">Impacto no Orçamento Mensal</span>
                <span className="font-mono text-2xl font-black text-amber-400 block">
                  R$ {weeklyBudget * 4},00 / mês
                </span>
                <span className="text-[10px] text-slate-500 block leading-tight">
                  Menos de 1% da renda média brasileira. Perfeito para manter o lazer sustentável.
                </span>
              </div>
            </div>

            {/* Positive Reinforcement Message */}
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3.5 text-xs text-emerald-300 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                <strong>Parabéns pelo compromisso com o autocontrole:</strong> ao estipular um valor fixo, você aproveita 100% da emoção dos sorteios sem colocar suas metas e tranquilidade em risco!
              </span>
            </div>
          </div>
        )}

        {/* SECTION 4: Autoavaliação & Apoio Gratuito */}
        {activeSection === 'selfcheck' && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-emerald-400" />
                Teste Rápido de Autocontrole & Canais de Ajuda
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Responda com honestidade. Se identificar mais de 2 respostas "Sim", considere uma pausa no jogo.
              </p>
            </div>

            {/* 4 Quiz Questions */}
            <div className="space-y-2.5">
              {[
                { id: 1, text: 'Você já gastou com bilhetes ou apostas mais do que pretendia inicialmente?' },
                { id: 2, text: 'Já sentiu necessidade de jogar novamente logo após perder para tentar recuperar o valor?' },
                { id: 3, text: 'Já escondeu de familiares ou amigos o quanto costuma apostar?' },
                { id: 4, text: 'O jogo já causou ansiedade, estresse ou tirou o foco de suas tarefas diárias?' },
              ].map(q => {
                const isYes = quizAnswers[q.id] === true;
                const isNo = quizAnswers[q.id] === false;

                return (
                  <div
                    key={q.id}
                    className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                  >
                    <span className="text-slate-200 leading-snug">{q.text}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: true }))}
                        className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                          isYes
                            ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        Sim
                      </button>
                      <button
                        onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: false }))}
                        className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                          isNo
                            ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        Não
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Helpline Contacts */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <span className="text-xs font-bold text-white block">
                Canais de Apoio Gratuitos e Confidenciais no Brasil:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 space-y-1">
                  <span className="font-bold text-emerald-400 block">Jogadores Anônimos do Brasil</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Reuniões de apoio presenciais e virtuais gratuitas em todo o país.
                  </p>
                  <span className="text-[11px] font-mono text-slate-300 block pt-1">
                    www.jogadoresanonimos.com.br
                  </span>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 space-y-1">
                  <span className="font-bold text-amber-400 block">CVV - Apoio Emocional</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Atendimento 24h por telefone ou chat para desabafo e acolhimento.
                  </p>
                  <span className="text-[11px] font-mono text-slate-300 block pt-1">
                    Ligue 188 (Ligação gratuita)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
