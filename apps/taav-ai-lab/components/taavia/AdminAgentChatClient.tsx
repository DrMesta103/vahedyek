'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Bot, Loader2, RefreshCw, Send, Sparkles, UserRound } from 'lucide-react';
import { TaavButton } from '@repo/ui/taav/primitives';
import type { TaaviaChatMessage } from '@/app/lib/types/domain';
import { AI_LAB_TOOLTIPS } from '@/app/lib/tooltips';
import { AiLabSectionLabel, AiLabTooltipIcon } from '@/components/AiLabTooltip';

type AdminAgentChatClientProps = {
  tenantId: string;
  brandId: string;
  brandName: string;
  initialConversationId?: string | null;
  initialMessages: TaaviaChatMessage[];
};

type ConversationResponse = {
  conversation?: {
    id: string;
    messages: TaaviaChatMessage[];
  };
  message?: string;
};

type SendMessageResponse = {
  conversationId?: string;
  userMessage?: TaaviaChatMessage;
  assistantMessage?: TaaviaChatMessage;
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

export function AdminAgentChatClient({
  tenantId,
  brandId,
  brandName,
  initialConversationId = null,
  initialMessages,
}: AdminAgentChatClientProps) {
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState<TaaviaChatMessage[]>(initialMessages);
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
        throw new Error(payload?.message ?? 'بارگذاری گفتگو ناموفق بود.');
      }
      setConversationId(payload.conversation.id);
      setMessages(payload.conversation.messages);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'خطا در بارگذاری گفتگو.');
    } finally {
      setLoading(false);
    }
  }, [tenantId, brandId]);

  useEffect(() => {
    setMessages(initialMessages);
    setConversationId(initialConversationId);
    if (initialMessages.length === 0) {
      void loadConversation();
    } else {
      setLoading(false);
    }
  }, [brandId, tenantId, initialConversationId, initialMessages, loadConversation]);

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
        throw new Error(payload?.message ?? 'ارسال پیام ناموفق بود.');
      }

      if (payload.conversationId) {
        setConversationId(payload.conversationId);
      }

      setMessages((current) => [...current, payload.userMessage!, payload.assistantMessage!]);
    } catch (sendError) {
      setDraft(trimmed);
      setError(sendError instanceof Error ? sendError.message : 'ارسال پیام ناموفق بود.');
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  return (
    <div className="taavia-agent-workspace">
      <aside className="taavia-agent-helper" aria-label="راهنمای گفتگو">
        <div className="taavia-agent-helper-header">
          <Sparkles className="h-4 w-4" aria-hidden />
          <AiLabSectionLabel label="هدف این گفتگو" tooltip={AI_LAB_TOOLTIPS.taavia.chatGoal} />
        </div>
        <ul className="taavia-agent-helper-list">
          <li>معرفی برند</li>
          <li>شناسایی خدمات و محصولات</li>
          <li>آماده‌سازی FAQ</li>
          <li>آماده‌سازی نالج‌بیس</li>
        </ul>
        <p className="taavia-agent-helper-note">
          پاسخ‌های این مرحله شبیه‌سازی‌شده هستند و در آینده به سرویس هوش مصنوعی متصل می‌شوند.
        </p>
      </aside>

      <section className="taavia-agent-chat-panel" aria-label={`گفتگوی ایجنت مدیریت برند ${brandName}`}>
        <header className="taavia-agent-chat-panel-header">
          <div className="taavia-agent-chat-panel-title">
            <span className="taavia-agent-chat-eyebrow">ایجنت مدیریت برند</span>
            <strong>{brandName}</strong>
          </div>
          <span className="taavia-agent-chat-sim-badge">پاسخ شبیه‌سازی‌شده</span>
        </header>

        <p className="taavia-agent-chat-description">
          این چت برای راه‌اندازی و مدیریت دانش برند استفاده می‌شود. پاسخ‌ها فعلاً شبیه‌سازی‌شده هستند و در مراحل بعد به سرویس هوش مصنوعی متصل می‌شوند.
        </p>
        <div className="grid gap-1">
          <AiLabTooltipIcon content={AI_LAB_TOOLTIPS.taavia.adminAgent} label="راهنمای ایجنت" />
          <AiLabTooltipIcon content={AI_LAB_TOOLTIPS.taavia.simBadge} label="راهنمای شبیه‌سازی" />
        </div>

        {error ? (
          <div className="taavia-agent-chat-error" role="alert">
            <span>{error}</span>
            <TaavButton variant="secondary" size="sm" iconStart={<RefreshCw className="h-3.5 w-3.5" />} onClick={() => void loadConversation()}>
              تلاش مجدد
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
                      <span className="taavia-agent-chat-role">{isAssistant ? 'دستیار' : 'شما'}</span>
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
            <div className="taavia-agent-chat-typing" aria-label="در حال تولید پاسخ">
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
            <AiLabSectionLabel label="پیام" tooltip={AI_LAB_TOOLTIPS.taavia.messageInput} />
            <textarea
            ref={textareaRef}
            className="taavia-agent-chat-textarea"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="پیام خود را درباره برند بنویسید..."
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
            {sending ? 'در حال ارسال...' : 'ارسال'}
          </TaavButton>
        </footer>
      </section>
    </div>
  );
}
