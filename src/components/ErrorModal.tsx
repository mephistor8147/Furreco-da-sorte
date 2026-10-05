// furreco da sorte
import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  WifiOff,
  ServerCrash,
  X,
  RefreshCw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles,
} from 'lucide-react';
import { AppError, ErrorSeverity } from '../types/error';
import { playErrorSound } from '../utils/notificationService';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: AppError | null;
  onSelectSeverity?: (severity: ErrorSeverity) => void;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  error,
  onSelectSeverity,
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Play subtle error audio cue on open
  useEffect(() => {
    if (isOpen) {
      playErrorSound();
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset states when error changes
  useEffect(() => {
    if (error) {
      setShowTechnicalDetails(false);
      setCopied(false);
      setIsRetrying(false);
    }
  }, [error]);

  if (!isOpen || !error) return null;

  const handleCopyDetails = () => {
    const text =
      `⚠️ *RELATÓRIO DE ERRO - FURRECO DA SORTE*\n` +
      `📅 Data/Hora: ${error.timestamp ? error.timestamp.toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR')}\n` +
      `🏷️ Título: ${error.title}\n` +
      `📌 Mensagem: ${error.message}\n` +
      (error.code ? `🔢 Código: ${error.code}\n` : '') +
      (error.source ? `🌐 Origem: ${error.source}\n` : '') +
      (error.details ? `🔍 Detalhes Técnicos:\n${error.details}\n` : '') +
      `\nConsulte o Furreco da Sorte para suporte.`;

    try {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleRetry = async () => {
    if (!error.retryAction) return;
    setIsRetrying(true);
    try {
      await error.retryAction();
      onClose();
    } catch {
      // Keep modal open if retry fails
    } finally {
      setIsRetrying(false);
    }
  };

  // Icon and accent based on severity
  const getSeverityStyle = () => {
    switch (error.severity) {
      case 'conexao':
        return {
          icon: <WifiOff className="w-6 h-6 text-amber-400" />,
          badgeColor: 'text-amber-300 bg-amber-950/60 border-amber-500/30',
          borderColor: 'border-amber-500/40',
          glowColor: 'bg-amber-500/10',
          label: 'Falha de Conexão',
        };
      case 'validacao':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-cyan-400" />,
          badgeColor: 'text-cyan-300 bg-cyan-950/60 border-cyan-500/30',
          borderColor: 'border-cyan-500/40',
          glowColor: 'bg-cyan-500/10',
          label: 'Validação de Entrada',
        };
      case 'aviso':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
          badgeColor: 'text-amber-300 bg-amber-950/60 border-amber-500/30',
          borderColor: 'border-amber-500/40',
          glowColor: 'bg-amber-500/10',
          label: 'Aviso do Sistema',
        };
      case 'critico':
      default:
        return {
          icon: <ServerCrash className="w-6 h-6 text-rose-400" />,
          badgeColor: 'text-rose-300 bg-rose-950/60 border-rose-500/30',
          borderColor: 'border-rose-500/40',
          glowColor: 'bg-rose-500/10',
          label: 'Erro do Sistema',
        };
    }
  };

  const style = getSeverityStyle();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="error-modal-title"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`bg-slate-900 border ${style.borderColor} rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden text-white relative transition-all`}
        onClick={e => e.stopPropagation()}
      >
        {/* Subtle background glow */}
        <div className={`absolute top-0 right-0 w-64 h-64 ${style.glowColor} rounded-full blur-3xl pointer-events-none`} />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0 shadow-inner">
              {style.icon}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${style.badgeColor}`}>
                  {style.label}
                </span>
                {error.source && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {error.source}
                  </span>
                )}
              </div>
              <h3 id="error-modal-title" className="text-base sm:text-lg font-black text-white leading-tight">
                {error.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Fechar (Esc)"
            aria-label="Fechar pop-up de erro"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs sm:text-sm relative z-10 scrollbar-thin">
          {/* Main Error Explanation */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 sm:p-4 text-slate-200 leading-relaxed space-y-2">
            <p className="font-medium text-slate-200">
              {error.message}
            </p>

            {error.severity === 'conexao' && (
              <p className="text-[11px] sm:text-xs text-amber-300/90 font-normal">
                💡 <strong>Dica de Contingência:</strong> A Caixa Econômica Federal atualiza seus servidores após cada sorteio. Enquanto isso, o Furreco mantém a base de dados em cache local para você continuar consultando normalmente.
              </p>
            )}

            {error.severity === 'validacao' && (
              <p className="text-[11px] sm:text-xs text-cyan-300/90 font-normal">
                💡 <strong>Regra Oficial:</strong> Os bilhetes da Loteria Federal contêm 5 algarismos (00000 a 99999). Cada bilhete concorre aos 5 prêmios principais e às milhares, centenas e dezenas correlatas.
              </p>
            )}
          </div>

          {/* Interactive Severity Simulator for Diagnostics */}
          {(error.isDiagnosticTest || onSelectSeverity) && (
            <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Simular Outros Tipos de Erro:
                </span>
                <span className="text-[10px] text-slate-400 font-mono">4 Severidades</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-bold">
                <button
                  onClick={() => onSelectSeverity && onSelectSeverity('conexao')}
                  className={`px-2 py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                    error.severity === 'conexao'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 ring-1 ring-amber-400'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                  title="Simular falha de rede/conexão"
                >
                  📡 Conexão
                </button>
                <button
                  onClick={() => onSelectSeverity && onSelectSeverity('validacao')}
                  className={`px-2 py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                    error.severity === 'validacao'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 ring-1 ring-cyan-400'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                  title="Simular erro de validação de formulário/bilhete"
                >
                  ⚠️ Validação
                </button>
                <button
                  onClick={() => onSelectSeverity && onSelectSeverity('aviso')}
                  className={`px-2 py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                    error.severity === 'aviso'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 ring-1 ring-amber-400'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                  title="Simular aviso informativo do sistema"
                >
                  💡 Aviso
                </button>
                <button
                  onClick={() => onSelectSeverity && onSelectSeverity('critico')}
                  className={`px-2 py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                    error.severity === 'critico'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 ring-1 ring-rose-400'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                  title="Simular erro crítico com contingência"
                >
                  🚨 Crítico
                </button>
              </div>
            </div>
          )}

          {/* Reassurance badge */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 text-xs">
            <Info className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="leading-snug">
              Seus bilhetes salvos, preferências e histórico continuam intactos e protegidos no dispositivo.
            </span>
          </div>

          {/* Technical Details Accordion */}
          {(error.details || error.code) && (
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
              <button
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                className="w-full px-3 py-2.5 text-xs text-slate-400 hover:text-slate-200 flex items-center justify-between font-mono cursor-pointer transition-colors"
              >
                <span>Diagnóstico Técnico {error.code ? `[${error.code}]` : ''}</span>
                {showTechnicalDetails ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {showTechnicalDetails && (
                <div className="p-3 border-t border-slate-800 text-[11px] font-mono text-slate-300 bg-slate-950 space-y-2 overflow-x-auto">
                  {error.details && (
                    <pre className="whitespace-pre-wrap leading-relaxed text-slate-400 break-all">
                      {error.details}
                    </pre>
                  )}
                  {error.timestamp && (
                    <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                      Ocorrido às {error.timestamp.toLocaleTimeString('pt-BR')} do dia {error.timestamp.toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-950/80 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 relative z-10">
          <button
            onClick={handleCopyDetails}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] active:scale-95"
            title="Copiar relatório deste erro para diagnóstico"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Detalhes Copiados!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copiar Detalhes</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            {error.retryAction && (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md min-h-[38px] active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>{isRetrying ? 'Tentando...' : error.retryLabel || 'Tentar Novamente'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer min-h-[38px] active:scale-95 text-center"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
