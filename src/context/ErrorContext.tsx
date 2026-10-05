// furreco da sorte
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { AppError, ErrorSeverity } from '../types/error';
import { ErrorModal } from '../components/ErrorModal';
import { AlertTriangle, X } from 'lucide-react';

interface ToastError {
  id: string;
  message: string;
  error?: AppError;
}

interface ErrorContextType {
  showError: (error: AppError) => void;
  hideError: () => void;
  showToastError: (message: string, errorObj?: Partial<AppError>) => void;
  showDiagnosticError: (severity?: ErrorSeverity) => void;
  currentError: AppError | null;
  isErrorModalOpen: boolean;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentError, setCurrentError] = useState<AppError | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastError[]>([]);

  const showError = useCallback((error: AppError) => {
    setCurrentError({
      ...error,
      timestamp: error.timestamp || new Date(),
    });
    setIsErrorModalOpen(true);
  }, []);

  const hideError = useCallback(() => {
    setIsErrorModalOpen(false);
  }, []);

  const showToastError = useCallback((message: string, errorObj?: Partial<AppError>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const fullError: AppError = {
      title: errorObj?.title || 'Aviso de Erro',
      message: message,
      details: errorObj?.details,
      severity: errorObj?.severity || 'aviso',
      source: errorObj?.source || 'Aplicação',
      timestamp: new Date(),
      retryAction: errorObj?.retryAction,
      retryLabel: errorObj?.retryLabel,
      code: errorObj?.code,
    };

    setToasts(prev => [...prev, { id, message, error: fullError }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  // Diagnostic helper to test any of the 4 error categories live
  const showDiagnosticError = useCallback((targetSeverity: ErrorSeverity = 'aviso') => {
    const errorMap: Record<ErrorSeverity, AppError> = {
      conexao: {
        title: 'Falha de Conexão com a Caixa',
        message: 'Não foi possível contatar o serviço de apuração da Caixa Econômica Federal no momento. O servidor pode estar em manutenção pós-sorteio.',
        details: 'Status HTTP: 504 Gateway Timeout\nEndpoint: /api/loterias/federal/recent\nOrigem: API Loterias Caixa (Federal)\nContingência: Base com histórico anterior disponível offline para navegação e consultas.',
        severity: 'conexao',
        source: 'Loterias Caixa (Federal)',
        code: 'ERR_CAIXA_TIMEOUT_504',
        retryLabel: 'Tentar Sincronizar Novamente',
      },
      validacao: {
        title: 'Validação de Entrada Inválida',
        message: 'O bilhete informado não atende às regras oficiais da Loteria Federal (deve conter exatamente 5 dígitos numéricos de 00000 a 99999).',
        details: 'Campo: bilhete\nRegra: ^[0-9]{5}$\nValor recebido: [INVÁLIDO]\nAção requerida: Digite um número de 5 algarismos ou use a Surpresinha.',
        severity: 'validacao',
        source: 'Validador de Bilhetes',
        code: 'ERR_INVALID_TICKET_FORMAT',
        retryLabel: 'Corrigir e Tentar',
      },
      aviso: {
        title: 'Diagnóstico do Sistema & Pop-up de Erro',
        message: 'O pop-up de erros e contingência do Furreco da Sorte está plenamente ativo e operacional. Ele captura quedas de rede, validações e alertas.',
        details: `Código de Diagnóstico: ERR_SYSTEM_DIAGNOSTIC_200\nData/Hora: ${new Date().toISOString()}\nAmbiente: Web SPA\nStatus: Operação Normal`,
        severity: 'aviso',
        source: 'Central de Diagnóstico',
        code: 'ERR_DIAGNOSTIC_VERIFIED',
        retryLabel: 'Testar Ação de Retentativa',
      },
      critico: {
        title: 'Falha Crítica Interceptada',
        message: 'Ocorreu uma exceção inesperada durante a execução. O Furreco ativou a barreira de isolamento para proteger seus bilhetes salvos e preferências.',
        details: 'Exception: MemoryBarrierFault at lotteryAnalysisCore\nStack Trace: at eval (/src/utils/lotteryUtils.ts)\nIntegridade dos Bilhetes Salvos: 100% preservada',
        severity: 'critico',
        source: 'Núcleo do Sistema',
        code: 'ERR_CORE_FAULT_INTERCEPTED',
        retryLabel: 'Reiniciar Módulo',
      },
    };

    const err = errorMap[targetSeverity] || errorMap.aviso;
    showError({
      ...err,
      isDiagnosticTest: true,
      timestamp: new Date(),
      retryAction: () => {
        showToastError(`Ação de retentativa para "${err.title}" executada com sucesso!`, {
          title: 'Retentativa OK',
          severity: 'aviso',
        });
      },
    });
  }, [showError, showToastError]);

  // Global browser error listeners (unhandled rejections, window errors, offline/online)
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = typeof reason === 'string' ? reason : reason?.message || 'Falha em operação assíncrona';
      console.warn('[Furreco Error Caught]', message);

      if (message.includes('aborted') || message.includes('AbortError')) return;

      showToastError(message, {
        title: 'Falha em Operação Assíncrona',
        details: reason?.stack || String(reason),
        severity: 'aviso',
      });
    };

    const handleGlobalError = (event: ErrorEvent) => {
      if (!event.message || event.message.includes('ResizeObserver') || event.message.includes('Script error.')) {
        return;
      }
      console.warn('[Furreco Global Error Caught]', event.message);
      showToastError(event.message, {
        title: 'Aviso do Sistema',
        details: `${event.filename || ''}:${event.lineno || 0}\n${event.error?.stack || ''}`,
        severity: 'aviso',
      });
    };

    const handleOffline = () => {
      showError({
        title: 'Sem Conexão com a Internet',
        message: 'Seu dispositivo perdeu a conexão com a rede. O Furreco da Sorte ativou o modo de contingência local.',
        details: 'Dispositivo desconectado da rede (navigator.onLine = false).\nTodos os concursos e bilhetes em cache continuam disponíveis offline.',
        severity: 'conexao',
        source: 'Rede Local',
        code: 'ERR_DEVICE_OFFLINE',
        retryAction: () => {
          if (navigator.onLine) {
            showToastError('Conexão restabelecida com sucesso!');
          } else {
            showToastError('Dispositivo ainda sem conexão à internet.');
          }
        },
        retryLabel: 'Verificar Conexão',
      });
    };

    const handleOnline = () => {
      showToastError('Conexão com a internet restabelecida!', {
        title: 'Dispositivo Online',
        severity: 'aviso',
      });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [showError, showToastError]);

  return (
    <ErrorContext.Provider
      value={{
        showError,
        hideError,
        showToastError,
        showDiagnosticError,
        currentError,
        isErrorModalOpen,
      }}
    >
      {children}

      {/* Global Error Modal Pop-up */}
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={hideError}
        error={currentError}
        onSelectSeverity={showDiagnosticError}
      />

      {/* Floating Error Toasts Queue */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3 sm:px-0">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className="pointer-events-auto bg-slate-900/95 border border-rose-500/40 text-white rounded-xl p-3 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-slideDown text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="p-1 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </span>
                <span className="font-medium text-slate-200 truncate">
                  {toast.message}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {toast.error && (
                  <button
                    onClick={() => {
                      if (toast.error) showError(toast.error);
                      setToasts(prev => prev.filter(t => t.id !== toast.id));
                    }}
                    className="text-[11px] font-bold text-amber-300 hover:text-amber-200 underline cursor-pointer"
                  >
                    Detalhes
                  </button>
                )}
                <button
                  onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ErrorContext.Provider>
  );
};

export const useAppError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useAppError must be used within an ErrorProvider');
  }
  return context;
};
