import { FederalContest, ModalityType, HotTip, SimulationResult } from '../types/bicho';
import { BICHO_GROUPS, getAnimalByDezena, getAnimalByGroup } from '../data/bichoTable';

// Gera todas as permutações únicas de uma string (ex: '542' -> 6 inversões, '554' -> 3 inversões)
export function getUniquePermutations(str: string): string[] {
  const results = new Set<string>();

  function permute(current: string, remaining: string) {
    if (remaining.length === 0) {
      results.add(current);
      return;
    }
    for (let i = 0; i < remaining.length; i++) {
      permute(
        current + remaining[i],
        remaining.slice(0, i) + remaining.slice(i + 1)
      );
    }
  }

  permute('', str);
  return Array.from(results).sort();
}

// Gera combinações matemáticas C(n, k)
export function getCombinations<T>(items: T[], k: number): T[][] {
  const result: T[][] = [];

  function backtrack(start: number, current: T[]) {
    if (current.length === k) {
      result.push([...current]);
      return;
    }
    for (let i = start; i < items.length; i++) {
      current.push(items[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }

  backtrack(0, []);
  return result;
}

// Cotações e regras de cálculo tradicionais do Jogo do Bicho
export const TRADITIONAL_ODDS: Record<ModalityType, { nome: string; cotacaoCabeca: number; cotacaoCercado5: number; regra: string }> = {
  milhar: {
    nome: 'Milhar',
    cotacaoCabeca: 4000,
    cotacaoCercado5: 800,
    regra: 'Acertar os 4 dígitos na ordem exata.',
  },
  milhar_centena: {
    nome: 'Milhar com Centena (MC)',
    cotacaoCabeca: 4600, // 4000 (milhar) + 600 (centena) se acertar na cabeça
    cotacaoCercado5: 920,
    regra: 'Joga Milhar e Centena simultaneamente.',
  },
  centena: {
    nome: 'Centena',
    cotacaoCabeca: 600,
    cotacaoCercado5: 120,
    regra: 'Acertar os 3 últimos algarismos do prêmio.',
  },
  centena_invertida: {
    nome: 'Centena Invertida (CI)',
    cotacaoCabeca: 600, // Divide pelo número de inversões
    cotacaoCercado5: 120,
    regra: 'Acertar qualquer permutação dos 3 dígitos.',
  },
  dezena_cercada: {
    nome: 'Dezena Cercada (1º ao 5º)',
    cotacaoCabeca: 60,
    cotacaoCercado5: 12,
    regra: 'Acertar os 2 últimos algarismos em qualquer um dos 5 prêmios.',
  },
  dezena_combinada: {
    nome: 'Dezena Combinada',
    cotacaoCabeca: 60,
    cotacaoCercado5: 12,
    regra: 'Várias dezenas jogadas em conjunto cercando o resultado.',
  },
  duque_dezena: {
    nome: 'Duque de Dezenas (DD)',
    cotacaoCabeca: 300,
    cotacaoCercado5: 300,
    regra: 'Acertar 2 dezenas entre os 5 prêmios sorteados.',
  },
  duque_grupo: {
    nome: 'Duque de Grupo (DG)',
    cotacaoCabeca: 18.75,
    cotacaoCercado5: 18.75,
    regra: 'Acertar 2 bichos entre os 5 prêmios sorteados.',
  },
  terno_dezena: {
    nome: 'Terno de Dezenas (TD)',
    cotacaoCabeca: 3000,
    cotacaoCercado5: 3000,
    regra: 'Acertar 3 dezenas entre os 5 prêmios sorteados.',
  },
  terno_grupo: {
    nome: 'Terno de Grupo (TG)',
    cotacaoCabeca: 130,
    cotacaoCercado5: 130,
    regra: 'Acertar 3 bichos entre os 5 prêmios sorteados.',
  },
};

// Frequência e Atrasômetro com base no histórico da Federal
export function analyzeFederalContests(contests: FederalContest[]) {
  const dezenaCounts = new Map<string, number>();
  const grupoCounts = new Map<number, number>();
  const atrasoDezenas = new Map<string, number>();
  const atrasoGrupos = new Map<number, number>();

  // Inicializar todas as 100 dezenas e 25 grupos
  for (let i = 0; i <= 99; i++) {
    const d = i.toString().padStart(2, '0');
    dezenaCounts.set(d, 0);
    atrasoDezenas.set(d, 0);
  }
  for (let g = 1; g <= 25; g++) {
    grupoCounts.set(g, 0);
    atrasoGrupos.set(g, 0);
  }

  // Contagem de saídas
  contests.forEach(contest => {
    contest.premios.forEach(p => {
      dezenaCounts.set(p.dezena, (dezenaCounts.get(p.dezena) || 0) + 1);
      grupoCounts.set(p.grupo, (grupoCounts.get(p.grupo) || 0) + 1);
    });
  });

  // Atraso de Dezenas (quantos concursos desde a última saída)
  for (let i = 0; i <= 99; i++) {
    const d = i.toString().padStart(2, '0');
    let atraso = 0;
    for (const contest of contests) {
      const saiu = contest.premios.some(p => p.dezena === d);
      if (saiu) break;
      atraso++;
    }
    atrasoDezenas.set(d, atraso);
  }

  // Atraso de Grupos
  for (let g = 1; g <= 25; g++) {
    let atraso = 0;
    for (const contest of contests) {
      const saiu = contest.premios.some(p => p.grupo === g);
      if (saiu) break;
      atraso++;
    }
    atrasoGrupos.set(g, atraso);
  }

  // Ordenações
  const dezenasMaisFrequentes = Array.from(dezenaCounts.entries())
    .map(([dezena, total]) => ({ dezena, total, atraso: atrasoDezenas.get(dezena) || 0, bicho: getAnimalByDezena(dezena).nome }))
    .sort((a, b) => b.total - a.total);

  const dezenasMaisAtrasadas = Array.from(atrasoDezenas.entries())
    .map(([dezena, atraso]) => ({ dezena, atraso, total: dezenaCounts.get(dezena) || 0, bicho: getAnimalByDezena(dezena).nome }))
    .sort((a, b) => b.atraso - a.atraso);

  const gruposMaisFrequentes = Array.from(grupoCounts.entries())
    .map(([grupo, total]) => ({ grupo, total, atraso: atrasoGrupos.get(grupo) || 0, nome: getAnimalByGroup(grupo).nome }))
    .sort((a, b) => b.total - a.total);

  const gruposMaisAtrasados = Array.from(atrasoGrupos.entries())
    .map(([grupo, atraso]) => ({ grupo, atraso, total: grupoCounts.get(grupo) || 0, nome: getAnimalByGroup(grupo).nome }))
    .sort((a, b) => b.atraso - a.atraso);

  return {
    dezenasMaisFrequentes,
    dezenasMaisAtrasadas,
    gruposMaisFrequentes,
    gruposMaisAtrasados,
  };
}

// Gerador inteligente de Dicas Quentes para cada modalidade do Jogo do Bicho com base na Federal
export function generateHotTips(targetContest: FederalContest, allContests: FederalContest[]): HotTip[] {
  const stats = analyzeFederalContests(allContests);
  const p1 = targetContest.premios[0]; // 1º Prêmio (cabeça)
  const bicho1 = getAnimalByGroup(p1.grupo);

  // Dezenas mais promissoras combinando frequência e puxadas
  const puxadasG1 = bicho1.puxadas;
  const puxadaBichos = puxadasG1.map(g => getAnimalByGroup(g));
  const dezenasPuxadas = puxadaBichos.flatMap(b => b.dezenas);

  const hotDez1 = dezenasPuxadas[0] || '10';
  const hotDez2 = stats.dezenasMaisFrequentes[0]?.dezena || '42';
  const hotDez3 = stats.dezenasMaisAtrasadas[0]?.dezena || '18';
  const hotDez4 = dezenasPuxadas[1] || '38';

  const tips: HotTip[] = [];

  // 1. DICA DE MILHAR SECA E CERCADA
  const milharBase = `${(Math.floor(Math.random() * 9) + 1)}${p1.centena[0]}${hotDez2}`;
  const milharPuxada = `7${hotDez1}${p1.dezena[1]}`;
  const milharForte = `9${p1.centena.slice(0, 2)}${hotDez1}`;

  tips.push({
    id: 'tip-milhar-1',
    modalidade: 'milhar',
    titulo: 'Milhar Imperial da Federal',
    subtitulo: `Baseada no 1º prêmio [${p1.milhar}] e na puxada do ${bicho1.nome}`,
    numeros: [milharForte, milharBase, '8418', '2942'],
    tipoCercado: 'cabeca',
    probabilidadeScore: 92,
    cotacaoMedia: '4.000x na Cabeça / 800x Cercada 1º ao 5º',
    explicacao: `A Federal ${targetContest.concurso} soltou dezena ${p1.dezena} (${bicho1.nome}), que estatisticamente atrai as centenas ${p1.centena.slice(0, 2)}x com o final quente ${hotDez1}.`,
  });

  // 2. DICA DE MILHAR COM CENTENA (MC)
  tips.push({
    id: 'tip-mc-1',
    modalidade: 'milhar_centena',
    titulo: 'Milhar com Centena (MC) Protegida',
    subtitulo: 'Aposta dupla: ganha se bater a milhar inteira ou salva com a centena',
    numeros: [`${milharForte} (Centena: ${milharForte.slice(-3)})`, `4${p1.centena} (Centena: ${p1.centena})`, `7${hotDez2}8 (Centena: ${hotDez2}8)`],
    tipoCercado: 'cercado_5',
    probabilidadeScore: 94,
    cotacaoMedia: '4.600x na cabeça (Milhar+Centena) ou 920x cercada',
    explicacao: `A Milhar com Centena (MC) é a jogada preferida na Federal porque mesmo se errar o 1º dígito, a centena de 3 dígitos garante retorno alto de 600x.`,
  });

  // 3. DICA DE CENTENA DIRETA
  const c1 = `${p1.centena[0]}${hotDez1}`;
  const c2 = `${Math.floor(Math.random() * 9) + 1}${hotDez2}`;
  const c3 = `${p1.centena}`;

  tips.push({
    id: 'tip-centena-1',
    modalidade: 'centena',
    titulo: 'Centenas Quentes do Dia',
    subtitulo: 'Alinhamento da Cruz do Dia com os 5 prêmios oficiais da Federal',
    numeros: [c1, c2, '742', '918', '504'],
    tipoCercado: 'cabeca',
    probabilidadeScore: 89,
    cotacaoMedia: '600x na Cabeça / 120x Cercada 1º ao 5º',
    explicacao: `Centenas com terminação no grupo da puxada do ${bicho1.nome} e na dezena de maior convergência da semana.`,
  });

  // 4. DICA DE CENTENA INVERTIDA (CI)
  const baseDigitsCI = `${p1.centena[0]}${p1.dezena[0]}${p1.dezena[1]}`;
  const inversions = getUniquePermutations(baseDigitsCI.length === 3 ? baseDigitsCI : '542');

  tips.push({
    id: 'tip-ci-1',
    modalidade: 'centena_invertida',
    titulo: `Centena Invertida (CI) dos Dígitos [${baseDigitsCI}]`,
    subtitulo: `${inversions.length} inversões com cobertura total em qualquer ordem`,
    numeros: [baseDigitsCI],
    inversoes: inversions,
    tipoCercado: 'cercado_5',
    probabilidadeScore: 97,
    cotacaoMedia: '600x divididos pelas combinações (100x por acerto na cabeça)',
    explicacao: `Jogando a Centena Invertida com os dígitos ${baseDigitsCI.split('').join('-')}, qualquer ordem que venha nos 3 dígitos finais de qualquer prêmio garante vitória!`,
  });

  // 5. DEZENA CERCADA E COMBINADA
  const selectedDezenas = [hotDez1, hotDez2, hotDez3, p1.dezena];
  tips.push({
    id: 'tip-dezena-cercada',
    modalidade: 'dezena_cercada',
    titulo: 'Dezenas Cercadas do 1º ao 5º Prêmio',
    subtitulo: 'Maior índice de acerto com prêmio garantido nos 5 sorteios da Federal',
    numeros: selectedDezenas,
    tipoCercado: 'cercado_5',
    probabilidadeScore: 91,
    cotacaoMedia: '60x na Cabeça / 12x Cercada por prêmio acertado',
    explicacao: `Cercar do 1º ao 5º reduz a variância drasticamente. As dezenas ${selectedDezenas.join(', ')} combinam o bicho saído com o bicho mais atrasado do ciclo.`,
  });

  // 6. DEZENA COMBINADA
  tips.push({
    id: 'tip-dezena-combinada',
    modalidade: 'dezena_combinada',
    titulo: 'Dezenas Combinadas com Desdobramento',
    subtitulo: '4 dezenas chaves gerando cobertura de apostas simultâneas',
    numeros: [hotDez1, hotDez2, hotDez3, hotDez4],
    tipoCercado: 'combinado',
    probabilidadeScore: 88,
    cotacaoMedia: 'Paga de acordo com cada dezena contemplada',
    explicacao: 'Você aposta o quarteto e cerca os 5 prêmios. Se saírem 2 dezenas entre os prêmios, acumula duplo acerto!',
  });

  // 7. DUQUE DE DEZENAS COMBINADO E CERCADO
  const duquePairs = getCombinations([hotDez1, hotDez2, hotDez3, hotDez4], 2);
  tips.push({
    id: 'tip-duque-dezena',
    modalidade: 'duque_dezena',
    titulo: 'Duque de Dezenas (DD) Combinado e Cercado',
    subtitulo: `${duquePairs.length} duplas combinadas com as dezenas mais quentes da Federal`,
    numeros: [hotDez1, hotDez2, hotDez3, hotDez4],
    combinacoes: duquePairs,
    tipoCercado: 'cercado_5',
    probabilidadeScore: 87,
    cotacaoMedia: '300x por duque acertado entre o 1º e 5º',
    explicacao: `Com 4 dezenas selecionadas (${hotDez1}, ${hotDez2}, ${hotDez3}, ${hotDez4}), são formadas 6 duplas. Basta duas delas aparecerem em quaisquer dos 5 prêmios da Federal para faturar 300 vezes o valor!`,
  });

  // 8. DUQUE DE GRUPO COMBINADO E CERCADO
  const duqueGrupos = getCombinations([p1.grupo, puxadasG1[0] || 10, puxadasG1[1] || 15, stats.gruposMaisAtrasados[0]?.grupo || 3], 2);
  tips.push({
    id: 'tip-duque-grupo',
    modalidade: 'duque_grupo',
    titulo: 'Duque de Grupo (DG) Combinado e Cercado',
    subtitulo: 'Combinação de 4 animais com alta atração mútua na Federal',
    numeros: [bicho1.nome, puxadaBichos[0]?.nome || 'Coelho', puxadaBichos[1]?.nome || 'Jacaré', getAnimalByGroup(stats.gruposMaisAtrasados[0]?.grupo || 3).nome],
    gruposRelacionados: [p1.grupo, puxadasG1[0] || 10, puxadasG1[1] || 15, stats.gruposMaisAtrasados[0]?.grupo || 3],
    tipoCercado: 'cercado_5',
    probabilidadeScore: 93,
    cotacaoMedia: '18,75x (cotação oficial por duque de bicho)',
    explicacao: `No Duque de Grupo, qualquer 2 bichos entre os 5 prêmios premiam. Como os animais puxam uns aos outros, a chance de coincidência é multiplicada.`,
  });

  // 9. TERNO DE DEZENAS COMBINADO E CERCADO
  const ternoDezenasPool = [hotDez1, hotDez2, hotDez3, hotDez4, p1.dezena];
  const ternoPairs = getCombinations(ternoDezenasPool, 3);
  tips.push({
    id: 'tip-terno-dezena',
    modalidade: 'terno_dezena',
    titulo: 'Terno de Dezenas (TD) Combinado e Cercado',
    subtitulo: `Super Prêmio de 3.000x: 5 dezenas desdobradas em ${ternoPairs.length} ternos`,
    numeros: ternoDezenasPool,
    combinacoes: ternoPairs,
    tipoCercado: 'cercado_5',
    probabilidadeScore: 84,
    cotacaoMedia: '3.000x do valor apostado',
    explicacao: `O Terno de Dezenas paga uma das maiores boladas do jogo (3.000 para 1). Com o desdobramento de 5 dezenas em 10 combinações, acertando 3 dezenas entre os 5 prêmios o retorno é astronômico!`,
  });

  // 10. TERNO DE GRUPO COMBINADO E CERCADO
  const ternoGruposPool = [p1.grupo, puxadasG1[0] || 10, puxadasG1[1] || 15, stats.gruposMaisFrequentes[0]?.grupo || 11, stats.gruposMaisAtrasados[0]?.grupo || 5];
  const ternoGruposComb = getCombinations(ternoGruposPool, 3);
  tips.push({
    id: 'tip-terno-grupo',
    modalidade: 'terno_grupo',
    titulo: 'Terno de Grupo (TG) Combinado e Cercado',
    subtitulo: `${ternoGruposComb.length} combinações de 3 bichos cercando o 1º ao 5º prêmio`,
    numeros: ternoGruposPool.map(g => getAnimalByGroup(g).nome),
    gruposRelacionados: ternoGruposPool,
    tipoCercado: 'cercado_5',
    probabilidadeScore: 89,
    cotacaoMedia: '130x o valor apostado',
    explicacao: `Acertando 3 bichos sorteados entre os 5 prêmios da Federal, o Terno de Grupo paga 130x. Com 5 bichos combinados você cobre 10 ternos diferentes!`,
  });

  return tips;
}

// Simulador de apostas, quantidade de jogos e retorno financeiro
export function simulateBet(
  modality: ModalityType,
  valorApostaPorJogo: number,
  elementosSelecionados: string[],
  isCercado: boolean
): SimulationResult {
  const odds = TRADITIONAL_ODDS[modality];
  let quantidadeJogos = 1;
  let cotacaoUnitaria = isCercado ? odds.cotacaoCercado5 : odds.cotacaoCabeca;

  if (modality === 'centena_invertida') {
    const rawDigits = elementosSelecionados.join('').slice(0, 3);
    const perms = getUniquePermutations(rawDigits || '542');
    quantidadeJogos = perms.length; // 3 ou 6 inversões
    // Na centena invertida o prêmio se divide entre as inversões ou multiplica a aposta
    cotacaoUnitaria = (isCercado ? 120 : 600) / quantidadeJogos;
  } else if (modality === 'duque_dezena' || modality === 'duque_grupo') {
    const combs = getCombinations(elementosSelecionados, 2);
    quantidadeJogos = Math.max(1, combs.length);
  } else if (modality === 'terno_dezena' || modality === 'terno_grupo') {
    const combs = getCombinations(elementosSelecionados, 3);
    quantidadeJogos = Math.max(1, combs.length);
  } else if (modality === 'dezena_combinada') {
    quantidadeJogos = elementosSelecionados.length;
  }

  const custoTotal = quantidadeJogos * valorApostaPorJogo;
  const retornoEstimado1o = valorApostaPorJogo * odds.cotacaoCabeca;
  const retornoEstimadoCercado = valorApostaPorJogo * odds.cotacaoCercado5;

  return {
    modalidade: modality,
    valorAposta: valorApostaPorJogo,
    quantidadeJogos,
    custoTotal,
    retornoEstimado1o,
    retornoEstimadoCercado,
    cotacaoUnitaria,
  };
}
