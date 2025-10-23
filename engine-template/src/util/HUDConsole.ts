function formatTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function safeStringify(value: unknown, maxLen = 500): string {
  const indentUnit = '  ';
  const inlineThreshold = 60; // max characters to keep on one line

  const isIdent = (k: string) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k);

  try {
    if (typeof value === 'string') return value;

    const seen = new WeakSet<object>();

    const fmt = (val: unknown, depth: number): string => {
      // Primitives and simple types
      if (val === null) return 'null';
      const t = typeof val;
      if (t === 'undefined') return 'undefined';
      if (t === 'number' || t === 'boolean' || t === 'bigint') return String(val);
      if (t === 'string') return val as string;
      if (t === 'symbol') return String(val);
      if (t === 'function') {
        const fn = val as Function;
        return `[Function ${fn.name || 'anonymous'}]`;
      }

      // Browser-specific instances
      if (val instanceof HTMLElement) return `<${val.tagName.toLowerCase()}#${(val as HTMLElement).id || ''}>`;
      if (val instanceof CanvasRenderingContext2D) return '[CanvasRenderingContext2D]';

      // Special objects
      if (val instanceof Date) return `Date(${val.toISOString()})`;
      if (val instanceof RegExp) return String(val);

      if (typeof val === 'object' && val !== null) {
        if (seen.has(val as object)) return '[Circular]';
        seen.add(val as object);

        // Arrays
        if (Array.isArray(val)) {
          const parts = val.map((v) => fmt(v, depth + 1));
          const inline = `[${parts.join(', ')}]`;
          if (inline.length <= inlineThreshold && !parts.some((p) => p.includes('\n'))) return inline;
          const indent = indentUnit.repeat(depth + 1);
          const closeIndent = indentUnit.repeat(depth);
          return `[\n${indent}${parts.join(`,\n${indent}`)}\n${closeIndent}]`;
        }

        // Plain objects or class instances (show enumerable props)
        const obj = val as Record<string, unknown>;
        const keys = Object.keys(obj);
        if (keys.length === 0) return '{}';

        const entries = keys.map((k) => {
          const key = isIdent(k) ? k : JSON.stringify(k);
          const v = fmt(obj[k], depth + 1);
          return `${key}: ${v}`;
        });

        const inline = `{${entries.join(', ')}}`;
        if (inline.length <= inlineThreshold && !entries.some((e) => e.includes('\n'))) return inline;

        const indent = indentUnit.repeat(depth + 1);
        const closeIndent = indentUnit.repeat(depth);
        return `{\n${indent}${entries.join(`,\n${indent}`)}\n${closeIndent}}`;
      }

      // Fallback
      return String(val);
    };

    const out = fmt(value, 0);
    return out.length > maxLen ? out.slice(0, maxLen) + '…' : out;
  } catch {
    try {
      return String(value);
    } catch {
      return '[Unprintable]';
    }
  }
}

type LogLevel = 'log' | 'warn' | 'error';

interface HUDLine {
  level: LogLevel;
  text: string;
}

export class HUDConsole {
  private lines: HUDLine[] = [];

  div: HTMLDivElement;
  maxLines = 10;

  originalLog = console.log;
  originalWarn = console.warn;
  originalError = console.error;
  private readonly handleWindowError = (event: ErrorEvent) => {
    const err = event.error;
    if (err instanceof Error) {
      const stack = err.stack ? `\n${err.stack}` : '';
      this.append('error', [`Uncaught exception: ${err.name}: ${err.message}${stack}`], false);
    } else {
      const message = event.message || safeStringify(err ?? 'Unknown error');
      this.append('error', [`Uncaught exception: ${message}`], false);
    }
  };
  private readonly handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    if (reason instanceof Error) {
      const stack = reason.stack ? `\n${reason.stack}` : '';
      this.append('error', [`Unhandled rejection: ${reason.name}: ${reason.message}${stack}`], false);
    } else {
      this.append('error', [`Unhandled rejection: ${safeStringify(reason)}`], false);
    }
  };
  private rafScheduled = false;

  constructor(id: string, maxLines = 100) {
    this.div = document.getElementById(id) as HTMLDivElement;
    this.maxLines = maxLines;
    if (this.div) this.div.style.whiteSpace = 'pre-wrap';
    console.log = this.log.bind(this);
    console.warn = this.warn.bind(this);
    console.error = this.error.bind(this);
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleWindowError);
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    }
  }

  private append(level: LogLevel, items: unknown[], forwardToConsole = true) {
    const forward =
      level === 'error' ? this.originalError : level === 'warn' ? this.originalWarn : this.originalLog;
    if (forwardToConsole) forward(...items);

    const text = items.map((it) => safeStringify(it)).join(' ');
    const timestamp = formatTime(new Date());
    const levelLabel = level === 'log' ? '' : `[${level.toUpperCase()}] `;
    const logLine = `${timestamp}: ${levelLabel}${text}`.trimEnd();

    this.lines.splice(0, 0, { level, text: logLine });

    const extra = this.lines.length - this.maxLines;
    if (extra > 0) this.lines.splice(this.maxLines, extra);

    if (!this.rafScheduled) {
      this.rafScheduled = true;
      requestAnimationFrame(() => {
        this.rafScheduled = false;
        if (this.div) {
          this.div.textContent = '';
          this.lines.forEach((entry, index) => {
            const lineEl = document.createElement('div');
            lineEl.textContent = entry.text;
            if (entry.level === 'warn') lineEl.style.color = '#d97706';
            if (entry.level === 'error') lineEl.style.color = '#dc2626';
            if (index !== this.lines.length - 1) lineEl.style.marginBottom = '4px';
            this.div.appendChild(lineEl);
          });
        }
      });
    }
  }

  log(...items: unknown[]) {
    this.append('log', items);
  }

  warn(...items: unknown[]) {
    this.append('warn', items);
  }

  error(...items: unknown[]) {
    this.append('error', items);
  }

  dispose() {
    // Restore original console.log
    console.log = this.originalLog;
    console.warn = this.originalWarn;
    console.error = this.originalError;
    if (typeof window !== 'undefined') {
      window.removeEventListener('error', this.handleWindowError);
      window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    }
  }
}

new HUDConsole('console');