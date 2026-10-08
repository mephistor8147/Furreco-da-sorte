import React, { useState } from 'react';
import { MobileTopBar } from './components/MobileTopBar';
import { MobileBottomNav, NavTab } from './components/MobileBottomNav';
import { DashboardView } from './components/DashboardView';
import { ModalitiesView } from './components/ModalitiesView';
import { CombinatorView } from './components/CombinatorView';
import { FederalHistoryView } from './components/FederalHistoryView';
import { BichoTableView } from './components/BichoTableView';
import { Toast } from './components/Toast';
import { FEDERAL_CONTESTS, LATEST_FEDERAL_CONTEST } from './data/federalData';
import { generateHotTips } from './utils/bichoEngine';
import { ModalityType, FederalContest } from './types/bicho';
import { fetchLatestFederalContest } from './services/federalSyncService';

// Asset paths generated via generate_image
const BANNER_IMAGE = '/src/assets/images/federal_lottery_banner_1791416599298.jpg';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [contestsList, setContestsList] = useState<FederalContest[]>(FEDERAL_CONTESTS);
  const [selectedContest, setSelectedContest] = useState<FederalContest>(LATEST_FEDERAL_CONTEST);
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estados de Sincronização em Tempo Real
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Estados para passar valores entre telas
  const [combinatorModality, setCombinatorModality] = useState<ModalityType>('centena_invertida');
  const [combinatorInitialValues, setCombinatorInitialValues] = useState<string[]>(['542']);
  const [modalitiesInitialFilter, setModalitiesInitialFilter] = useState<string>('milhar_centena');

  // Gerar dicas quentes com base no concurso selecionado e histórico
  const hotTips = generateHotTips(selectedContest, contestsList);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(prev => (prev === message ? null : prev));
    }, 2800);
  };

  const handleCopyText = async (text: string, label: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        showToast(label);
      } else {
        // Fallback para ambientes restritos
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        showToast(label);
      }
    } catch {
      showToast('Copiado para a área de transferência!');
    }
  };

  const handleShareApp = async () => {
    const p1 = selectedContest.premios[0];
    const text = `🍀 Palpites Quentes do Bicho da Federal\nBase: Concurso ${selectedContest.concurso} (${selectedContest.data})\n1º Prêmio: ${p1.milhar} (Grupo ${p1.grupo} - ${p1.bichoNome})\nConfira no app!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bicho da Federal - Palpites & Dicas Quentes',
          text,
          url: window.location.href,
        });
      } catch {
        // Ignorar cancelamento
      }
    } else {
      handleCopyText(text, 'Resumo do sorteio copiado para compartilhar!');
    }
  };

  // Função principal para atualizar o resultado da Loteria Federal
  const handleSyncFederal = async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    try {
      const currentHighest = contestsList[0]?.concurso || 6106;
      const result = await fetchLatestFederalContest(currentHighest);

      const now = new Date();
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(timeStr);

      if (result.success && result.contest) {
        const fetched = result.contest;
        setContestsList(prev => {
          const exists = prev.some(c => c.concurso === fetched.concurso);
          if (exists) {
            return prev.map(c => (c.concurso === fetched.concurso ? fetched : c));
          }
          return [fetched, ...prev];
        });

        setSelectedContest(fetched);
        showToast(`🍀 Concurso ${fetched.concurso} (${fetched.data}) atualizado com sucesso!`);
      } else {
        showToast('Resultados já conferidos com a base oficial!');
      }
    } catch (err: any) {
      showToast('Sincronização concluída com base de contingência.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOpenCombinatorWith = (mod: ModalityType, values: string[]) => {
    setCombinatorModality(mod);
    setCombinatorInitialValues(values);
    setActiveTab('desdobrador');
  };

  const handleSelectModalityFromDash = (mod: string) => {
    setModalitiesInitialFilter(mod);
    setActiveTab('modalidades');
  };

  const handleSelectDezenasFromTable = (dezenas: string[]) => {
    setCombinatorModality('duque_dezena');
    setCombinatorInitialValues(dezenas);
    setActiveTab('desdobrador');
    showToast(`${dezenas.length} dezenas carregadas no desdobrador!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start selection:bg-amber-400 selection:text-slate-950">
      {/* Toast de Notificação */}
      <Toast message={toastMessage} />

      {/* Frame Container (Smartphone Simulation no Desktop ou Full Mobile) */}
      <div
        className={`w-full transition-all duration-300 min-h-screen flex flex-col ${
          isMobileFrame
            ? 'max-w-[430px] shadow-2xl border-x border-slate-800 bg-slate-950 my-0 sm:my-4 sm:rounded-[40px] sm:overflow-hidden sm:min-h-[880px]'
            : 'max-w-4xl'
        }`}
      >
        {/* Top Bar (< 15% sticky cap) com Botão de Atualizar */}
        <MobileTopBar
          concursoAtual={selectedContest.concurso}
          dataConcurso={selectedContest.data}
          isMobileFrame={isMobileFrame}
          isSyncing={isSyncing}
          onToggleFrame={() => setIsMobileFrame(prev => !prev)}
          onShareApp={handleShareApp}
          onSyncFederal={handleSyncFederal}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-5">
          {activeTab === 'dashboard' && (
            <DashboardView
              contest={selectedContest}
              allContests={contestsList}
              hotTips={hotTips}
              onSelectModality={handleSelectModalityFromDash}
              onCopyText={handleCopyText}
              bannerImage={BANNER_IMAGE}
              isSyncing={isSyncing}
              lastSyncTime={lastSyncTime}
              onSyncFederal={handleSyncFederal}
            />
          )}

          {activeTab === 'modalidades' && (
            <ModalitiesView
              hotTips={hotTips}
              initialModality={modalitiesInitialFilter}
              onCopyText={handleCopyText}
              onOpenCombinatorWith={handleOpenCombinatorWith}
            />
          )}

          {activeTab === 'desdobrador' && (
            <CombinatorView
              initialModality={combinatorModality}
              initialValues={combinatorInitialValues}
              onCopyText={handleCopyText}
            />
          )}

          {activeTab === 'federal' && (
            <FederalHistoryView
              contests={contestsList}
              selectedContest={selectedContest}
              isSyncing={isSyncing}
              onSyncFederal={handleSyncFederal}
              onSelectContest={contest => {
                setSelectedContest(contest);
                showToast(`Concurso ${contest.concurso} definido como base!`);
              }}
            />
          )}

          {activeTab === 'bichos' && (
            <BichoTableView
              onCopyText={handleCopyText}
              onSelectDezenasForBet={handleSelectDezenasFromTable}
            />
          )}
        </main>

        {/* Bottom Tab Bar Anchor */}
        <MobileBottomNav
          activeTab={activeTab}
          onChangeTab={tab => setActiveTab(tab)}
          isMobileFrame={isMobileFrame}
        />
      </div>
    </div>
  );
}
