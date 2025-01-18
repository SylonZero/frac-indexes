const { generateFractionalIndex, generateBulkIndexes, generateRelocationIndexes } = require('../src/index');

function testIndexGeneration() {
    // Initialize array of indexes with one item
    const indexes = [generateFractionalIndex(null, null)];

    // Insert 9 more items into the array
    for (let i = 1; i < 10; i++) {
        indexes.push(generateFractionalIndex(indexes[i - 1], null));
    }
    console.log("Indexes after inserting 10 items:", indexes);

    // Insert 5 items between the first and second items
    for (let i = 0; i < 5; i++) {
        indexes.splice(1, 0, generateFractionalIndex(indexes[0], indexes[1]));
    }
    console.log("Indexes after inserting 5 items between first and second items:", indexes);

    // Insert 5 more items between the 4th and 5th original items
    for (let i = 0; i < 5; i++) {
        indexes.splice(6, 0, generateFractionalIndex(indexes[5], indexes[6]));
    }
    console.log("Indexes after inserting 5 more items between 4th and 5th original items:", indexes);
}

function testBulkIndexGeneration() {
    console.log("\n=== Testing Bulk Index Generation ===\n");
    
    // Generate 5 indexes at the start of an empty list
    const firstBatch = generateBulkIndexes(null, null, 5);
    console.log("5 indexes for empty list:", firstBatch);
    
    // Generate 3 indexes between two existing indexes
    const middleBatch = generateBulkIndexes(firstBatch[1], firstBatch[2], 3);
    console.log("\n3 indexes between two existing indexes:", middleBatch);
    
    // Generate 4 indexes at the end of the list
    const endBatch = generateBulkIndexes(firstBatch[firstBatch.length - 1], null, 4);
    console.log("\n4 indexes at the end:", endBatch);
    
    // Verify ordering
    const allIndexes = [
        ...firstBatch.slice(0, 2),
        ...middleBatch,
        ...firstBatch.slice(2),
        ...endBatch
    ];
    
    console.log("\nAll indexes in order:", allIndexes);
    
    // Verify that indexes are properly ordered
    const sorted = [...allIndexes].sort();
    const isOrdered = JSON.stringify(allIndexes) === JSON.stringify(sorted);
    console.log("\nIndexes are properly ordered:", isOrdered);
}

function testRelocation() {
    console.log("\n=== Testing Item Relocation ===\n");
    
    // Create an initial ordered list
    const initialIndexes = generateBulkIndexes(null, null, 10);
    console.log("Initial list:", initialIndexes);
    
    // Simulate moving 3 items from the beginning to between items 5 and 6
    const targetPrev = initialIndexes[4];  // 5th item
    const targetNext = initialIndexes[5];  // 6th item
    const relocatedIndexes = generateRelocationIndexes(targetPrev, targetNext, 3);
    
    // Construct the new list order
    const newList = [
        ...initialIndexes.slice(3, 5),  // Items before the insertion point
        ...relocatedIndexes,            // Relocated items
        ...initialIndexes.slice(5)      // Items after the insertion point
    ];
    
    console.log("\nRelocated 3 items between positions 5 and 6:");
    console.log(newList);
    
    // Verify ordering
    const sorted = [...newList].sort();
    const isOrdered = JSON.stringify(newList) === JSON.stringify(sorted);
    console.log("\nIndexes are properly ordered:", isOrdered);
    
    // Test even distribution
    console.log("\nTesting even distribution of items:");
    const evenlyDistributed = generateRelocationIndexes(
        initialIndexes[0],
        initialIndexes[1],
        5,
        true
    );
    console.log("5 items evenly distributed between first two indexes:", evenlyDistributed);
}

// Run tests
testIndexGeneration();
testBulkIndexGeneration();
testRelocation(); 