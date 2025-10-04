# prototypeExtensions
Extend String, Array, Number, Object with generally usefull or outright genious functions. Use NodeJS' 'path' functions in the browser;
---

## Available Functions

### String

toHsp()

reverse()

toTitleCase()

words()

slashreverse(str)

slashwin()

slashlinux()

strip()

stripCompare(otherStr)

toWordCapitalized()

truncate(length, suffix?)

isJson()

safeParseJson()

nullParseJson()

filenameCompare(otherPath)

### Number

percentage(percent)

isEven()

isOdd()

toFixedNumber(decimals?)

between(min, max)

clamp(min, max)

times(fn)

### Array

findByKey(key, value)

sumByKey(key)

autoParseKeys()

unique()

shuffle()

highestByKey(key)

lowestByKey(key)

sortByKey(key, ascending?)

sortByKeyName(key, ascending?)

### Object

parseKeys(keys: string[])

### Math

randomRangeFloat(min, max)

randomRangeInt(min, max)

clamp(value, min, max)

percentageInRange(min, max, percent)

lerp(min, max, t)

mapRange(value, inMin, inMax, outMin, outMax)

---

## Installation

Simply copy the `installPrototypes.js` file into your project:

```js
import installPrototypes from './installPrototypes.js';
installPrototypes();
