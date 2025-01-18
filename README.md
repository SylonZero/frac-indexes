# frac-indexes

A JavaScript library for generating lexicographically ordered fractional indexes. This is useful for maintaining order in lists, especially when you need to insert items between existing ones without reindexing the entire list.

## Features

- Generate unique, ordered string indexes
- Insert new items between any two existing items
- Bulk insertion support for better efficiency
- No reindexing required when inserting items
- Maintains lexicographical ordering
- Suitable for collaborative editing and real-time list management

## Installation

```bash
npm install frac-indexes
```

## Usage

```javascript
const { generateFractionalIndex } = require('frac-indexes');

const indexes = [generateFractionalIndex(null, null)];
```

## API Reference

### generateFractionalIndex(prevIndex, nextIndex)

Generates a single fractional index between two existing indexes.

- **Parameters:**
  - `prevIndex` (string|null): The index before the desired position
  - `nextIndex` (string|null): The index after the desired position
- **Returns:** (string) A new fractional index

### generateBulkIndexes(prevIndex, nextIndex, count)

Generates multiple fractional indexes between two existing indexes.

- **Parameters:**
  - `prevIndex` (string|null): The index before the desired position
  - `nextIndex` (string|null): The index after the desired position
  - `count` (number): Number of indexes to generate
- **Returns:** (string[]) An array of new fractional indexes

### generateRelocationIndexes(targetPrevIndex, targetNextIndex, count, distributeEvenly)

Generates indexes for relocating multiple items to a new position.

- **Parameters:**
  - `targetPrevIndex` (string|null): Index before the target position
  - `targetNextIndex` (string|null): Index after the target position
  - `count` (number): Number of items to relocate
  - `distributeEvenly` (boolean, optional): Whether to distribute items evenly in the target space (default: true)
- **Returns:** (string[]) An array of new indexes for the relocated items

## Common Use Cases

1. **Ordered Lists:**
   ```javascript
   const items = [
     { id: 1, index: generateFractionalIndex(null, null), text: "First item" },
     { id: 2, index: generateFractionalIndex(items[0].index, null), text: "Second item" }
   ];
   ```

2. **Collaborative Editing:**
   ```javascript
   function insertBetweenItems(prevItem, nextItem, newItems) {
     const newIndexes = generateBulkIndexes(prevItem?.index, nextItem?.index, newItems.length);
     return newItems.map((item, i) => ({ ...item, index: newIndexes[i] }));
   }
   ```

3. **Drag and Drop Reordering:**
   ```javascript
   function getNewIndex(draggedItem, targetItem, position) {
     if (position === 'before') {
       return generateFractionalIndex(targetItem.prevIndex, targetItem.index);
     } else {
       return generateFractionalIndex(targetItem.index, targetItem.nextIndex);
     }
   }
   ```

## How It Works

The library generates string-based indexes that maintain lexicographical ordering. Each index consists of:
- A decimal number with 5 decimal places
- A random "jitter" value to prevent conflicts

When inserting between two existing indexes, it calculates the midpoint and adds random jitter to ensure uniqueness.

## License

MIT

## Author

Sai Prakash (sylonzero@gmail.com)