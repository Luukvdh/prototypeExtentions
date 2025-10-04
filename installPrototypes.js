if (!globalThis.path) {
  let pathImpl;

  // Browser path implementatie
  const browserPath = {
    sep: '/',
    normalize(p) {
      return p.replace(/\\/g, '/').replace(/\/+/g, '/');
    },
    join(...parts) {
      return browserPath.normalize(parts.join('/'));
    },
    basename(p) {
      const normalized = browserPath.normalize(p);
      return normalized.substring(normalized.lastIndexOf('/') + 1);
    },
    dirname(p) {
      const normalized = browserPath.normalize(p);
      const idx = normalized.lastIndexOf('/');
      return idx === -1 ? '.' : normalized.substring(0, idx);
    },
    extname(p) {
      const base = browserPath.basename(p);
      const i = base.lastIndexOf('.');
      return i === -1 ? '' : base.substring(i);
    },
    filenameCompare(a, b) {
      const baseA = browserPath.basename(a).toLowerCase();
      const baseB = browserPath.basename(b).toLowerCase();
      return baseA === baseB;
    },
  };

  if (typeof window !== 'undefined') {
    // Browser → gebruik eigen implementatie
    pathImpl = browserPath;
  } else {
    // Node.js → probeer native path
    try {
      // Werkt voor zowel ESM als CJS
      pathImpl = (await import('path')).default || require('path');
    } catch {
      // Fallback naar browservariant
      pathImpl = browserPath;
    }
  }

  globalThis.path = pathImpl;
}

export default function installPrototypes() {
  // --- String extensions ---
  const defineString = (name, fn) =>
    Object.defineProperty(String.prototype, name, {
      enumerable: false,
      configurable: true,
      writable: true,
      value: fn,
    });

  defineString('toHsp', function () {
    return this.replace(/\.\w{3}$/i, '.hsp');
  });

  defineString('slashreverse', function (str) {
    return String(str).replace(/[\\/]/g, (ch) => (ch === '\\' ? '/' : '\\'));
  });

  defineString('slashwin', function () {
    return String(this).replace(/[\\/]/g, '\\');
  });

  defineString('slashlinux', function () {
    return String(this).replace(/[\\/]/g, '/');
  });

  defineString('strip', function () {
    return String(this)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '')
      .trim();
  });

  defineString('stripCompare', function (otherStr) {
    const normalize = (str) =>
      String(str)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[\s_]/g, '')
        .trim();
    return normalize(this).includes(normalize(otherStr));
  });

  defineString('capitalize', function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  });

  defineString('truncate', function (length, suffix = '…') {
    return this.length > length ? this.slice(0, length) + suffix : this.toString();
  });

  defineString('isJson', function () {
    if (typeof this !== 'string' || !this.trim()) return false;
    try {
      JSON.parse(this);
      return true;
    } catch {
      return false;
    }
  });

  defineString('safeParseJson', function () {
    try {
      return JSON.parse(this);
    } catch {
      return this.valueOf();
    }
  });

  defineString('nullParseJson', function () {
    if (!this.trim()) return null;
    try {
      return JSON.parse(this);
    } catch {
      return null;
    }
  });

  defineString('filenameCompare', function (otherPath) {
    const normalizeName = (p) => path.basename(p).toLowerCase();
    return normalizeName(this.toString()) === normalizeName(otherPath);
  });

  defineString('substringFrom', function (startStr, stopStr) {
    const str = this.toString();
    const startIndex = str.indexOf(startStr);
    if (startIndex === -1) return '';
    const afterStart = str.slice(startIndex + startStr.length);
    if (!stopStr) return afterStart;
    const endIndex = afterStart.indexOf(stopStr);
    return endIndex === -1 ? afterStart : afterStart.slice(0, endIndex);
  });

  // --- Number extensions ---
  const defineNumber = (name, fn) =>
    Object.defineProperty(Number.prototype, name, {
      enumerable: false,
      configurable: true,
      writable: true,
      value: fn,
    });

  defineNumber('percentage', function (percent) {
    return (this.valueOf() * percent) / 100;
  });

  defineNumber('isEven', function () {
    return this.valueOf() % 2 === 0;
  });

  defineNumber('isOdd', function () {
    return this.valueOf() % 2 !== 0;
  });

  defineNumber('toFixedNumber', function (decimals = 2) {
    return parseFloat(this.valueOf().toFixed(decimals));
  });

  defineNumber('between', function (min, max) {
    const val = this.valueOf();
    return val >= min && val <= max;
  });

  // --- Math utilities ---
  const defineMath = (name, fn) => {
    if (!Math[name]) Math[name] = fn;
  };

  defineMath('randomRangeFloat', (min, max) => Math.random() * (max - min) + min);
  defineMath('randomRangeInt', (min, max) => Math.floor(Math.random() * (max - min + 1)) + min);
  defineMath('clamp', (value, min, max) => Math.min(Math.max(value, min), max));
  defineMath('percentageInRange', (min, max, percent) => min + ((max - min) * percent) / 100);
  defineMath('lerp', (min, max, t) => min + (max - min) * t);
  defineMath('mapRange', (value, inMin, inMax, outMin, outMax) => ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin);

  // --- Array extensions ---
  const defineArray = (name, fn) =>
    Object.defineProperty(Array.prototype, name, {
      enumerable: false,
      configurable: true,
      writable: true,
      value: fn,
    });

  defineArray('findByKey', function (key, value) {
    for (const item of this) {
      if (item[key] === value) return item;
    }
    return null;
  });

  defineArray('sumByKey', function (key) {
    return this.reduce((acc, item) => {
      const val = item[key];
      return acc + (typeof val === 'number' ? val : 0);
    }, 0);
  });

  defineArray('parseKeys', function (keys) {
    return this.map((obj) => {
      if (obj && typeof obj === 'object') {
        for (const key of keys) {
          if (obj.hasOwnProperty(key) && typeof obj[key] === 'string') {
            try {
              obj[key] = JSON.parse(obj[key]);
            } catch {
              obj[key] = null;
            }
          }
        }
      }
      return obj;
    });
  });

  defineArray('autoParseKeys', function () {
    return this.map((obj) => {
      if (obj && typeof obj === 'object') {
        for (const key in obj) {
          if (typeof obj[key] === 'string') {
            try {
              obj[key] = JSON.parse(obj[key]);
            } catch {
              // niet parseable blijft string
            }
          }
        }
      }
      return obj;
    });
  });

  // --- Object extensions ---
  const defineObject = (name, fn) =>
    Object.defineProperty(Object.prototype, name, {
      enumerable: false,
      configurable: true,
      writable: true,
      value: fn,
    });

  defineObject('parseKeys', function (keys) {
    for (const key of keys) {
      if (this.hasOwnProperty(key) && typeof this[key] === 'string') {
        try {
          this[key] = JSON.parse(this[key]);
        } catch {
          this[key] = null;
        }
      }
    }
    return this;
  });
}
