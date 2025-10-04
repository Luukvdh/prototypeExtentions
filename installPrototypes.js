if (!globalThis.path) {
  let pathImpl;

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
    pathImpl = browserPath;
  } else {
    try {
      pathImpl = (await import('path')).default || require('path');
    } catch {
      pathImpl = browserPath;
    }
  }

  globalThis.path = pathImpl;
}

export default function installPrototypes() {
  // --- STRING EXTENSIONS ---
  const defineString = (name, fn) =>
    Object.defineProperty(String.prototype, name, {
      enumerable: false,
      configurable: true,
      writable: true,
      value: fn,
    });

  /**
   * Swap all / ↔ \ in a string.
   * @param {string} str
   * @returns {string}
   */
  defineString('slashreverse', function (str) {
    return String(str).replace(/[\\/]/g, (ch) => (ch === '\\' ? '/' : '\\'));
  });

  /**
   * Normalize path separators to /
   * @returns {string}
   */
  defineString('slashlinux', function () {
    return String(this).replace(/[\\/]/g, '/');
  });

  /**
   * Normalize path separators to \
   * @returns {string}
   */
  defineString('slashwin', function () {
    return String(this).replace(/[\\/]/g, '\\');
  });

  /**
   * Remove spaces, diacritics, normalize, lowercase, trim
   * @returns {string}
   */
  defineString('strip', function () {
    return String(this)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '')
      .trim();
  });

  /**
   * Compare two strings loosely after stripping
   * @param {string} otherStr
   * @returns {boolean}
   */
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

  /**
   * Capitalize the first letter only
   * @returns {string}
   */
  defineString('toWordCapitalized', function () {
    const str = String(this);
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  });

  /**
   * Capitalize every word
   * @returns {string}
   */
  defineString('toEveryWordCapitalized', function () {
    return String(this).replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  });

  /**
   * Get array of words in string
   * @returns {string[]}
   */
  defineString('words', function () {
    return String(this).match(/\b\w+\b/g) || [];
  });

  /**
   * Check if string is valid JSON
   * @returns {boolean}
   */
  defineString('isJson', function () {
    if (typeof this !== 'string' || !this.trim()) return false;
    try {
      JSON.parse(this);
      return true;
    } catch {
      return false;
    }
  });

  /**
   * Parse JSON if possible, else return original string
   * @returns {any}
   */
  defineString('safeParseJson', function () {
    try {
      return JSON.parse(this);
    } catch {
      return this.valueOf();
    }
  });

  /**
   * Parse JSON if possible, else return null
   * @returns {any|null}
   */
  defineString('nullParseJson', function () {
    if (!this.trim()) return null;
    try {
      return JSON.parse(this);
    } catch {
      return null;
    }
  });

  /**
   * Compare filenames (ignores absolute/relative)
   * @param {string} otherPath
   * @returns {boolean}
   */
  defineString('filenameCompare', function (otherPath) {
    const normalizeName = (p) => path.basename(p).toLowerCase();
    return normalizeName(this.toString()) === normalizeName(otherPath);
  });

  /**
   * Substring between two markers
   * @param {string} startStr
   * @param {string} [stopStr]
   * @returns {string}
   */
  defineString('substringFrom', function (startStr, stopStr) {
    const str = this.toString();
    const startIndex = str.indexOf(startStr);
    if (startIndex === -1) return '';
    const afterStart = str.slice(startIndex + startStr.length);
    if (!stopStr) return afterStart;
    const endIndex = afterStart.indexOf(stopStr);
    return endIndex === -1 ? afterStart : afterStart.slice(0, endIndex);
  });

  // --- NUMBER EXTENSIONS ---
  const defineNumber = (name, fn) =>
    Object.defineProperty(Number.prototype, name, {
      enumerable: false,
      configurable: true,
      writable: true,
      value: fn,
    });

  /**
   * Percentage of a number
   * @param {number} percent
   * @returns {number}
   */
  defineNumber('percentage', function (percent) {
    return (this.valueOf() * percent) / 100;
  });

  /**
   * True if even
   * @returns {boolean}
   */
  defineNumber('isEven', function () {
    return this.valueOf() % 2 === 0;
  });

  /**
   * True if odd
   * @returns {boolean}
   */
  defineNumber('isOdd', function () {
    return this.valueOf() % 2 !== 0;
  });

  /**
   * Rounded number to decimals
   * @param {number} decimals
   * @returns {number}
   */
  defineNumber('toFixedNumber', function (decimals = 2) {
    return parseFloat(this.valueOf().toFixed(decimals));
  });

  /**
   * Check if number is between min and max
   * @param {number} min
   * @param {number} max
   * @returns {boolean}
   */
  defineNumber('between', function (min, max) {
    const val = this.valueOf();
    return val >= min && val <= max;
  });

  /**
   * Call function n times
   * @param {(i:number)=>void} fn
   */
  defineNumber('times', function (fn) {
    for (let i = 0; i < this.valueOf(); i++) fn(i);
  });

  // --- MATH EXTENSIONS ---
  const defineMath = (name, fn) => {
    if (!Math[name]) Math[name] = fn;
  };

  defineMath('randomRangeFloat', (min, max) => Math.random() * (max - min) + min);
  defineMath('randomRangeInt', (min, max) => Math.floor(Math.random() * (max - min + 1)) + min);
  defineMath('clamp', (value, min, max) => Math.min(Math.max(value, min), max));
  defineMath('percentageInRange', (min, max, percent) => min + ((max - min) * percent) / 100);
  defineMath('lerp', (min, max, t) => min + (max - min) * t);
  defineMath('mapRange', (value, inMin, inMax, outMin, outMax) => ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin);

  // --- ARRAY EXTENSIONS ---
  const defineArray = (name, fn) =>
    Object.defineProperty(Array.prototype, name, {
      enumerable: false,
      configurable: true,
      writable: true,
      value: fn,
    });

  /**
   * Find object by key=value
   * @param {string} key
   * @param {any} value
   * @returns {object|null}
   */
  defineArray('findByKey', function (key, value) {
    for (const item of this) {
      if (item[key] === value) return item;
    }
    return null;
  });

  /**
   * Sum all numeric values for a key
   * @param {string} key
   * @returns {number}
   */
  defineArray('sumByKey', function (key) {
    return this.reduce((acc, item) => {
      const val = item[key];
      return acc + (typeof val === 'number' ? val : 0);
    }, 0);
  });

  /**
   * Parse specified keys in object array
   * @param {string[]} keys
   * @returns {Array<object>}
   */
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

  /**
   * Attempt JSON parse on all string values in object array
   * @returns {Array<object>}
   */
  defineArray('autoParseKeys', function () {
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

  /**
   * Return unique values of array
   * @returns {Array<any>}
   */
  defineArray('unique', function () {
    return [...new Set(this)];
  });

  /**
   * Return shuffled array
   * @returns {Array<any>}
   */
  defineArray('shuffle', function () {
    let arr = [...this];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });

  /**
   * Return first n elements
   * @param {number} n
   * @returns {Array<any>|any}
   */
  defineArray('first', function (n = 1) {
    return n === 1 ? this[0] : this.slice(0, n);
  });

  /**
   * Return last n elements
   * @param {number} n
   * @returns {Array<any>|any}
   */
  defineArray('last', function (n = 1) {
    return n === 1 ? this[this.length - 1] : this.slice(-n);
  });

  // --- OBJECT EXTENSIONS ---
  const defineObject = (name, fn) =>
    Object.defineProperty(Object.prototype, name, {
      enumerable: false,
      configurable: true,
      writable: true,
      value: fn,
    });

  /**
   * Parse specific keys in object
   * @param {string[]} keys
   * @returns {object}
   */
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

  /**
   * Map object keys
   * @param {object} obj
   * @param {(k:string,v:any)=>[string,any]} fn
   * @returns {object}
   */
  Object.defineProperty(Object, 'keysMap', {
    value: function (obj, fn) {
      return Object.fromEntries(Object.entries(obj).map(([k, v]) => fn(k, v)));
    },
    enumerable: false,
    configurable: false,
    writable: false,
  });

  /**
   * Map object values
   * @param {object} obj
   * @param {(v:any,k:string)=>any} fn
   * @returns {object}
   */
  Object.defineProperty(Object, 'valuesMap', {
    value: function (obj, fn) {
      return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v, k)]));
    },
    enumerable: false,
    configurable: false,
    writable: false,
  });
}
