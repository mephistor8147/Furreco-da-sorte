export interface AnimalGroup {
  grupo: number;
  nome: string;
  dezenas: string[];
  puxadas: number[]; // grupos que costumam ser atraídos
}

export interface FederalPrize {
  ordem: number; // 1 a 5
  bilhete: string; // 5 dígitos ex: '48542'
  milhar: string; // 4 dígitos ex: '8542'
  centena: string; // 3 dígitos ex: '542'
  dezena: string; // 2 dígitos ex: '42'
  grupo: number; // 1 a 25
  bichoNome: string;
  premioValor?: number;
}

export interface FederalContest {
  concurso: number;
  data: string;
  premios: FederalPrize[];
}

export type ModalityType =
  | 'milhar'
  | 'milhar_centena'
  | 'centena'
  | 'centena_invertida'
  | 'dezena_cercada'
  | 'dezena_combinada'
  | 'duque_dezena'
  | 'duque_grupo'
  | 'terno_dezena'
  | 'terno_grupo';

export interface HotTip {
  id: string;
  modalidade: ModalityType;
  titulo: string;
  subtitulo: string;
  numeros: string[];
  detalhes?: string;
  inversoes?: string[];
  combinacoes?: string[][];
  gruposRelacionados?: number[];
  tipoCercado: 'cabeca' | 'cercado_5' | 'combinado';
  probabilidadeScore: number; // 0 a 100
  explicacao: string;
  cotacaoMedia: string;
}

export interface SimulationResult {
  modalidade: ModalityType;
  valorAposta: number;
  quantidadeJogos: number;
  custoTotal: number;
  retornoEstimado1o: number;
  retornoEstimadoCercado: number;
  cotacaoUnitaria: number;
}
