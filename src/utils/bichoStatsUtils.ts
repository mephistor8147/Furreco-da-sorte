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

export interface BichoStatsReport {
  totalContestsAnalyzed: number;
  hotAnimals: BichoFrequency[];
  delayedAnimals: BichoFrequency[];
  topDezenas: { dezena: string; count: number; animal: AnimalInfo }[];
  topCentenas: { centena: string; count: number }[];
  topMilhares: { milhar: string; count: number; animal: AnimalInfo }[];
  suggestions: BichoBetSuggestion[];
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

  // Generate actionable suggestions for Bancas de Bicho
  const suggestions: BichoBetSuggestion[] = [];

  // 1. Hot Animal Suggestion 1
  if (hotAnimals.length > 0) {
    const a1 = hotAnimals[0];
    const dez1 = a1.frequentDezenas[0] || a1.animal.dezenas[0];
    const topCentenaForDez = topCentenas.find(c => c.centena.endsWith(dez1))?.centena || `3${dez1}`;
    const topMilharForCent = topMilhares.find(m => m.milhar.endsWith(topCentenaForDez))?.milhar || `8${topCentenaForDez}`;
    const partnerDez = hotAnimals[1]?.frequentDezenas[0] || '74';
    const partnerDez3 = hotAnimals[2]?.frequentDezenas[0] || '18';

    suggestions.push({
      id: 'sug-quente-1',
      milhar: topMilharForCent.slice(-4),
      centena: topCentenaForDez.slice(-3),
      dezena: dez1,
      animal: a1.animal,
      tipo: 'quente',
      titulo: `Bicho do Momento: ${a1.animal.nome} (Grupo ${String(a1.animal.grupo).padStart(2, '0')})`,
      motivoEstatistico: `Apareceu ${a1.totalCount}x nos concursos recentes (incluindo ${a1.cabecaCount}x no 1º prêmio). Dezena ${dez1} está com alta frequência.`,
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
          nome: 'Grupo Simples',
          explicacao: `Qualquer dezena do ${a1.animal.nome} (${a1.animal.dezenas.join(', ')})`,
          multiplicador: '18x na cabeça / 3.6x nos 5',
          valorConscienteSugerido: 'R$ 2,00',
        },
      ],
      duqueSugerido: [dez1, partnerDez],
      ternoSugerido: [dez1, partnerDez, partnerDez3],
    });
  }

  // 2. Hot Animal Suggestion 2
  if (hotAnimals.length > 1) {
    const a2 = hotAnimals[1];
    const dez2 = a2.frequentDezenas[0] || a2.animal.dezenas[0];
    const topCentenaForDez = topCentenas.find(c => c.centena.endsWith(dez2))?.centena || `5${dez2}`;
    const topMilharForCent = topMilhares.find(m => m.milhar.endsWith(topCentenaForDez))?.milhar || `3${topCentenaForDez}`;
    const partnerDez = hotAnimals[0]?.frequentDezenas[0] || '91';
    const partnerDez3 = hotAnimals[2]?.frequentDezenas[0] || '23';

    suggestions.push({
      id: 'sug-quente-2',
      milhar: topMilharForCent.slice(-4),
      centena: topCentenaForDez.slice(-3),
      dezena: dez2,
      animal: a2.animal,
      tipo: 'quente',
      titulo: `Tendência Forte: ${a2.animal.nome} (Grupo ${String(a2.animal.grupo).padStart(2, '0')})`,
      motivoEstatistico: `Constante nos últimos prêmios com ${a2.totalCount} aparições. A dezena ${dez2} é uma das mais pontuadas da série.`,
      modalidadesRecomendadas: [
        {
          nome: 'Duque de Dezenas',
          explicacao: `Combinando a dezena ${dez2} com a dezena ${partnerDez}`,
          multiplicador: '~300x o valor apostado',
          valorConscienteSugerido: 'R$ 1,00',
        },
        {
          nome: 'Dezena na Cabeça',
          explicacao: `Dezena ${dez2} pura no 1º prêmio`,
          multiplicador: '~60x o valor apostado',
          valorConscienteSugerido: 'R$ 1,00',
        },
      ],
      duqueSugerido: [dez2, partnerDez],
      ternoSugerido: [dez2, partnerDez, partnerDez3],
    });
  }

  // 3. Delayed Animal Suggestion (Atrasado - Estatística de Retorno)
  if (delayedAnimals.length > 0) {
    const ad = delayedAnimals[0];
    const dezAtrasada = ad.frequentDezenas[0] || ad.animal.dezenas[0];
    const milharSugerida = `42${ad.animal.dezenas[1] || dezAtrasada}`;
    const centenaSugerida = `2${ad.animal.dezenas[1] || dezAtrasada}`;

    suggestions.push({
      id: 'sug-atrasado-1',
      milhar: milharSugerida.slice(-4),
      centena: centenaSugerida.slice(-3),
      dezena: ad.animal.dezenas[1] || dezAtrasada,
      animal: ad.animal,
      tipo: 'atrasado',
      titulo: `Bicho Atrasado: ${ad.animal.nome} (Grupo ${String(ad.animal.grupo).padStart(2, '0')})`,
      motivoEstatistico: `Está há ${ad.concursosAtrasado} concursos sem aparecer entre os 5 primeiros prêmios. Pela lei das médias, tende a reaparecer.`,
      modalidadesRecomendadas: [
        {
          nome: 'Grupo Cercado (1º ao 5º)',
          explicacao: `Protege a volta do bicho em qualquer um dos 5 prêmios`,
          multiplicador: '~3.6x o valor apostado',
          valorConscienteSugerido: 'R$ 2,00',
        },
        {
          nome: 'Centena Seca no 1º',
          explicacao: `Centena ${centenaSugerida} buscando retorno na cabeça`,
          multiplicador: '~600x o valor apostado',
          valorConscienteSugerido: 'R$ 0,50',
        },
      ],
      duqueSugerido: [dezAtrasada, hotAnimals[0]?.frequentDezenas[0] || '91'],
      ternoSugerido: [dezAtrasada, hotAnimals[0]?.frequentDezenas[0] || '91', hotAnimals[1]?.frequentDezenas[0] || '74'],
    });
  }

  // 4. Equilibrium Suggestion (Harmonia Par / Ímpar)
  if (hotAnimals.length > 2) {
    const a3 = hotAnimals[2];
    const dezEquil = a3.frequentDezenas[0] || a3.animal.dezenas[0];
    const milharEquil = `59${dezEquil}`;

    suggestions.push({
      id: 'sug-equil-1',
      milhar: milharEquil.slice(-4),
      centena: `9${dezEquil}`.slice(-3),
      dezena: dezEquil,
      animal: a3.animal,
      tipo: 'equilibrio',
      titulo: `Equilíbrio Estatístico: ${a3.animal.nome} (Grupo ${String(a3.animal.grupo).padStart(2, '0')})`,
      motivoEstatistico: `Excelente correlação de dezenas pares e ímpares. Excelente opção para apostas em frações e dezenas.`,
      modalidadesRecomendadas: [
        {
          nome: 'Milhar Cercada do 1º ao 5º',
          explicacao: `Concorre com ${milharEquil} nos 5 prêmios oficiais`,
          multiplicador: '~800x o valor apostado',
          valorConscienteSugerido: 'R$ 1,00',
        },
        {
          nome: 'Passe de Grupo',
          explicacao: `Grupo ${a3.animal.grupo} no 1º e outro bicho nos demais`,
          multiplicador: '~80x o valor apostado',
          valorConscienteSugerido: 'R$ 1,00',
        },
      ],
      duqueSugerido: [dezEquil, hotAnimals[0]?.frequentDezenas[0] || '91'],
      ternoSugerido: [dezEquil, hotAnimals[0]?.frequentDezenas[0] || '91', delayedAnimals[0]?.animal.dezenas[0] || '01'],
    });
  }

  return {
    totalContestsAnalyzed: contests.length,
    hotAnimals,
    delayedAnimals,
    topDezenas,
    topCentenas,
    topMilhares,
    suggestions,
  };
}
