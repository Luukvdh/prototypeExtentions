// --- installPrototypes.ts ---
export function installPrototypes(): void {
  // --- String extensions ---
  Object.defineProperty(String.prototype, 'toHsp', {
    value: function (): string {
      return this.replace(/\.\w{3}$/i, '.hsp');
    },
  });

  Object.defineProperty(String.prototype, 'slashreverse', {
    value: function (str: string): string {
      return String(str).replace(/[\\/]/g, (ch) => (ch === '\\' ? '/' : '\\'));
    },
  });

  Object.defineProperty(String.prototype, 'slashwin', {
    value: function (): string {
      return String(this).replace(/[\\/]/g, '\\');
    },
  });

  Object.defineProperty(String.prototype, 'slashlinux', {
    value: function (): string {
      return String(this).replace(/[\\/]/g, '/');
    },
  });

  Object.defineProperty(String.prototype, 'strip', {
    value: function (): string {
      return String(this)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '')
        .trim();
    },
  });

  Object.defineProperty(String.prototype, 'stripCompare', {
    value: function (otherStr: string): boolean {
      const normalize = (str: string) =>
        String(str)
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[\s_]/g, '')
          .trim();
      return normalize(this).includes(normalize(otherStr));
    },
  });

  Object.defineProperty(String.prototype, 'capitalize', {
    value: function (): string {
      return this.charAt(0).toUpperCase() + this.slice(1);
    },
  });

  Object.defineProperty(String.prototype, 'truncate', {
    value: function (length: number, suffix = '…'): string {
      return this.length > length ? this.slice(0, length) + suffix : this.toString();
    },
  });

  // --- Number extensions ---
  if (!Number.prototype.percentage) {
    Number.prototype.percentage = function (percent: number): number {
      return (this.valueOf() * percent) / 100;
    };
  }

  if (!Number.prototype.isEven) {
    Number.prototype.isEven = function (): boolean {
      return this.valueOf() % 2 === 0;
    };
  }

  if (!Number.prototype.isOdd) {
    Number.prototype.isOdd = function (): boolean {
      return this.valueOf() % 2 !== 0;
    };
  }

  if (!Number.prototype.toFixedNumber) {
    Number.prototype.toFixedNumber = function (decimals = 2): number {
      return parseFloat(this.valueOf().toFixed(decimals));
    };
  }

  if (!Number.prototype.between) {
    Number.prototype.between = function (min: number, max: number): boolean {
      const val = this.valueOf();
      return val >= min && val <= max;
    };
  }

  // --- Math utilities ---
  if (!Math.randomRangeFloat) {
    Math.randomRangeFloat = (min: number, max: number): number => Math.random() * (max - min) + min;
  }

  if (!Math.randomRangeInt) {
    Math.randomRangeInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  }

  if (!Math.clamp) {
    Math.clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);
  }

  if (!Math.percentageInRange) {
    Math.percentageInRange = (min: number, max: number, percent: number): number => min + ((max - min) * percent) / 100;
  }

  if (!Math.lerp) {
    Math.lerp = (min: number, max: number, t: number): number => min + (max - min) * t;
  }

  if (!Math.mapRange) {
    Math.mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number =>
      ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
  }

  // --- Array extensions ---
  Object.defineProperty(Array.prototype, 'findByKey', {
    value: function <T extends Record<string, any>>(key: string, value: any): T | null {
      for (const item of this) {
        if (item[key] === value) return item;
      }
      return null;
    },
  });

  Object.defineProperty(Array.prototype, 'sumByKey', {
    value: function (key: string): number {
      return this.reduce((acc, item) => {
        const val = item[key];
        return acc + (typeof val === 'number' ? val : 0);
      }, 0);
    },
  });

  Object.defineProperty(Array.prototype, 'parseKeys', {
    value: function (keys: string[]): Array<any> {
      return this.map(obj => {
        if (obj && typeof obj === 'object') {
          for (const key of keys) {
            if (obj.hasOwnProperty(key) && typeof obj[key] === 'string') {
              try {
                obj[key] = JSON.parse(obj[key]);
              } catch (e) {
                obj[key] = null;
              }
            }
          }
        }
        return obj;
      });
    },
  });

  Object.defineProperty(Array.prototype, 'autoParseKeys', {
    value: function (): Array<any> {
      return this.map(obj => {
        if (obj && typeof obj === 'object') {
          for (const key in obj) {
            if (typeof obj[key] === 'string') {
              try {
                obj[key] = JSON.parse(obj[key]);
              } catch (e) {
                // niet parseable blijft string
              }
            }
          }
        }
        return obj;
      });
    },
  });

  // --- Object extensions ---
  Object.defineProperty(Object.prototype, 'parseKeys', {
    value: function (keys: string[]): any {
      for (const key of keys) {
        if (this.hasOwnProperty(key) && typeof this[key] === 'string') {
          try {
            this[key] = JSON.parse(this[key]);
          } catch (e) {
            this[key] = null;
          }
        }
      }
      return this;
    },
  });
}
