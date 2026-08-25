import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";
import { ENDPOINTS } from "../endpoints";
import { COPILOT_UI } from "../copilot.constants";
import {
  sanitizeCopilotHits,
  type CopilotChatRequest,
  type CopilotChatResponse,
  type CopilotHistoryMessage,
  type CopilotQuota,
} from "../copilot.types";
import { COPILOT_QUOTA_QUERY_KEY } from "./useCopilotQuota";

export function lastHistoryForRequest(
  messages: CopilotHistoryMessage[],
): CopilotHistoryMessage[] {
  return messages.slice(-COPILOT_UI.HISTORY_MESSAGES).map((m) => ({
    role: m.role,
    content: m.content,
  }));
}

export function useCopilotChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CopilotChatRequest) => {
      const { data } = await api.post<CopilotChatResponse>(
        ENDPOINTS.copilot.chat,
        {
          message: payload.message,
          history: lastHistoryForRequest(payload.history ?? []),
        },
      );
      return {
        reply: String(data.reply ?? ""),
        hits: sanitizeCopilotHits(data.hits),
        quota: data.quota,
      } satisfies CopilotChatResponse;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<CopilotQuota>(COPILOT_QUOTA_QUERY_KEY, (prev) => ({
        used: data.quota.used,
        remaining: data.quota.remaining,
        limit: data.quota.limit,
        resetAt: prev?.resetAt,
        cooldownUntil: data.quota.cooldownUntil ?? null,
        cooldownRemainingMs: data.quota.cooldownRemainingMs ?? 0,
      }));
      void queryClient.invalidateQueries({ queryKey: COPILOT_QUOTA_QUERY_KEY });
    },
  });
}
