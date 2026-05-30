# Supabase RLS (Row-Level Security) Policies

Este documento define as regras de acesso de segurança a nível de linha (RLS) para proteger a integridade dos dados e garantir a separação de responsabilidades dos mercados de Portugal e Espanha.

---

## 1. Perfis e Funções (Roles) do Sistema

O sistema utiliza a tabela `profiles` associada ao sistema de autenticação nativo do Supabase (`auth.users`) para ler o nível de acesso do utilizador:

*   `admin`: Acesso total de leitura e escrita em todos os registos e mercados.
*   `creator_portugal`: Acesso de escrita restrito a dados do mercado português (`portugal`). Leitura permitida para referências globais.
*   `creator_spain`: Acesso de escrita restrito a dados do mercado espanhol (`espanha`). Leitura permitida para referências globais.

Para suportar esta separação, as tabelas `competitor_profiles`, `campaigns`, `trend_vibes` e `content_packages` contêm uma coluna `market` (Valores: `portugal` | `spain` | `global`).

---

## 2. Matriz de Permissões por Tabela

Abaixo está o mapeamento conceptual de políticas a implementar nas tabelas da base de dados do Supabase.

### 2.1 Tabela: `profiles`
*   **Regra de Leitura (SELECT)**: Qualquer utilizador autenticado pode ler perfis para identificar autores.
*   **Regra de Escrita (INSERT/UPDATE)**: Apenas o próprio utilizador pode atualizar o seu nome. Apenas `admin` pode alterar a coluna `role`.

### 2.2 Tabela: `competitor_profiles`
*   **Regra de Leitura (SELECT)**: Todos os criadores podem ler concorrentes de qualquer mercado para cruzamento de ideias.
*   **Regra de Escrita (INSERT/UPDATE/DELETE)**:
    *   `creator_portugal` só pode inserir ou editar concorrentes com `market = 'portugal'`.
    *   `creator_spain` só pode inserir ou editar concorrentes com `market = 'spain'`.
    *   `admin` pode editar qualquer registo.

### 2.3 Tabela: `campaigns`
*   **Regra de Leitura (SELECT)**: Leitura pública ou permitida a qualquer utilizador autenticado.
*   **Regra de Escrita (INSERT/UPDATE/DELETE)**:
    *   Filtro estrito por mercado do utilizador. Um criador regional não pode criar ou editar campanhas de outra geografia.

### 2.4 Tabela: `trend_vibes` e `content_ideas`
*   **Regra de Leitura (SELECT)**: Livre para utilizadores autenticados (útil para inspirar equipas do outro lado da fronteira).
*   **Regra de Escrita (INSERT/UPDATE/DELETE)**:
    *   Ciclos autónomos (triggers automáticos por Cron) contornam o RLS usando a role de serviço do Supabase (`service_role`).
    *   Edições manuais por utilizadores autenticados são filtradas pela correspondência entre o seu perfil regional (`role`) e a coluna de mercado associada ao briefing de vibe.

### 2.5 Tabela: `content_packages`
*   **Regra de Leitura (SELECT)**: Utilizadores autenticados podem ler para visualizar o Calendário Editorial unificado.
*   **Regra de Escrita (INSERT/UPDATE/DELETE)**:
    *   **Inserção**: Criadores só podem criar pacotes de conteúdo sob ideias aprovadas que correspondam ao seu mercado.
    *   **Edição/Exclusão**: Apenas o criador responsável pelo mercado respetivo (ou `admin`) pode agendar, editar as cópias das legendas ou alterar o estado para publicação.

---

## 3. Lógica das Políticas (Pseudocódigo de Relações)

Para validar o mercado do utilizador durante as queries, as políticas RLS executarão funções auxiliares baseadas na seguinte lógica lógica (sem código nativo de BD):

1.  **Função Auxiliar `get_user_role()`**:
    *   Lê o ID do utilizador autenticado (`auth.uid()`).
    *   Retorna a role de utilizador guardada em `profiles.role`.

2.  **Lógica da Política de Escrita**:
    ```text
    PERMITIR INSERT/UPDATE SE:
        get_user_role() = 'admin' OR
        (get_user_role() = 'creator_portugal' AND table.market = 'portugal') OR
        (get_user_role() = 'creator_spain' AND table.market = 'spain')
    ```

3.  **Lógica para Tabelas Dependentes (Ex.: `content_packages` e `content_ideas`)**:
    As tabelas dependentes herdam a segurança através de joins relacionais implícitos. Por exemplo, a edição de um `content_package` é validada pelo mercado da `content_idea` a que está associado.
