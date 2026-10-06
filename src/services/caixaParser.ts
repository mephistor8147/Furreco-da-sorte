// furreco da sorte
import { LotteryContest, AnimalInfo } from '../types/lottery';

export const ANIMAL_NAMES = [
  'Avestruz', 'Águia', 'Burro', 'Borboleta', 'Cachorro',
  'Cabra', 'Carneiro', 'Camelo', 'Cobra', 'Coelho',
  'Cavalo', 'Elefante', 'Galo', 'Gato', 'Jacaré',
  'Leão', 'Macaco', 'Porco', 'Pavão', 'Peru',
  'Touro', 'Tigre', 'Urso', 'Veado', 'Vaca',
];

export const ANIMAL_EMOJIS = [
  '🦤', '🦅', '🫏', '🦋', '🐕',
  '🐐', '🐏', '🐪', '🐍', '🐇',
  '🐎', '🐘', '🐓', '🐈', '🐊',
  '🦁', '🐒', '🐖', '🦚', '🦃',
  '🐂', '🐅', '🐻', '🦌', '🐄',
];

export function getAnimalByDezena(dezenaStr: string): AnimalInfo {
  let d = parseInt(dezenaStr.slice(-2), 10);
  if (isNaN(d)) d = 0;
  let groupIndex = 24; // Vaca (00)
  if (d > 0) {
    groupIndex = Math.min(Math.max(Math.ceil(d / 4) - 1, 0), 24);
  }
  const grupo = groupIndex + 1;
  const start = grupo === 25 ? 97 : (grupo - 1) * 4 + 1;
  const dezenas = grupo === 25
    ? ['97', '98', '99', '00']
    : [
        start.toString().padStart(2, '0'),
        (start + 1).toString().padStart(2, '0'),
        (start + 2).toString().padStart(2, '0'),
        (start + 3).toString().padStart(2, '0'),
      ];

  return {
    grupo,
    nome: ANIMAL_NAMES[groupIndex],
    emoji: ANIMAL_EMOJIS[groupIndex],
    dezenas,
  };
}

export function parseCaixaContest(data: any): LotteryContest | null {
  if (!data || !data.numero) return null;

  const [day, month, year] = (data.dataApuracao || '').split('/').map(Number);
  const dateObj = new Date(year, (month || 1) - 1, day || 1);
  const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const diaSemana = (daysOfWeek[dateObj.getDay()] || 'Sábado') as 'Quarta-feira' | 'Sábado';

  const rawDezenas = data.listaDezenas || data.dezenasSorteadasOrdemSorteio || [];
  const rateio = data.listaRateioPremio || [];
  const defaultPrizes = [500000, 35000, 30000, 25000, 20503];

  const premios = rawDezenas.slice(0, 5).map((d: string, index: number) => {
    const bilhete = (d || '').toString().slice(-5).padStart(5, '0');
    const rateioItem = rateio.find((r: any) => r.faixa === index + 1);
    const valorPremio = rateioItem?.valorPremio ? Number(rateioItem.valorPremio) : defaultPrizes[index];
    return {
      ordem: index + 1,
      bilhete,
      valorPremio,
    };
  });

  const p1Ticket = premios[0]?.bilhete || '00000';
  const bichoPrincipal = getAnimalByDezena(p1Ticket.slice(-2));
  const todosBichos = premios.map((p: any) => getAnimalByDezena(p.bilhete.slice(-2)));

  return {
    concurso: Number(data.numero),
    data: data.dataApuracao || '',
    diaSemana,
    premios,
    local: `${data.localSorteio || 'Espaço da Sorte'}, ${data.nomeMunicipioUFSorteio || 'São Paulo, SP'}`.trim(),
    acumulou: Boolean(data.acumulado),
    bichoPrincipal,
    todosBichos,
    arrecadacaoTotal: Number(data.valorArrecadado) || 4200000,
  };
}

export function parseMirrorContest(data: any): LotteryContest | null {
  if (!data || !data.concurso) return null;

  const [day, month, year] = (data.data || '').split('/').map(Number);
  const dateObj = new Date(year, (month || 1) - 1, day || 1);
  const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const diaSemana = (daysOfWeek[dateObj.getDay()] || 'Sábado') as 'Quarta-feira' | 'Sábado';

  const rawDezenas = data.dezenas || data.dezenasOrdemSorteio || [];
  const premiacoes = data.premiacoes || [];
  const defaultPrizes = [500000, 35000, 30000, 25000, 20503];

  const premios = rawDezenas.slice(0, 5).map((d: string, index: number) => {
    const bilhete = (d || '').toString().slice(-5).padStart(5, '0');
    const premioItem = premiacoes.find((p: any) => p.faixa === index + 1);
    const valorPremio = premioItem?.valorPremio ? Number(premioItem.valorPremio) : defaultPrizes[index];
    return {
      ordem: index + 1,
      bilhete,
      valorPremio,
    };
  });

  const p1Ticket = premios[0]?.bilhete || '00000';
  const bichoPrincipal = getAnimalByDezena(p1Ticket.slice(-2));
  const todosBichos = premios.map((p: any) => getAnimalByDezena(p.bilhete.slice(-2)));

  return {
    concurso: Number(data.concurso),
    data: data.data || '',
    diaSemana,
    premios,
    local: data.local || 'Espaço da Sorte, São Paulo, SP',
    acumulou: Boolean(data.acumulou),
    bichoPrincipal,
    todosBichos,
    arrecadacaoTotal: Number(data.valorArrecadado) || 4200000,
  };
}

export const SEED_CONTESTS_DATA: {
  concurso: number;
  data: string;
  diaSemana: 'Quarta-feira' | 'Sábado';
  bilhetes: [string, string, string, string, string];
  acumulou?: boolean;
}[] = [
  { concurso: 6106, data: '03/10/2026', diaSemana: 'Sábado', bilhetes: ['17469', '81210', '07767', '41317', '79412'] },
  { concurso: 6105, data: '30/09/2026', diaSemana: 'Quarta-feira', bilhetes: ['41092', '23453', '03271', '18708', '66303'] },
  { concurso: 6104, data: '27/09/2026', diaSemana: 'Sábado', bilhetes: ['59074', '03557', '20563', '40449', '07802'] },
  { concurso: 5945, data: '19/09/2026', diaSemana: 'Sábado', bilhetes: ['48291', '73104', '19852', '65430', '02816'] },
  { concurso: 5944, data: '16/09/2026', diaSemana: 'Quarta-feira', bilhetes: ['83574', '24918', '51063', '90427', '37185'] },
  { concurso: 5943, data: '12/09/2026', diaSemana: 'Sábado', bilhetes: ['15923', '88410', '42709', '63184', '97051'] },
  { concurso: 5942, data: '09/09/2026', diaSemana: 'Quarta-feira', bilhetes: ['62447', '39105', '84729', '10682', '55393'] },
  { concurso: 5941, data: '05/09/2026', diaSemana: 'Sábado', bilhetes: ['29836', '71542', '04918', '83670', '46205'] },
  { concurso: 5940, data: '02/09/2026', diaSemana: 'Quarta-feira', bilhetes: ['91358', '47209', '63821', '15470', '82944'] },
  { concurso: 5939, data: '29/08/2026', diaSemana: 'Sábado', bilhetes: ['38104', '59267', '14083', '72651', '90318'] },
  { concurso: 5938, data: '26/08/2026', diaSemana: 'Quarta-feira', bilhetes: ['74982', '10356', '85219', '36740', '49125'] },
  { concurso: 5937, data: '22/08/2026', diaSemana: 'Sábado', bilhetes: ['51639', '82904', '37418', '90562', '24871'] },
  { concurso: 5936, data: '19/08/2026', diaSemana: 'Quarta-feira', bilhetes: ['20475', '63891', '49120', '87534', '15208'] },
  { concurso: 5935, data: '15/08/2026', diaSemana: 'Sábado', bilhetes: ['83712', '41950', '76283', '10549', '59827'] },
  { concurso: 5934, data: '12/08/2026', diaSemana: 'Quarta-feira', bilhetes: ['69248', '35017', '82491', '47136', '90825'] },
  { concurso: 5933, data: '08/08/2026', diaSemana: 'Sábado', bilhetes: ['14560', '78923', '23105', '56478', '31294'] },
  { concurso: 5932, data: '05/08/2026', diaSemana: 'Quarta-feira', bilhetes: ['97831', '52408', '61974', '38520', '84163'] },
  { concurso: 5931, data: '01/08/2026', diaSemana: 'Sábado', bilhetes: ['45192', '86370', '19485', '72036', '30849'] },
];

export function buildSeedContests(targetCount = 100): LotteryContest[] {
  const prizes = [500000, 35000, 30000, 25000, 20503];
  const baseList: LotteryContest[] = SEED_CONTESTS_DATA.map(item => {
    const premios = item.bilhetes.map((bilhete, idx) => ({
      ordem: idx + 1,
      bilhete,
      valorPremio: prizes[idx],
    }));
    return {
      concurso: item.concurso,
      data: item.data,
      diaSemana: item.diaSemana,
      premios,
      local: 'Espaço da Sorte, São Paulo, SP',
      acumulou: Boolean(item.acumulou),
      bichoPrincipal: getAnimalByDezena(item.bilhetes[0].slice(-2)),
      todosBichos: premios.map(p => getAnimalByDezena(p.bilhete.slice(-2))),
      arrecadacaoTotal: 4200000,
    };
  });

  if (baseList.length >= targetCount) {
    return baseList.slice(0, targetCount);
  }

  // Generate deterministic past sequence down to targetCount (up to 100 draws)
  let lastItem = baseList[baseList.length - 1];
  let [d, m, y] = (lastItem.data || '01/08/2026').split('/').map(Number);
  let curDate = new Date(y, (m || 1) - 1, d || 1);
  let curConcurso = lastItem.concurso - 1;

  while (baseList.length < targetCount && curConcurso > 5000) {
    const isWed = curDate.getDay() === 3;
    // Step backwards: from Wed to Sat is -4 days, from Sat to Wed is -3 days
    curDate.setDate(curDate.getDate() - (isWed ? 4 : 3));
    const nextDiaSemana: 'Quarta-feira' | 'Sábado' = curDate.getDay() === 3 ? 'Quarta-feira' : 'Sábado';
    const dateStr = `${String(curDate.getDate()).padStart(2, '0')}/${String(curDate.getMonth() + 1).padStart(2, '0')}/${curDate.getFullYear()}`;

    // Deterministic pseudo-random generation based on contest number
    const pseudoRand = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const tickets: string[] = [];
    for (let p = 0; p < 5; p++) {
      const raw = Math.floor(pseudoRand(curConcurso * 13 + p * 37) * 100000);
      tickets.push(String(raw).padStart(5, '0'));
    }

    const premios = tickets.map((bilhete, idx) => ({
      ordem: idx + 1,
      bilhete,
      valorPremio: prizes[idx],
    }));

    baseList.push({
      concurso: curConcurso,
      data: dateStr,
      diaSemana: nextDiaSemana,
      premios,
      local: 'Espaço da Sorte, São Paulo, SP',
      acumulou: false,
      bichoPrincipal: getAnimalByDezena(tickets[0].slice(-2)),
      todosBichos: premios.map(p => getAnimalByDezena(p.bilhete.slice(-2))),
      arrecadacaoTotal: 3950000 + Math.floor(pseudoRand(curConcurso) * 300000),
    });

    curConcurso--;
  }

  return baseList.slice(0, targetCount);
}
