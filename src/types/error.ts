// furreco da sorte
export type ErrorSeverity = 'critico' | 'aviso' | 'conexao' | 'validacao';

export interface AppError {
  id?: string;
  title: string;
  message: string;
  details?: string;
  severity?: ErrorSeverity;
  source?: string;
  timestamp?: Date;
  retryAction?: () => void | Promise<void>;
  retryLabel?: string;
  code?: string | number;
  isDiagnosticTest?: boolean;
}
