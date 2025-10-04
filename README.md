# prototypeExtensions
Extend String, Array, Number, Object and add 'path' to browser;
---

Available Functions

### String
- `String.slashlinux()` — normalize path separators to `/`
- `String.slashwin()` — normalize path separators to `\`
- `String.slashreverse(str)` — swap `/` ↔ `\` in a given string
- `String.strip()` — remove spaces, diacritics, and normalize
- `String.stripCompare(other)` — compare two strings loosely
- `String.isJson()` — check if a string is valid JSON
- `String.safeParseJson()` — parse JSON if possible, else return original
- `String.nullParseJson()` — parse JSON if possible, else return null
- `String.substringFrom(startStr, endStr)` — get substring between two markers

### Number
- `Number.percentage(percent)` — calculate a percentage of the number

### Math
- `Math.randomRangeFloat(min, max)` — float random number in range
- `Math.randomRangeInt(min, max)` — integer random number in range
- `Math.clamp(value, min, max)` — clamp a number to a range
- `Math.percentageInRange(min, max, percent)` — get a number at `percent` of a range

### Array
- `Array.findByKey(key, value)` — find object in array by key
- `Array.sumByKey(key)` — sum all numeric values for a key

### Object
- `Object.parseJsonKeys()` — parse all JSON strings in object keys

### Path (browser + Node)
- `path.basename(path)` — get filename from path
- `path.dirname(path)` — get directory from path
- `path.extname(path)` — get file extension
- `path.join(...parts)` — join multiple path parts
- `path.isFilenameEqual(a, b)` — compare filenames, ignoring absolute/relative and slashes

---

## Installation

Simply copy the `installPrototypes.js` file into your project:

```js
import installPrototypes from './installPrototypes.js';
installPrototypes();
