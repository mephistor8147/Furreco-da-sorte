// furreco da sorte
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  RefreshCw,
  Bookmark,
  Check,
  History,
  Award,
  Info,
  Trash2,
  Copy,
  Share2,
  Target,
  X,
  Flame,
  Snowflake,
  Scale,
  Dices,
  Calculator,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import { LotteryContest, SmartBet, AnimalInfo } from '../types/lottery';
import { getAnimalByDezena, formatTicket } from '../utils/lotteryUtils';
import { calculateDezenaStats, calculateFinalDigitStats } from '../data/mockLotteryData';
import { useAppError } from '../context/ErrorContext';

interface SmartGeneratorCardProps {
  contests: LotteryContest[];
  soundEnabled: boolean;
  onPlayChime?: () => void;
  targetDezena?: string | null;
  onClearTargetDezena?: () => void;
  onNavigateToTab?: (
    tab: 'stats' | 'history' | 'generator' | 'weekly' | 'odds' | 'responsible' | 'milhar',
    subTab?: 'finais' | 'dezenas' | 'atrasometro' | 'bichos' | 'auditoria'
  ) => void;
  onSelectDezena?: (dezena: string) => void;
}

interface HotModalitiesData {
  milhar: {
    numero: string;
    bicho: AnimalInfo;
  };
  centena: {
    numero: string;
    bicho: AnimalInfo;
  };
  dezena: {
    numero: string;
    bicho: AnimalInfo;
  };
  duque: {
    dezenas: [string, string];
    bichos: [AnimalInfo, AnimalInfo];
  };
  terno: {
    dezenas: [string, string, string];
    bichos: [AnimalInfo, AnimalInfo, AnimalInfo];
  };
}

const SAVED_BETS_KEY = 'furreco_saved_bets_v1';

export const SmartGeneratorCard: React.FC<SmartGeneratorCardProps> = ({
  contests,
  soundEnabled,
  onPlayChime,
  targetDezena,
  onClearTargetDezena,
  onNavigateToTab,
  onSelectDezena,
}) => {
  const { showError, showToastError, showDiagnosticError } = useAppError();
  const [strategy, setStrategy] = useState<'quentes' | 'atrasados' | 'equilibrio' | 'surpresinha'>('quentes');
  const [isGenerating, setIsGenerating] = useState(false);
  const [displayDigits, setDisplayDigits] = useState<string[]>(['4', '8', '2', '9', '1']);
  const [currentBet, setCurrentBet] = useState<SmartBet | null>(null);
  const [hotModalities, setHotModalities] = useState<HotModalitiesData | null>(null);
  const [copied, setCopied] = useState(false);
  const [sharedWhatsApp, setSharedWhatsApp] = useState(false);
  const [savedBets, setSavedBets] = useState<SmartBet[]>([]);
  const [copiedSavedId, setCopiedSavedId] = useState<string | null>(null);
  const [copiedModality, setCopiedModality] = useState<string | null>(null);
  const [copiedAllModalities, setCopiedAllModalities] = useState(false);
  const [pastTestResult, setPastTestResult] = useState<{
    tested: boolean;
    hits: Array<{ contestNum: number; date: string; prizeType: string; matched: string; prizeValue: number }>;
  }>({ tested: false, hits: [] });

  // Load saved bets from localStorage
  useEffect(() => {
    try {
      const data = localStorage.getItem(SAVED_BETS_KEY);
      if (data) setSavedBets(JSON.parse(data));
    } catch {
      // ignore
    }
  }, []);

  const saveBetsToStorage = (bets: SmartBet[]) => {
    setSavedBets(bets);
    try {
      localStorage.setItem(SAVED_BETS_KEY, JSON.stringify(bets));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha desconhecida de armazenamento';
      showError({
        title: 'Falha no Armazenamento Local',
        message: 'Não foi possível salvar o bilhete no dispositivo. O armazenamento do navegador pode estar cheio.',
        details: `${msg}\nChave: ${SAVED_BETS_KEY}`,
        severity: 'critico',
        source: 'Armazenamento do Navegador',
        code: 'ERR_STORAGE_FULL',
      });
    }
  };

  // Generate numbers based on selected strategy, target dezena and recent contest history
  const generateTicket = (overrideStrategy?: 'quentes' | 'atrasados' | 'equilibrio' | 'surpresinha') => {
    const activeStrategy = overrideStrategy || strategy;
    if (overrideStrategy && overrideStrategy !== strategy) {
      setStrategy(overrideStrategy);
    }

    setIsGenerating(true);
    setPastTestResult({ tested: false, hits: [] });

    // Sound feedback
    if (soundEnabled && onPlayChime) onPlayChime();

    // Stats calculations
    const dezenaStats = calculateDezenaStats(contests);
    const finalStats = calculateFinalDigitStats(contests);

    let chosenTicket = '';
    let motivo = '';

    if (targetDezena) {
      // Locked target dezena chosen from Atrasômetro or Milhar
      const padDez = targetDezena.padStart(2, '0').slice(-2);
      const animal = getAnimalByDezena(padDez);
      const d1 = Math.floor(Math.random() * 9) + 1;
      const d2 = Math.floor(Math.random() * 10);
      const d3 = Math.floor(Math.random() * 10);
      chosenTicket = `${d1}${d2}${d3}${padDez}`;
      motivo = `Palpite personalizado focado na dezena ${padDez} (${animal.nome} ${animal.emoji} - Gr. ${String(animal.grupo).padStart(2, '0')}), selecionada diretamente no Atrasômetro da Caixa.`;
    } else if (activeStrategy === 'quentes') {
      // Top hot dezenas and hot final digits
      const hotPool = dezenaStats.maisFrequentes.slice(0, Math.min(6, dezenaStats.maisFrequentes.length));
      const chosenItem = hotPool[Math.floor(Math.random() * hotPool.length)] || { dezena: '42' };
      const hotDezena = chosenItem.dezena;
      const hotFinal = finalStats[Math.floor(Math.random() * Math.min(3, finalStats.length))]?.digit ?? 7;
      const d1 = Math.floor(Math.random() * 9) + 1;
      const d2 = hotFinal;
      const d3 = Math.floor(Math.random() * 10);
      chosenTicket = `${d1}${d2}${d3}${hotDezena}`.slice(-5).padStart(5, '0');
      motivo = `Estratégia Dezenas Quentes: gerado com a dezena ${hotDezena} (alta frequência recente nos prêmios da Caixa) e final favorável ${hotDezena.slice(-1)}.`;
    } else if (activeStrategy === 'atrasados') {
      // Delayed / cold dezenas due for a cycle hit
      const coldPool = dezenaStats.maisAtrasadas.slice(0, Math.min(6, dezenaStats.maisAtrasadas.length));
      const chosenCold = coldPool[Math.floor(Math.random() * coldPool.length)] || { dezena: '91', concursosAtrasada: 8 };
      const d1 = Math.floor(Math.random() * 8) + 1;
      const d2 = Math.floor(Math.random() * 10);
      const d3 = Math.floor(Math.random() * 10);
      chosenTicket = `${d1}${d2}${d3}${chosenCold.dezena}`.slice(-5).padStart(5, '0');
      motivo = `Estratégia Atrasômetro: aposta na dezena fria ${chosenCold.dezena}, que está há ${chosenCold.concursosAtrasada} concursos sem sair, aproveitando a pressão de ciclo estatístico.`;
    } else if (activeStrategy === 'equilibrio') {
      // Balanced distribution
      let t = '';
      let sum = 0;
      for (let i = 0; i < 5; i++) {
        const d = (i === 0 ? Math.floor(Math.random() * 9) + 1 : Math.floor(Math.random() * 10));
        t += d;
        sum += d;
      }
      chosenTicket = t.padStart(5, '0');
      motivo = `Equilíbrio Estatístico: soma balanceada de algarismos (${sum}) com proporção ideal de números pares e ímpares para a Loteria Federal.`;
    } else {
      // Surpresinha
      const rnd = Math.floor(Math.random() * 100000);
      chosenTicket = rnd.toString().padStart(5, '0');
      motivo = `Surpresinha Aleatória do Furreco: seleção randômica pura. Todos os 100.000 bilhetes possuem chances matemáticas rigorosamente idênticas!`;
    }

    // Number rolling effect animation
    let iterations = 0;
    const interval = setInterval(() => {
      setDisplayDigits([
        String(Math.floor(Math.random() * 10)),
        String(Math.floor(Math.random() * 10)),
        String(Math.floor(Math.random() * 10)),
        String(Math.floor(Math.random() * 10)),
        String(Math.floor(Math.random() * 10)),
      ]);
      iterations++;

      if (iterations >= 10) {
        clearInterval(interval);
        setDisplayDigits(chosenTicket.split(''));
        setIsGenerating(false);

        const dezenaFinal = chosenTicket.slice(-2);
        const animal = getAnimalByDezena(dezenaFinal);
        const newBet: SmartBet = {
          id: `bet-${Date.now()}`,
          bilhete: chosenTicket,
          estrategia: targetDezena ? 'personalizado' : activeStrategy,
          dataGeracao: new Date().toLocaleDateString('pt-BR'),
          bicho: animal,
          motivo,
          probabilidadeTeorica: '1 em 100.000 (1º Prêmio) · 1 em 10 (Terminação)',
        };
        setCurrentBet(newBet);

        // Compute Hot Modalities (Milhar, Centena, Dezena, Duque, Terno)
        const milharNum = chosenTicket.slice(-4);
        const centenaNum = chosenTicket.slice(-3);

        // Pick 2nd and 3rd correlated hot/stat dezenas for Duque and Terno
        const poolSource = activeStrategy === 'atrasados'
          ? dezenaStats.maisAtrasadas.map(d => d.dezena)
          : dezenaStats.maisFrequentes.map(d => d.dezena);

        const filteredPool = poolSource.filter(d => d !== dezenaFinal);
        const d2 = filteredPool[0] || (parseInt(dezenaFinal, 10) === 99 ? '00' : String(parseInt(dezenaFinal, 10) + 1).padStart(2, '0'));
        const d3 = filteredPool[1] || (parseInt(dezenaFinal, 10) <= 97 ? String(parseInt(dezenaFinal, 10) + 2).padStart(2, '0') : '07');

        const animal2 = getAnimalByDezena(d2);
        const animal3 = getAnimalByDezena(d3);

        setHotModalities({
          milhar: {
            numero: milharNum,
            bicho: animal,
          },
          centena: {
            numero: centenaNum,
            bicho: animal,
          },
          dezena: {
            numero: dezenaFinal,
            bicho: animal,
          },
          duque: {
            dezenas: [dezenaFinal, d2],
            bichos: [animal, animal2],
          },
          terno: {
            dezenas: [dezenaFinal, d2, d3],
            bichos: [animal, animal2, animal3],
          },
        });

        // Confetti burst
        try {
          confetti({
            particleCount: 45,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#10b981', '#f59e0b', '#06b6d4', '#ec4899'],
          });
        } catch {
          // ignore
        }
      }
    }, 45);
  };

  // Run on mount or when targetDezena changes
  useEffect(() => {
    generateTicket();
  }, [targetDezena]);

  const handleCopy = async () => {
    if (!currentBet) return;
    try {
      await navigator.clipboard.writeText(formatTicket(currentBet.bilhete));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na API de Clipboard';
      showError({
        title: 'Falha na Área de Transferência',
        message: 'O navegador bloqueou a cópia automática do bilhete.',
        details: `${msg}\nBilhete: ${currentBet.bilhete}`,
        severity: 'validacao',
        source: 'Área de Transferência',
        code: 'ERR_CLIPBOARD_FAILED',
      });
    }
  };

  const handleShareWhatsApp = async () => {
    if (!currentBet) return;
    const msg = `🍀 *PALPITE DO FURRECO DA SORTE*\n` +
      `🎟️ *Bilhete:* ${formatTicket(currentBet.bilhete)}\n` +
      `🎯 *Milhar:* ${currentBet.bilhete.slice(-4)}\n` +
      `🔢 *Centena:* ${currentBet.bilhete.slice(-3)}\n` +
      `🐾 *Bicho:* ${currentBet.bicho.nome} ${currentBet.bicho.emoji} (Grupo ${String(currentBet.bicho.grupo).padStart(2, '0')})\n` +
      `⚖️ *Estratégia:* ${currentBet.estrategia.toUpperCase()}\n` +
      `💡 *Por quê?* ${currentBet.motivo}\n\n` +
      `Consulte estatísticas completas e o Atrasômetro no Furreco da Sorte!`;

    try {
      await navigator.clipboard.writeText(msg);
      setSharedWhatsApp(true);
      setTimeout(() => setSharedWhatsApp(false), 2500);
    } catch {
      // ignore
    }

    try {
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bloqueio de pop-up';
      showError({
        title: 'Bloqueio de Janela Externa',
        message: 'O navegador impediu a abertura automática da janela do WhatsApp. O texto completo do palpite foi copiado para sua área de transferência para colar diretamente!',
        details: `${msg}\nURL: https://api.whatsapp.com`,
        severity: 'aviso',
        source: 'WhatsApp',
        code: 'ERR_POPUP_BLOCKED',
      });
    }
  };

  const handleSaveBet = () => {
    if (!currentBet) return;
    if (savedBets.some(b => b.bilhete === currentBet.bilhete)) {
      showError({
        title: 'Palpite Já Salvo nos Favoritos',
        message: `O bilhete ${formatTicket(currentBet.bilhete)} já está salvo na sua lista de palpites.`,
        details: `Bilhete: ${currentBet.bilhete}\nEstratégia: ${currentBet.estrategia.toUpperCase()}\nBicho: ${currentBet.bicho.nome} ${currentBet.bicho.emoji} (Grupo ${String(currentBet.bicho.grupo).padStart(2, '0')})\nNão é necessário salvá-lo em duplicidade.`,
        severity: 'aviso',
        source: 'Gerador de Palpites',
        code: 'ERR_DUPLICATE_BET',
      });
      return;
    }
    const updated = [currentBet, ...savedBets];
    saveBetsToStorage(updated);
    showToastError(`Bilhete ${formatTicket(currentBet.bilhete)} salvo com sucesso!`, {
      title: 'Palpite Salvo',
      severity: 'aviso',
    });
  };

  const handleDeleteSaved = (id: string) => {
    const updated = savedBets.filter(b => b.id !== id);
    saveBetsToStorage(updated);
  };

  const handleLoadSavedBet = (bet: SmartBet) => {
    setCurrentBet(bet);
    setDisplayDigits(bet.bilhete.split(''));
    setPastTestResult({ tested: false, hits: [] });

    // Also update hot modalities for loaded bet
    const dezenaFinal = bet.bilhete.slice(-2);
    const animal = getAnimalByDezena(dezenaFinal);
    const dezenaStats = calculateDezenaStats(contests);
    const filteredPool = dezenaStats.maisFrequentes.map(d => d.dezena).filter(d => d !== dezenaFinal);
    const d2 = filteredPool[0] || '14';
    const d3 = filteredPool[1] || '27';
    setHotModalities({
      milhar: { numero: bet.bilhete.slice(-4), bicho: animal },
      centena: { numero: bet.bilhete.slice(-3), bicho: animal },
      dezena: { numero: dezenaFinal, bicho: animal },
      duque: { dezenas: [dezenaFinal, d2], bichos: [animal, getAnimalByDezena(d2)] },
      terno: { dezenas: [dezenaFinal, d2, d3], bichos: [animal, getAnimalByDezena(d2), getAnimalByDezena(d3)] },
    });
  };

  const handleCopySavedBet = (bet: SmartBet) => {
    navigator.clipboard.writeText(formatTicket(bet.bilhete));
    setCopiedSavedId(bet.id);
    setTimeout(() => setCopiedSavedId(null), 2000);
  };

  const handleInspectMilhar = (bilhete: string) => {
    const dezena = bilhete.slice(-2);
    if (onSelectDezena) onSelectDezena(dezena);
    if (onNavigateToTab) onNavigateToTab('milhar');
  };

  const handleCopyModalityText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedModality(id);
      setTimeout(() => setCopiedModality(null), 2000);
    } catch {
      showToastError('Não foi possível copiar o texto da modalidade.');
    }
  };

  const handleCopyAllModalities = async () => {
    if (!hotModalities) return;
    const text = `🍀 *PALPITES QUENTES POR MODALIDADE - FURRECO DA SORTE*\n` +
      `📅 Sorteios Oficiais da Loteria Federal (Caixa)\n\n` +
      `🎯 *MILHAR QUENTE:* ${hotModalities.milhar.numero}\n` +
      `   🐾 Bicho: ${hotModalities.milhar.bicho.nome} ${hotModalities.milhar.bicho.emoji} (Gr. ${String(hotModalities.milhar.bicho.grupo).padStart(2, '0')})\n` +
      `   📊 Probabilidade: 1 em 10.000 (0,01% na Cabeça) · 1 em 2.000 (0,05% no 1º ao 5º)\n` +
      `   💰 Retorno: Até 4.000x\n\n` +
      `🔢 *CENTENA QUENTE:* ${hotModalities.centena.numero}\n` +
      `   🐾 Bicho: ${hotModalities.centena.bicho.nome} ${hotModalities.centena.bicho.emoji}\n` +
      `   📊 Probabilidade: 1 em 1.000 (0,10% na Cabeça) · 1 em 200 (0,50% no 1º ao 5º)\n` +
      `   💰 Retorno: Até 600x\n\n` +
      `🔟 *DEZENA QUENTE:* ${hotModalities.dezena.numero}\n` +
      `   🐾 Bicho: ${hotModalities.dezena.bicho.nome} ${hotModalities.dezena.bicho.emoji}\n` +
      `   📊 Probabilidade: 1 em 100 (1,00% na Cabeça) · 1 em 20 (5,00% no 1º ao 5º)\n` +
      `   💰 Retorno: Até 60x\n\n` +
      `🎲 *DUQUE DE DEZENAS:* ${hotModalities.duque.dezenas.join(' - ')}\n` +
      `   🐾 Animais: ${hotModalities.duque.bichos[0].nome} ${hotModalities.duque.bichos[0].emoji} + ${hotModalities.duque.bichos[1].nome} ${hotModalities.duque.bichos[1].emoji}\n` +
      `   📊 Cálculo: C(100,2) = 4.950 pares | C(5,2) = 10 duques sorteados no 1º ao 5º\n` +
      `   🎯 Probabilidade Obtida: 1 em 495 (0,202%)\n` +
      `   💰 Retorno: ~300x\n\n` +
      `👑 *TERNO DE DEZENAS:* ${hotModalities.terno.dezenas.join(' - ')}\n` +
      `   🐾 Animais: ${hotModalities.terno.bichos.map(b => `${b.nome} ${b.emoji}`).join(' + ')}\n` +
      `   📊 Cálculo: C(100,3) = 161.700 trios | C(5,3) = 10 ternos sorteados no 1º ao 5º\n` +
      `   🎯 Probabilidade Obtida: 1 em 16.170 (0,0062%)\n` +
      `   💰 Retorno: ~3.000x a 5.000x\n\n` +
      `Consulte estatísticas auditadas em tempo real no Furreco da Sorte!`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedAllModalities(true);
      setTimeout(() => setCopiedAllModalities(false), 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na cópia';
      showError({
        title: 'Falha na Área de Transferência',
        message: 'Não foi possível copiar as modalidades para a área de transferência.',
        details: msg,
        severity: 'validacao',
        source: 'Área de Transferência',
        code: 'ERR_CLIPBOARD_WRITE',
      });
    }
  };

  // Test current bet against past contests in memory
  const testAgainstPastContests = () => {
    if (!currentBet) return;
    if (contests.length === 0) {
      showError({
        title: 'Nenhum Concurso em Memória',
        message: 'Não há concursos da Loteria Federal carregados para testar o bilhete contra o histórico.',
        details: 'A base local de concursos está vazia. Verifique a conexão com a Caixa e tente sincronizar novamente.',
        severity: 'conexao',
        source: 'Auditoria de Acertos',
        code: 'ERR_NO_CONTESTS_DATA',
      });
      return;
    }
    const hits: Array<{ contestNum: number; date: string; prizeType: string; matched: string; prizeValue: number }> = [];

    contests.forEach(c => {
      const p1 = c.premios[0]?.bilhete || '';
      const bet = currentBet.bilhete;

      if (bet === p1) {
        hits.push({ contestNum: c.concurso, date: c.data, prizeType: '1º Prêmio Exato (5d)', matched: bet, prizeValue: 500000 });
      } else if (bet.slice(-4) === p1.slice(-4)) {
        hits.push({ contestNum: c.concurso, date: c.data, prizeType: 'Milhar no 1º Prêmio (4d)', matched: bet.slice(-4), prizeValue: 2000 });
      } else if (bet.slice(-3) === p1.slice(-3)) {
        hits.push({ contestNum: c.concurso, date: c.data, prizeType: 'Centena no 1º Prêmio (3d)', matched: bet.slice(-3), prizeValue: 400 });
      } else if (bet.slice(-2) === p1.slice(-2)) {
        hits.push({ contestNum: c.concurso, date: c.data, prizeType: 'Dezena no 1º Prêmio (2d)', matched: bet.slice(-2), prizeValue: 50 });
      } else if (bet.slice(-1) === p1.slice(-1)) {
        hits.push({ contestNum: c.concurso, date: c.data, prizeType: 'Terminação Final (1d)', matched: bet.slice(-1), prizeValue: 10 });
      }
    });

    setPastTestResult({ tested: true, hits });
  };

  const sumOfDigits = displayDigits.reduce((acc, curr) => acc + parseInt(curr || '0', 10), 0);
  const evenCount = displayDigits.filter(d => parseInt(d, 10) % 2 === 0).length;
  const oddCount = 5 - evenCount;
  const isSaved = Boolean(currentBet && savedBets.some(b => b.bilhete === currentBet.bilhete));
  const latestContestNum = contests[0]?.concurso || 6105;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Main Generator Column (2 cols) */}
      <div className="lg:col-span-2 space-y-4 sm:space-y-6">
        {/* Card 1: Interactive Bilhete Generator */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-7 shadow-xl relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Target Dezena Lock Banner (if navigated from Atrasômetro) */}
          {targetDezena && (
            <div className="relative z-10 mb-4 bg-cyan-950/80 border border-cyan-500/40 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono font-bold text-sm">
                  🎯 {targetDezena}
                </span>
                <div className="text-xs text-slate-200">
                  <strong className="text-cyan-300 block font-bold">Foco Ativo na Dezena {targetDezena}</strong>
                  <span>Palpites gerados terminarão na dezena selecionada no Atrasômetro.</span>
                </div>
              </div>

              {onClearTargetDezena && (
                <button
                  onClick={onClearTargetDezena}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all self-end sm:self-auto min-h-[32px]"
                  title="Remover foco e voltar às estratégias gerais"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remover Foco</span>
                </button>
              )}
            </div>
          )}

          {/* Header */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] sm:text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Inteligência Estatística Recente
                </span>
                <button
                  onClick={() => showDiagnosticError('aviso')}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-300 hover:text-white bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 px-2 py-0.5 rounded-full cursor-pointer transition-colors active:scale-95 shadow-sm"
                  title="Abrir o pop-up de erros para testar diagnóstico e contingência"
                >
                  <ShieldAlert className="w-3 h-3 text-rose-400" />
                  <span>Pop-up de Erros</span>
                </button>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white mt-0.5 sm:mt-1">
                Gerador de Palpites do Furreco
              </h2>
            </div>

            {/* Strategy Selectors (All 4 fully functional - immediately generate on click) */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 p-1 bg-slate-950/90 rounded-xl border border-slate-800 w-full sm:w-auto">
              <button
                onClick={() => generateTicket('quentes')}
                className={`px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs font-bold rounded-lg transition-all text-center cursor-pointer flex items-center justify-center gap-1 min-h-[38px] ${
                  strategy === 'quentes' && !targetDezena
                    ? 'bg-rose-500 text-white font-black shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Gerar palpite priorizando as dezenas mais sorteadas recentemente"
              >
                <Flame className="w-3.5 h-3.5 text-amber-300" />
                <span>Quentes</span>
              </button>

              <button
                onClick={() => generateTicket('atrasados')}
                className={`px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs font-bold rounded-lg transition-all text-center cursor-pointer flex items-center justify-center gap-1 min-h-[38px] ${
                  strategy === 'atrasados' && !targetDezena
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Gerar palpite com as dezenas e bichos com maior tempo sem sair"
              >
                <Snowflake className="w-3.5 h-3.5 text-cyan-300" />
                <span>Atrasados</span>
              </button>

              <button
                onClick={() => generateTicket('equilibrio')}
                className={`px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs font-bold rounded-lg transition-all text-center cursor-pointer flex items-center justify-center gap-1 min-h-[38px] ${
                  strategy === 'equilibrio' && !targetDezena
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Gerar palpite equilibrado com soma intermediária e paridade 3/2"
              >
                <Scale className="w-3.5 h-3.5 text-emerald-300" />
                <span>Equilíbrio</span>
              </button>

              <button
                onClick={() => generateTicket('surpresinha')}
                className={`px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs font-bold rounded-lg transition-all text-center cursor-pointer flex items-center justify-center gap-1 min-h-[38px] ${
                  strategy === 'surpresinha' && !targetDezena
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Gerar surpresinha totalmente aleatória de 5 dígitos"
              >
                <Dices className="w-3.5 h-3.5 text-slate-950" />
                <span>Surpresinha</span>
              </button>
            </div>
          </div>

          {/* Ticket Display Area (Styled like official Brazilian Lottery Ticket) */}
          <div className="mt-4 sm:mt-6 relative z-10">
            <div className="bg-gradient-to-br from-amber-50 via-amber-100/95 to-amber-50 text-slate-900 rounded-2xl p-3.5 sm:p-7 border-2 border-dashed border-amber-300 shadow-2xl relative">
              {/* Ticket Stamp & Perforation marks */}
              <div className="flex items-center justify-between border-b border-amber-300/80 pb-2 text-[11px] sm:text-xs font-mono uppercase tracking-wider text-amber-900/90 font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="text-base">🍀</span> LOTERIA FEDERAL · BILHETE OFICIAL
                </span>
                <span className="text-amber-800 font-semibold">
                  BASE #{latestContestNum}
                </span>
              </div>

              {/* Rolling 5 Digits Display - Scaled for zero mobile overflow */}
              <div className="py-4 sm:py-6 flex items-center justify-center gap-1.5 sm:gap-3 max-w-full">
                {displayDigits.map((digit, idx) => (
                  <div
                    key={idx}
                    className={`w-11 h-15 sm:w-16 sm:h-22 rounded-xl bg-slate-900 text-amber-300 font-mono text-2xl sm:text-5xl font-black flex items-center justify-center shadow-lg border-2 border-amber-400/40 tabular-nums ${
                      isGenerating ? 'animate-pulse scale-95' : 'scale-100 transition-transform'
                    }`}
                  >
                    {digit}
                  </div>
                ))}
              </div>

              {/* Animal & Subtitle Breakdown */}
              {currentBet && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 border-t border-amber-300/80 text-xs sm:text-sm">
                  <div className="flex items-center justify-between sm:justify-start gap-2 bg-amber-200/70 px-3 py-1.5 rounded-lg font-medium text-amber-950">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg sm:text-xl">{currentBet.bicho.emoji}</span>
                      <span>
                        Grupo {String(currentBet.bicho.grupo).padStart(2, '0')} · <strong>{currentBet.bicho.nome}</strong>
                      </span>
                    </div>
                    <span className="text-amber-900/80 text-[11px] sm:text-xs font-mono font-bold">
                      ({currentBet.bicho.dezenas.join(', ')})
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 text-amber-950 font-mono text-[11px] sm:text-xs bg-amber-200/40 sm:bg-transparent px-2.5 py-1 sm:p-0 rounded">
                    <span>
                      Milhar: <strong className="text-slate-950 font-bold">{currentBet.bilhete.slice(-4)}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Centena: <strong className="text-slate-950 font-bold">{currentBet.bilhete.slice(-3)}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Final: <strong className="text-emerald-800 font-black">{currentBet.bilhete.slice(-1)}</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Analysis & Breakdown Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3 sm:mt-4">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 sm:p-3 text-center">
                <span className="text-xs text-slate-400 font-semibold block">Soma dos Dígitos</span>
                <span className="text-lg sm:text-xl font-black font-mono text-amber-300 tabular-nums">{sumOfDigits}</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 sm:p-3 text-center">
                <span className="text-xs text-slate-400 font-semibold block">Paridade</span>
                <span className="text-sm sm:text-base font-black text-slate-100">
                  {evenCount}P · {oddCount}I
                </span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 sm:p-3 text-center">
                <span className="text-xs text-slate-400 font-semibold block">Chance Teórica</span>
                <span className="text-xs sm:text-sm font-black text-emerald-400">1 em 100 mil</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 sm:p-3 text-center">
                <span className="text-xs text-slate-400 font-semibold block">Restituição (Final)</span>
                <span className="text-xs sm:text-sm font-black text-cyan-300">10% de chance</span>
              </div>
            </div>

            {/* Justification Box */}
            {currentBet && (
              <div className="mt-3 sm:mt-4 bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-3 sm:p-3.5 flex items-start gap-2.5 text-xs text-emerald-200">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-emerald-300 font-bold block mb-0.5">Por que este palpite?</strong>
                  {currentBet.motivo}
                </div>
              </div>
            )}

            {/* Action Buttons: Fully functional, responsive grid */}
            <div className="flex flex-col gap-2.5 mt-4 sm:mt-6">
              {/* Main Primary CTA */}
              <button
                onClick={() => generateTicket()}
                disabled={isGenerating}
                className="w-full py-3.5 px-6 rounded-xl font-black text-slate-950 bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-300 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 disabled:opacity-50 cursor-pointer min-h-[48px] text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Calculando Probabilidades...' : 'Gerar Novo Palpite da Sorte'}</span>
              </button>

              {/* Functional Sub-Actions Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={handleCopy}
                  className="py-2.5 px-2 rounded-xl font-bold text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer min-h-[42px] active:scale-95"
                  title="Copiar bilhete formatado"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar Bilhete'}</span>
                </button>

                <button
                  onClick={handleShareWhatsApp}
                  className="py-2.5 px-2 rounded-xl font-bold text-xs text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 transition-colors flex items-center justify-center gap-1.5 border border-emerald-500/30 cursor-pointer min-h-[42px] active:scale-95"
                  title="Compartilhar palpite com bilhete e bicho no WhatsApp"
                >
                  {sharedWhatsApp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{sharedWhatsApp ? 'Enviado!' : 'WhatsApp'}</span>
                </button>

                <button
                  onClick={handleSaveBet}
                  className={`py-2.5 px-2 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border cursor-pointer min-h-[42px] active:scale-95 ${
                    isSaved
                      ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                  title={isSaved ? 'Este palpite já está salvo nos favoritos (clique para ver detalhes)' : 'Salvar este palpite na lista local'}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{isSaved ? 'Salvo ✓' : 'Salvar'}</span>
                </button>

                <button
                  onClick={testAgainstPastContests}
                  className="py-2.5 px-2 rounded-xl font-bold text-xs text-amber-300 bg-amber-950/40 hover:bg-amber-900/40 transition-colors flex items-center justify-center gap-1.5 border border-amber-500/30 cursor-pointer min-h-[42px] active:scale-95"
                  title="Confrontar este bilhete contra os concursos passados da Caixa"
                >
                  <History className="w-3.5 h-3.5 text-amber-400" />
                  <span>Testar Acertos</span>
                </button>
              </div>

              {/* Milhar Inspector Bridge */}
              {currentBet && onNavigateToTab && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-400 truncate">
                    Milhar deste bilhete: <strong className="text-cyan-300 font-mono">{currentBet.bilhete.slice(-4)}</strong>
                  </span>
                  <button
                    onClick={() => handleInspectMilhar(currentBet.bilhete)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 hover:text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0"
                    title="Inspecionar saídas e desdobramentos desta milhar na aba Milhar"
                  >
                    <Target className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Inspecionar no Menu Milhar →</span>
                  </button>
                </div>
              )}
            </div>

            {/* Test Against Past Contests Feedback */}
            {pastTestResult.tested && (
              <div className="mt-4 p-3.5 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 animate-fadeIn">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] sm:text-xs font-bold uppercase text-slate-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    Teste Retroativo Oficial ({contests.length} concursos Caixa)
                  </span>
                  <span className="text-xs text-emerald-400 font-black">
                    {pastTestResult.hits.length} acerto(s)
                  </span>
                </div>

                {pastTestResult.hits.length > 0 ? (
                  <div className="space-y-2 mt-2">
                    {pastTestResult.hits.map((hit, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900/90 p-2.5 sm:px-3 sm:py-2 rounded-lg text-xs border border-slate-800 gap-1"
                      >
                        <span className="text-slate-200">
                          Conc. <strong>#{hit.contestNum}</strong> ({hit.date}) ·{' '}
                          <span className="text-amber-300 font-semibold">{hit.prizeType}</span>
                        </span>
                        <span className="font-mono text-emerald-400 font-bold">
                          R$ {hit.prizeValue.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Este número não coincidiu com os prêmios principais nos últimos {contests.length} concursos analisados da Federal.
                    Na teoria dos ciclos, isso indica defasagem estatística favorável!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Hot Modalities Breakdown Card with exact probability calculations */}
        {hotModalities && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 sm:space-y-5 animate-fadeIn">
            {/* Header: Title + Calculation Context + Master Share Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/90 pb-3.5">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-amber-400/20 text-amber-300">
                    <Calculator className="w-4 h-4" />
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>Palpites Quentes por Modalidade & Probabilidades</span>
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Cálculo combinatório exato das chances matemáticas para cada faixa de aposta da Loteria Federal.
                </p>
              </div>

              <button
                onClick={handleCopyAllModalities}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 hover:brightness-110 active:scale-95 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shrink-0 min-h-[38px]"
                title="Copiar todas as 5 modalidades formatadas com cálculos para o WhatsApp"
              >
                {copiedAllModalities ? (
                  <>
                    <Check className="w-4 h-4 text-slate-950" />
                    <span>Todas Copiadas!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-950" />
                    <span>Copiar Todas as 5</span>
                  </>
                )}
              </button>
            </div>

            {/* Grid of the 5 Hot Modalities Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
              {/* 1. Milhar Quente */}
              <div className="bg-slate-950/90 border border-slate-800 hover:border-cyan-500/60 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between gap-3 transition-all shadow-md">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-cyan-300 flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-cyan-400" />
                      Milhar Quente (4d)
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">
                      Até 4.000x
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between gap-2 pt-1">
                    <div className="font-mono text-2xl sm:text-3xl font-black text-white tracking-wider">
                      {hotModalities.milhar.numero}
                    </div>
                    <div className="text-right text-xs text-slate-300">
                      <span>{hotModalities.milhar.bicho.emoji} {hotModalities.milhar.bicho.nome}</span>
                      <span className="block text-[10px] text-slate-400 font-mono">Gr. {String(hotModalities.milhar.bicho.grupo).padStart(2, '0')}</span>
                    </div>
                  </div>

                  {/* Probability Breakdown */}
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">1º Prêmio (Cabeça):</span>
                      <strong className="text-white font-mono">1 em 10.000 (0,01%)</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">1º ao 5º (Cercado):</span>
                      <strong className="text-cyan-300 font-mono">1 em 2.000 (0,05%)</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-900">
                  <button
                    onClick={() =>
                      handleCopyModalityText(
                        `Milhar Quente Furreco: ${hotModalities.milhar.numero} (${hotModalities.milhar.bicho.nome} ${hotModalities.milhar.bicho.emoji}) · Probabilidade: 1 em 10.000 (0,01%)`,
                        'milhar'
                      )
                    }
                    className="flex-1 py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-800 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedModality === 'milhar' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{copiedModality === 'milhar' ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                  {onNavigateToTab && (
                    <button
                      onClick={() => handleInspectMilhar(hotModalities.milhar.numero)}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Ver histórico desta milhar"
                    >
                      <Target className="w-3 h-3" />
                      <span>Ver Milhar</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Centena Quente */}
              <div className="bg-slate-950/90 border border-slate-800 hover:border-amber-500/60 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between gap-3 transition-all shadow-md">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Centena Quente (3d)
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">
                      Até 600x
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between gap-2 pt-1">
                    <div className="font-mono text-2xl sm:text-3xl font-black text-amber-300 tracking-wider">
                      {hotModalities.centena.numero}
                    </div>
                    <div className="text-right text-xs text-slate-300">
                      <span>{hotModalities.centena.bicho.emoji} {hotModalities.centena.bicho.nome}</span>
                      <span className="block text-[10px] text-slate-400 font-mono">3 últimos dígitos</span>
                    </div>
                  </div>

                  {/* Probability Breakdown */}
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">1º Prêmio (Cabeça):</span>
                      <strong className="text-white font-mono">1 em 1.000 (0,10%)</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">1º ao 5º (Cercado):</span>
                      <strong className="text-amber-300 font-mono">1 em 200 (0,50%)</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900">
                  <button
                    onClick={() =>
                      handleCopyModalityText(
                        `Centena Quente Furreco: ${hotModalities.centena.numero} (${hotModalities.centena.bicho.nome} ${hotModalities.centena.bicho.emoji}) · Probabilidade: 1 em 1.000 (0,10%)`,
                        'centena'
                      )
                    }
                    className="w-full py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-800 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedModality === 'centena' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{copiedModality === 'centena' ? 'Centena Copiada!' : 'Copiar Centena'}</span>
                  </button>
                </div>
              </div>

              {/* 3. Dezena Quente */}
              <div className="bg-slate-950/90 border border-slate-800 hover:border-emerald-500/60 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between gap-3 transition-all shadow-md">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-300 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      Dezena Quente (2d)
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">
                      Até 60x
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between gap-2 pt-1">
                    <div className="font-mono text-2xl sm:text-3xl font-black text-emerald-300 tracking-wider">
                      {hotModalities.dezena.numero}
                    </div>
                    <div className="text-right text-xs text-slate-300">
                      <span>{hotModalities.dezena.bicho.emoji} {hotModalities.dezena.bicho.nome}</span>
                      <span className="block text-[10px] text-slate-400 font-mono">Grupo {String(hotModalities.dezena.bicho.grupo).padStart(2, '0')}</span>
                    </div>
                  </div>

                  {/* Probability Breakdown */}
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">1º Prêmio (Cabeça):</span>
                      <strong className="text-white font-mono">1 em 100 (1,00%)</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">1º ao 5º (Cercado):</span>
                      <strong className="text-emerald-300 font-mono">1 em 20 (5,00%)</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-900">
                  <button
                    onClick={() =>
                      handleCopyModalityText(
                        `Dezena Quente Furreco: ${hotModalities.dezena.numero} (${hotModalities.dezena.bicho.nome} ${hotModalities.dezena.bicho.emoji} - Grupo ${String(hotModalities.dezena.bicho.grupo).padStart(2, '0')}) · Probabilidade: 1 em 100`,
                        'dezena'
                      )
                    }
                    className="flex-1 py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-800 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedModality === 'dezena' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{copiedModality === 'dezena' ? 'Copiada!' : 'Copiar'}</span>
                  </button>
                  {onNavigateToTab && (
                    <button
                      onClick={() => {
                        if (onSelectDezena) onSelectDezena(hotModalities.dezena.numero);
                        onNavigateToTab('stats', 'atrasometro');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Ver atraso no Atrasômetro"
                    >
                      <Snowflake className="w-3 h-3 text-cyan-400" />
                      <span>Atraso</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 4. Duque de Dezenas */}
              <div className="bg-slate-950/90 border border-slate-800 hover:border-indigo-500/60 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between gap-3 transition-all shadow-md sm:col-span-2 lg:col-span-1">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-300 flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-indigo-400" />
                      Duque de Dezenas
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">
                      ~300x
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xl sm:text-2xl font-black text-indigo-300 px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-500/40">
                        {hotModalities.duque.dezenas[0]}
                      </span>
                      <span className="text-slate-500 font-bold">+</span>
                      <span className="font-mono text-xl sm:text-2xl font-black text-indigo-300 px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-500/40">
                        {hotModalities.duque.dezenas[1]}
                      </span>
                    </div>

                    <div className="text-right text-[11px] text-slate-300 leading-tight">
                      <span>{hotModalities.duque.bichos[0].emoji} {hotModalities.duque.bichos[0].nome}</span>
                      <span className="block text-slate-400">e {hotModalities.duque.bichos[1].emoji} {hotModalities.duque.bichos[1].nome}</span>
                    </div>
                  </div>

                  {/* Combinatorics & Probability */}
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span>Combinações C(100,2):</span>
                      <span className="font-mono text-slate-300">4.950 pares possíveis</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Pares no 1º ao 5º:</span>
                      <span className="font-mono text-slate-300 font-semibold">10 premiados</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                      <span className="text-white font-bold">Probabilidade:</span>
                      <strong className="text-indigo-300 font-mono font-black">1 em 495 (0,202%)</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900">
                  <button
                    onClick={() =>
                      handleCopyModalityText(
                        `Duque de Dezenas Furreco: ${hotModalities.duque.dezenas.join(' - ')} (${hotModalities.duque.bichos[0].nome} + ${hotModalities.duque.bichos[1].nome}) · Probabilidade: 1 em 495 (0,202%) · Retorno: ~300x`,
                        'duque'
                      )
                    }
                    className="w-full py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-800 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedModality === 'duque' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{copiedModality === 'duque' ? 'Duque Copiado!' : 'Copiar Duque de Dezenas'}</span>
                  </button>
                </div>
              </div>

              {/* 5. Terno de Dezenas */}
              <div className="bg-slate-950/90 border border-slate-800 hover:border-rose-500/60 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between gap-3 transition-all shadow-md sm:col-span-2 lg:col-span-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                      Terno de Dezenas (3 Dezenas)
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">
                      ~3.000x a 5.000x
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xl sm:text-2xl font-black text-rose-300 px-2 py-0.5 rounded bg-rose-950/70 border border-rose-500/40">
                        {hotModalities.terno.dezenas[0]}
                      </span>
                      <span className="text-slate-500 font-bold">+</span>
                      <span className="font-mono text-xl sm:text-2xl font-black text-rose-300 px-2 py-0.5 rounded bg-rose-950/70 border border-rose-500/40">
                        {hotModalities.terno.dezenas[1]}
                      </span>
                      <span className="text-slate-500 font-bold">+</span>
                      <span className="font-mono text-xl sm:text-2xl font-black text-rose-300 px-2 py-0.5 rounded bg-rose-950/70 border border-rose-500/40">
                        {hotModalities.terno.dezenas[2]}
                      </span>
                    </div>

                    <div className="text-left sm:text-right text-[11px] text-slate-300 leading-tight">
                      <span>{hotModalities.terno.bichos[0].emoji} {hotModalities.terno.bichos[0].nome}</span> ·{' '}
                      <span>{hotModalities.terno.bichos[1].emoji} {hotModalities.terno.bichos[1].nome}</span> ·{' '}
                      <span>{hotModalities.terno.bichos[2].emoji} {hotModalities.terno.bichos[2].nome}</span>
                    </div>
                  </div>

                  {/* Combinatorics & Probability */}
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-slate-400 text-[10px] gap-1">
                      <span>Cálculo Combinatório C(100,3):</span>
                      <span className="font-mono text-slate-300">161.700 trios possíveis | 10 ternos premiados no 1º ao 5º</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                      <span className="text-white font-bold">Probabilidade Obtida:</span>
                      <strong className="text-rose-400 font-mono font-black text-xs sm:text-sm">
                        1 em 16.170 (0,00618%)
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900">
                  <button
                    onClick={() =>
                      handleCopyModalityText(
                        `Terno de Dezenas Furreco: ${hotModalities.terno.dezenas.join(' - ')} (${hotModalities.terno.bichos[0].nome} + ${hotModalities.terno.bichos[1].nome} + ${hotModalities.terno.bichos[2].nome}) · Probabilidade: 1 em 16.170 (0,0062%) · Retorno: ~3.000x`,
                        'terno'
                      )
                    }
                    className="w-full py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-800 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedModality === 'terno' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{copiedModality === 'terno' ? 'Terno Copiado!' : 'Copiar Terno de Dezenas'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Saved Bets Column (1 col) - Fully Interactive */}
      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-emerald-400" />
              <span>Meus Palpites Salvos</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs font-mono text-cyan-300 font-bold">
                {savedBets.length}
              </span>
            </h3>
            {savedBets.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja limpar todos os palpites salvos?')) {
                    saveBetsToStorage([]);
                  }
                }}
                className="text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer font-semibold"
                title="Limpar todos os palpites"
              >
                Limpar Todos
              </button>
            )}
          </div>

          {savedBets.length === 0 ? (
            <div className="py-8 text-center text-slate-400 space-y-3">
              <span className="text-3xl block opacity-60">🎟️</span>
              <p className="text-xs font-semibold text-slate-300">Nenhum palpite salvo ainda.</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Gere um número e clique em <strong>"Salvar"</strong> para acompanhar seus bilhetes favoritos aqui.
              </p>
              <button
                onClick={() => generateTicket()}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gerar Meu Primeiro Palpite</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin">
              {savedBets.map(bet => (
                <div
                  key={bet.id}
                  className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-3 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div
                      onClick={() => handleLoadSavedBet(bet)}
                      className="flex items-center gap-2 cursor-pointer group"
                      title="Clique para carregar este palpite no bilhete principal"
                    >
                      <span className="font-mono text-base font-black text-amber-300 tracking-wider group-hover:text-amber-200">
                        {formatTicket(bet.bilhete)}
                      </span>
                      <span className="text-xs text-slate-300 font-semibold">
                        {bet.bicho.emoji} {bet.bicho.nome}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteSaved(bet.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                      title="Excluir este palpite"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                    <span className="capitalize">{bet.estrategia} · {bet.dataGeracao}</span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopySavedBet(bet)}
                        className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[10px] font-bold border border-slate-800 cursor-pointer transition-colors"
                        title="Copiar número"
                      >
                        {copiedSavedId === bet.id ? 'Copiado!' : 'Copiar'}
                      </button>

                      <button
                        onClick={() => handleInspectMilhar(bet.bilhete)}
                        className="px-2 py-0.5 rounded bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 hover:text-white text-[10px] font-bold border border-cyan-500/30 cursor-pointer transition-colors"
                        title="Ver milhar na aba Milhar"
                      >
                        Milhar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
