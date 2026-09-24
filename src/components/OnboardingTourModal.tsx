import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BarChart3,
  Flame,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  RefreshCw,
  Compass,
  ArrowRight,
  Trophy,
  Sliders,
  Contrast,
  ExternalLink,
} from 'lucide-react';

interface OnboardingTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: 'stats' | 'history' | 'generator' | 'weekly' | 'odds' | 'responsible' | 'milhar') => void;
  onPlayChime?: () => void;
  highContrast?: boolean;
}

interface TourStep {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string[];
  tips: string;
  targetTab?: 'stats' | 'history' | 'generator' | 'weekly' | 'odds' | 'responsible' | 'milhar';
  actionLabel?: string;
  icon: React.ReactNode;
  accentColor: string;
  visualPreview: React.ReactNode;
}

export const OnboardingTourModal: React.FC<OnboardingTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onPlayChime,
  highContrast,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Keyboard navigation: Escape closes, arrows navigate
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        setCurrentStepIndex(prev => Math.min(prev + 1, tourSteps.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentStepIndex(prev => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      badge: 'Boas-vindas',
      title: 'Bem-vindo ao Furreco da Sorte 🍀',
      subtitle: 'Seu assistente matemático para a Loteria Federal & Bancas',
      description: [
        'O Furreco transforma os sorteios oficiais das quartas-feiras e sábados em análises estatísticas claras e palpites calculados.',
        'Chega de apostar completamente no escuro: aqui você visualiza quais números têm maior incidência real, dezenas atrasadas e probabilidades matemáticas comprovadas.',
      ],
      tips: '💡 Dica: A Loteria Federal tem a melhor probabilidade do Brasil: 1 chance em 100.000 para faturar o 1º prêmio!',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      accentColor: 'from-amber-500/20 via-emerald-500/10 to-transparent border-amber-500/40',
      visualPreview: (
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-2 text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <span>Oficial Caixa Econômica</span>
            <span>·</span>
            <span>Espaço da Sorte 19h</span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-xs">
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Concursos</span>
              <strong className="text-white text-sm">Quarta & Sábado</strong>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Bichos</span>
              <strong className="text-amber-400 text-sm">25 Grupos</strong>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Bilhetes</span>
              <strong className="text-emerald-400 text-sm">00.000 a 99.999</strong>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'stats',
      badge: 'Estatísticas',
      title: '📊 Como Explorar as Estatísticas',
      subtitle: 'Descubra Dezenas Quentes, Finais Líderes e Atrasômetro',
      description: [
        'Na aba "Estatísticas", você encontra gráficos interativos calculados a partir dos concursos recentes da Federal:',
        '• Finais Líderes: veja qual dígito (0 a 9) mais finaliza os bilhetes sorteados nos 5 prêmios.',
        '• Dezenas Mais Frequentes: ranking das dezenas (00 a 99) que mais saem, associadas aos seus respectivos animais do Bicho.',
        '• O Atrasômetro: lista quais dezenas estão há mais concursos sem aparecer, indicando retorno estatístico.',
      ],
      tips: '💡 Dica: Você pode alternar entre as abas internas (Finais, Dezenas, Atrasômetro e Bichos) para refinar sua análise.',
      targetTab: 'stats',
      actionLabel: 'Abrir Painel de Estatísticas',
      icon: <BarChart3 className="w-5 h-5 text-emerald-400" />,
      accentColor: 'from-emerald-500/20 via-slate-900 to-transparent border-emerald-500/40',
      visualPreview: (
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold border-b border-slate-800 pb-1.5">
            <span>Exemplo: Dezenas Quentes Recentes</span>
            <span className="text-emerald-400 font-mono">Frequência</span>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between bg-slate-900/90 px-2.5 py-1.5 rounded border border-slate-800">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span className="text-emerald-400 font-black">91</span>
                <span className="text-slate-400 text-[11px] font-sans">🐻 Urso (Gr. 23)</span>
              </span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[85%]" />
                </div>
                <span className="text-emerald-400 font-bold">14x</span>
              </div>
            </div>
            <div className="flex items-center justify-between bg-slate-900/90 px-2.5 py-1.5 rounded border border-slate-800">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span className="text-amber-400 font-black">74</span>
                <span className="text-slate-400 text-[11px] font-sans">🦚 Pavão (Gr. 19)</span>
              </span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full w-[68%]" />
                </div>
                <span className="text-amber-400 font-bold">11x</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'generator',
      badge: 'Gerador Inteligente',
      title: '🎯 Como Usar o Gerador de Palpites',
      subtitle: 'Estratégias Matemáticas & Teste em Concursos Anteriores',
      description: [
        'O Gerador não cria números aleatórios vazios: ele aplica 4 estratégias baseadas em dados históricos reais:',
        '1. 🔥 Dezenas Quentes: combina dezenas e finais que estão em alta nos últimos sorteios.',
        '2. ❄️ Atrasômetro: prioriza números frios há muito tempo sem sair (estatística de probabilidade acumulada).',
        '3. ⚖️ Equilíbrio Par/Ímpar: balanceia os dígitos para seguir a média histórica dos 5 prêmios.',
        '4. 🎲 Surpresinha Estatística: gera combinações com filtros para evitar números impraticáveis.',
        '⚡ Destaque exclusivo: após gerar, clique em "Testar nos Concursos Anteriores" para auditar na hora se o bilhete já teria recebido algum prêmio no histórico!',
      ],
      tips: '💡 Dica: Você pode salvar quantos bilhetes quiser na sua lista local e copiar para o WhatsApp ou canhoto.',
      targetTab: 'generator',
      actionLabel: 'Experimentar o Gerador Agora',
      icon: <Flame className="w-5 h-5 text-amber-400" />,
      accentColor: 'from-amber-500/20 via-rose-500/10 to-transparent border-amber-500/40',
      visualPreview: (
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-center space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-center gap-1.5">
            <span>Bilhete Gerado pela Estratégia</span>
            <span className="text-amber-400 font-bold">🔥 Dezenas Quentes</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 py-1">
            {['4', '8', '2', '9', '1'].map((digit, i) => (
              <span
                key={i}
                className="w-8 h-10 rounded-lg bg-slate-900 border border-amber-400/50 flex items-center justify-center font-mono font-black text-lg text-amber-300 shadow-inner"
              >
                {digit}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5 px-1">
            <span>Dezena 91 · 🐻 Urso</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Teste no Histórico: Premiado!
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'odds_responsible',
      badge: 'Jogo Consciente',
      title: '🛡️ Probabilidades & Gestão da Banca',
      subtitle: 'Controle de Gastos e Palpites de Bicho Fracionados',
      description: [
        'O Furreco incentiva o jogo recreativo responsável através de duas ferramentas essenciais:',
        '• Calculadora de Probabilidades: confira as chances reais para cada faixa (1º Prêmio, Milhar, Centena, Dezena e Terminação).',
        '• Simulador de Teto Semanal: defina um teto (ex.: R$ 10 ou R$ 15 por semana) para manter suas apostas sob controle total.',
        '• Palpites para Bancas: sugestões de Milhar (4d), Centena (3d) e Duque de Dezenas com orientação para apostar frações de R$ 0,50 a R$ 1,00.',
      ],
      tips: '💡 Dica: Nunca encare loterias como investimento. Aposte apenas pequenos valores de lazer que não comprometam seu orçamento.',
      targetTab: 'responsible',
      actionLabel: 'Ver Ferramentas de Jogo Consciente',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      accentColor: 'from-emerald-500/20 via-slate-900 to-transparent border-emerald-500/40',
      visualPreview: (
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold">Teto Semanal Recomendado:</span>
            <span className="font-mono text-emerald-400 font-bold">R$ 10,00</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full w-[25%]" />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800 text-center">
              <span className="text-[9px] text-slate-400 block font-sans">Apostas de R$ 0,50</span>
              <strong className="text-white text-xs">20 palpites</strong>
            </div>
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800 text-center">
              <span className="text-[9px] text-slate-400 block font-sans">Apostas de R$ 1,00</span>
              <strong className="text-white text-xs">10 palpites</strong>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'accessibility_notifs',
      badge: 'Acessibilidade & Alertas',
      title: '⚙️ Notificações e Modo Alto Contraste',
      subtitle: 'Tudo pronto para você aproveitar o Furreco!',
      description: [
        'Para tornar sua navegação mais confortável, o Furreco inclui:',
        '• Alertas no Navegador: ative as notificações para ser avisado assim que os resultados oficiais das 19h forem publicados.',
        '• Modo Alto Contraste: no topo da tela ou nas configurações, ative o contraste reforçado com bordas nítidas e textos de alta luminância.',
        '• Áudio Interativo: sinos e sons de celebração para conferência de bilhetes sorteados.',
      ],
      tips: '💡 Você pode reabrir este tour a qualquer momento clicando no botão "Como Usar" no topo da página!',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      accentColor: 'from-emerald-500/20 via-amber-500/10 to-transparent border-emerald-500/40',
      visualPreview: (
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 space-y-2 text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="px-3 py-1.5 rounded-lg bg-black border-2 border-white text-white font-bold text-xs flex items-center gap-1.5">
              <Contrast className="w-3.5 h-3.5" /> Alto Contraste
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Alertas Ativos
            </span>
          </div>
          <p className="text-[11px] text-slate-400 pt-1">
            Totalmente otimizado para celulares, tablets e computadores.
          </p>
        </div>
      ),
    },
  ];

  const currentStep = tourSteps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === tourSteps.length - 1;

  const handleNext = () => {
    if (onPlayChime) onPlayChime();
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (onPlayChime) onPlayChime();
    setCurrentStepIndex(prev => Math.max(prev - 1, 0));
  };

  const handleJumpToTab = (tab: 'stats' | 'history' | 'generator' | 'weekly' | 'odds' | 'responsible' | 'milhar') => {
    if (onPlayChime) onPlayChime();
    onNavigateToTab(tab);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div
        className={`w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[92vh] transition-all ${
          highContrast
            ? 'bg-black border-2 border-amber-400 text-white shadow-amber-400/20'
            : 'bg-slate-900 border-slate-800 text-slate-100 shadow-slate-950/60'
        }`}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {currentStep.badge}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Etapa {currentStepIndex + 1} de {tourSteps.length}
                </span>
              </div>
              <h2 id="tour-modal-title" className="text-sm sm:text-base font-bold text-white mt-0.5">
                Tour Interativo do Furreco
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fechar tour"
            aria-label="Fechar tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Step Hero Banner */}
          <div className={`rounded-xl p-4 border bg-gradient-to-br ${currentStep.accentColor}`}>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 shrink-0">
                {currentStep.icon}
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                  {currentStep.title}
                </h3>
                <p className="text-xs sm:text-sm font-medium text-amber-300">
                  {currentStep.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Visual Preview */}
          <div>{currentStep.visualPreview}</div>

          {/* Step Explanation Text */}
          <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
            {currentStep.description.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* Practical Tip */}
          <div className="bg-amber-950/30 border border-amber-500/30 p-2.5 sm:p-3 rounded-xl text-[11px] sm:text-xs text-amber-200">
            {currentStep.tips}
          </div>

          {/* Direct Action Link if available */}
          {currentStep.targetTab && currentStep.actionLabel && (
            <div className="pt-1">
              <button
                onClick={() => handleJumpToTab(currentStep.targetTab!)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-900/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{currentStep.actionLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer with Controls */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          {/* Progress Dots */}
          <div className="flex items-center gap-1.5">
            {tourSteps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => {
                  if (onPlayChime) onPlayChime();
                  setCurrentStepIndex(idx);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'w-6 bg-amber-400'
                    : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Ir para etapa ${idx + 1}: ${step.badge}`}
                aria-label={`Ir para etapa ${idx + 1}`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                isLastStep
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-900/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30'
              }`}
            >
              <span>{isLastStep ? 'Concluir & Começar' : 'Próximo'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
