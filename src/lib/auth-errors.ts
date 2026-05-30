import type { AuthError, AuthErrorCode } from "@/types/auth";

const ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  INVALID_CREDENTIALS: "Email ou palavra-passe incorretos.",
  EMAIL_NOT_CONFIRMED: "Confirma o teu email antes de fazer login.",
  USER_EXISTS: "Já existe uma conta com este email.",
  WEAK_PASSWORD: "A palavra-passe deve ter pelo menos 6 caracteres.",
  NETWORK_ERROR: "Erro de rede. Verifica a tua ligação.",
  UNKNOWN: "Ocorreu um erro inesperado. Tenta novamente.",
};

export function mapAuthError(error: unknown): AuthError {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  let code: AuthErrorCode = "UNKNOWN";
  if (message.includes("invalid login credentials")) code = "INVALID_CREDENTIALS";
  else if (message.includes("email not confirmed")) code = "EMAIL_NOT_CONFIRMED";
  else if (message.includes("user already registered")) code = "USER_EXISTS";
  else if (message.includes("should be at least 6 characters") || message.includes("password should be longer")) code = "WEAK_PASSWORD";
  else if (message.includes("network") || message.includes("fetch")) code = "NETWORK_ERROR";
  return { code, message: ERROR_MESSAGES[code] };
}

export function createAuthError(code: AuthErrorCode): AuthError {
  return { code, message: ERROR_MESSAGES[code] };
}
