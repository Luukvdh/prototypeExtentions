// --- installPrototypes.ts ---
export function installPrototypes(): void {
  // --- STRING EXTENSIONS ---
  const defineString = <K extends string>(name: K, fn: (this: string, ...args: any[]) => any) => {
    Object.defineProperty(String.prototype, name, {
      value: fn,
      enumerable: false,
      configurable: true,
      writable: true,
    });
  };

  /** Replace last 3-char extension with '.hsp' */
  defineString('toHsp', function (this: string): string {
    return this.replace(/\.\w{3}$/i, '.hsp');
  });

  /** Reverse string */
  defineString('reverse', function (this: string): string {
    return this.split('').reverse().join('');
  });

  /** Capitalize every word */
  defineString('toTitleCase', function (this: string): string {
    return this.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  });

  /** Return array of words */
  defineString('words', function (this: string): string[] {
    return this.match(/\b\w+\b/g) || [];
  });

  /** Swap / ↔ \ in string */
  defineString('slashreverse', function (this: string, str: string): string {
    return str.replace(/[\\/]/g, (ch) => (ch === '\\' ? '/' : '\\'));
  });

  /** Convert all slashes to Windows style */
  defineString('slashwin', function (this: string): string {
    return this.replace(/[\\/]/g, '\\');
  });

  /** Convert all slashes to Linux style */
  defineString('slashlinux', function (this: string): string {
    return this.replace(/[\\/]/g, '/');
  });

  /** Strip spaces, diacritics, normalize, lowercase, trim */
  defineString('strip', function (this: string): string {
    return this.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '')
      .trim();
  });

  /** Loose comparison using stripped strings */
  defineString('stripCompare', function (this: string, otherStr: string): boolean {
    const normalize = (str: string) =>
      str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[\s_]/g, '')
        .trim();
    return normalize(this).includes(normalize(otherStr));
  });

  /** Capitalize first letter only */
  defineString('toWordCapitalized', function (this: string): string {
    return this ? this.charAt(0).toUpperCase() + this.slice(1).toLowerCase() : '';
  });

  /** Truncate string to length with optional suffix */
  defineString('truncate', function (this: string, length: number, suffix = '…'): string {
    return this.length > length ? this.slice(0, length) + suffix : this.toString();
  });

  /** Check if string is valid JSON */
  defineString('isJson', function (this: string): boolean {
    if (!this.trim()) return false;
    try {
      JSON.parse(this);
      return true;
    } catch {
      return false;
    }
  });

  /** Parse JSON if possible, else return original string */
  defineString('safeParseJson', function (this: string): any {
    try {
      return JSON.parse(this);
    } catch {
      return this.valueOf();
    }
  });

  /** Parse JSON if possible, else return null */
  defineString('nullParseJson', function (this: string): any | null {
    if (!this.trim()) return null;
    try {
      return JSON.parse(this);
    } catch {
      return null;
    }
  });

  /** Compare filenames ignoring absolute/relative and slashes */
  defineString('filenameCompare', function (this: string, otherPath: string): boolean {
    const normalizeName = (p: string) => p.replace(/\\/g, '/').split('/').pop()?.toLowerCase() || '';
    return normalizeName(this) === normalizeName(otherPath);
  });

  /** Substring between start and optional stop */
  defineString('substringFrom', function (this: string, startStr: string, stopStr?: string): string {
    const startIndex = this.indexOf(startStr);
    if (startIndex === -1) return '';
    const afterStart = this.slice(startIndex + startStr.length);
    if (!stopStr) return afterStart;
    const endIndex = afterStart.indexOf(stopStr);
    return endIndex === -1 ? afterStart : afterStart.slice(0, endIndex);
  });

  // --- NUMBER EXTENSIONS ---
  const defineNumber = <K extends string>(name: K, fn: (this: number, ...args: any[]) => any) => {
    Object.defineProperty(Number.prototype, name, {
      value: fn,
      enumerable: false,
      configurable: true,
      writable: true,
    });
  };

  defineNumber('percentage', function (this: number, percent: number): number {
    return (this * percent) / 100;
  });

  defineNumber('isEven', function (this: number): boolean {
    return this % 2 === 0;
  });

  defineNumber('isOdd', function (this: number): boolean {
    return this % 2 !== 0;
  });

  defineNumber('toFixedNumber', function (this: number, decimals = 2): number {
    return parseFloat(this.toFixed(decimals));
  });

  defineNumber('between', function (this: number, min: number, max: number): boolean {
    return this >= min && this <= max;
  });

  defineNumber('clamp', function (this: number, min: number, max: number): number {
    return Math.min(Math.max(this, min), max);
  });

  defineNumber('times', function (this: number, fn: (i: number) => void) {
    for (let i = 0; i < this; i++) fn(i);
  });

  // --- ARRAY EXTENSIONS ---
  function defineArray<T>(name: string, fn: (this: T[], ...args: any[]) => any) {
    Object.defineProperty(Array.prototype, name, {
      value: fn,
      enumerable: false,
      configurable: true,
      writable: true,
    });
  }

  defineArray<Record<string, any>>('findByKey', function (this: Record<string, any>[], key: string, value: any): Record<
    string,
    any
  > | null {
    for (const item of this) if (item[key] === value) return item;
    return null;
  });

  defineArray<Record<string, any>>('sumByKey', function (this: Record<string, any>[], key: string): number {
    return this.reduce((acc, item) => acc + (typeof item[key] === 'number' ? item[key] : 0), 0);
  });

  defineArray<Record<string, any>>('autoParseKeys', function (this: Record<string, any>[]): Record<string, any>[] {
    return this.map((obj) => {
      if (obj && typeof obj === 'object') {
        for (const key in obj) {
          if (typeof obj[key] === 'string') {
            try {
              obj[key] = JSON.parse(obj[key]);
            } catch {}
          }
        }
      }
      return obj;
    });
  });

  defineArray('unique', function <T>(this: T[]): T[] {
    return [...new Set(this)];
  });
  defineArray('shuffle', function <T>(this: T[]): T[] {
    const arr = [...this];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });
}
