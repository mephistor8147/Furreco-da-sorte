import { AnimalInfo, LotteryContest, TicketCheckResult } from '../types/lottery';

export const ANIMAL_GROUPS: AnimalInfo[] = [
  { grupo: 1, nome: 'Avestruz', emoji: '🦤', dezenas: ['01', '02', '03', '04'] },
  { grupo: 2, nome: 'Águia', emoji: '🦅', dezenas: ['05', '06', '07', '08'] },
  { grupo: 3, nome: 'Burro', emoji: '🫏', dezenas: ['09', '10', '11', '12'] },
  { grupo: 4, nome: 'Borboleta', emoji: '🦋', dezenas: ['13', '14', '15', '16'] },
  { grupo: 5, nome: 'Cachorro', emoji: '🐕', dezenas: ['17', '18', '19', '20'] },
  { grupo: 6, nome: 'Cabra', emoji: '🐐', dezenas: ['21', '22', '23', '24'] },
  { grupo: 7, nome: 'Carneiro', emoji: '🐏', dezenas: ['25', '26', '27', '28'] },
  { grupo: 8, nome: 'Camelo', emoji: '🐪', dezenas: ['29', '30', '31', '32'] },
  { grupo: 9, nome: 'Cobra', emoji: '🐍', dezenas: ['33', '34', '35', '36'] },
  { grupo: 10, nome: 'Coelho', emoji: '🐇', dezenas: ['37', '38', '39', '40'] },
  { grupo: 11, nome: 'Cavalo', emoji: '🐎', dezenas: ['41', '42', '43', '44'] },
  { grupo: 12, nome: 'Elefante', emoji: '🐘', dezenas: ['45', '46', '47', '48'] },
  { grupo: 13, nome: 'Galo', emoji: '🐓', dezenas: ['49', '50', '51', '52'] },
  { grupo: 14, nome: 'Gato', emoji: '🐈', dezenas: ['53', '54', '55', '56'] },
  { grupo: 15, nome: 'Jacaré', emoji: '🐊', dezenas: ['57', '58', '59', '60'] },
  { grupo: 16, nome: 'Leão', emoji: '🦁', dezenas: ['61', '62', '63', '64'] },
  { grupo: 17, nome: 'Macaco', emoji: '🐒', dezenas: ['65', '66', '67', '68'] },
  { grupo: 18, nome: 'Porco', emoji: '🐖', dezenas: ['69', '70', '71', '72'] },
  { grupo: 19, nome: 'Pavão', emoji: '🦚', dezenas: ['73', '74', '75', '76'] },
  { grupo: 20, nome: 'Peru', emoji: '🦃', dezenas: ['77', '78', '79', '80'] },
  { grupo: 21, nome: 'Touro', emoji: '🐂', dezenas: ['81', '82', '83', '84'] },
  { grupo: 22, nome: 'Tigre', emoji: '🐅', dezenas: ['85', '86', '87', '88'] },
  { grupo: 23, nome: 'Urso', emoji: '🐻', dezenas: ['89', '90', '91', '92'] },
  { grupo: 24, nome: 'Veado', emoji: '🦌', dezenas: ['93', '94', '95', '96'] },
  { grupo: 25, nome: 'Vaca', emoji: '🐄', dezenas: ['97', '98', '99', '00'] },
];

export function getAnimalByDezena(dezenaInput: string | number): AnimalInfo {
  let d = typeof dezenaInput === 'number' ? dezenaInput : parseInt(dezenaInput.slice(-2), 10);
  if (isNaN(d)) d = 0;
  if (d === 0) return ANIMAL_GROUPS[24]; // Vaca (00)
  const groupIndex = Math.ceil(d / 4) - 1;
  return ANIMAL_GROUPS[Math.min(Math.max(groupIndex, 0), 24)];
}

export function formatTicket(ticket: string): string {
  const clean = ticket.replace(/\D/g, '').padStart(5, '0');
  return `${clean.slice(0, 2)}.${clean.slice(2)}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

// Probabilidades da Loteria Federal por bilhete
export const LOTERIA_FEDERAL_ODDS = [
  {
    modalidade: 'Prêmio Principal (1º Prêmio)',
    regra: 'Acertar o bilhete exato de 5 dígitos do 1º prêmio',
    chance: '1 em 100.000',
    percentual: '0,001%',
    premioTipico: 'R$ 500.000,00',
    dica: 'Bilhete inteiro dividido em 10 frações de R$ 50.000 cada.',
  },
  {
    modalidade: 'Demais Prêmios Principais (2º ao 5º)',
    regra: 'Acertar qualquer um dos bilhetes exatos sorteados (2º ao 5º)',
    chance: '1 em 25.000',
    percentual: '0,004%',
    premioTipico: 'R$ 18.000 a R$ 27.000',
    dica: 'Cada prêmio contempla uma faixa com valor específico.',
  },
  {
    modalidade: 'Milhar (4 últimos dígitos do 1º)',
    regra: 'Acertar os 4 últimos dígitos do bilhete sorteado',
    chance: '1 em 10.000',
    percentual: '0,01%',
    premioTipico: 'R$ 2.000,00',
    dica: 'Exemplo: se o sorteado for 48.291, ganha quem tiver bilhete final 8.291.',
  },
  {
    modalidade: 'Centena (3 últimos dígitos do 1º)',
    regra: 'Acertar os 3 últimos algarismos do 1º prêmio',
    chance: '1 em 1.000',
    percentual: '0,1%',
    premioTipico: 'R$ 400,00',
    dica: 'Se o 1º prêmio for 48.291, qualquer bilhete final 291 é premiado.',
  },
  {
    modalidade: 'Dezena (2 últimos dígitos do 1º)',
    regra: 'Acertar a dezena final dos números premiados',
    chance: '1 em 100',
    percentual: '1,0%',
    premioTipico: 'R$ 50,00',
    dica: 'Todas as centenas e milhares com final idêntico ganham.',
  },
  {
    modalidade: 'Grupo do Bicho (Dezena correspondente)',
    regra: 'Acertar o grupo de 4 dezenas do 1º prêmio',
    chance: '1 em 25',
    percentual: '4,0%',
    premioTipico: 'R$ 20,00 a R$ 40,00',
    dica: '1 em cada 25 bilhetes na média é contemplado pelo grupo.',
  },
  {
    modalidade: 'Unidade / Terminação (Último dígito)',
    regra: 'Acertar o algarismo final do bilhete do 1º prêmio',
    chance: '1 em 10',
    percentual: '10,0%',
    premioTipico: 'Devolução / Prêmio de consolação (R$ 10)',
    dica: 'Garante que 10% de todos os bilhetes emitidos recebam reembolso.',
  },
  {
    modalidade: 'Aproximação (Anterior e Posterior)',
    regra: 'Bilhete imediatamente anterior ou posterior ao 1º prêmio',
    chance: '2 em 100.000 (1 em 50.000)',
    percentual: '0,002%',
    premioTipico: 'R$ 2.000,00 cada',
    dica: 'Se o 1º for 48.291, os números 48.290 e 48.292 ganham.',
  },
];

// Helper to calculate next draw timestamp (Wednesdays and Saturdays at 19:00 BRT)
export function getNextDrawDate(): {
  date: Date;
  formatted: string;
  diaSemana: string;
  concursoEstimado: number;
  premioEstimado: string;
} {
  const now = new Date();
  const target = new Date(now);
  target.setHours(19, 0, 0, 0);

  const dayOfWeek = now.getDay(); // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
  
  if (dayOfWeek === 3 && now.getHours() < 19) {
    // Today is Wednesday before 19:00
  } else if (dayOfWeek === 6 && now.getHours() < 19) {
    // Today is Saturday before 19:00
  } else if (dayOfWeek < 3) {
    // Sunday, Monday, Tuesday -> Next is Wednesday
    target.setDate(now.getDate() + (3 - dayOfWeek));
  } else if (dayOfWeek === 3) {
    // Wednesday after 19:00 -> Next is Saturday (+3 days)
    target.setDate(now.getDate() + 3);
  } else if (dayOfWeek < 6) {
    // Thursday, Friday -> Next is Saturday
    target.setDate(now.getDate() + (6 - dayOfWeek));
  } else {
    // Saturday after 19:00 -> Next is Wednesday (+4 days)
    target.setDate(now.getDate() + 4);
  }

  const diaSemana = target.getDay() === 3 ? 'Quarta-feira' : 'Sábado';
  const formatted = `${target.toLocaleDateString('pt-BR')} às 19:00h`;

  return {
    date: target,
    formatted,
    diaSemana,
    concursoEstimado: 5946,
    premioEstimado: 'R$ 500.000,00',
  };
}

// Check ticket against a contest
export function checkTicketAgainstContest(rawTicket: string, contest: LotteryContest): TicketCheckResult {
  const ticket = rawTicket.replace(/\D/g, '').padStart(5, '0');
  const ticketInt = parseInt(ticket, 10);
  const p1 = contest.premios[0];
  const p1Ticket = p1.bilhete;
  const p1Int = parseInt(p1Ticket, 10);

  // 1. Check exact 1st prize
  if (ticket === p1Ticket) {
    return {
      hasWon: true,
      contest,
      ticketNumber: ticket,
      prizeCategory: 'bilhete_exato',
      prizeTier: 1,
      prizeValue: p1.valorPremio,
      description: 'PARABÉNS! 🏆 Você acertou o 1º PRÊMIO PRINCIPAL da Loteria Federal!',
      matchedDigits: ticket,
    };
  }

  // 2. Check other exact prizes (2 to 5)
  for (let i = 1; i < contest.premios.length; i++) {
    const p = contest.premios[i];
    if (ticket === p.bilhete) {
      return {
        hasWon: true,
        contest,
        ticketNumber: ticket,
        prizeCategory: 'bilhete_exato',
        prizeTier: p.ordem,
        prizeValue: p.valorPremio,
        description: `Sensacional! 🎉 Você acertou o ${p.ordem}º Prêmio da Loteria Federal!`,
        matchedDigits: ticket,
      };
    }
  }

  // 3. Check approximations (+1 or -1 of 1st prize)
  if (ticketInt === p1Int - 1 || ticketInt === p1Int + 1) {
    return {
      hasWon: true,
      contest,
      ticketNumber: ticket,
      prizeCategory: 'aproximacao',
      prizeValue: 2000,
      description: `Aproximação Premiada! Seu bilhete é vizinho do 1º prêmio (${p1Ticket})!`,
      matchedDigits: ticket,
    };
  }

  // 4. Check milhar (last 4 digits of 1st prize)
  if (ticket.slice(-4) === p1Ticket.slice(-4)) {
    return {
      hasWon: true,
      contest,
      ticketNumber: ticket,
      prizeCategory: 'milhar',
      prizeValue: 2000,
      description: `Show! Você acertou a Milhar do 1º Prêmio (final ${ticket.slice(-4)})!`,
      matchedDigits: ticket.slice(-4),
    };
  }

  // 5. Check centena (last 3 digits of 1st prize)
  if (ticket.slice(-3) === p1Ticket.slice(-3)) {
    return {
      hasWon: true,
      contest,
      ticketNumber: ticket,
      prizeCategory: 'centena',
      prizeValue: 400,
      description: `Muito bom! Você acertou a Centena do 1º Prêmio (final ${ticket.slice(-3)})!`,
      matchedDigits: ticket.slice(-3),
    };
  }

  // 6. Check dezena (last 2 digits of 1st prize)
  if (ticket.slice(-2) === p1Ticket.slice(-2)) {
    return {
      hasWon: true,
      contest,
      ticketNumber: ticket,
      prizeCategory: 'dezena',
      prizeValue: 50,
      description: `Acertou a Dezena do 1º Prêmio (final ${ticket.slice(-2)})!`,
      matchedDigits: ticket.slice(-2),
    };
  }

  // 7. Check animal group match on 1st prize
  const userAnimal = getAnimalByDezena(ticket.slice(-2));
  if (userAnimal.grupo === contest.bichoPrincipal.grupo) {
    return {
      hasWon: true,
      contest,
      ticketNumber: ticket,
      prizeCategory: 'grupo',
      prizeValue: 25,
      description: `Grupo da Sorte! Seu bicho ${userAnimal.nome} (${userAnimal.emoji}) deu no 1º Prêmio!`,
      matchedDigits: ticket.slice(-2),
    };
  }

  // 8. Check final digit (terminação)
  if (ticket.slice(-1) === p1Ticket.slice(-1)) {
    return {
      hasWon: true,
      contest,
      ticketNumber: ticket,
      prizeCategory: 'terminacao',
      prizeValue: 10,
      description: `Terminação garantida! O final ${ticket.slice(-1)} foi sorteado no 1º prêmio (restituição do bilhete).`,
      matchedDigits: ticket.slice(-1),
    };
  }

  return {
    hasWon: false,
    contest,
    ticketNumber: ticket,
    prizeCategory: 'nenhum',
    prizeValue: 0,
    description: 'Não foi desta vez neste concurso, mas a sorte continua ao seu lado no próximo!',
    matchedDigits: '',
  };
}
