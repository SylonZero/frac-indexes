# frac-indexes

A robust JavaScript library for generating lexicographically ordered fractional indexes. Perfect for maintaining order in lists when you need to insert items between existing ones without reindexing the entire list, or while supporting CRDT-style operations.

## ✨ Features

- **Production-Ready**: Tested against edge cases involving small gaps, bulk insertions and move operations
- **Boundary-Safe**: Stays within valid ranges and produces a moderate-sized index value with jitter
- **Bulk Operations**: Efficient insertion and relocation of multiple items
- **Real-Time Friendly**: Handles high-frequency collaborative editing
- **Zero Dependencies**: Lightweight with no external dependencies
- **TypeScript Ready**: Full type definitions included

## 📦 Installation

```bash
npm install frac-indexes
```

## 🚀 Quick Start

### Node.js (Modern ES6+)
```javascript
const { generateFractionalIndex, generateBulkIndexes } = require('frac-indexes');

// Create first item
const firstIndex = generateFractionalIndex(null, null);
// Returns (eg): 0.000548996

// Add item at the end  
const lastIndex = generateFractionalIndex(firstIndex, null);
// Returns (eg): 0.0016129989 

// Insert between two items
const middleIndex = generateFractionalIndex(firstIndex, lastIndex);
// Returns (based on first 2 examples): 0.001092958115464

// Bulk insert 5 items
const bulkIndexes = generateBulkIndexes(firstIndex, lastIndex, 5);

// Returns: [0.001114926762483, 0.001335277582793, 0.001494220983368, 0.001557755522828, 0.001587200051102]

```

### Browser (ES5 Compatible)
```html
<script src="node_modules/frac-indexes/src/es5-indexing.js"></script>
<script>
// Functions available under FractionalIndexing namespace
var firstIndex = FractionalIndexing.generateFractionalIndex(null, null);
var lastIndex = FractionalIndexing.generateFractionalIndex(firstIndex, null);
var middleIndex = FractionalIndexing.generateFractionalIndex(firstIndex, lastIndex);
</script>
```

### Node.js (ES5 Compatible)
```javascript
var fracIndexes = require('frac-indexes/src/es5-indexing');
var firstIndex = fracIndexes.generateFractionalIndex(null, null);
```

## 📚 API Reference

### generateFractionalIndex(prevIndex, nextIndex)

Generates a single fractional index between two existing indexes.

**Parameters:**
- `prevIndex` (string|null): The index before the desired position
- `nextIndex` (string|null): The index after the desired position

**Returns:** (string) A new fractional index that will sort between the inputs

**Example:**
```javascript
const index = generateFractionalIndex('0.001', '0.002');
// Returns (eg): 0.001392203389972
```

### generateBulkIndexes(prevIndex, nextIndex, count)

Generates multiple fractional indexes between two existing indexes.

**Parameters:**
- `prevIndex` (string|null): The index before the desired position  
- `nextIndex` (string|null): The index after the desired position
- `count` (number): Number of indexes to generate

**Returns:** (string[]) An array of new fractional indexes

**Example:**
```javascript
const indexes = generateBulkIndexes('0.001', '0.002', 3);
// Returns (eg): [ '0.001605493264275', '0.001827080243356', '0.001895877231710' ]
```

### generateRelocationIndexes(targetPrevIndex, targetNextIndex, count, distributeEvenly)

Generates indexes for relocating multiple items to a new position.

**Parameters:**
- `targetPrevIndex` (string|null): Index before the target position
- `targetNextIndex` (string|null): Index after the target position  
- `count` (number): Number of items to relocate
- `distributeEvenly` (boolean, optional): Whether to distribute items evenly (default: true)

**Returns:** (string[]) An array of new indexes for the relocated items

**Example:**
```javascript
const newIndexes = generateRelocationIndexes('0.001', '0.003', 2, true);
// Returns evenly distributed indexes between 0.001 and 0.003
```

## 💡 Common Use Cases

### Ordered Task Lists
```javascript
const tasks = [
  { id: 1, index: generateFractionalIndex(null, null), title: "First task" },
  { id: 2, index: generateFractionalIndex(tasks[0].index, null), title: "Second task" }
];

// Insert between existing tasks
const newTaskIndex = generateFractionalIndex(tasks[0].index, tasks[1].index);
tasks.splice(1, 0, { id: 3, index: newTaskIndex, title: "Inserted task" });
```

### Collaborative Editing
```javascript
function insertMultipleItems(prevItem, nextItem, newItems) {
  const newIndexes = generateBulkIndexes(
    prevItem?.index || null, 
    nextItem?.index || null, 
    newItems.length
  );
  
  return newItems.map((item, i) => ({
    ...item,
    index: newIndexes[i]
  }));
}
```

### Drag & Drop Reordering
```javascript
function moveItems(itemsToMove, targetPosition) {
  const prevIndex = targetPosition.previous?.index || null;
  const nextIndex = targetPosition.next?.index || null;
  
  const newIndexes = generateRelocationIndexes(
    prevIndex, 
    nextIndex, 
    itemsToMove.length
  );
  
  return itemsToMove.map((item, i) => ({
    ...item,
    index: newIndexes[i]
  }));
}
```

## 🧪 Testing

```bash
# Run all tests (recommended)
npm test

# Run only basic functionality tests  
npm run test:basic

# Run only edge case/danger scenario tests
npm run test:danger
```

## 🔬 How It Works

The library generates high-precision decimal numbers as strings, ensuring:

1. **Lexicographical Ordering**: String comparison matches numerical order
2. **Bounded Jitter**: Random variation stays within safe mathematical bounds  
3. **Precision Management**: Uses 15+ decimal places to handle tiny gaps
4. **Boundary Protection**: Multiple validation layers prevent range violations

**Technical Details:**
- Uses IEEE 754 double precision with safety margins
- Applies bounded randomization (max 25% of available gap)
- Falls back to safe midpoints when gaps become microscopic
- Maintains deterministic behavior under extreme conditions

## 🛡️ Production Safety Tests

This library has been tested against the following scenarios:

- ✅ **Small boundary Scenario**: Ensure small gaps don't result in out of order indexes
- ✅ **Death by 1000 Cuts**: Survives 15+ sequential subdivisions  
- ✅ **Microscopic Gaps**: Handles gaps down to floating-point precision limits
- ✅ **High Frequency**: 100% reliability under 50+ concurrent operations

## 📄 License

MIT

## 👨‍💻 Author

Sai Prakash (sylonzero@gmail.com)

## 🔗 Repository

[https://github.com/SylonZero/frac-indexes](https://github.com/SylonZero/frac-indexes)