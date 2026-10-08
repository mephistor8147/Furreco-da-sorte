import { FederalContest } from '../types/bicho';
import { parseTicketToBicho } from './bichoTable';

interface RawContestInput {
  concurso: number;
  data: string;
  premios: [string, string, string, string, string]; // bilhetes dos 5 prêmios
}

const RAW_FEDERAL_CONTESTS: RawContestInput[] = [
  {
    concurso: 6106,
    data: '03/10/2026',
    premios: ['48542', '12390', '76118', '35467', '90204'],
  },
  {
    concurso: 6105,
    data: '30/09/2026',
    premios: ['87413', '52829', '09174', '63550', '21981'],
  },
  {
    concurso: 6104,
    data: '26/09/2026',
    premios: ['19088', '74301', '38945', '60212', '45763'],
  },
  {
    concurso: 6103,
    data: '23/09/2026',
    premios: ['53279', '88164', '20436', '71599', '04822'],
  },
  {
    concurso: 6102,
    data: '19/09/2026',
    premios: ['64105', '31958', '90442', '18731', '52670'],
  },
  {
    concurso: 6101,
    data: '16/09/2026',
    premios: ['09520', '42887', '75314', '61493', '38006'],
  },
  {
    concurso: 6100,
    data: '12/09/2026',
    premios: ['81655', '34291', '50738', '29107', '73462'],
  },
  {
    concurso: 6099,
    data: '09/09/2026',
    premios: ['27433', '90125', '68549', '14380', '52019'],
  },
  {
    concurso: 6098,
    data: '05/09/2026',
    premios: ['95044', '13768', '48202', '76915', '31571'],
  },
  {
    concurso: 6097,
    data: '02/09/2026',
    premios: ['38260', '70494', '59183', '24628', '81352'],
  },
  {
    concurso: 6096,
    data: '29/08/2026',
    premios: ['42911', '86377', '15049', '93826', '60503'],
  },
  {
    concurso: 6095,
    data: '26/08/2026',
    premios: ['71835', '24908', '60472', '38194', '59346'],
  },
];

export const FEDERAL_CONTESTS: FederalContest[] = RAW_FEDERAL_CONTESTS.map(c => ({
  concurso: c.concurso,
  data: c.data,
  premios: c.premios.map((bilhete, index) => {
    const parsed = parseTicketToBicho(bilhete);
    return {
      ordem: index + 1,
      bilhete: parsed.bilhete,
      milhar: parsed.milhar,
      centena: parsed.centena,
      dezena: parsed.dezena,
      grupo: parsed.grupo,
      bichoNome: parsed.bichoNome,
    };
  }),
}));

export const LATEST_FEDERAL_CONTEST = FEDERAL_CONTESTS[0];
