import { AppDiagnostics } from "./sync";

export type ClientErrorSource = "error_boundary" | "manual" | "service";

export type ClientErrorLogInput = {
  userId?: string | null;
  source: ClientErrorSource;
  message: string;
  stack?: string | null;
  componentStack?: string | null;
  route?: string | null;
};

export type ClientErrorLogRecord = ClientErrorLogInput & {
  id: string;
  diagnostics: AppDiagnostics;
  createdAt: string;
  updatedAt: string;
  serverUpdatedAt?: unknown;
};
