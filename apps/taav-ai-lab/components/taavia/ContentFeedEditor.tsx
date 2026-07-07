'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Loader2, Mic, Paperclip, Send, StopCircle, Trash2, Video } from 'lucide-react';
import type { WorkspaceContentMessage } from '@/app/lib/types/taavia-workspace';
import {
  classifyFileKind,
  createFileMessage,
  createTextMessage,
  getContentKindLabel,
} from '@/app/lib/taavia-workspace-knowledge';

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function ContentFeedBubble({
  message,
  onDelete,
}: {
  message: WorkspaceContentMessage;
  onDelete: (messageId: string) => void;
}) {
  return (
    <div className="group flex justify-start">
      <div className="max-w-[min(100%,720px)] rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,30,56,0.92)_0%,rgba(10,19,38,0.88)_100%)] px-4 py-3 text-right shadow-[0_10px_28px_rgba(0,0,0,0.18)]">
        <div className="mb-2 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onDelete(message.id)}
            aria-label="حذف آیتم"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[rgba(217,229,255,0.45)] opacity-0 transition hover:bg-white/10 hover:text-[rgb(254,202,202)] group-hover:opacity-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[rgba(217,229,255,0.52)]">
              {formatUpdatedAt(message.createdAt)}
            </span>
            <span className="inline-flex items-center rounded-full border border-[rgba(66,237,211,0.22)] bg-[rgba(66,237,211,0.10)] px-2 py-0.5 text-[10px] font-bold text-[rgb(150,246,231)]">
              {getContentKindLabel(message.kind)}
            </span>
          </div>
        </div>

        {message.kind === 'text' ? (
          <p className="m-0 whitespace-pre-wrap text-[length:var(--taav-text-sm)] leading-8 text-white">{message.text}</p>
        ) : null}

        {message.kind === 'image' && message.objectUrl ? (
          <img src={message.objectUrl} alt={message.fileName ?? 'تصویر'} className="max-h-72 w-full rounded-[16px] object-cover" />
        ) : null}

        {message.kind === 'video' && message.objectUrl ? (
          <video src={message.objectUrl} controls className="max-h-72 w-full rounded-[16px]" />
        ) : null}

        {message.kind === 'audio' && message.objectUrl ? (
          <audio src={message.objectUrl} controls className="w-full min-w-[260px]" />
        ) : null}

        {message.kind === 'file' ? (
          <div className="inline-flex items-center gap-2 rounded-[14px] border border-white/10 bg-white/8 px-3 py-2">
            <Paperclip className="h-4 w-4 text-[rgb(199,210,254)]" />
            <span className="text-[length:var(--taav-text-sm)] font-semibold text-white">
              {message.fileName ?? 'فایل ضمیمه'}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

type ContentFeedEditorProps = {
  title: string;
  description: string;
  placeholder: string;
  emptyTitle: string;
  emptyDescription: string;
  messages: WorkspaceContentMessage[];
  onMessagesChange: (messages: WorkspaceContentMessage[]) => void;
  onUpdated?: () => void;
  disabled?: boolean;
};

export function ContentFeedEditor({
  title,
  description,
  placeholder,
  emptyTitle,
  emptyDescription,
  messages,
  onMessagesChange,
  onUpdated,
  disabled = false,
}: ContentFeedEditorProps) {
  const [composerText, setComposerText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const filePickerRef = useRef<HTMLInputElement | null>(null);
  const filePickerKindRef = useRef<WorkspaceContentMessage['kind']>('file');
  const recordSessionRef = useRef<{
    recorder: MediaRecorder;
    stream: MediaStream;
    chunks: Blob[];
  } | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const appendMessages = useCallback(
    (nextMessages: WorkspaceContentMessage[]) => {
      if (nextMessages.length === 0) return;
      onMessagesChange([...messages, ...nextMessages]);
      onUpdated?.();
    },
    [messages, onMessagesChange, onUpdated],
  );

  const sendTextMessage = () => {
    const text = composerText.trim();
    if (!text || disabled) return;
    appendMessages([createTextMessage(text)]);
    setComposerText('');
  };

  const addFilesAsMessages = useCallback(
    (files: FileList | File[], forcedKind?: WorkspaceContentMessage['kind']) => {
      const list = Array.from(files);
      if (list.length === 0 || disabled) return;
      appendMessages(list.map((file) => createFileMessage(file, forcedKind ?? classifyFileKind(file))));
    },
    [appendMessages, disabled],
  );

  const removeMessage = (messageId: string) => {
    if (disabled) return;
    onMessagesChange(
      messages.filter((message) => {
        if (message.id !== messageId) return true;
        if (message.objectUrl) URL.revokeObjectURL(message.objectUrl);
        return false;
      }),
    );
    onUpdated?.();
  };

  const openFilePicker = (kind: WorkspaceContentMessage['kind']) => {
    if (disabled) return;
    filePickerKindRef.current = kind;
    filePickerRef.current?.click();
  };

  const startAudioRecording = async () => {
    if (isRecording || disabled) return;
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    recorder.addEventListener('dataavailable', (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    });

    recorder.addEventListener('stop', () => {
      const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
      const file = new File([blob], `voice-${Date.now()}.webm`, { type: blob.type });
      appendMessages([createFileMessage(file, 'audio')]);
      stream.getTracks().forEach((track) => track.stop());
      recordSessionRef.current = null;
      setIsRecording(false);
    });

    recordSessionRef.current = { recorder, stream, chunks };
    recorder.start();
    setIsRecording(true);
  };

  const stopAudioRecording = () => {
    recordSessionRef.current?.recorder.stop();
  };

  return (
    <div className="flex min-h-[420px] flex-col rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,30,56,0.78)_0%,rgba(10,19,38,0.78)_100%)] shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
      <div className="border-b border-white/10 px-5 py-4 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[11px] font-bold text-[rgba(217,229,255,0.72)]">
            {new Intl.NumberFormat('fa-IR').format(messages.length)} آیتم
          </span>
          <div className="text-right">
            <strong className="block text-[length:var(--taav-text-md)] text-white">{title}</strong>
            <span className="text-[length:var(--taav-text-xs)] text-[rgba(217,229,255,0.58)]">{description}</span>
          </div>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 py-5 md:px-6"
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (event.dataTransfer?.files?.length) {
            addFilesAsMessages(event.dataTransfer.files);
          }
        }}
      >
        {messages.length > 0 ? (
          <div className="grid gap-4">
            {messages.map((message) => (
              <ContentFeedBubble key={message.id} message={message} onDelete={removeMessage} />
            ))}
            <div ref={chatEndRef} />
          </div>
        ) : (
          <div className="grid h-full min-h-[280px] place-items-center rounded-[22px] border border-dashed border-white/14 bg-white/5 p-8 text-center">
            <div className="grid max-w-md gap-3">
              <strong className="text-[length:var(--taav-text-md)] text-white">{emptyTitle}</strong>
              <p className="m-0 text-[length:var(--taav-text-sm)] leading-7 text-[rgba(217,229,255,0.62)]">
                {emptyDescription}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 bg-[rgba(5,12,25,0.55)] p-4 md:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => openFilePicker('image')}
              disabled={disabled}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(66,237,211,0.22)] bg-[rgba(66,237,211,0.12)] px-3 py-2 text-[12px] font-bold text-[rgb(150,246,231)] transition hover:bg-[rgba(66,237,211,0.18)] disabled:opacity-50"
            >
              <ImageIcon className="h-4 w-4" />
              عکس
            </button>
            <button
              type="button"
              onClick={() => openFilePicker('video')}
              disabled={disabled}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(130,158,255,0.22)] bg-[rgba(130,158,255,0.12)] px-3 py-2 text-[12px] font-bold text-[rgb(199,210,254)] transition hover:bg-[rgba(130,158,255,0.18)] disabled:opacity-50"
            >
              <Video className="h-4 w-4" />
              ویدئو
            </button>
            <button
              type="button"
              onClick={() => (isRecording ? stopAudioRecording() : startAudioRecording())}
              disabled={disabled}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[12px] font-bold transition disabled:opacity-50 ${
                isRecording
                  ? 'border-[rgba(248,113,113,0.30)] bg-[rgba(248,113,113,0.12)] text-[rgb(254,202,202)]'
                  : 'border-white/10 bg-white/8 text-[rgba(241,245,249,0.90)]'
              }`}
            >
              {isRecording ? <StopCircle className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isRecording ? 'توقف ضبط' : 'ضبط ویس'}
            </button>
            <button
              type="button"
              onClick={() => openFilePicker('file')}
              disabled={disabled}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-2 text-[12px] font-bold text-[rgba(241,245,249,0.90)] transition disabled:opacity-50"
            >
              <Paperclip className="h-4 w-4" />
              فایل
            </button>
          </div>
          <div className="text-[11px] font-medium text-[rgba(217,229,255,0.52)]">drag & drop یا paste</div>
        </div>

        <input
          ref={filePickerRef}
          type="file"
          multiple
          className="hidden"
          accept={
            filePickerKindRef.current === 'image'
              ? 'image/*'
              : filePickerKindRef.current === 'video'
                ? 'video/*'
                : filePickerKindRef.current === 'audio'
                  ? 'audio/*'
                  : undefined
          }
          onChange={(event) => {
            const files = event.target.files;
            if (files?.length) addFilesAsMessages(files, filePickerKindRef.current);
            event.target.value = '';
          }}
        />

        <div className="flex items-end gap-3">
          <button
            type="button"
            onClick={sendTextMessage}
            disabled={disabled || !composerText.trim()}
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[rgba(66,237,211,0.34)] bg-[rgba(66,237,211,0.16)] text-[rgb(150,246,231)] transition hover:bg-[rgba(66,237,211,0.24)] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="ارسال"
          >
            {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
          <textarea
            value={composerText}
            onChange={(event) => setComposerText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendTextMessage();
              }
            }}
            onPaste={(event) => {
              const items = event.clipboardData?.items;
              if (!items?.length) return;
              const files: File[] = [];
              for (const item of Array.from(items)) {
                if (item.kind === 'file') {
                  const file = item.getAsFile();
                  if (file) files.push(file);
                }
              }
              if (files.length) {
                event.preventDefault();
                addFilesAsMessages(files);
              }
            }}
            placeholder={placeholder}
            rows={2}
            disabled={disabled}
            className="min-h-[52px] flex-1 resize-none rounded-[20px] border border-white/10 bg-[rgba(8,16,31,0.82)] px-4 py-3 text-right text-[length:var(--taav-text-sm)] leading-7 text-white outline-none transition placeholder:text-[rgba(217,229,255,0.38)] focus:border-[rgba(66,237,211,0.36)] disabled:opacity-60"
          />
        </div>
      </div>
    </div>
  );
}
