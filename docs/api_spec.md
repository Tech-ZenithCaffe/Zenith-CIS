# API Specifications (Next.js Route Handlers)

Este documento descreve os endpoints da API do Next.js App Router necessários para o funcionamento do sistema, incluindo os métodos, payloads esperados, headers e as estratégias de streaming.

---

## 1. Automação Autónoma (Cron Endpoint)

### `GET /api/cron/trend-analysis`
*   **Descrição**: Executado autonomamente por um agendamento do Vercel Cron. Acorda os Agentes 1 e 2 para recolher o histórico da base de dados e povoar a fila de sugestões.
*   **Headers**:
    *   `Authorization: Bearer <VERCEL_CRON_SECRET>` (Segurança para garantir que apenas o Vercel Cron ativa o endpoint).
*   **Fluxo de Execução**:
    1.  Consulta `competitor_profiles` para obter dados recentes de concorrência.
    2.  Recupera a memória editorial (últimos 10 registos da `content_packages`).
    3.  Chama o Agente 1 para gerar o briefing emocional.
    4.  Passa o briefing para o Agente 2 que gera 3 ideias conceituais.
    5.  Grava as ideias na base de dados com `is_saved = false`.
*   **Response**:
    *   `200 OK`
    *   Payload:
        ```json
        {
          "status": "success",
          "ideas_generated": 3,
          "vibe_created": "UUID-Vibe-Briefing"
        }
        ```

---

## 2. Gestão da Fila de Ideias (Queue Management)

### `GET /api/ideas`
*   **Descrição**: Retorna a fila de ideias conceituais autónomas pendentes de aprovação pelo utilizador, ordenadas por data de criação.
*   **Response**:
    *   `200 OK`
    *   Payload:
        ```json
        [
          {
            "id": "UUID",
            "title": "Nomads Morning Ritual",
            "concept_description": "Um Reel que mostra a transição de um laptop fechado para um cappuccino...",
            "format": "reels",
            "business_goal": "engagement",
            "trend_vibe": {
              "vibe_name": "Cosy Remote Work Vibes",
              "mood_category": "Lifestyle"
            },
            "created_at": "2026-05-29T12:00:00Z"
          }
        ]
        ```

### `POST /api/ideas/approve`
*   **Descrição**: O utilizador aprova uma ideia para produção. A rota marca a ideia como salva (`is_saved = true`) e inicia imediatamente a cadeia de geração sequencial do pacote de conteúdo.
*   **Request Body**:
    ```json
    {
      "idea_id": "UUID",
      "campaign_id": "UUID (Opcional)"
    }
    ```
*   **Streaming de Saída (Server-Sent Events / ReadableStream)**:
    Como esta rota chama o Agente 3 (Roteiros), Agente 4 (Prompts) e Agente 5 (Growth) de forma sequencial, ela envia a resposta de volta ao cliente em pedaços (chunks) para evitar timeouts.
*   **Estrutura dos Eventos do Stream**:
    *   *Chunk 1 (Progresso)*: `{"step": "copywriting", "status": "started"}`
    *   *Chunk 2 (Conteúdo de Escrita)*: `{"step": "copywriting", "data": { "script_flow": [...], "captions": {...} }}`
    *   *Chunk 3 (Progresso)*: `{"step": "prompting", "status": "started"}`
    *   *Chunk 4 (Conteúdo Visual)*: `{"step": "prompting", "data": { "visual_prompts": {...} }}`
    *   *Chunk 5 (Progresso)*: `{"step": "growth", "status": "started"}`
    *   *Chunk 6 (Estratégia Final & Conclusão)*: `{"step": "growth", "data": { "growth_and_engagement": {...} }, "package_id": "UUID-Package-Gravado"}`

---

## 3. Gestão de Conteúdo e Calendário

### `GET /api/packages`
*   **Descrição**: Recupera os pacotes de conteúdo gerados que estão rascunhados (`draft`) ou agendados (`scheduled`) para exibição no calendário visual.
*   **Parameters (Query)**:
    *   `start_date` (Data ISO): Filtrar por janela do calendário.
    *   `end_date` (Data ISO).
*   **Response**:
    *   `200 OK`
    *   Payload:
        ```json
        [
          {
            "id": "UUID",
            "content_idea": {
              "title": "Nomads Morning Ritual",
              "format": "reels"
            },
            "campaign": {
              "name": "Nómadas de Primavera"
            },
            "scheduled_date": "2026-06-02T10:00:00Z",
            "status": "scheduled",
            "captions": {
              "primary_text": "Trabalhar remotamente nunca soube tão bem...",
              "english_translation": "Remote working never tasted so good..."
            }
          }
        ]
        ```

### `PUT /api/packages/[id]`
*   **Descrição**: Permite ao SMM redefinir a data de agendamento (ex. drag-and-drop no calendário), editar o texto final das legendas ou alterar o estado do post.
*   **Request Body**:
    ```json
    {
      "scheduled_date": "2026-06-03T11:30:00Z",
      "status": "published",
      "captions": {
        "primary_text": "Legenda editada manualmente pelo utilizador...",
        "english_translation": "Translated version edited..."
      }
    }
    ```
*   **Response**:
    *   `200 OK`
    *   Payload:
        ```json
        {
          "status": "success",
          "updated_id": "UUID"
        }
        ```
