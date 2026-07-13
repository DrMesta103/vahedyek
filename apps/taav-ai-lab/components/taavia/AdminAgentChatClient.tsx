'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Bot, Loader2, RefreshCw, Send, Sparkles, UserRound } from 'lucide-react';
import { TaavButton } from '@repo/ui/taav/primitives';
import type { AdminAgentEffectiveModelSummary } from '@/app/lib/repositories/conversations';
import type { TaaviaChatMessage } from '@/app/lib/types/domain';
import { AI_LAB_TOOLTIPS } from '@/app/lib/tooltips';
import { AiLabSectionLabel, AiLabTooltipIcon } from '@/components/AiLabTooltip';

type AdminAgentChatClientProps = {
  tenantId: string;
  brandId: string;
  brandName: string;
  initialConversationId?: string | null;
  initialMessages: TaaviaChatMessage[];
  initialEffectiveModel?: AdminAgentEffectiveModelSummary | null;
};

type ConversationResponse = {
  conversation?: {
    id: string;
    messages: TaaviaChatMessage[];
    effectiveModel?: AdminAgentEffectiveModelSummary | null;
  };
  message?: string;
};

type SendMessageResponse = {
  conversationId?: string;
  userMessage?: TaaviaChatMessage;
  assistantMessage?: TaaviaChatMessage;
  effectiveModel?: AdminAgentEffectiveModelSummary | null;
  message?: string;
};

function formatMessageTime(iso: string) {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

function formatEffectiveModelLabel(model: AdminAgentEffectiveModelSummary | null | undefined) {
  if (!model?.displayName) return 'مدل موثر ادمین';
  const providerPrefix = model.providerLabel ? `${model.providerLabel} / ` : '';
  return `${providerPrefix}${model.displayName}`;
}

function formatEffectiveModelState(model: AdminAgentEffectiveModelSummary | null | undefined) {
  switch (model?.selectionState) {
    case 'override':
      return 'override برند';
    case 'fallback-default':
      return 'fallback ادمین';
    case 'invalid-selection':
      return 'انتخاب قبلی نامعتبر';
    default:
      return 'بدون مدل موثر';
  }
}

export function AdminAgentChatClient({
  tenantId,
  brandId,
  brandName,
  initialConversationId = null,
  initialMessages,
  initialEffectiveModel = null,
}: AdminAgentChatClientProps) {
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState<TaaviaChatMessage[]>(initialMessages);
  const [effectiveModel, setEffectiveModel] = useState<AdminAgentEffectiveModelSummary | null>(initialEffectiveModel);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(initialMessages.length === 0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  }, []);

  const loadConversation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/businesses/${tenantId}/taavia/brands/${brandId}/admin-agent/conversation`,
      );
      const payload = (await response.json().catch(() => null)) as ConversationResponse | null;
      if (!response.ok || !payload?.conversation) {
        throw new Error(payload?.message ?? 'Ø¨Ø§Ø±Ú¯Ø°Ø§Ø±ÛŒ Ú¯ÙØªÚ¯Ùˆ Ù†Ø§Ù…ÙˆÙÙ‚ Ø¨ÙˆØ¯.');
      }
      setConversationId(payload.conversation.id);
      setMessages(payload.conversation.messages);
      setEffectiveModel(payload.conversation.effectiveModel ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Ø®Ø·Ø§ Ø¯Ø± Ø¨Ø§Ø±Ú¯Ø°Ø§Ø±ÛŒ Ú¯ÙØªÚ¯Ùˆ.');
    } finally {
      setLoading(false);
    }
  }, [tenantId, brandId]);

  useEffect(() => {
    setMessages(initialMessages);
    setConversationId(initialConversationId);
    setEffectiveModel(initialEffectiveModel);
    if (initialMessages.length === 0) {
      void loadConversation();
    } else {
      setLoading(false);
    }
  }, [brandId, tenantId, initialConversationId, initialMessages, initialEffectiveModel, loadConversation]);

  useEffect(() => {
    scrollToBottom(messages.length <= 1 ? 'auto' : 'smooth');
  }, [messages, sending, scrollToBottom]);

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed || sending || loading) return;

    setSending(true);
    setError(null);
    setDraft('');

    try {
      const response = await fetch(
        `/api/businesses/${tenantId}/taavia/brands/${brandId}/admin-agent/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: trimmed,
            conversationId,
          }),
        },
      );
      const payload = (await response.json().catch(() => null)) as SendMessageResponse | null;
      if (!response.ok || !payload?.userMessage || !payload?.assistantMessage) {
        throw new Error(payload?.message ?? 'Ø§Ø±Ø³Ø§Ù„ Ù¾ÛŒØ§Ù… Ù†Ø§Ù…ÙˆÙÙ‚ Ø¨ÙˆØ¯.');
      }

      if (payload.conversationId) {
        setConversationId(payload.conversationId);
      }

      setEffectiveModel(payload.effectiveModel ?? null);
      setMessages((current) => [...current, payload.userMessage, payload.assistantMessage] as TaaviaChatMessage[]);
    } catch (sendError) {
      setDraft(trimmed);
      setError(sendError instanceof Error ? sendError.message : 'Ø§Ø±Ø³Ø§Ù„ Ù¾ÛŒØ§Ù… Ù†Ø§Ù…ÙˆÙÙ‚ Ø¨ÙˆØ¯.');
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  return (
    <div className="taavia-agent-workspace">
      <aside className="taavia-agent-helper" aria-label="Ø±Ø§Ù‡Ù†Ù…Ø§ÛŒ Ú¯ÙØªÚ¯Ùˆ">
        <div className="taavia-agent-helper-header">
          <Sparkles className="h-4 w-4" aria-hidden />
          <AiLabSectionLabel label="Ù‡Ø¯Ù Ø§ÛŒÙ† Ú¯ÙØªÚ¯Ùˆ" tooltip={AI_LAB_TOOLTIPS.taavia.chatGoal} />
        </div>
        <ul className="taavia-agent-helper-list">
          <li>Ù…Ø¹Ø±ÙÛŒ Ø¨Ø±Ù†Ø¯</li>
          <li>Ø´Ù†Ø§Ø³Ø§ÛŒÛŒ Ø®Ø¯Ù…Ø§Øª Ùˆ Ù…Ø­ØµÙˆÙ„Ø§Øª</li>
          <li>Ø¢Ù…Ø§Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ FAQ</li>
          <li>Ø¢Ù…Ø§Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ Ù†Ø§Ù„Ø¬â€ŒØ¨ÛŒØ³</li>
        </ul>
        <p className="taavia-agent-helper-note">
          Ù¾Ø§Ø³Ø®â€ŒÙ‡Ø§ÛŒ Ø§ÛŒÙ† Ù…Ø±Ø­Ù„Ù‡ Ø´Ø¨ÛŒÙ‡â€ŒØ³Ø§Ø²ÛŒâ€ŒØ´Ø¯Ù‡ Ù‡Ø³ØªÙ†Ø¯ Ùˆ Ø¯Ø± Ø¢ÛŒÙ†Ø¯Ù‡ Ø¨Ù‡ Ø³Ø±ÙˆÛŒØ³ Ù‡ÙˆØ´ Ù…ØµÙ†ÙˆØ¹ÛŒ Ù…ØªØµÙ„ Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯.
        </p>
      </aside>

      <section className="taavia-agent-chat-panel" aria-label={`Ú¯ÙØªÚ¯ÙˆÛŒ Ø§ÛŒØ¬Ù†Øª Ù…Ø¯ÛŒØ±ÛŒØª Ø¨Ø±Ù†Ø¯ ${brandName}`}>
        <header className="taavia-agent-chat-panel-header">
          <div className="taavia-agent-chat-panel-title">
            <span className="taavia-agent-chat-eyebrow">Ø§ÛŒØ¬Ù†Øª Ù…Ø¯ÛŒØ±ÛŒØª Ø¨Ø±Ù†Ø¯</span>
            <strong>{brandName}</strong>
            <span className="text-[12px] text-[var(--taav-text-muted)]">
              {formatEffectiveModelLabel(effectiveModel)} | {formatEffectiveModelState(effectiveModel)}
            </span>
          </div>
          <span className="taavia-agent-chat-sim-badge">Ù¾Ø§Ø³Ø® Ø´Ø¨ÛŒÙ‡â€ŒØ³Ø§Ø²ÛŒâ€ŒØ´Ø¯Ù‡</span>
        </header>

        <p className="taavia-agent-chat-description">
          Ø§ÛŒÙ† Ú†Øª Ø¨Ø±Ø§ÛŒ Ø±Ø§Ù‡â€ŒØ§Ù†Ø¯Ø§Ø²ÛŒ Ùˆ Ù…Ø¯ÛŒØ±ÛŒØª Ø¯Ø§Ù†Ø´ Ø¨Ø±Ù†Ø¯ Ø§Ø³ØªÙØ§Ø¯Ù‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯. Ù¾Ø§Ø³Ø®â€ŒÙ‡Ø§ ÙØ¹Ù„Ø§Ù‹ Ø´Ø¨ÛŒÙ‡â€ŒØ³Ø§Ø²ÛŒâ€ŒØ´Ø¯Ù‡ Ù‡Ø³ØªÙ†Ø¯ Ùˆ Ø¯Ø± Ù…Ø±Ø§Ø­Ù„ Ø¨Ø¹Ø¯ Ø¨Ù‡ Ø³Ø±ÙˆÛŒØ³ Ù‡ÙˆØ´ Ù…ØµÙ†ÙˆØ¹ÛŒ Ù…ØªØµÙ„ Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯.
        </p>
        <div className="grid gap-1">
          <AiLabTooltipIcon content={AI_LAB_TOOLTIPS.taavia.adminAgent} label="Ø±Ø§Ù‡Ù†Ù…Ø§ÛŒ Ø§ÛŒØ¬Ù†Øª" />
          <AiLabTooltipIcon content={AI_LAB_TOOLTIPS.taavia.simBadge} label="Ø±Ø§Ù‡Ù†Ù…Ø§ÛŒ Ø´Ø¨ÛŒÙ‡â€ŒØ³Ø§Ø²ÛŒ" />
        </div>

        {error ? (
          <div className="taavia-agent-chat-error" role="alert">
            <span>{error}</span>
            <TaavButton variant="secondary" size="sm" iconStart={<RefreshCw className="h-3.5 w-3.5" />} onClick={() => void loadConversation()}>
              ØªÙ„Ø§Ø´ Ù…Ø¬Ø¯Ø¯
            </TaavButton>
          </div>
        ) : null}

        <div className="taavia-agent-chat-messages" aria-live="polite" aria-busy={loading || sending}>
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="taavia-agent-chat-skeleton" aria-hidden />
              ))
            : null}

          {!loading
            ? messages.map((message) => {
                const isAssistant = message.role === 'assistant' || message.role === 'system';
                return (
                  <article
                    key={message.id}
                    className={`taavia-agent-chat-bubble ${isAssistant ? 'is-assistant' : 'is-user'}`}
                  >
                    <div className="taavia-agent-chat-bubble-meta">
                      <span className="taavia-agent-chat-avatar" aria-hidden>
                        {isAssistant ? <Bot className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
                      </span>
                      <span className="taavia-agent-chat-role">{isAssistant ? 'Ø¯Ø³ØªÛŒØ§Ø±' : 'Ø´Ù…Ø§'}</span>
                      <time className="taavia-agent-chat-time" dateTime={message.createdAt}>
                        {formatMessageTime(message.createdAt)}
                      </time>
                    </div>
                    <p className="taavia-agent-chat-content">{message.content}</p>
                  </article>
                );
              })
            : null}

          {sending ? (
            <div className="taavia-agent-chat-typing" aria-label="Ø¯Ø± Ø­Ø§Ù„ ØªÙˆÙ„ÛŒØ¯ Ù¾Ø§Ø³Ø®">
              <span className="taavia-agent-chat-avatar" aria-hidden>
                <Bot className="h-4 w-4" />
              </span>
              <span className="taavia-agent-chat-typing-dots">
                <span />
                <span />
                <span />
              </span>
            </div>
          ) : null}

          <div ref={messagesEndRef} />
        </div>

        <footer className="taavia-agent-chat-composer">
          <div className="grid flex-1 gap-1">
            <AiLabSectionLabel label="Ù¾ÛŒØ§Ù…" tooltip={AI_LAB_TOOLTIPS.taavia.messageInput} />
            <textarea
              ref={textareaRef}
              className="taavia-agent-chat-textarea"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ù¾ÛŒØ§Ù… Ø®ÙˆØ¯ Ø±Ø§ Ø¯Ø±Ø¨Ø§Ø±Ù‡ Ø¨Ø±Ù†Ø¯ Ø¨Ù†ÙˆÛŒØ³ÛŒØ¯..."
              rows={2}
              disabled={loading || sending}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void handleSend();
                }
              }}
            />
          </div>
          <TaavButton
            iconStart={sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            onClick={() => void handleSend()}
            disabled={!draft.trim() || sending || loading}
          >
            {sending ? 'Ø¯Ø± Ø­Ø§Ù„ Ø§Ø±Ø³Ø§Ù„...' : 'Ø§Ø±Ø³Ø§Ù„'}
          </TaavButton>
        </footer>
      </section>
    </div>
  );
}
