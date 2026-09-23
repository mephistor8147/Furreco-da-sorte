import { LotteryContest, DigitStat, DezenaStat, WeeklyReport } from '../types/lottery';
import { getAnimalByDezena, ANIMAL_GROUPS } from '../utils/lotteryUtils';

// Concursos recentes da Loteria Federal
export const LOTTERY_CONTESTS: LotteryContest[] = [
  {
    concurso: 5945,
    data: '19/09/2026',
    diaSemana: 'Sábado',
    local: 'Espaço da Sorte, São Paulo, SP',
    acumulou: false,
    arrecadacaoTotal: 4280900,
    premios: [
      { ordem: 1, bilhete: '48291', valorPremio: 500000 },
      { ordem: 2, bilhete: '73104', valorPremio: 27000 },
      { ordem: 3, bilhete: '19852', valorPremio: 24000 },
      { ordem: 4, bilhete: '65430', valorPremio: 19000 },
      { ordem: 5, bilhete: '02816', valorPremio: 18329 },
    ],
    bichoPrincipal: getAnimalByDezena('91'), // Urso (89-92)
    todosBichos: [
      getAnimalByDezena('91'),
      getAnimalByDezena('04'),
      getAnimalByDezena('52'),
      getAnimalByDezena('30'),
      getAnimalByDezena('16'),
    ],
  },
  {
    concurso: 5944,
    data: '16/09/2026',
    diaSemana: 'Quarta-feira',
    local: 'Espaço da Sorte, São Paulo, SP',
    acumulou: false,
    arrecadacaoTotal: 3950200,
    premios: [
      { ordem: 1, bilhete: '83574', valorPremio: 500000 },
      { ordem: 2, bilhete: '24918', valorPremio: 27000 },
      { ordem: 3, bilhete: '51063', valorPremio: 24000 },
      { ordem: 4, bilhete: '90427', valorPremio: 19000 },
      { ordem: 5, bilhete: '37185', valorPremio: 18329 },
    ],
    bichoPrincipal: getAnimalByDezena('74'), // Pavão (73-76)
    todosBichos: [
      getAnimalByDezena('74'),
      getAnimalByDezena('18'),
      getAnimalByDezena('63'),
      getAnimalByDezena('27'),
      getAnimalByDezena('85'),
    ],
  },
  {
    concurso: 5943,
    data: '12/09/2026',
    diaSemana: 'Sábado',
    local: 'Espaço da Sorte, São Paulo, SP',
    acumulou: false,
    arrecadacaoTotal: 4120000,
    premios: [
      { ordem: 1, bilhete: '15923', valorPremio: 500000 },
      { ordem: 2, bilhete: '88410', valorPremio: 27000 },
      { ordem: 3, bilhete: '42709', valorPremio: 24000 },
      { ordem: 4, bilhete: '63184', valorPremio: 19000 },
      { ordem: 5, bilhete: '97051', valorPremio: 18329 },
    ],
    bichoPrincipal: getAnimalByDezena('23'), // Cabra (21-24)
    todosBichos: [
      getAnimalByDezena('23'),
      getAnimalByDezena('10'),
      getAnimalByDezena('09'),
      getAnimalByDezena('84'),
      getAnimalByDezena('51'),
    ],
  },
  {
    concurso: 5942,
    data: '09/09/2026',
    diaSemana: 'Quarta-feira',
    local: 'Espaço da Sorte, São Paulo, SP',
    acumulou: false,
    arrecadacaoTotal: 3880400,
    premios: [
      { ordem: 1, bilhete: '62447', valorPremio: 500000 },
      { ordem: 2, bilhete: '39105', valorPremio: 27000 },
      { ordem: 3, bilhete: '84729', valorPremio: 24000 },
      { ordem: 4, bilhete: '10682', valorPremio: 19000 },
      { ordem: 5, bilhete: '55393', valorPremio: 18329 },
    ],
    bichoPrincipal: getAnimalByDezena('47'), // Elefante (45-48)
    todosBichos: [
      getAnimalByDezena('47'),
      getAnimalByDezena('05'),
      getAnimalByDezena('29'),
      getAnimalByDezena('82'),
      getAnimalByDezena('93'),
    ],
  },
  {
    concurso: 5941,
    data: '05/09/2026',
    diaSemana: 'Sábado',
    local: 'Espaço da Sorte, São Paulo, SP',
    acumulou: false,
    arrecadacaoTotal: 4310500,
    premios: [
      { ordem: 1, bilhete: '29836', valorPremio: 500000 },
      { ordem: 2, bilhete: '71542', valorPremio: 27000 },
      { ordem: 3, bilhete: '04918', valorPremio: 24000 },
      { ordem: 4, bilhete: '83670', valorPremio: 19000 },
      { ordem: 5, bilhete: '46205', valorPremio: 18329 },
    ],
    bichoPrincipal: getAnimalByDezena('36'), // Cobra (33-36)
    todosBichos: [
      getAnimalByDezena('36'),
      getAnimalByDezena('42'),
      getAnimalByDezena('18'),
      getAnimalByDezena('70'),
      getAnimalByDezena('05'),
    ],
  },
  {
    concurso: 5940,
    data: '02/09/2026',
    diaSemana: 'Quarta-feira',
    local: 'Espaço da Sorte, São Paulo, SP',
    acumulou: false,
    arrecadacaoTotal: 3900000,
    premios: [
      { ordem: 1, bilhete: '94128', valorPremio: 500000 },
      { ordem: 2, bilhete: '50371', valorPremio: 27000 },
      { ordem: 3, bilhete: '18249', valorPremio: 24000 },
      { ordem: 4, bilhete: '72604', valorPremio: 19000 },
      { ordem: 5, bilhete: '35890', valorPremio: 18329 },
    ],
    bichoPrincipal: getAnimalByDezena('28'), // Carneiro (25-28)
    todosBichos: [
      getAnimalByDezena('28'),
      getAnimalByDezena('71'),
      getAnimalByDezena('49'),
      getAnimalByDezena('04'),
      getAnimalByDezena('90'),
    ],
  },
  {
    concurso: 5939,
    data: '29/08/2026',
    diaSemana: 'Sábado',
    local: 'Espaço da Sorte, São Paulo, SP',
    acumulou: false,
    arrecadacaoTotal: 4400200,
    premios: [
      { ordem: 1, bilhete: '37561', valorPremio: 500000 },
      { ordem: 2, bilhete: '89104', valorPremio: 27000 },
      { ordem: 3, bilhete: '62483', valorPremio: 24000 },
      { ordem: 4, bilhete: '04392', valorPremio: 19000 },
      { ordem: 5, bilhete: '15877', valorPremio: 18329 },
    ],
    bichoPrincipal: getAnimalByDezena('61'), // Leão (61-64)
    todosBichos: [
      getAnimalByDezena('61'),
      getAnimalByDezena('04'),
      getAnimalByDezena('83'),
      getAnimalByDezena('92'),
      getAnimalByDezena('77'),
    ],
  },
  {
    concurso: 5938,
    data: '26/08/2026',
    diaSemana: 'Quarta-feira',
    local: 'Espaço da Sorte, São Paulo, SP',
    acumulou: false,
    arrecadacaoTotal: 3820100,
    premios: [
      { ordem: 1, bilhete: '51804', valorPremio: 500000 },
      { ordem: 2, bilhete: '26739', valorPremio: 27000 },
      { ordem: 3, bilhete: '90412', valorPremio: 24000 },
      { ordem: 4, bilhete: '73958', valorPremio: 19000 },
      { ordem: 5, bilhete: '48265', valorPremio: 18329 },
    ],
    bichoPrincipal: getAnimalByDezena('04'), // Avestruz (01-04)
    todosBichos: [
      getAnimalByDezena('04'),
      getAnimalByDezena('39'),
      getAnimalByDezena('12'),
      getAnimalByDezena('58'),
      getAnimalByDezena('65'),
    ],
  },
  {
    concurso: 5937,
    data: '22/08/2026',
    diaSemana: 'Sábado',
    local: 'Espaço da Sorte, São Paulo, SP',
    acumulou: false,
    arrecadacaoTotal: 4190500,
    premios: [
      { ordem: 1, bilhete: '70295', valorPremio: 500000 },
      { ordem: 2, bilhete: '14820', valorPremio: 27000 },
      { ordem: 3, bilhete: '39516', valorPremio: 24000 },
      { ordem: 4, bilhete: '85641', valorPremio: 19000 },
      { ordem: 5, bilhete: '62137', valorPremio: 18329 },
    ],
    bichoPrincipal: getAnimalByDezena('95'), // Veado (93-96)
    todosBichos: [
      getAnimalByDezena('95'),
      getAnimalByDezena('20'),
      getAnimalByDezena('16'),
      getAnimalByDezena('41'),
      getAnimalByDezena('37'),
    ],
  },
  {
    concurso: 5936,
    data: '19/08/2026',
    diaSemana: 'Quarta-feira',
    local: 'Espaço da Sorte, São Paulo, SP',
    acumulou: false,
    arrecadacaoTotal: 3790000,
    premios: [
      { ordem: 1, bilhete: '08432', valorPremio: 500000 },
      { ordem: 2, bilhete: '93715', valorPremio: 27000 },
      { ordem: 3, bilhete: '57190', valorPremio: 24000 },
      { ordem: 4, bilhete: '24683', valorPremio: 19000 },
      { ordem: 5, bilhete: '41906', valorPremio: 18329 },
    ],
    bichoPrincipal: getAnimalByDezena('32'), // Camelo (29-32)
    todosBichos: [
      getAnimalByDezena('32'),
      getAnimalByDezena('15'),
      getAnimalByDezena('90'),
      getAnimalByDezena('83'),
      getAnimalByDezena('06'),
    ],
  },
  {
    concurso: 5935,
    data: '15/08/2026',
    diaSemana: 'Sábado',
    local: 'Espaço da Sorte, São Paulo, SP',
    acumulou: false,
    arrecadacaoTotal: 4250000,
    premios: [
      { ordem: 1, bilhete: '86159', valorPremio: 500000 },
      { ordem: 2, bilhete: '40928', valorPremio: 27000 },
      { ordem: 3, bilhete: '15374', valorPremio: 24000 },
      { ordem: 4, bilhete: '79201', valorPremio: 19000 },
      { ordem: 5, bilhete: '32846', valorPremio: 18329 },
    ],
    bichoPrincipal: getAnimalByDezena('59'), // Jacaré (57-60)
    todosBichos: [
      getAnimalByDezena('59'),
      getAnimalByDezena('28'),
      getAnimalByDezena('74'),
      getAnimalByDezena('01'),
      getAnimalByDezena('46'),
    ],
  },
  {
    concurso: 5934,
    data: '12/08/2026',
    diaSemana: 'Quarta-feira',
    local: 'Espaço da Sorte, São Paulo, SP',
    acumulou: false,
    arrecadacaoTotal: 3870000,
    premios: [
      { ordem: 1, bilhete: '43781', valorPremio: 500000 },
      { ordem: 2, bilhete: '69052', valorPremio: 27000 },
      { ordem: 3, bilhete: '21439', valorPremio: 24000 },
      { ordem: 4, bilhete: '87514', valorPremio: 19000 },
      { ordem: 5, bilhete: '58260', valorPremio: 18329 },
    ],
    bichoPrincipal: getAnimalByDezena('81'), // Touro (81-84)
    todosBichos: [
      getAnimalByDezena('81'),
      getAnimalByDezena('52'),
      getAnimalByDezena('39'),
      getAnimalByDezena('14'),
      getAnimalByDezena('60'),
    ],
  },
  {
    concurso: 5933,
    data: '08/08/2026',
    diaSemana: 'Sábado',
    local: 'Espaço da Sorte, São Paulo, SP',
    acumulou: false,
    arrecadacaoTotal: 4330000,
    premios: [
      { ordem: 1, bilhete: '19047', valorPremio: 500000 },
      { ordem: 2, bilhete: '85263', valorPremio: 27000 },
      { ordem: 3, bilhete: '37910', valorPremio: 24000 },
      { ordem: 4, bilhete: '64825', valorPremio: 19000 },
      { ordem: 5, bilhete: '02178', valorPremio: 18329 },
    ],
    bichoPrincipal: getAnimalByDezena('47'), // Elefante
    todosBichos: [
      getAnimalByDezena('47'),
      getAnimalByDezena('63'),
      getAnimalByDezena('10'),
      getAnimalByDezena('25'),
      getAnimalByDezena('78'),
    ],
  },
  {
    concurso: 5932,
    data: '05/08/2026',
    diaSemana: 'Quarta-feira',
    local: 'Espaço da Sorte, São Paulo, SP',
    acumulou: false,
    arrecadacaoTotal: 3840000,
    premios: [
      { ordem: 1, bilhete: '65824', valorPremio: 500000 },
      { ordem: 2, bilhete: '12907', valorPremio: 27000 },
      { ordem: 3, bilhete: '94351', valorPremio: 24000 },
      { ordem: 4, bilhete: '47086', valorPremio: 19000 },
      { ordem: 5, bilhete: '78139', valorPremio: 18329 },
    ],
    bichoPrincipal: getAnimalByDezena('24'), // Cabra
    todosBichos: [
      getAnimalByDezena('24'),
      getAnimalByDezena('07'),
      getAnimalByDezena('51'),
      getAnimalByDezena('86'),
      getAnimalByDezena('39'),
    ],
  },
  {
    concurso: 5931,
    data: '01/08/2026',
    diaSemana: 'Sábado',
    local: 'Espaço da Sorte, São Paulo, SP',
    acumulou: false,
    arrecadacaoTotal: 4410000,
    premios: [
      { ordem: 1, bilhete: '92318', valorPremio: 500000 },
      { ordem: 2, bilhete: '58470', valorPremio: 27000 },
      { ordem: 3, bilhete: '03192', valorPremio: 24000 },
      { ordem: 4, bilhete: '76805', valorPremio: 19000 },
      { ordem: 5, bilhete: '31564', valorPremio: 18329 },
    ],
    bichoPrincipal: getAnimalByDezena('18'), // Cachorro
    todosBichos: [
      getAnimalByDezena('18'),
      getAnimalByDezena('70'),
      getAnimalByDezena('92'),
      getAnimalByDezena('05'),
      getAnimalByDezena('64'),
    ],
  },
];

// Cálculo de frequências de dígitos finais (0 a 9)
export function calculateFinalDigitStats(contests: LotteryContest[]): DigitStat[] {
  const counts: { [digit: number]: { count: number; lastSeen: number } } = {};
  for (let i = 0; i <= 9; i++) {
    counts[i] = { count: 0, lastSeen: -1 };
  }

  // Analisa todos os 5 prêmios
  let totalDraws = 0;
  contests.forEach((contest, index) => {
    contest.premios.forEach(premio => {
      totalDraws++;
      const finalDigit = parseInt(premio.bilhete.slice(-1), 10);
      counts[finalDigit].count++;
      if (counts[finalDigit].lastSeen === -1) {
        counts[finalDigit].lastSeen = index; // contests ago
      }
    });
  });

  return Object.keys(counts).map(digitStr => {
    const d = parseInt(digitStr, 10);
    const count = counts[d].count;
    return {
      digit: d,
      count,
      percentage: totalDraws > 0 ? (count / totalDraws) * 100 : 0,
      lastSeenContestsAgo: counts[d].lastSeen >= 0 ? counts[d].lastSeen : 99,
    };
  }).sort((a, b) => b.count - a.count);
}

// Cálculo das dezenas mais sorteadas e mais atrasadas
export function calculateDezenaStats(contests: LotteryContest[]): {
  maisFrequentes: DezenaStat[];
  maisAtrasadas: DezenaStat[];
  todas: DezenaStat[];
} {
  const counts: { [key: string]: { count: number; lastContest: number; delay: number } } = {};

  // Inicializa 00 a 99
  for (let i = 0; i <= 99; i++) {
    const key = i.toString().padStart(2, '0');
    counts[key] = { count: 0, lastContest: 0, delay: 999 };
  }

  // Preenche com dados
  contests.forEach((c, cIndex) => {
    c.premios.forEach(p => {
      const dezena = p.bilhete.slice(-2);
      counts[dezena].count++;
      if (counts[dezena].lastContest === 0) {
        counts[dezena].lastContest = c.concurso;
        counts[dezena].delay = cIndex;
      }
    });
  });

  const allStats: DezenaStat[] = Object.keys(counts).map(dezena => {
    const animal = getAnimalByDezena(dezena);
    return {
      dezena,
      count: counts[dezena].count,
      lastSeenContest: counts[dezena].lastContest,
      concursosAtrasada: counts[dezena].delay,
      grupo: animal.grupo,
      nomeBicho: animal.nome,
    };
  });

  const maisFrequentes = [...allStats].sort((a, b) => b.count - a.count).slice(0, 10);
  const maisAtrasadas = [...allStats].sort((a, b) => b.concursosAtrasada - a.concursosAtrasada).slice(0, 10);

  return {
    maisFrequentes,
    maisAtrasadas,
    todas: allStats,
  };
}

// Paridade geral
export function calculateParityStats(contests: LotteryContest[]): {
  pares: number;
  impares: number;
  percentPares: number;
  percentImpares: number;
} {
  let pares = 0;
  let impares = 0;

  contests.forEach(c => {
    c.premios.forEach(p => {
      const num = parseInt(p.bilhete.slice(-1), 10);
      if (num % 2 === 0) {
        pares++;
      } else {
        impares++;
      }
    });
  });

  const total = pares + impares;
  return {
    pares,
    impares,
    percentPares: total > 0 ? (pares / total) * 100 : 50,
    percentImpares: total > 0 ? (impares / total) * 100 : 50,
  };
}

// Frequência de Bichos no 1º Prêmio
export function calculateAnimalStats(contests: LotteryContest[]): {
  grupo: number;
  nome: string;
  emoji: string;
  count: number;
  percent: number;
}[] {
  const counts: { [grupo: number]: number } = {};
  ANIMAL_GROUPS.forEach(g => {
    counts[g.grupo] = 0;
  });

  contests.forEach(c => {
    counts[c.bichoPrincipal.grupo]++;
  });

  return ANIMAL_GROUPS.map(g => ({
    grupo: g.grupo,
    nome: g.nome,
    emoji: g.emoji,
    count: counts[g.grupo] || 0,
    percent: contests.length > 0 ? ((counts[g.grupo] || 0) / contests.length) * 100 : 0,
  })).sort((a, b) => b.count - a.count);
}

// Relatório semanal gerado a partir de pares de concursos de cada semana
export function generateWeeklyReports(contests: LotteryContest[]): WeeklyReport[] {
  const weeks: { [key: string]: LotteryContest[] } = {};

  contests.forEach(c => {
    // Parse DD/MM/YYYY
    const [day, month, year] = c.data.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    // Identificador de semana (aproximado por mês e semana)
    const weekNum = Math.ceil(day / 7);
    const weekKey = `Semana ${weekNum} de ${date.toLocaleString('pt-BR', { month: 'long' })} / ${year}`;
    if (!weeks[weekKey]) {
      weeks[weekKey] = [];
    }
    weeks[weekKey].push(c);
  });

  return Object.keys(weeks).map(semana => {
    const list = weeks[semana];
    let totalDistribuido = 0;
    const dezenasSeen = new Map<string, number>();
    const finaisCount: { [k: number]: number } = {};
    let pares = 0;
    let impares = 0;

    list.forEach(c => {
      c.premios.forEach(p => {
        totalDistribuido += p.valorPremio;
        const dezena = p.bilhete.slice(-2);
        dezenasSeen.set(dezena, (dezenasSeen.get(dezena) || 0) + 1);

        const fin = parseInt(p.bilhete.slice(-1), 10);
        finaisCount[fin] = (finaisCount[fin] || 0) + 1;

        if (fin % 2 === 0) pares++;
        else impares++;
      });
    });

    const dezenasRepetidas = Array.from(dezenasSeen.entries())
      .filter(([_, count]) => count > 1)
      .map(([dez]) => dez);

    const finaisMaisFrequentes = Object.entries(finaisCount)
      .sort((a, b) => b[1] - a[1])
      .map(([d]) => parseInt(d, 10))
      .slice(0, 3);

    const bichoDestaque = list[0]?.bichoPrincipal || ANIMAL_GROUPS[0];

    const destaqueTexto = dezenasRepetidas.length > 0
      ? `Na ${semana}, observou-se repetição das dezenas ${dezenasRepetidas.join(', ')}. O bicho destaque do 1º prêmio foi ${bichoDestaque.nome} (${bichoDestaque.emoji}).`
      : `Na ${semana}, distribuição equilibrada sem repetições diretas de dezenas. Finais mais fortes foram ${finaisMaisFrequentes.join(', ')}.`;

    return {
      semana,
      concursos: list,
      totalDistribuido,
      dezenasRepetidas,
      finaisMaisFrequentes,
      bichoDestaque,
      balancoParidade: { pares, impares },
      destaqueTexto,
    };
  });
}
