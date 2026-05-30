/**
 * Tipos de autenticação do sistema.
 */

import type { Profile } from "./database";

/**
 * Estado da sessão do utilizador.
 * Retornado pelos hooks e APIs de autenticação.
 */
export interface AuthState {
  /** Utilizador autenticado (null se não autenticado) */
  user: AuthUser | null;
  /** Se a sessão está a ser carregada */
  loading: boolean;
}

/**
 * Utilizador autenticado com perfil completo.
 * Combina dados do auth.users + profiles.
 */
export interface AuthUser {
  /** ID do utilizador (auth.users.id = profiles.id) */
  id: string;
  /** Email do utilizador */
  email: string;
  /** Nome de exibição */
  name: string;
  /** Role no sistema */
  role: "admin" | "creator_portugal" | "creator_spain";
  /** Mercado primário */
  market: "portugal" | "spain";
  /** URL do avatar (opcional) */
  avatarUrl: string | null;
}

/**
 * Erros de autenticação mapeados para mensagens amigáveis.
 */
export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "EMAIL_NOT_CONFIRMED"
  | "USER_EXISTS"
  | "WEAK_PASSWORD"
  | "NETWORK_ERROR"
  | "UNKNOWN";

/**
 * Resultado de uma operação de autenticação.
 */
export type AuthResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: AuthError };

export interface AuthError {
  code: AuthErrorCode;
  message: string;
}

/**
 * Input do formulário de login.
 */
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Input do formulário de registo.
 */
export interface SignUpInput {
  email: string;
  password: string;
  name: string;
}

/**
 * Converte um Profile da BD para AuthUser.
 */
export function profileToAuthUser(profile: Profile): AuthUser {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role,
    market: profile.market,
    avatarUrl: profile.avatar_url,
  };
}
