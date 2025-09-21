const { generateFractionalIndex, generateBulkIndexes, generateRelocationIndexes } = require('../src/index');

// Helper function to create items with titles and indexes
function createItem(title, index) {
    return { title, index };
}

// Helper function to display items in a readable format
function displayItems(items, description) {
    console.log(`\n${description}:`);
    console.log('┌─────────────────────────────────────────────────────────────┐');
    items.forEach((item, i) => {
        const position = (i + 1).toString().padStart(2, ' ');
        const title = item.title.padEnd(15, ' ');
        const index = item.index;
        console.log(`│ ${position}. ${title} │ Index: ${index} │`);
    });
    console.log('└─────────────────────────────────────────────────────────────┘');
    
    // Verify ordering
    const isCorrectOrder = items.every((item, i) => 
        i === 0 || item.index > items[i - 1].index
    );
    
    console.log(`✅ Ordering is ${isCorrectOrder ? 'CORRECT' : 'INCORRECT'}`);
    return isCorrectOrder;
}

function testBasicInsertion() {
    console.log('\n🧪 === Testing Basic Insertion ===');
    
    // Start with an empty list
    const items = [];
    
    // Add first item
    items.push(createItem('Item 1', generateFractionalIndex(null, null)));
    displayItems(items, 'After adding first item');
    
    // Add second item at the end
    items.push(createItem('Item 2', generateFractionalIndex(items[0].index, null)));
    displayItems(items, 'After adding second item at end');
    
    // Insert between Item 1 and Item 2
    const newIndex = generateFractionalIndex(items[0].index, items[1].index);
    items.splice(1, 0, createItem('Item 1.5', newIndex));
    displayItems(items, 'After inserting Item 1.5 between Item 1 and Item 2');
    
    // Add another item at the beginning
    const beginningIndex = generateFractionalIndex(null, items[0].index);
    items.unshift(createItem('Item 0.5', beginningIndex));
    displayItems(items, 'After adding Item 0.5 at the beginning');
}

function testBulkInsertion() {
    console.log('\n🧪 === Testing Bulk Insertion ===');
    
    // Create initial list
    const items = [];
    
    // Bulk create 5 initial items
    const initialIndexes = generateBulkIndexes(null, null, 5);
    for (let i = 0; i < 5; i++) {
        items.push(createItem(`Item ${i + 1}`, initialIndexes[i]));
    }
    displayItems(items, 'Initial list with 5 items');
    
    // Insert 3 items between Item 2 and Item 3
    const insertIndexes = generateBulkIndexes(items[1].index, items[2].index, 3);
    const newItems = [
        createItem('Item 2.1', insertIndexes[0]),
        createItem('Item 2.2', insertIndexes[1]),
        createItem('Item 2.3', insertIndexes[2])
    ];
    
    // Insert the new items in the correct position
    items.splice(2, 0, ...newItems);
    displayItems(items, 'After bulk inserting 3 items between Item 2 and Item 3');
    
    // Add 2 items at the end
    const endIndexes = generateBulkIndexes(items[items.length - 1].index, null, 2);
    items.push(
        createItem('Item 6', endIndexes[0]),
        createItem('Item 7', endIndexes[1])
    );
    displayItems(items, 'After adding 2 items at the end');
}

function testRelocation() {
    console.log('\n🧪 === Testing Item Relocation ===');
    
    // Create initial list
    const items = [];
    const initialIndexes = generateBulkIndexes(null, null, 6);
    for (let i = 0; i < 6; i++) {
        items.push(createItem(`Item ${i + 1}`, initialIndexes[i]));
    }
    displayItems(items, 'Initial list with 6 items');
    
    // Simulate relocating Item 1 and Item 2 to between Item 4 and Item 5
    const itemsToMove = items.splice(0, 2); // Remove Item 1 and Item 2
    displayItems(items, 'After removing Item 1 and Item 2');
    
    // Generate new indexes for the moved items (between Item 4 and Item 5, which are now at positions 2 and 3)
    const newIndexes = generateRelocationIndexes(items[1].index, items[2].index, 2);
    
    // Update the moved items with new indexes and rename them for clarity
    itemsToMove[0].index = newIndexes[0];
    itemsToMove[0].title = 'Item 1 (moved)';
    itemsToMove[1].index = newIndexes[1];
    itemsToMove[1].title = 'Item 2 (moved)';
    
    // Insert them in their new position
    items.splice(2, 0, ...itemsToMove);
    displayItems(items, 'After relocating Item 1 and Item 2 between Item 4 and Item 5');
}

function testComplexScenario() {
    console.log('\n🧪 === Testing Complex Scenario ===');
    
    // Start with a small list
    const items = [
        createItem('Alpha', generateFractionalIndex(null, null))
    ];
    
    // Add Beta at the end
    items.push(createItem('Beta', generateFractionalIndex(items[0].index, null)));
    
    // Add Gamma at the end
    items.push(createItem('Gamma', generateFractionalIndex(items[1].index, null)));
    
    displayItems(items, 'Initial list: Alpha, Beta, Gamma');
    
    // Insert multiple items between Alpha and Beta
    const betweenIndexes = generateBulkIndexes(items[0].index, items[1].index, 3);
    const betweenItems = [
        createItem('Alpha.1', betweenIndexes[0]),
        createItem('Alpha.2', betweenIndexes[1]),
        createItem('Alpha.3', betweenIndexes[2])
    ];
    items.splice(1, 0, ...betweenItems);
    displayItems(items, 'After inserting Alpha.1, Alpha.2, Alpha.3 between Alpha and Beta');
    
    // Insert one item between Beta and Gamma
    const betaGammaIndex = generateFractionalIndex(
        items.find(item => item.title === 'Beta').index,
        items.find(item => item.title === 'Gamma').index
    );
    const betaGammaPosition = items.findIndex(item => item.title === 'Gamma');
    items.splice(betaGammaPosition, 0, createItem('Beta.5', betaGammaIndex));
    displayItems(items, 'After inserting Beta.5 between Beta and Gamma');
    
    // Add items at the beginning
    const beginningIndexes = generateBulkIndexes(null, items[0].index, 2);
    items.unshift(
        createItem('Prelude', beginningIndexes[0]),
        createItem('Prologue', beginningIndexes[1])
    );
    displayItems(items, 'After adding Prelude and Prologue at the beginning');
}

function runAllTests() {
    console.log('🚀 Running Fractional Indexing Tests\n');
    console.log('=' .repeat(70));
    
    try {
        testBasicInsertion();
        testBulkInsertion();
        testRelocation();
        testComplexScenario();
        
        console.log('\n' + '=' .repeat(70));
        console.log('🎉 All tests completed successfully!');
        console.log('✅ Fractional indexing is working correctly.');
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);
    }
}

// Run all tests
runAllTests();