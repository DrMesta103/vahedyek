'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Camera, CheckCircle2, Download, FileText, Loader2, Maximize2, Mic, Minimize2, Pause, Plus, Reply, Send, Smile, Tag, Upload, X } from 'lucide-react';
import { Input } from '@repo/ui';
import { MinimalScroll } from './MinimalScroll';
import { currentAppConfig } from '../config/current';
import { useAuthContext } from '../hooks/useAuthContext';
import { DEFAULT_DOC_TYPES, THREAD_PRIORITIES, type PageMessageRecord, type PageThreadRecord, type ThreadPriority } from '../lib/page-threads';

type WidgetMode = 'threads' | 'wizard' | 'chat';
type ThreadScope = 'page' | 'app';

type ThreadsResponse = {
  pagePath: string;
  pageKey: string;
  threads: PageThreadRecord[];
};

type CreateThreadResponse = { success: true; threadId: string; pageKey: string; pagePath: string } | { message?: string };

const PRIORITY_LABELS: Record<ThreadPriority, string> = {
  p0: 'خیلی فوری',
  p1: 'فوری',
  p2: 'عادی',
  p3: 'کم‌اهمیت',
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function getThreadScopeLabel(scope: ThreadScope) {
  return scope === 'app' ? 'همه گفتگوهای اپ' : 'گفتگوهای همین صفحه';
}

function actionButtonClass(primary = false) {
  return primary
    ? 'app-button app-button-primary rounded-xl px-4 py-2 text-sm font-bold'
    : 'app-button rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface)] px-4 py-2 text-sm font-medium text-[color:var(--text-body)]';
}

function chipClass() {
  return 'inline-flex items-center rounded-full bg-[color:var(--surface-soft)] px-2.5 py-1 text-xs font-medium text-[color:var(--text-body)]';
}

function activeChipClass(active: boolean) {
  return `inline-flex items-center rounded-full px-3 py-1 text-xs font-bold transition ${
    active
      ? 'bg-[color:var(--theme-accent)] text-white'
      : 'bg-[color:var(--surface-soft)] text-[color:var(--text-body)] hover:bg-[color:var(--surface)]'
  }`;
}

const fieldClassName =
  'border-[color:var(--border-color)] bg-[color:var(--surface-soft)] text-[color:var(--text-body)] placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--theme-accent)] focus:ring-[color:var(--theme-accent)]';

function messageBubbleClass(mine: boolean) {
  return `rounded-[18px] px-4 py-3 shadow-[0_10px_28px_var(--shadow-soft)] ${
    mine
      ? 'border border-[color:var(--border-color)] bg-[color:var(--surface)] text-[color:var(--text-body)]'
      : 'bg-[color:var(--theme-accent)] text-white'
  }`;
}

function messageReplyClass(mine: boolean) {
  return `mb-2 rounded-xl px-3 py-2 text-xs ${
    mine ? 'bg-[color:var(--surface-soft)] text-[color:var(--text-muted)]' : 'bg-white/15 text-white/85'
  }`;
}

function messageAttachmentClass(mine: boolean) {
  return mine ? 'bg-[color:var(--surface-soft)]' : 'bg-white/10';
}

async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('خواندن فایل انجام نشد.'));
    reader.readAsDataURL(file);
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function dataUrlToFile(dataUrl: string, filename: string) {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header?.match(/data:(.*?);base64/);
  const mimeType = mimeMatch?.[1] || 'application/octet-stream';
  const bytes = atob(base64 || '');
  const array = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) array[i] = bytes.charCodeAt(i);
  return new File([array], filename, { type: mimeType });
}

type ScreenshotStep = null | 'select' | 'edit';

type UiMessage = PageMessageRecord & { pending?: boolean };

export default function PageDocsWidget() {
  const pathname = usePathname();
  const { data: authContext } = useAuthContext();
  const currentUserId = authContext?.user?.id ?? null;

  const [widgetPos, setWidgetPos] = useState<{ x: number; y: number } | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recording, setRecording] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [mode, setMode] = useState<WidgetMode>('threads');
  const [threadScope, setThreadScope] = useState<ThreadScope>('page');
  const [threads, setThreads] = useState<PageThreadRecord[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [requestedThreadId, setRequestedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [wizardTitle, setWizardTitle] = useState('');
  const [wizardDocType, setWizardDocType] = useState<string>('free');
  const [wizardDocTypeInput, setWizardDocTypeInput] = useState('');
  const [wizardPriority, setWizardPriority] = useState<ThreadPriority>('p2');
  const [wizardLabelsInput, setWizardLabelsInput] = useState('');

  const [composerText, setComposerText] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<PageMessageRecord | null>(null);
  const [error, setError] = useState('');
  const [pageKey, setPageKey] = useState('');
  const [buzz, setBuzz] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<Record<string, number>>({});
  const [screenshotStep, setScreenshotStep] = useState<ScreenshotStep>(null);
  const [screenshotRect, setScreenshotRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [screenshotBaseDataUrl, setScreenshotBaseDataUrl] = useState<string | null>(null);
  const [screenshotColor, setScreenshotColor] = useState<string>('#ef4444');

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const screenshotStartRef = useRef<{ x: number; y: number } | null>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawingRef = useRef(false);
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef<{ dx: number; dy: number } | null>(null);
  const audioElsRef = useRef<Record<string, HTMLAudioElement | null>>({});
  const recordingVizCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const recordingAudioCtxRef = useRef<AudioContext | null>(null);
  const recordingAnalyserRef = useRef<AnalyserNode | null>(null);
  const recordingRafRef = useRef<number | null>(null);
  const emojiPopoverRef = useRef<HTMLDivElement | null>(null);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) ?? null,
    [selectedThreadId, threads],
  );

  const parsedLabels = useMemo(() => {
    return Array.from(
      new Set(
        wizardLabelsInput
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean)
          .slice(0, 12),
      ),
    );
  }, [wizardLabelsInput]);

  useEffect(() => {
    setOpen(false);
    setMode('threads');
    setThreadScope('page');
    setError('');
    setSelectedThreadId(null);
    setRequestedThreadId(null);
    setMessages([]);
    setReplyTo(null);
    setMaximized(false);
  }, [pathname]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setBuzz(true);
      window.setTimeout(() => setBuzz(false), 600);
    }, 9000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem('devDocsWidgetPos:v1');
      if (raw) {
        const parsed = JSON.parse(raw) as { x?: unknown; y?: unknown };
        if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
          const x = clamp(parsed.x, 12, window.innerWidth - 60);
          const y = clamp(parsed.y, 12, window.innerHeight - 60);
          setWidgetPos({ x, y });
          return;
        }
      }
    } catch {
      /* ignore */
    }
    setWidgetPos({ x: 16, y: Math.round(window.innerHeight / 2 - 22) });
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key === 'Escape' && screenshotStep) {
        setScreenshotStep(null);
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screenshotStep]);

  useEffect(() => {
    if (!emojiOpen) return;
    const onDown = (event: MouseEvent) => {
      const node = emojiPopoverRef.current;
      if (!node) return;
      if (event.target instanceof Node && !node.contains(event.target)) {
        setEmojiOpen(false);
      }
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [emojiOpen]);

  useEffect(() => {
    const handleOpenRequest = (event: Event) => {
      const detail =
        event instanceof CustomEvent
          ? (event.detail as { scope?: ThreadScope; threadId?: string } | undefined)
          : undefined;
      const nextScope = detail?.scope === 'app' ? 'app' : 'page';

      setOpen(true);
      setMode('threads');
      setThreadScope(nextScope);
      setRequestedThreadId(typeof detail?.threadId === 'string' ? detail.threadId : null);
      setSelectedThreadId(null);
      setMessages([]);
      setReplyTo(null);
      setError('');
    };

    window.addEventListener('vahedyek:page-docs-open', handleOpenRequest);
    return () => window.removeEventListener('vahedyek:page-docs-open', handleOpenRequest);
  }, []);

  const fetchThreads = async (scope: ThreadScope) => {
    const query =
      scope === 'app'
        ? '/api/page-threads?scope=app'
        : `/api/page-threads?pagePath=${encodeURIComponent(pathname)}`;
    const response = await fetch(query, { cache: 'no-store' });
    const payload = (await response.json().catch(() => null)) as ThreadsResponse | { message?: string } | null;
    if (!response.ok) throw new Error((payload as { message?: string } | null)?.message || 'بارگذاری گفتگوها انجام نشد.');
    return payload as ThreadsResponse;
  };

  const loadThreads = async (scope: ThreadScope = threadScope) => {
    setLoading(true);
    setError('');
    try {
      const payload = await fetchThreads(scope);
      setThreads(payload.threads);
      setPageKey(payload.pageKey);
      if (requestedThreadId) {
        const requestedThread = payload.threads.find((thread) => thread.id === requestedThreadId) ?? null;
        setRequestedThreadId(null);
        if (requestedThread) {
          await openChat(requestedThread);
          return;
        }
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'بارگذاری گفتگوها انجام نشد.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open || mode !== 'threads') return;
    void loadThreads(threadScope);
  }, [open, mode, threadScope, requestedThreadId]);

  const openDrawer = async () => {
    if (open) {
      setOpen(false);
      setMode('threads');
      return;
    }
    setOpen(true);
    setMode('threads');
    setThreadScope('page');
  };

  const resetWizard = () => {
    setWizardTitle('');
    setWizardDocType('free');
    setWizardDocTypeInput('');
    setWizardPriority('p2');
    setWizardLabelsInput('');
    setError('');
  };

  const openWizard = () => {
    resetWizard();
    setMode('wizard');
  };

  const loadMessages = async (threadId: string) => {
    setLoadingMessages(true);
    setError('');
    try {
      const response = await fetch(`/api/page-threads/${threadId}/messages`, { cache: 'no-store' });
      const payload = (await response.json().catch(() => null)) as { messages?: PageMessageRecord[]; message?: string } | null;
      if (!response.ok) throw new Error(payload?.message || 'بارگذاری پیام‌ها انجام نشد.');
      setMessages(payload?.messages ?? []);
      requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'بارگذاری پیام‌ها انجام نشد.');
    } finally {
      setLoadingMessages(false);
    }
  };

  const upsertOptimisticMessage = (tempId: string, message: PageMessageRecord | null) => {
    if (!message) return;
    setMessages((current) => current.map((m) => (m.id === tempId ? ({ ...message, pending: false } as UiMessage) : m)));
  };

  const openChat = async (thread: PageThreadRecord) => {
    setSelectedThreadId(thread.id);
    setThreads((current) => current.map((item) => (item.id === thread.id ? { ...item, isOpened: true } : item)));
    setMode('chat');
    setReplyTo(null);
    await loadMessages(thread.id);
  };

  const sendAttachmentMessage = async (file: File, type: 'image' | 'audio' | 'pdf') => {
    if (!selectedThreadId) throw new Error('هیچ گفتگویی انتخاب نشده است.');

    const dataUrl = await fileToDataUrl(file);
    const tempId = `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const optimistic: UiMessage = {
      id: tempId,
      threadId: selectedThreadId,
      messageType: type,
      text: null,
      attachmentDataUrl: dataUrl,
      attachmentMimeType: file.type || null,
      attachmentName: file.name || null,
      attachmentSize: file.size || null,
      replyToMessageId: replyTo?.id ?? null,
      createdAt: new Date().toISOString(),
      author: authContext?.user
        ? {
            id: authContext.user.id,
            fullName: authContext.user.fullName,
            email: authContext.user.email ?? '',
          }
        : null,
      replyTo: replyTo ? { id: replyTo.id, messageType: replyTo.messageType, text: replyTo.text } : null,
      pending: true,
    };
    setMessages((current) => [...current, optimistic]);
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    });

    try {
      const response = await fetch(`/api/page-threads/${selectedThreadId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageType: type,
          replyToMessageId: replyTo?.id ?? null,
          attachment: {
            dataUrl,
            mimeType: file.type || (type === 'pdf' ? 'application/pdf' : null),
            name: file.name,
            size: file.size,
          },
        }),
      });
      const payload = (await response.json().catch(() => null)) as { message?: string | PageMessageRecord | null; success?: boolean } | null;
      if (!response.ok) throw new Error((payload as { message?: string } | null)?.message || 'ارسال فایل انجام نشد.');
      setReplyTo(null);
      upsertOptimisticMessage(tempId, (payload as { message?: PageMessageRecord | null } | null)?.message ?? null);
    } catch (error) {
      setMessages((current) => current.filter((m) => m.id !== tempId));
      throw error;
    }
  };

  const startScreenshot = () => {
    if (!selectedThreadId) {
      setError('برای ارسال اسکرین‌شات، ابتدا یک گفتگو را باز کن.');
      return;
    }
    setError('');
    setScreenshotRect(null);
    setScreenshotBaseDataUrl(null);
    setScreenshotStep('select');
    setOpen(false);
  };

  const captureSelectedRect = async (rect: { x: number; y: number; width: number; height: number }) => {
    const { default: html2canvas } = await import('html2canvas');
    const options = {
      backgroundColor: null as string | null,
      useCORS: true,
      logging: false,
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight,
      scrollX: 0,
      scrollY: -window.scrollY,
      onclone: (doc: Document) => {
        // Workaround for html2canvas not supporting oklab/oklch in some CSS.
        doc.querySelectorAll<HTMLElement>('[style]').forEach((el) => {
          const style = el.getAttribute('style') || '';
          if (style.includes('oklab(') || style.includes('oklch(')) {
            el.removeAttribute('style');
          }
        });
        doc.querySelectorAll('style').forEach((styleEl) => {
          const text = styleEl.textContent || '';
          if (text.includes('oklab(') || text.includes('oklch(')) {
            styleEl.textContent = text
              .replace(/oklab\([^)]*\)/g, 'rgb(0,0,0)')
              .replace(/oklch\([^)]*\)/g, 'rgb(0,0,0)');
          }
        });
      },
    };

    let canvas: HTMLCanvasElement;
    try {
      canvas = await html2canvas(document.body, options);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('oklab') && !message.includes('oklch')) throw error;

      // HARD fallback: use Screen Capture API to avoid CSS parsing entirely.
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' as unknown as string },
        audio: false,
      });
      try {
        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();
        await new Promise<void>((resolve) => setTimeout(resolve, 200));

        const devicePixelRatio = window.devicePixelRatio || 1;
        const cropX = Math.floor((rect.x + window.scrollX) * devicePixelRatio);
        const cropY = Math.floor((rect.y + window.scrollY) * devicePixelRatio);
        const cropW = Math.floor(rect.width * devicePixelRatio);
        const cropH = Math.floor(rect.height * devicePixelRatio);

        const full = document.createElement('canvas');
        full.width = Math.max(1, Math.floor(video.videoWidth));
        full.height = Math.max(1, Math.floor(video.videoHeight));
        const fullCtx = full.getContext('2d');
        if (!fullCtx) throw new Error('Canvas در دسترس نیست.');
        fullCtx.drawImage(video, 0, 0, full.width, full.height);

        const out = document.createElement('canvas');
        out.width = Math.max(1, cropW);
        out.height = Math.max(1, cropH);
        const outCtx = out.getContext('2d');
        if (!outCtx) throw new Error('Canvas در دسترس نیست.');
        outCtx.drawImage(full, cropX, cropY, cropW, cropH, 0, 0, out.width, out.height);
        return out.toDataURL('image/png');
      } finally {
        stream.getTracks().forEach((track) => track.stop());
      }
    }

    const devicePixelRatio = window.devicePixelRatio || 1;
    const cropX = Math.floor((rect.x + window.scrollX) * devicePixelRatio);
    const cropY = Math.floor((rect.y + window.scrollY) * devicePixelRatio);
    const cropW = Math.floor(rect.width * devicePixelRatio);
    const cropH = Math.floor(rect.height * devicePixelRatio);

    const out = document.createElement('canvas');
    out.width = Math.max(1, cropW);
    out.height = Math.max(1, cropH);
    const outCtx = out.getContext('2d');
    if (!outCtx) throw new Error('Canvas در دسترس نیست.');
    outCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, out.width, out.height);
    return out.toDataURL('image/png');
  };

  const openEditorForRect = async (rect: { x: number; y: number; width: number; height: number }) => {
    setSaving(true);
    setError('');
    try {
      const dataUrl = await captureSelectedRect(rect);
      setScreenshotBaseDataUrl(dataUrl);
      setScreenshotStep('edit');
    } catch (captureError) {
      setScreenshotStep(null);
      setError(captureError instanceof Error ? captureError.message : 'اسکرین‌شات انجام نشد.');
      setOpen(true);
    } finally {
      setSaving(false);
    }
  };

  const confirmScreenshot = async () => {
    if (!screenshotBaseDataUrl) return;
    try {
      const baseImg = new Image();
      baseImg.src = screenshotBaseDataUrl;
      await new Promise<void>((resolve, reject) => {
        baseImg.onload = () => resolve();
        baseImg.onerror = () => reject(new Error('لود تصویر انجام نشد.'));
      });

      const out = document.createElement('canvas');
      out.width = baseImg.naturalWidth;
      out.height = baseImg.naturalHeight;
      const outCtx = out.getContext('2d');
      if (!outCtx) throw new Error('Canvas در دسترس نیست.');
      outCtx.drawImage(baseImg, 0, 0);
      if (drawCanvasRef.current) {
        outCtx.drawImage(drawCanvasRef.current, 0, 0);
      }

      const finalDataUrl = out.toDataURL('image/png');
      const file = dataUrlToFile(finalDataUrl, 'screenshot.png');
      setScreenshotStep(null);
      setOpen(true);
      await sendAttachmentMessage(file, 'image');
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'ارسال اسکرین‌شات انجام نشد.');
      setScreenshotStep(null);
      setOpen(true);
    }
  };

  const toggleRecording = async () => {
    if (recording) {
      recorderRef.current?.stop();
      setRecording(false);
      if (recordingRafRef.current) cancelAnimationFrame(recordingRafRef.current);
      recordingRafRef.current = null;
      recordingAnalyserRef.current = null;
      recordingAudioCtxRef.current?.close().catch(() => null);
      recordingAudioCtxRef.current = null;
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      try {
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        recordingAudioCtxRef.current = audioCtx;
        recordingAnalyserRef.current = analyser;

        const draw = () => {
          const canvas = recordingVizCanvasRef.current;
          const an = recordingAnalyserRef.current;
          if (!canvas || !an) return;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          const data = new Uint8Array(an.frequencyBinCount);
          an.getByteFrequencyData(data);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const bars = 18;
          const step = Math.floor(data.length / bars);
          const gap = 2;
          const barW = (canvas.width - gap * (bars - 1)) / bars;
          for (let i = 0; i < bars; i++) {
            const v = data[i * step] || 0;
            const h = (v / 255) * canvas.height;
            const x = i * (barW + gap);
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.fillRect(x, canvas.height - h, barW, Math.max(2, h));
          }
          recordingRafRef.current = requestAnimationFrame(draw);
        };
        recordingRafRef.current = requestAnimationFrame(draw);
      } catch {
        // ignore visualizer failures
      }

      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const file = new File([blob], 'voice-note.webm', { type: blob.type });
        try {
          await sendAttachmentMessage(file, 'audio');
        } catch (sendError) {
          setError(sendError instanceof Error ? sendError.message : 'ارسال ویس انجام نشد.');
        }
        stream.getTracks().forEach((track) => track.stop());
      };
      recorder.start();
      setRecording(true);
    } catch {
      setError('دسترسی میکروفون در دسترس نیست.');
    }
  };

  const handleCreateThread = async () => {
    if (!wizardTitle.trim()) {
      setError('عنوان گفتگو الزامی است.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/page-threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pagePath: pathname,
          title: wizardTitle.trim(),
          docType: wizardDocType.trim(),
          priority: wizardPriority,
          labels: parsedLabels,
        }),
      });
      const payload = (await response.json().catch(() => null)) as CreateThreadResponse | null;
      if (!response.ok) throw new Error((payload as { message?: string } | null)?.message || 'ایجاد گفتگو انجام نشد.');
      if (!payload || !('threadId' in payload)) throw new Error('ایجاد گفتگو انجام نشد.');

      const refreshed = await fetchThreads(threadScope);
      setThreads(refreshed.threads);
      setPageKey(refreshed.pageKey);
      const createdThread = refreshed.threads.find((t) => t.id === payload.threadId) ?? null;
      if (createdThread) {
        await openChat(createdThread);
      } else {
        setMode('threads');
      }
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'ایجاد گفتگو انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  const sendTextMessage = async () => {
    if (!selectedThreadId) return;
    if (!composerText.trim()) return;

    const text = composerText.trim();
    setComposerText('');

    try {
      const tempId = `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const optimistic: UiMessage = {
        id: tempId,
        threadId: selectedThreadId,
        messageType: 'text',
        text,
        attachmentDataUrl: null,
        attachmentMimeType: null,
        attachmentName: null,
        attachmentSize: null,
        replyToMessageId: replyTo?.id ?? null,
        createdAt: new Date().toISOString(),
        author: authContext?.user
          ? { id: authContext.user.id, fullName: authContext.user.fullName, email: authContext.user.email ?? '' }
          : null,
        replyTo: replyTo ? { id: replyTo.id, messageType: replyTo.messageType, text: replyTo.text } : null,
        pending: true,
      };
      setMessages((current) => [...current, optimistic]);
      requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      });

      const response = await fetch(`/api/page-threads/${selectedThreadId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageType: 'text',
          text,
          replyToMessageId: replyTo?.id ?? null,
        }),
      });
      const payload = (await response.json().catch(() => null)) as { message?: string | PageMessageRecord | null } | null;
      if (!response.ok) throw new Error((payload as { message?: string } | null)?.message || 'ارسال پیام انجام نشد.');
      setReplyTo(null);
      upsertOptimisticMessage(tempId, (payload as { message?: PageMessageRecord | null } | null)?.message ?? null);
    } catch (sendError) {
      setComposerText(text);
      setError(sendError instanceof Error ? sendError.message : 'ارسال پیام انجام نشد.');
    }
  };

  /** Same default on server and first client paint to avoid hydration mismatch; real position comes from state after mount. */
  const defaultWidgetTop = 120;

  return (
    <>
      <style>{`
        @keyframes devDocsBuzz {
          0% { transform: translate(0, 0) rotate(0deg); }
          18% { transform: translate(-2px, 0) rotate(-3deg); }
          36% { transform: translate(2px, 0) rotate(3deg); }
          54% { transform: translate(-2px, 0) rotate(-2deg); }
          72% { transform: translate(2px, 0) rotate(2deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        @keyframes devDocsEqualize {
          0%, 100% { transform: scaleY(0.35); }
          50% { transform: scaleY(1); }
        }
      `}</style>

      {screenshotStep ? (
        <div
          className="fixed inset-0 z-[9999] bg-black/40"
          onPointerDown={(event) => {
            if (screenshotStep !== 'select') return;
            const x = clamp(event.clientX, 0, window.innerWidth);
            const y = clamp(event.clientY, 0, window.innerHeight);
            screenshotStartRef.current = { x, y };
            setScreenshotRect({ x, y, width: 1, height: 1 });
          }}
          onPointerMove={(event) => {
            if (screenshotStep !== 'select') return;
            if (!screenshotStartRef.current) return;
            const x2 = clamp(event.clientX, 0, window.innerWidth);
            const y2 = clamp(event.clientY, 0, window.innerHeight);
            const x1 = screenshotStartRef.current.x;
            const y1 = screenshotStartRef.current.y;
            const next = {
              x: Math.min(x1, x2),
              y: Math.min(y1, y2),
              width: Math.abs(x2 - x1),
              height: Math.abs(y2 - y1),
            };
            setScreenshotRect(next);
          }}
          onPointerUp={() => {
            if (screenshotStep !== 'select') return;
            const rect = screenshotRect;
            screenshotStartRef.current = null;
            if (!rect || rect.width < 12 || rect.height < 12) {
              setScreenshotRect(null);
              return;
            }
            void openEditorForRect(rect);
          }}
        >
          <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 shadow">
            ناحیه را انتخاب کن. (Esc برای خروج)
          </div>
          <button
            type="button"
            className="absolute left-6 top-4 inline-flex items-center justify-center rounded-xl bg-white/90 p-2 text-slate-700 shadow"
            onClick={() => {
              setScreenshotStep(null);
              setOpen(true);
            }}
            title="انصراف"
          >
            <X className="h-5 w-5" />
          </button>

          {screenshotRect && screenshotStep === 'select' ? (
            <div
              className="absolute border-2 border-white bg-white/10"
              style={{ left: screenshotRect.x, top: screenshotRect.y, width: screenshotRect.width, height: screenshotRect.height }}
            />
          ) : null}

          {screenshotStep === 'edit' && screenshotBaseDataUrl ? (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="flex h-[min(92vh,860px)] w-[min(92vw,980px)] flex-col overflow-hidden rounded-[26px] border border-white/30 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.25)]">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white px-4 py-3">
                  <div className="text-sm font-black text-slate-900">ویرایش اسکرین‌شات</div>
                  <div className="flex items-center gap-2">
                    {['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#a855f7'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`h-8 w-8 rounded-full border ${screenshotColor === color ? 'border-slate-900' : 'border-slate-200'}`}
                        style={{ background: color }}
                        onClick={() => setScreenshotColor(color)}
                        title="رنگ"
                      />
                    ))}
                    <button type="button" className="ml-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold" onClick={() => confirmScreenshot()}>
                      تایید و ارسال
                    </button>
                  </div>
                </div>

                <MinimalScroll variant="both" className="relative flex-1 bg-slate-50 p-4">
                  <div className="relative mx-auto w-fit">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={screenshotBaseDataUrl}
                      alt="screenshot"
                      className="max-h-[70vh] max-w-[86vw] rounded-xl border border-slate-200 bg-white"
                      onLoad={(event) => {
                        const img = event.currentTarget;
                        const canvas = drawCanvasRef.current;
                        if (!canvas) return;
                        canvas.width = img.naturalWidth;
                        canvas.height = img.naturalHeight;
                        canvas.style.width = `${img.clientWidth}px`;
                        canvas.style.height = `${img.clientHeight}px`;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) return;
                        ctx.lineCap = 'round';
                        ctx.lineJoin = 'round';
                        ctx.lineWidth = 6;
                        drawCtxRef.current = ctx;
                      }}
                    />
                    <canvas
                      ref={drawCanvasRef}
                      className="absolute inset-0 touch-none"
                      onPointerDown={(event) => {
                        const canvas = drawCanvasRef.current;
                        const ctx = drawCtxRef.current;
                        if (!canvas || !ctx) return;
                        drawingRef.current = true;
                        const rect = canvas.getBoundingClientRect();
                        const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
                        const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
                        ctx.strokeStyle = screenshotColor;
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                      }}
                      onPointerMove={(event) => {
                        if (!drawingRef.current) return;
                        const canvas = drawCanvasRef.current;
                        const ctx = drawCtxRef.current;
                        if (!canvas || !ctx) return;
                        const rect = canvas.getBoundingClientRect();
                        const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
                        const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
                        ctx.lineTo(x, y);
                        ctx.stroke();
                      }}
                      onPointerUp={() => {
                        drawingRef.current = false;
                      }}
                      onPointerCancel={() => {
                        drawingRef.current = false;
                      }}
                    />
                  </div>
                </MinimalScroll>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {open ? (
        <div
          className="fixed inset-0 z-40"
          onMouseDown={() => {
            setOpen(false);
            setMode('threads');
          }}
          onTouchStart={() => {
            setOpen(false);
            setMode('threads');
          }}
        />
      ) : null}

      <div className="pointer-events-none fixed inset-0 z-[9998]">
      <button
        type="button"
        onClick={() => void openDrawer()}
        className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-[color:var(--theme-accent)] text-white shadow-[0_22px_55px_rgba(0,0,0,0.35)] transition hover:scale-105"
        aria-label="گفتگوی مستندات توسعه این صفحه"
        title="گفتگوی مستندات توسعه این صفحه"
        style={{
          position: 'fixed',
          left: widgetPos ? widgetPos.x : 16,
          top: widgetPos ? widgetPos.y : defaultWidgetTop,
          zIndex: 9998,
          backgroundColor: 'var(--theme-accent, #14b8a6)',
          touchAction: 'none',
          ...(buzz ? { animation: 'devDocsBuzz 600ms ease-in-out' as const } : {}),
        }}
        onPointerDown={(event) => {
          draggingRef.current = true;
          const startX = widgetPos?.x ?? 16;
          const startY = widgetPos?.y ?? defaultWidgetTop;
          dragOffsetRef.current = { dx: event.clientX - startX, dy: event.clientY - startY };
          (event.currentTarget as HTMLButtonElement).setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!draggingRef.current || !dragOffsetRef.current) return;
          const x = clamp(event.clientX - dragOffsetRef.current.dx, 12, window.innerWidth - 60);
          const y = clamp(event.clientY - dragOffsetRef.current.dy, 12, window.innerHeight - 60);
          setWidgetPos({ x, y });
        }}
        onPointerUp={() => {
          if (!draggingRef.current) return;
          draggingRef.current = false;
          dragOffsetRef.current = null;
          if (widgetPos) {
            try {
              window.localStorage.setItem('devDocsWidgetPos:v1', JSON.stringify(widgetPos));
            } catch {
              return;
            }
          }
        }}
      >
        {open ? <X className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
      </button>

      {open ? (
        <section
          role="dialog"
          aria-modal="false"
          className="pointer-events-auto fixed flex flex-col overflow-hidden border border-[color:var(--border-color)] bg-[color:var(--surface)] shadow-[0_24px_70px_var(--shadow-soft)]"
          onMouseDown={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}
          style={{
            left: 16,
            top: 16,
            right: maximized ? 16 : undefined,
            bottom: maximized ? 16 : undefined,
            height: maximized ? undefined : '94vh',
            width: maximized ? undefined : 'min(620px, calc(100vw - 88px))',
            borderRadius: maximized ? 22 : 26,
          }}
        >
          <div className="border-b border-[color:var(--border-color)] bg-[color:var(--surface)] px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-[color:var(--text-muted)]">{currentAppConfig.appName}</div>
                <h2 className="text-lg font-black text-[color:var(--text-strong)]">گفتگوی مستندات توسعه</h2>
                <p className="font-mono text-xs text-[color:var(--text-muted)]">
                  {threadScope === 'app' ? getThreadScopeLabel(threadScope) : pageKey || pathname}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface)] text-[color:var(--text-body)]"
                  onClick={() => setMaximized((v) => !v)}
                  title={maximized ? 'خروج از حالت تمام‌صفحه' : 'تمام‌صفحه'}
                >
                  {maximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
              {mode !== 'threads' ? (
                <button
                  type="button"
                  className={actionButtonClass(false)}
                  onClick={() => {
                    setMode('threads');
                    setSelectedThreadId(null);
                    setMessages([]);
                    setReplyTo(null);
                  }}
                >
                  برگشت
                </button>
              ) : null}
              </div>
            </div>
          </div>

          {mode === 'chat' ? (
            <>
              <div className="border-b border-[color:var(--border-color)] bg-[color:var(--surface-soft)] px-5 py-3">
                <div className="text-sm font-black text-[color:var(--text-strong)]">{selectedThread?.title || 'گفتگو'}</div>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-[color:var(--text-muted)]">
                  {selectedThread ? (
                    <>
                      <span className={chipClass()}>
                        <strong className="ml-1">موضوع:</strong>
                        {selectedThread.title}
                      </span>
                      <span className={chipClass()}>
                        <strong className="ml-1">نوع:</strong>
                        {selectedThread.docType}
                      </span>
                      <span className={chipClass()}>
                        <strong className="ml-1">اولویت:</strong>
                        {PRIORITY_LABELS[selectedThread.priority]}
                      </span>
                    </>
                  ) : null}
                </div>
              </div>

              <MinimalScroll ref={scrollRef} variant="both" className="flex-1 bg-[color:var(--surface-soft)] p-4">
                {loadingMessages ? (
                  <div className="rounded-[22px] border border-[color:var(--border-color)] bg-[color:var(--surface)] p-8 text-center text-sm text-[color:var(--text-muted)]">
                    <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" />
                    در حال بارگذاری پیام‌ها...
                  </div>
                ) : error ? (
                  <div className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
                ) : messages.length === 0 ? (
                  <div className="rounded-[22px] border border-dashed border-[color:var(--border-color)] bg-[color:var(--surface)] px-5 py-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--surface-soft)] text-[color:var(--theme-accent-strong)]">
                      <FileText className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-base font-black text-[color:var(--text-strong)]">هنوز پیامی ارسال نشده است</h3>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">اولین پیام را بفرست تا گفتگو شروع شود.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => {
                      const mine = Boolean(currentUserId && message.author?.id === currentUserId);
                      const bubbleMaxW = message.messageType === 'audio' ? 'max-w-[60%]' : 'max-w-[65%]';
                      const attachmentClassName = messageAttachmentClass(mine);
                      return (
                        <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                          <button
                            type="button"
                            className={`${bubbleMaxW} text-right`}
                            onClick={() => setReplyTo(message)}
                            title="ریپلای به این پیام"
                          >
                            <div className={messageBubbleClass(mine)}>
                              {message.replyTo ? (
                                <div className={messageReplyClass(mine)}>
                                  <div className="font-bold">ریپلای</div>
                                  <div className="mt-1 line-clamp-2">{message.replyTo.text || message.replyTo.messageType}</div>
                                </div>
                              ) : null}

                              <div className={`text-xs opacity-80 ${mine ? 'text-right' : 'text-right'}`}>{message.author?.fullName || 'نامشخص'}</div>

                              {message.messageType === 'text' ? (
                                <div className="mt-1 whitespace-pre-wrap text-sm leading-7">{message.text}</div>
                              ) : message.messageType === 'image' && message.attachmentDataUrl ? (
                                <div className="mt-2 space-y-2">
                                  <div className={`overflow-hidden rounded-xl ${attachmentClassName}`}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={message.attachmentDataUrl} alt="attachment" className="h-auto w-full" />
                                  </div>
                                  <div className="flex justify-end">
                                    <a
                                      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs underline ${attachmentClassName}`}
                                      href={message.attachmentDataUrl}
                                      download={message.attachmentName || 'image.png'}
                                    >
                                      <Download className="h-4 w-4" />
                                      دانلود
                                    </a>
                                  </div>
                                </div>
                              ) : message.messageType === 'audio' && message.attachmentDataUrl ? (
                                <div className="mt-2">
                                  <div className={`mb-2 overflow-hidden rounded-xl px-3 py-2 ${attachmentClassName}`}>
                                    <div className="relative h-8">
                                      <div className="absolute inset-0 flex items-end justify-between gap-1">
                                        {Array.from({ length: 34 }).map((_, idx) => {
                                          const progress = audioProgress[message.id] ?? 0;
                                          const played = idx / 34 <= progress;
                                          return (
                                            <div
                                              key={idx}
                                              className="w-1 rounded"
                                              style={{
                                                height: 6 + ((idx * 11) % 18),
                                                background: played ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.35)',
                                                animation:
                                                  playingAudioId === message.id
                                                    ? `devDocsEqualize 650ms ease-in-out ${idx * 18}ms infinite`
                                                    : undefined,
                                                transformOrigin: 'bottom',
                                              }}
                                            />
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <audio
                                      ref={(el) => {
                                        audioElsRef.current[message.id] = el;
                                      }}
                                      controls
                                      src={message.attachmentDataUrl}
                                      className="w-full"
                                      onPlay={() => setPlayingAudioId(message.id)}
                                      onPause={() => setPlayingAudioId((v) => (v === message.id ? null : v))}
                                      onTimeUpdate={(event) => {
                                        const el = event.currentTarget;
                                        const ratio = el.duration ? el.currentTime / el.duration : 0;
                                        setAudioProgress((current) => ({ ...current, [message.id]: clamp(ratio, 0, 1) }));
                                      }}
                                      onEnded={() => {
                                        setPlayingAudioId((v) => (v === message.id ? null : v));
                                        const currentIndex = messages.findIndex((m) => m.id === message.id);
                                        for (let i = currentIndex + 1; i < messages.length; i++) {
                                          if (messages[i]?.messageType === 'audio') {
                                            const nextEl = audioElsRef.current[messages[i]!.id];
                                            if (nextEl) {
                                              void nextEl.play().catch(() => null);
                                            }
                                            break;
                                          }
                                          if (messages[i]?.messageType !== 'audio') break;
                                        }
                                      }}
                                    />
                                  </div>
                                  {message.pending ? (
                                    <div className="mt-2 flex items-center gap-2 text-xs opacity-80">
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      در حال ارسال ویس...
                                    </div>
                                  ) : null}
                                </div>
                              ) : message.messageType === 'pdf' && message.attachmentDataUrl ? (
                                <div className="mt-2 space-y-2">
                                  <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${attachmentClassName}`}>
                                    <FileText className="h-4 w-4" />
                                    <span>PDF</span>
                                    <div className="mr-auto flex items-center gap-3">
                                      <a className="underline" href={message.attachmentDataUrl} target="_blank" rel="noreferrer">
                                        مشاهده
                                      </a>
                                      <a className="inline-flex items-center gap-2 underline" href={message.attachmentDataUrl} download={message.attachmentName || 'document.pdf'}>
                                        <Download className="h-4 w-4" />
                                        دانلود
                                      </a>
                                    </div>
                                  </div>
                                  <div className={`overflow-hidden rounded-xl ${attachmentClassName}`}>
                                    <embed src={message.attachmentDataUrl} type="application/pdf" className="h-72 w-full" />
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-1 text-sm opacity-80">پیام</div>
                              )}

                              <div className="mt-2 text-[11px] opacity-70">{formatDateTime(message.createdAt)}</div>
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </MinimalScroll>

              <div className="border-t border-[color:var(--border-color)] bg-[color:var(--surface)] p-3">
                {replyTo ? (
                  <div className="mb-2 flex items-center justify-between rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface-soft)] px-3 py-2 text-xs">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 font-bold">
                        <Reply className="h-4 w-4" />
                        ریپلای
                      </div>
                      <div className="mt-1 truncate">{replyTo.text || replyTo.messageType}</div>
                    </div>
                    <button type="button" className="ml-2 rounded-xl px-2 py-1 text-[color:var(--text-muted)]" onClick={() => setReplyTo(null)}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}

                <div className="flex items-center gap-2">
                  <div className="relative flex items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface)] text-[color:var(--text-body)]"
                      onClick={() => imageInputRef.current?.click()}
                      title="آپلود عکس"
                    >
                      <Upload className="h-4 w-4" />
                    </button>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.currentTarget.value = '';
                        if (file) void sendAttachmentMessage(file, 'image');
                      }}
                    />

                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface)] text-[color:var(--text-body)]"
                      onClick={() => pdfInputRef.current?.click()}
                      title="آپلود PDF"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                    <input
                      ref={pdfInputRef}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.currentTarget.value = '';
                        if (file) void sendAttachmentMessage(file, 'pdf');
                      }}
                    />

                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface)] text-[color:var(--text-body)]"
                      onClick={() => void toggleRecording()}
                      title={recording ? 'پایان ضبط' : 'ضبط ویس'}
                    >
                      {recording ? <Pause className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </button>

                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface)] text-[color:var(--text-body)]"
                      title="اسکرین‌شات"
                      onClick={() => startScreenshot()}
                    >
                      <Camera className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface)] text-[color:var(--text-body)]"
                      title="ایموجی"
                      onClick={() => setEmojiOpen((v) => !v)}
                    >
                      <Smile className="h-4 w-4" />
                    </button>

                    {emojiOpen ? (
                      <div
                        ref={emojiPopoverRef}
                        className="absolute bottom-[56px] right-0 w-56 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface)] p-3 shadow-[0_24px_70px_var(--shadow-soft)]"
                      >
                        <div className="grid grid-cols-8 gap-2 text-lg">
                          {['😀', '😂', '😍', '🥲', '😡', '👍', '🙏', '🎯', '✅', '❌', '🔥', '💡', '📌', '🧩', '📝', '📎'].map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              className="h-8 w-8 rounded-xl hover:bg-[color:var(--surface-soft)]"
                              onClick={() => {
                                setComposerText((v) => `${v}${emoji}`);
                                setEmojiOpen(false);
                              }}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex-1">
                    {recording ? (
                      <div className="flex h-9 items-center rounded-xl border border-[color:var(--border-color)] bg-[color:var(--theme-accent)] px-3">
                        <canvas ref={recordingVizCanvasRef} width={420} height={26} className="w-full opacity-95" />
                      </div>
                    ) : (
                      <textarea
                        value={composerText}
                        onChange={(event) => setComposerText(event.target.value)}
                        placeholder="پیام..."
                        rows={1}
                        className="h-9 max-h-28 w-full resize-none rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface-soft)] px-4 py-3 text-sm leading-6 text-[color:var(--text-body)] outline-none"
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            void sendTextMessage();
                          }
                        }}
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--theme-accent)] text-white"
                    onClick={() => void sendTextMessage()}
                    title="ارسال"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <MinimalScroll variant="both" className="flex-1 bg-[color:var(--surface-soft)] p-4">
              {loading ? (
                <div className="rounded-[22px] border border-[color:var(--border-color)] bg-[color:var(--surface)] p-8 text-center text-sm text-[color:var(--text-muted)]">
                  <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" />
                  در حال بارگذاری گفتگوها...
                </div>
              ) : mode === 'wizard' ? (
                <div className="space-y-4">
                  <div className="rounded-[22px] border border-[color:var(--border-color)] bg-[color:var(--surface)] p-4">
                    <div className="grid gap-4">
                      <label className="grid gap-2">
                        <span className="text-sm font-semibold text-[color:var(--text-body)]">عنوان</span>
                        <Input
                          value={wizardTitle}
                          onChange={(event) => setWizardTitle(event.target.value)}
                          placeholder="عنوان گفتگو"
                          className={fieldClassName}
                        />
                      </label>

                      <div className="grid gap-2">
                        <span className="text-sm font-semibold text-[color:var(--text-body)]">نوع مستند (Tag)</span>
                        <div className="flex flex-wrap gap-2">
                          {DEFAULT_DOC_TYPES.map((type) => (
                            <button
                              key={type}
                              type="button"
                              className={activeChipClass(wizardDocType === type)}
                              onClick={() => setWizardDocType(type)}
                            >
                              {type}
                            </button>
                          ))}
                          {wizardDocType && !DEFAULT_DOC_TYPES.includes(wizardDocType as (typeof DEFAULT_DOC_TYPES)[number]) ? (
                            <button type="button" className={activeChipClass(true)} onClick={() => setWizardDocType(wizardDocType)}>
                              {wizardDocType}
                            </button>
                          ) : null}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={wizardDocTypeInput}
                            onChange={(event) => setWizardDocTypeInput(event.target.value)}
                            placeholder="افزودن tag جدید..."
                            className={fieldClassName}
                          />
                          <button
                            type="button"
                            className={actionButtonClass(false)}
                            onClick={() => {
                              const next = wizardDocTypeInput.trim().toLowerCase();
                              if (!next) return;
                              setWizardDocType(next);
                              setWizardDocTypeInput('');
                            }}
                          >
                            افزودن
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <span className="text-sm font-semibold text-[color:var(--text-body)]">اولویت</span>
                        <div className="flex flex-wrap gap-2">
                          {THREAD_PRIORITIES.map((priority) => (
                            <button
                              key={priority}
                              type="button"
                              className={activeChipClass(wizardPriority === priority)}
                              onClick={() => setWizardPriority(priority)}
                            >
                              {PRIORITY_LABELS[priority]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <label className="grid gap-2">
                        <span className="text-sm font-semibold text-[color:var(--text-body)]">لیبل‌ها</span>
                        <Input
                          value={wizardLabelsInput}
                          onChange={(event) => setWizardLabelsInput(event.target.value)}
                          placeholder="مثلا: dto, onboarding, validation"
                          className={fieldClassName}
                        />
                        <span className="text-xs text-[color:var(--text-muted)]">لیبل‌ها را با ویرگول جدا کن.</span>
                        {parsedLabels.length ? (
                          <div className="flex flex-wrap gap-2">
                            {parsedLabels.map((label) => (
                              <span key={label} className={chipClass()}>
                                <Tag className="ml-1 h-3.5 w-3.5" />
                                {label}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className={activeChipClass(threadScope === 'page')} onClick={() => setThreadScope('page')}>
                      همین صفحه
                    </button>
                    <button type="button" className={activeChipClass(threadScope === 'app')} onClick={() => setThreadScope('app')}>
                      کل اپ
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className={activeChipClass(threadScope === 'page')} onClick={() => setThreadScope('page')}>
                      همین صفحه
                    </button>
                    <button type="button" className={activeChipClass(threadScope === 'app')} onClick={() => setThreadScope('app')}>
                      کل اپ
                    </button>
                  </div>

                  {error ? <div className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

                  <div className="flex justify-end gap-2">
                    <button type="button" className={actionButtonClass(false)} onClick={() => setMode('threads')}>
                      انصراف
                    </button>
                    <button type="button" className={actionButtonClass(true)} disabled={saving} onClick={() => void handleCreateThread()}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      ایجاد گفتگو
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-[22px] border border-[color:var(--border-color)] bg-[color:var(--surface)] p-4">
                    <button type="button" className={actionButtonClass(true)} onClick={openWizard}>
                      <Plus className="h-4 w-4" />
                      گفتگوی جدید
                    </button>
                    <button type="button" className={actionButtonClass(false)} onClick={() => void loadThreads()}>
                      بروزرسانی
                    </button>
                  </div>

                  {error ? <div className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

                  {threads.length ? (
                    <div className="space-y-3">
                      {threads.map((thread) => (
                        <article key={thread.id} className="rounded-[22px] border border-[color:var(--border-color)] bg-[color:var(--surface)] p-4">
                          <button type="button" className="w-full text-right" onClick={() => void openChat(thread)}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 space-y-2">
                                <div className="flex flex-wrap gap-2">
                                  <span className={chipClass()}>{thread.docType}</span>
                                  <span className={chipClass()}>{PRIORITY_LABELS[thread.priority]}</span>
                                  {thread.status === 'in_progress' ? (
                                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                                      در حال انجام
                                    </span>
                                  ) : null}
                                  {thread.status === 'done' ? (
                                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                      <CheckCircle2 className="ml-1 h-3.5 w-3.5" />
                                      انجام شده
                                    </span>
                                  ) : null}
                                  {thread.labels.slice(0, 4).map((label) => (
                                    <span key={label} className={chipClass()}>
                                      {label}
                                    </span>
                                  ))}
                                </div>
                                <h3 className="truncate text-base font-black text-[color:var(--text-strong)]">{thread.title}</h3>
                                <div className="flex flex-wrap gap-3 text-xs text-[color:var(--text-muted)]">
                                  <span>{thread.createdBy?.fullName || 'نامشخص'}</span>
                                  <span>{formatDateTime(thread.updatedAt)}</span>
                                  {threadScope === 'app' ? <span className="font-mono">{thread.pagePathSample}</span> : null}
                                </div>
                              </div>
                            </div>
                          </button>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[22px] border border-dashed border-[color:var(--border-color)] bg-[color:var(--surface)] px-5 py-10 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--surface-soft)] text-[color:var(--theme-accent-strong)]">
                        <FileText className="h-6 w-6" />
                      </div>
                      <h3 className="mt-4 text-base font-black text-[color:var(--text-strong)]">هنوز گفتگویی برای این صفحه ثبت نشده است</h3>
                      <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">
                        با ساختن گفتگو، تیم می‌تواند پیام، عکس، ویس و فایل PDF مرتبط با همین صفحه را ثبت کند.
                      </p>
                      <button type="button" className={`${actionButtonClass(true)} mt-5`} onClick={openWizard}>
                        <Plus className="h-4 w-4" />
                        ساخت اولین گفتگو
                      </button>
                    </div>
                  )}
                </div>
              )}
            </MinimalScroll>
          )}
        </section>
      ) : null}
      </div>
    </>
  );
}
