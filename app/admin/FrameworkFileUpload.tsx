'use client';

import { useCallback, useRef, useState } from 'react';
import {
  FRAMEWORK_UPLOAD_ACCEPT,
  FRAMEWORK_UPLOAD_HINT,
  type FrameworkFormFields,
} from '@/lib/framework-form';

type Props = {
  onImport: (fields: FrameworkFormFields, meta: { filename: string; warnings: string[] }) => void;
  disabled?: boolean;
};

export function FrameworkFileUpload({ onImport, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const processFile = useCallback(
    async (file: File) => {
      if (disabled) return;

      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      const allowed = ['md', 'markdown', 'json', 'txt'];
      if (!allowed.includes(ext)) {
        setStatus('error');
        setMessage('Unsupported file type. Use .md, .json, or .txt.');
        return;
      }

      setStatus('loading');
      setMessage('');

      try {
        const content = await file.text();
        const res = await fetch('/api/admin/parse-framework', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, content }),
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setStatus('error');
          setMessage(typeof data.error === 'string' ? data.error : 'Could not parse this file.');
          return;
        }

        onImport(data.fields as FrameworkFormFields, {
          filename: file.name,
          warnings: Array.isArray(data.warnings) ? data.warnings : [],
        });
        setStatus('ok');
        const warnCount = Array.isArray(data.warnings) ? data.warnings.length : 0;
        const warn = warnCount > 0 ? ` ${warnCount} note(s) — review fields below.` : '';
        setMessage(`Imported “${file.name}”.${warn}`);
      } catch {
        setStatus('error');
        setMessage('Network error. Check your connection and try again.');
      }
    },
    [disabled, onImport]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) void processFile(file);
    },
    [processFile]
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void processFile(file);
      e.target.value = '';
    },
    [processFile]
  );

  return (
    <div className="admin-upload-wrap">
      <div
        className={`admin-upload-zone${dragOver ? ' admin-upload-zone--active' : ''}${disabled ? ' admin-upload-zone--disabled' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled) inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
      >
        <input
          ref={inputRef}
          type="file"
          accept={FRAMEWORK_UPLOAD_ACCEPT}
          className="admin-upload-input"
          onChange={onFileChange}
          disabled={disabled}
          tabIndex={-1}
        />
        <div className="admin-upload-icon" aria-hidden>
          ↑
        </div>
        <div className="admin-upload-title">
          {status === 'loading' ? 'Reading file…' : 'Drop framework file or click to upload'}
        </div>
        <div className="admin-upload-hint">{FRAMEWORK_UPLOAD_HINT}</div>
        <a
          href="/framework-template.md"
          download
          className="admin-upload-template"
          onClick={(e) => e.stopPropagation()}
        >
          Download template (.md)
        </a>
      </div>

      {status === 'ok' && <div className="admin-upload-ok">{message}</div>}
      {status === 'error' && (
        <div className="admin-upload-err" role="alert">
          {message}
        </div>
      )}
    </div>
  );
}
