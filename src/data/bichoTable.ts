import { AnimalGroup } from '../types/bicho';

export const BICHO_GROUPS: AnimalGroup[] = [
  { grupo: 1, nome: 'Avestruz', dezenas: ['01', '02', '03', '04'], puxadas: [2, 10, 15] },
  { grupo: 2, nome: 'Águia', dezenas: ['05', '06', '07', '08'], puxadas: [1, 9, 22] },
  { grupo: 3, nome: 'Burro', dezenas: ['09', '10', '11', '12'], puxadas: [4, 11, 23] },
  { grupo: 4, nome: 'Borboleta', dezenas: ['13', '14', '15', '16'], puxadas: [3, 7, 14] },
  { grupo: 5, nome: 'Cachorro', dezenas: ['17', '18', '19', '20'], puxadas: [6, 17, 24] },
  { grupo: 6, nome: 'Cabra', dezenas: ['21', '22', '23', '24'], puxadas: [5, 8, 18] },
  { grupo: 7, nome: 'Carneiro', dezenas: ['25', '26', '27', '28'], puxadas: [4, 16, 21] },
  { grupo: 8, nome: 'Camelo', dezenas: ['29', '30', '31', '32'], puxadas: [6, 12, 23] },
  { grupo: 9, nome: 'Cobra', dezenas: ['33', '34', '35', '36'], puxadas: [2, 15, 20] },
  { grupo: 10, nome: 'Coelho', dezenas: ['37', '38', '39', '40'], puxadas: [1, 11, 19] },
  { grupo: 11, nome: 'Cavalo', dezenas: ['41', '42', '43', '44'], puxadas: [3, 10, 24] },
  { grupo: 12, nome: 'Elefante', dezenas: ['45', '46', '47', '48'], puxadas: [8, 13, 25] },
  { grupo: 13, nome: 'Galo', dezenas: ['49', '50', '51', '52'], puxadas: [12, 14, 22] },
  { grupo: 14, nome: 'Gato', dezenas: ['53', '54', '55', '56'], puxadas: [4, 13, 16] },
  { grupo: 15, nome: 'Jacaré', dezenas: ['57', '58', '59', '60'], puxadas: [1, 9, 18] },
  { grupo: 16, nome: 'Leão', dezenas: ['61', '62', '63', '64'], puxadas: [7, 14, 21] },
  { grupo: 17, nome: 'Macaco', dezenas: ['65', '66', '67', '68'], puxadas: [5, 19, 24] },
  { grupo: 18, nome: 'Porco', dezenas: ['69', '70', '71', '72'], puxadas: [6, 15, 23] },
  { grupo: 19, nome: 'Pavão', dezenas: ['73', '74', '75', '76'], puxadas: [10, 17, 22] },
  { grupo: 20, nome: 'Peru', dezenas: ['77', '78', '79', '80'], puxadas: [9, 21, 25] },
  { grupo: 21, nome: 'Touro', dezenas: ['81', '82', '83', '84'], puxadas: [7, 16, 20] },
  { grupo: 22, nome: 'Tigre', dezenas: ['85', '86', '87', '88'], puxadas: [2, 13, 19] },
  { grupo: 23, nome: 'Urso', dezenas: ['89', '90', '91', '92'], puxadas: [3, 8, 18] },
  { grupo: 24, nome: 'Veado', dezenas: ['93', '94', '95', '96'], puxadas: [5, 11, 17] },
  { grupo: 25, nome: 'Vaca', dezenas: ['97', '98', '99', '00'], puxadas: [12, 20, 21] }
];

// Retorna o grupo (1 a 25) correspondente a qualquer dezena ('00' a '99')
export function getGrupoFromDezena(dezena: string | number): number {
  const num = typeof dezena === 'string' ? parseInt(dezena, 10) : dezena;
  if (isNaN(num)) return 1;
  if (num === 0) return 25; // 00 pertence à vaca (grupo 25)
  return Math.ceil(num / 4);
}

// Retorna o objeto completo do animal pelo grupo ou dezena
export function getAnimalByGroup(grupo: number): AnimalGroup {
  const found = BICHO_GROUPS.find(b => b.grupo === grupo);
  return found || BICHO_GROUPS[0];
}

export function getAnimalByDezena(dezena: string | number): AnimalGroup {
  const grupo = getGrupoFromDezena(dezena);
  return getAnimalByGroup(grupo);
}

// Converte bilhete da Federal de 5 dígitos para as partes do bicho
export function parseTicketToBicho(bilhete: string) {
  const clean = bilhete.padStart(5, '0').slice(-5);
  const milhar = clean.slice(-4);
  const centena = clean.slice(-3);
  const dezena = clean.slice(-2);
  const grupo = getGrupoFromDezena(dezena);
  const animal = getAnimalByGroup(grupo);

  return {
    bilhete: clean,
    milhar,
    centena,
    dezena,
    grupo,
    bichoNome: animal.nome,
  };
}
