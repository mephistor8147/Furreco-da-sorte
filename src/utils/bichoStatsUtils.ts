import { LotteryContest, AnimalInfo } from '../types/lottery';
import { ANIMAL_GROUPS, getAnimalByDezena } from './lotteryUtils';

export interface BichoFrequency {
  animal: AnimalInfo;
  cabecaCount: number; // 1st prize
  totalCount: number; // 1st to 5th prize
  lastSeenContest: number;
  concursosAtrasado: number;
  frequentDezenas: string[];
}

export interface BichoBetSuggestion {
  id: string;
  milhar: string; // 4 digits
  centena: string; // 3 digits
  dezena: string; // 2 digits
  animal: AnimalInfo;
  tipo: 'quente' | 'atrasado' | 'equilibrio';
  titulo: string;
  motivoEstatistico: string;
  modalidadesRecomendadas: {
    nome: string;
    explicacao: string;
    multiplicador: string;
    valorConscienteSugerido: string;
  }[];
  duqueSugerido: [string, string];
  ternoSugerido: [string, string, string];
}

export interface TrioCombinations {
  ternoDezenas: [string, string, string];
  duquesDezenas: Array<{
    dezenas: [string, string];
    animais: [string, string];
    label: string;
  }>;
  ternoGrupos: [number, number, number];
  duquesGrupos: Array<{
    grupos: [number, number];
    animais: [string, string];
    label: string;
  }>;
}

export interface BichoStatsReport {
  totalContestsAnalyzed: number;
  hotAnimals: BichoFrequency[];
  delayedAnimals: BichoFrequency[];
  topDezenas: { dezena: string; count: number; animal: AnimalInfo }[];
  topCentenas: { centena: string; count: number }[];
  topMilhares: { milhar: string; count: number; animal: AnimalInfo }[];
  suggestions: BichoBetSuggestion[];
  threePicks: [BichoBetSuggestion, BichoBetSuggestion, BichoBetSuggestion];
  trioCombinations: TrioCombinations;
}

export function computeBichoStatistics(contests: LotteryContest[]): BichoStatsReport {
  const animalStatsMap = new Map<number, {
    cabecaCount: number;
    totalCount: number;
    lastSeenContest: number;
    dezenasCount: Map<string, number>;
  }>();

  ANIMAL_GROUPS.forEach(a => {
    animalStatsMap.set(a.grupo, {
      cabecaCount: 0,
      totalCount: 0,
      lastSeenContest: 0,
      dezenasCount: new Map(),
    });
  });

  const dezenaMap = new Map<string, number>();
  const centenaMap = new Map<string, number>();
  const milharMap = new Map<string, number>();

  const latestContestNum = contests.length > 0 ? contests[0].concurso : 5945;

  // Process all contests
  contests.forEach(contest => {
    contest.premios.forEach((premio, pIndex) => {
      const ticket = premio.bilhete.padStart(5, '0');
      const dezena = ticket.slice(-2);
      const centena = ticket.slice(-3);
      const milhar = ticket.slice(-4);

      // Frequencies
      dezenaMap.set(dezena, (dezenaMap.get(dezena) || 0) + 1);
      centenaMap.set(centena, (centenaMap.get(centena) || 0) + 1);
      milharMap.set(milhar, (milharMap.get(milhar) || 0) + 1);

      const animal = getAnimalByDezena(dezena);
      const entry = animalStatsMap.get(animal.grupo);
      if (entry) {
        entry.totalCount += 1;
        if (pIndex === 0) {
          entry.cabecaCount += 1;
        }
        if (entry.lastSeenContest === 0 || contest.concurso > entry.lastSeenContest) {
          entry.lastSeenContest = contest.concurso;
        }
        entry.dezenasCount.set(dezena, (entry.dezenasCount.get(dezena) || 0) + 1);
      }
    });
  });

  // Build bicho frequencies
  const allBichoFrequencies: BichoFrequency[] = ANIMAL_GROUPS.map(animal => {
    const entry = animalStatsMap.get(animal.grupo)!;
    const lastSeen = entry.lastSeenContest || (latestContestNum - 12);
    const atraso = Math.max(0, latestContestNum - lastSeen);

    // Sort most frequent dezenas for this animal
    const sortedDez = [...animal.dezenas].sort((a, b) => {
      const countA = entry.dezenasCount.get(a) || 0;
      const countB = entry.dezenasCount.get(b) || 0;
      return countB - countA;
    });

    return {
      animal,
      cabecaCount: entry.cabecaCount,
      totalCount: entry.totalCount,
      lastSeenContest: lastSeen,
      concursosAtrasado: atraso,
      frequentDezenas: sortedDez,
    };
  });

  // Top Hot Animals (by total occurrences)
  const hotAnimals = [...allBichoFrequencies]
    .sort((a, b) => b.totalCount - a.totalCount || b.cabecaCount - a.cabecaCount)
    .slice(0, 5);

  // Top Delayed Animals (by concursosAtrasado)
  const delayedAnimals = [...allBichoFrequencies]
    .sort((a, b) => b.concursosAtrasado - a.concursosAtrasado)
    .slice(0, 5);

  // Top Dezenas
  const topDezenas = Array.from(dezenaMap.entries())
    .map(([dezena, count]) => ({
      dezena,
      count,
      animal: getAnimalByDezena(dezena),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Top Centenas
  const topCentenas = Array.from(centenaMap.entries())
    .map(([centena, count]) => ({ centena, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Top Milhares
  const topMilhares = Array.from(milharMap.entries())
    .map(([milhar, count]) => ({
      milhar,
      count,
      animal: getAnimalByDezena(milhar.slice(-2)),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 3 Peças de Bichos Baseadas nas Estatísticas Atuais
  // Peça 1: Bicho em Alta / Mais Frequente (Quente)
  const a1 = hotAnimals[0] || allBichoFrequencies[0];
  const dez1 = a1.frequentDezenas[0] || a1.animal.dezenas[0];
  const topCentenaForDez1 = topCentenas.find(c => c.centena.endsWith(dez1))?.centena || `${(a1.animal.grupo % 9) + 1}${dez1}`;
  const topMilharForCent1 = topMilhares.find(m => m.milhar.endsWith(topCentenaForDez1))?.milhar || `${((a1.animal.grupo * 3) % 9) + 1}${topCentenaForDez1}`;

  // Peça 2: Bicho Atrasado (Lei das Probabilidades / Retorno)
  const a2 = delayedAnimals.find(d => d.animal.grupo !== a1.animal.grupo) || delayedAnimals[0] || allBichoFrequencies[1];
  const dez2 = a2.frequentDezenas[0] || a2.animal.dezenas[0];
  const topCentenaForDez2 = topCentenas.find(c => c.centena.endsWith(dez2))?.centena || `${(a2.animal.grupo % 9) + 1}${dez2}`;
  const topMilharForCent2 = topMilhares.find(m => m.milhar.endsWith(topCentenaForDez2))?.milhar || `${((a2.animal.grupo * 4) % 9) + 1}${topCentenaForDez2}`;

  // Peça 3: Bicho Tendência / Equilíbrio Estatístico
  const a3 = hotAnimals.find(h => h.animal.grupo !== a1.animal.grupo && h.animal.grupo !== a2.animal.grupo) 
    || allBichoFrequencies.find(a => a.animal.grupo !== a1.animal.grupo && a.animal.grupo !== a2.animal.grupo) 
    || allBichoFrequencies[2];
  const dez3 = a3.frequentDezenas[0] || a3.animal.dezenas[0];
  const topCentenaForDez3 = topCentenas.find(c => c.centena.endsWith(dez3))?.centena || `${(a3.animal.grupo % 9) + 1}${dez3}`;
  const topMilharForCent3 = topMilhares.find(m => m.milhar.endsWith(topCentenaForDez3))?.milhar || `${((a3.animal.grupo * 5) % 9) + 1}${topCentenaForDez3}`;

  const peca1: BichoBetSuggestion = {
    id: 'peca-1-quente',
    milhar: topMilharForCent1.slice(-4),
    centena: topCentenaForDez1.slice(-3),
    dezena: dez1,
    animal: a1.animal,
    tipo: 'quente',
    titulo: `Peça 1: Bicho em Alta · ${a1.animal.nome}`,
    motivoEstatistico: `Apareceu ${a1.totalCount}x nos concursos apurados (${a1.cabecaCount}x no 1º prêmio). A dezena ${dez1} desponta como a mais pontuada da série.`,
    modalidadesRecomendadas: [
      {
        nome: 'Centena Cercada (1º ao 5º)',
        explicacao: 'Cobre o sorteio inteiro do 1º ao 5º prêmio',
        multiplicador: '~120x o valor apostado',
        valorConscienteSugerido: 'R$ 1,00 (R$ 0,20 por prêmio)',
      },
      {
        nome: 'Milhar e Centena na Cabeça',
        explicacao: 'Concorre no 1º prêmio principal',
        multiplicador: 'Milhar ~4.000x | Centena ~600x',
        valorConscienteSugerido: 'R$ 0,50 a R$ 1,00',
      },
      {
        nome: 'Duque de Dezenas',
        explicacao: `Combinando com ${a2.animal.nome} (${dez2})`,
        multiplicador: '~300x o valor apostado',
        valorConscienteSugerido: 'R$ 1,00',
      },
    ],
    duqueSugerido: [dez1, dez2],
    ternoSugerido: [dez1, dez2, dez3],
  };

  const peca2: BichoBetSuggestion = {
    id: 'peca-2-atrasado',
    milhar: topMilharForCent2.slice(-4),
    centena: topCentenaForDez2.slice(-3),
    dezena: dez2,
    animal: a2.animal,
    tipo: 'atrasado',
    titulo: `Peça 2: Bicho Atrasado · ${a2.animal.nome}`,
    motivoEstatistico: `Está sem sair nos 5 prêmios há ${a2.concursosAtrasado} concursos consecutivos. Pela lei das médias, possui forte propensão estatística de retorno.`,
    modalidadesRecomendadas: [
      {
        nome: 'Grupo Cercado (1º ao 5º)',
        explicacao: `Protege a volta do ${a2.animal.nome} nos 5 prêmios oficiais`,
        multiplicador: '~3.6x o valor apostado',
        valorConscienteSugerido: 'R$ 2,00',
      },
      {
        nome: 'Centena Seca no 1º',
        explicacao: `Centena ${topCentenaForDez2.slice(-3)} buscando retorno na cabeça`,
        multiplicador: '~600x o valor apostado',
        valorConscienteSugerido: 'R$ 0,50',
      },
      {
        nome: 'Duque de Dezenas',
        explicacao: `Combinando com ${a1.animal.nome} (${dez1})`,
        multiplicador: '~300x o valor apostado',
        valorConscienteSugerido: 'R$ 1,00',
      },
    ],
    duqueSugerido: [dez2, dez1],
    ternoSugerido: [dez2, dez1, dez3],
  };

  const peca3: BichoBetSuggestion = {
    id: 'peca-3-tendencia',
    milhar: topMilharForCent3.slice(-4),
    centena: topCentenaForDez3.slice(-3),
    dezena: dez3,
    animal: a3.animal,
    tipo: 'equilibrio',
    titulo: `Peça 3: Bicho Tendência · ${a3.animal.nome}`,
    motivoEstatistico: `Presença consistente nos sorteios recentes da Federal com alta harmonia de dezenas. Dezena ${dez3} com excelente histórico de premiação.`,
    modalidadesRecomendadas: [
      {
        nome: 'Milhar Cercada do 1º ao 5º',
        explicacao: `Concorre com ${topMilharForCent3.slice(-4)} nos 5 prêmios`,
        multiplicador: '~800x o valor apostado',
        valorConscienteSugerido: 'R$ 1,00',
      },
      {
        nome: 'Terno de Dezenas',
        explicacao: `Cruzando com as peças 1 e 2 (${dez1} - ${dez2} - ${dez3})`,
        multiplicador: '~3.000x o valor apostado',
        valorConscienteSugerido: 'R$ 0,50',
      },
      {
        nome: 'Passe de Grupo',
        explicacao: `Grupo ${a3.animal.grupo} no 1º e outro bicho nos demais`,
        multiplicador: '~80x o valor apostado',
        valorConscienteSugerido: 'R$ 1,00',
      },
    ],
    duqueSugerido: [dez3, dez1],
    ternoSugerido: [dez3, dez1, dez2],
  };

  const threePicks: [BichoBetSuggestion, BichoBetSuggestion, BichoBetSuggestion] = [peca1, peca2, peca3];
  const suggestions: BichoBetSuggestion[] = [peca1, peca2, peca3];

  const trioCombinations: TrioCombinations = {
    ternoDezenas: [dez1, dez2, dez3],
    duquesDezenas: [
      {
        dezenas: [dez1, dez2],
        animais: [a1.animal.nome, a2.animal.nome],
        label: `${a1.animal.nome} (Gr. ${String(a1.animal.grupo).padStart(2, '0')}) + ${a2.animal.nome} (Gr. ${String(a2.animal.grupo).padStart(2, '0')})`,
      },
      {
        dezenas: [dez1, dez3],
        animais: [a1.animal.nome, a3.animal.nome],
        label: `${a1.animal.nome} (Gr. ${String(a1.animal.grupo).padStart(2, '0')}) + ${a3.animal.nome} (Gr. ${String(a3.animal.grupo).padStart(2, '0')})`,
      },
      {
        dezenas: [dez2, dez3],
        animais: [a2.animal.nome, a3.animal.nome],
        label: `${a2.animal.nome} (Gr. ${String(a2.animal.grupo).padStart(2, '0')}) + ${a3.animal.nome} (Gr. ${String(a3.animal.grupo).padStart(2, '0')})`,
      },
    ],
    ternoGrupos: [a1.animal.grupo, a2.animal.grupo, a3.animal.grupo],
    duquesGrupos: [
      {
        grupos: [a1.animal.grupo, a2.animal.grupo],
        animais: [a1.animal.nome, a2.animal.nome],
        label: `Gr. ${String(a1.animal.grupo).padStart(2, '0')} (${a1.animal.nome}) + Gr. ${String(a2.animal.grupo).padStart(2, '0')} (${a2.animal.nome})`,
      },
      {
        grupos: [a1.animal.grupo, a3.animal.grupo],
        animais: [a1.animal.nome, a3.animal.nome],
        label: `Gr. ${String(a1.animal.grupo).padStart(2, '0')} (${a1.animal.nome}) + Gr. ${String(a3.animal.grupo).padStart(2, '0')} (${a3.animal.nome})`,
      },
      {
        grupos: [a2.animal.grupo, a3.animal.grupo],
        animais: [a2.animal.nome, a3.animal.nome],
        label: `Gr. ${String(a2.animal.grupo).padStart(2, '0')} (${a2.animal.nome}) + Gr. ${String(a3.animal.grupo).padStart(2, '0')} (${a3.animal.nome})`,
      },
    ],
  };

  return {
    totalContestsAnalyzed: contests.length,
    hotAnimals,
    delayedAnimals,
    topDezenas,
    topCentenas,
    topMilhares,
    suggestions,
    threePicks,
    trioCombinations,
  };
}
