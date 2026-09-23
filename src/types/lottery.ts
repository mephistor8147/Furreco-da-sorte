export interface PrizeDraw {
  ordem: number; // 1, 2, 3, 4, 5
  bilhete: string; // "48291" (5 digits)
  valorPremio: number; // e.g. 500000
}

export interface AnimalInfo {
  grupo: number; // 1 to 25
  nome: string;
  emoji: string;
  dezenas: string[]; // ["01", "02", "03", "04"]
}

export interface LotteryContest {
  concurso: number;
  data: string; // DD/MM/YYYY
  diaSemana: 'Quarta-feira' | 'Sábado';
  premios: PrizeDraw[];
  local: string;
  acumulou: boolean;
  bichoPrincipal: AnimalInfo;
  todosBichos: AnimalInfo[];
  arrecadacaoTotal: number;
}

export interface FilterState {
  searchTerm: string; // number or contest
  filterType: 'all' | 'exact' | 'milhar' | 'centena' | 'dezena' | 'final';
  selectedYear: string;
  selectedAnimal: number | null;
  prizeFilter: 'all' | '1' | '2' | '3' | '4' | '5';
  sortBy: 'latest' | 'oldest' | 'prizeValue';
}

export interface DigitStat {
  digit: number;
  count: number;
  percentage: number;
  lastSeenContestsAgo: number;
}

export interface DezenaStat {
  dezena: string;
  count: number;
  lastSeenContest: number;
  concursosAtrasada: number;
  grupo: number;
  nomeBicho: string;
}

export interface TicketCheckResult {
  hasWon: boolean;
  contest: LotteryContest;
  ticketNumber: string;
  prizeCategory: 'bilhete_exato' | 'milhar' | 'centena' | 'dezena' | 'terminacao' | 'grupo' | 'aproximacao' | 'nenhum';
  prizeTier?: number; // 1 to 5
  prizeValue: number;
  description: string;
  matchedDigits: string;
}

export interface SmartBet {
  id: string;
  bilhete: string; // "48291"
  estrategia: 'quentes' | 'atrasados' | 'equilibrio' | 'surpresinha';
  dataGeracao: string;
  bicho: AnimalInfo;
  motivo: string;
  probabilidadeTeorica: string;
  favorito?: boolean;
}

export interface PushNotification {
  id: string;
  titulo: string;
  mensagem: string;
  horario: string;
  lida: boolean;
  tipo: 'resultado' | 'sorteio' | 'atraso' | 'dica';
}

export interface WeeklyReport {
  semana: string;
  concursos: LotteryContest[];
  totalDistribuido: number;
  dezenasRepetidas: string[];
  finaisMaisFrequentes: number[];
  bichoDestaque: AnimalInfo;
  balancoParidade: { pares: number; impares: number };
  destaqueTexto: string;
}
