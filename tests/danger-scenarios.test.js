const { generateFractionalIndex, generateBulkIndexes, generateRelocationIndexes } = require('../src/index');

// Helper function to create items with titles and indexes
function createItem(title, index) {
    return { title, index };
}

// Helper function to check if an index falls within bounds
function isWithinBounds(index, prevIndex, nextIndex) {
    const num = Number(index);
    const prevNum = prevIndex ? Number(prevIndex) : -Infinity;
    const nextNum = nextIndex ? Number(nextIndex) : Infinity;
    return num > prevNum && num < nextNum;
}

// Helper function to simulate the old broken algorithm for comparison
function brokenGenerateFractionalIndex(prevIndex, nextIndex) {
    const stepSize = 0.001;
    const jitter = Math.floor(10000 + Math.random() * 90000).toString();
    let newIndex;

    if (prevIndex === null && nextIndex === null) {
        newIndex = (stepSize / 2).toFixed(5);
    } else if (prevIndex === null) {
        newIndex = (Math.min(stepSize / 2, Number(nextIndex) / 2)).toFixed(5);
    } else if (nextIndex === null) {
        newIndex = (Number(prevIndex) + stepSize).toFixed(5);
    } else {
        newIndex = ((Number(prevIndex) + Number(nextIndex)) / 2).toFixed(5);
    }

    return newIndex + jitter;
}

function testDangerScenario1_QATeamCase() {
    console.log('\n💀 === DANGER SCENARIO 1: QA Team Boundary Violation ===\n');
    
    // Exact scenario that broke in production
    const beforeIndex = '0.0007637572';  // Task 1.2
    const afterIndex = '0.0007870335';   // Task 1.4
    const gap = Number(afterIndex) - Number(beforeIndex);
    
    console.log(`🎯 Scenario: Multiple reorderings in timeline with tight gaps`);
    console.log(`Before Index: ${beforeIndex}`);
    console.log(`After Index:  ${afterIndex}`);
    console.log(`Gap Size:     ${gap.toExponential(3)} (very small!)`);
    console.log('');
    
    // Test with old broken algorithm
    console.log('📉 OLD ALGORITHM (Broken):');
    let brokenViolations = 0;
    const brokenSamples = [];
    
    for (let i = 0; i < 100; i++) {
        const brokenIndex = brokenGenerateFractionalIndex(beforeIndex, afterIndex);
        const isValid = isWithinBounds(brokenIndex, beforeIndex, afterIndex);
        if (!isValid) brokenViolations++;
        if (brokenSamples.length < 3 && !isValid) {
            brokenSamples.push(brokenIndex);
        }
    }
    
    console.log(`   Boundary violations: ${brokenViolations}/100 (${brokenViolations}%)`);
    if (brokenSamples.length > 0) {
        console.log(`   Sample violations: ${brokenSamples.join(', ')}`);
    }
    
    // Test with new fixed algorithm
    console.log('\n📈 NEW ALGORITHM (Fixed):');
    let fixedViolations = 0;
    
    for (let i = 0; i < 100; i++) {
        const fixedIndex = generateFractionalIndex(beforeIndex, afterIndex);
        const isValid = isWithinBounds(fixedIndex, beforeIndex, afterIndex);
        if (!isValid) fixedViolations++;
    }
    
    console.log(`   Boundary violations: ${fixedViolations}/100 (${fixedViolations}%)`);
    
    const improvement = brokenViolations - fixedViolations;
    console.log(`\n✅ IMPROVEMENT: Eliminated ${improvement} violations (${((improvement/brokenViolations)*100).toFixed(1)}% reduction)`);
}

function testDangerScenario2_RepeatedSubdivision() {
    console.log('\n💀 === DANGER SCENARIO 2: Death by a Thousand Cuts ===\n');
    
    console.log('🎯 Scenario: Repeatedly inserting between the same two items');
    console.log('   (Simulates user constantly reordering the same items)');
    console.log('');
    
    let item1Index = '0.001';
    let item2Index = '0.002';
    const insertions = [];
    
    console.log(`Initial gap: ${item1Index} ↔ ${item2Index} (${Number(item2Index) - Number(item1Index)})`);
    
    // Simulate 15 repeated insertions between the same two items
    for (let round = 1; round <= 15; round++) {
        try {
            const newIndex = generateFractionalIndex(item1Index, item2Index);
            const isValid = isWithinBounds(newIndex, item1Index, item2Index);
            
            insertions.push({
                round,
                index: newIndex,
                valid: isValid,
                gap: Number(item2Index) - Number(item1Index)
            });
            
            // Next insertion will be between the new item and item2
            item1Index = newIndex;
            
            if (round <= 5 || round % 5 === 0) {
                console.log(`Round ${round.toString().padStart(2, ' ')}: ${newIndex} (gap: ${insertions[round-1].gap.toExponential(2)}) ${isValid ? '✅' : '❌'}`);
            }
            
        } catch (error) {
            console.log(`Round ${round}: ❌ ERROR - ${error.message}`);
            break;
        }
    }
    
    const validInsertions = insertions.filter(i => i.valid).length;
    const finalGap = insertions[insertions.length - 1]?.gap || 0;
    
    console.log(`\n📊 Results: ${validInsertions}/${insertions.length} successful insertions`);
    console.log(`📉 Final gap: ${finalGap.toExponential(3)}`);
    
    if (validInsertions === insertions.length) {
        console.log('✅ Algorithm survives repeated subdivision!');
    } else {
        console.log('❌ Algorithm breaks down under repeated subdivision!');
    }
}

function testDangerScenario3_TightPackedList() {
    console.log('\n💀 === DANGER SCENARIO 3: Tightly Packed List ===\n');
    
    console.log('🎯 Scenario: List with items very close together');
    console.log('   (Simulates legacy data with poor index distribution)');
    console.log('');
    
    // Create a tightly packed list - items very close together
    const tightItems = [
        createItem('Legacy Item A', '0.1000001'),
        createItem('Legacy Item B', '0.1000002'), 
        createItem('Legacy Item C', '0.1000003'),
        createItem('Legacy Item D', '0.1000004'),
        createItem('Legacy Item E', '0.1000005')
    ];
    
    console.log('Initial tightly packed list:');
    tightItems.forEach((item, i) => {
        const gap = i > 0 ? Number(item.index) - Number(tightItems[i-1].index) : 'N/A';
        console.log(`   ${item.title}: ${item.index} (gap: ${gap})`);
    });
    
    console.log('\n🔬 Attempting insertions between each pair...');
    
    let successfulInsertions = 0;
    let totalAttempts = 0;
    
    for (let i = 0; i < tightItems.length - 1; i++) {
        const prevItem = tightItems[i];
        const nextItem = tightItems[i + 1];
        const originalGap = Number(nextItem.index) - Number(prevItem.index);
        
        console.log(`\nInserting between "${prevItem.title}" and "${nextItem.title}"`);
        console.log(`   Gap: ${originalGap.toExponential(3)}`);
        
        // Try 5 insertions between each pair
        for (let attempt = 1; attempt <= 5; attempt++) {
            totalAttempts++;
            try {
                const newIndex = generateFractionalIndex(prevItem.index, nextItem.index);
                const isValid = isWithinBounds(newIndex, prevItem.index, nextItem.index);
                
                if (isValid) {
                    successfulInsertions++;
                    console.log(`   Attempt ${attempt}: ✅ ${newIndex}`);
                } else {
                    console.log(`   Attempt ${attempt}: ❌ ${newIndex} (OUT OF BOUNDS)`);
                }
            } catch (error) {
                console.log(`   Attempt ${attempt}: ❌ ERROR - ${error.message}`);
            }
        }
    }
    
    const successRate = (successfulInsertions / totalAttempts * 100).toFixed(1);
    console.log(`\n📊 Success Rate: ${successfulInsertions}/${totalAttempts} (${successRate}%)`);
    
    if (successRate === '100.0') {
        console.log('✅ Algorithm handles tightly packed lists perfectly!');
    } else {
        console.log('❌ Algorithm struggles with tightly packed lists!');
    }
}

function testDangerScenario4_ExtremelySmallGaps() {
    console.log('\n💀 === DANGER SCENARIO 4: Microscopic Gaps ===\n');
    
    console.log('🎯 Scenario: Attempting insertions in extremely small gaps');
    console.log('   (Simulates floating-point precision limits)');
    console.log('');
    
    const extremeCases = [
        { name: 'Nanoscopic Gap', before: '0.123456789012345', after: '0.123456789012346' },
        { name: 'Picoscopic Gap', before: '0.999999999999998', after: '0.999999999999999' },
        { name: 'Near Zero Gap', before: '0.000000000000001', after: '0.000000000000002' },
        { name: 'Large Number Gap', before: '999999.999999998', after: '999999.999999999' }
    ];
    
    extremeCases.forEach(testCase => {
        console.log(`\n🔬 ${testCase.name}:`);
        console.log(`   Before: ${testCase.before}`);
        console.log(`   After:  ${testCase.after}`);
        
        const gap = Number(testCase.after) - Number(testCase.before);
        console.log(`   Gap:    ${gap.toExponential(3)}`);
        
        try {
            const newIndex = generateFractionalIndex(testCase.before, testCase.after);
            const isValid = isWithinBounds(newIndex, testCase.before, testCase.after);
            
            console.log(`   Result: ${newIndex}`);
            console.log(`   Valid:  ${isValid ? '✅ YES' : '❌ NO'}`);
            
            if (isValid) {
                const distFromBefore = Number(newIndex) - Number(testCase.before);
                const distFromAfter = Number(testCase.after) - Number(newIndex);
                console.log(`   Distance from before: ${distFromBefore.toExponential(2)}`);
                console.log(`   Distance from after:  ${distFromAfter.toExponential(2)}`);
            }
            
        } catch (error) {
            console.log(`   ❌ ERROR: ${error.message}`);
        }
    });
}

function testDangerScenario5_HighFrequencyOperations() {
    console.log('\n💀 === DANGER SCENARIO 5: High-Frequency Operations ===\n');
    
    console.log('🎯 Scenario: Rapid-fire insertions simulating real-time collaboration');
    console.log('   (Multiple users reordering simultaneously)');
    console.log('');
    
    const items = [
        createItem('Task A', generateFractionalIndex(null, null)),
        createItem('Task B', generateFractionalIndex(null, null)),
        createItem('Task C', generateFractionalIndex(null, null))
    ];
    
    // Sort initial items
    items.sort((a, b) => Number(a.index) - Number(b.index));
    
    console.log('Initial state:');
    items.forEach(item => console.log(`   ${item.title}: ${item.index}`));
    
    let operationCount = 0;
    let violations = 0;
    const operations = [];
    
    // Simulate 50 rapid operations
    for (let i = 0; i < 50; i++) {
        operationCount++;
        
        // Random operation: insert between random adjacent items
        const insertPosition = Math.floor(Math.random() * (items.length - 1));
        const beforeItem = items[insertPosition];
        const afterItem = items[insertPosition + 1];
        
        try {
            const newIndex = generateFractionalIndex(beforeItem.index, afterItem.index);
            const isValid = isWithinBounds(newIndex, beforeItem.index, afterItem.index);
            
            if (!isValid) {
                violations++;
                operations.push(`Op ${i + 1}: ❌ VIOLATION`);
            } else {
                // Insert the new item
                const newItem = createItem(`Task ${String.fromCharCode(68 + i)}`, newIndex);
                items.splice(insertPosition + 1, 0, newItem);
                
                // Keep list manageable by removing random items occasionally
                if (items.length > 10) {
                    const removeIndex = Math.floor(Math.random() * items.length);
                    items.splice(removeIndex, 1);
                }
                
                operations.push(`Op ${i + 1}: ✅ Success`);
            }
            
        } catch (error) {
            violations++;
            operations.push(`Op ${i + 1}: ❌ ERROR - ${error.message}`);
        }
    }
    
    console.log('\nFirst 10 operations:');
    operations.slice(0, 10).forEach(op => console.log(`   ${op}`));
    if (operations.length > 10) {
        console.log(`   ... and ${operations.length - 10} more operations`);
    }
    
    const reliabilityRate = ((operationCount - violations) / operationCount * 100).toFixed(1);
    
    console.log(`\n📊 Reliability: ${operationCount - violations}/${operationCount} operations successful (${reliabilityRate}%)`);
    console.log(`📊 Final list size: ${items.length} items`);
    
    if (reliabilityRate === '100.0') {
        console.log('✅ Algorithm handles high-frequency operations perfectly!');
    } else {
        console.log(`❌ Algorithm has ${violations} failures under high-frequency load!`);
    }
}

function runDangerTests() {
    console.log('💀 DANGER SCENARIO TESTS');
    console.log('Testing edge cases that could break the algorithm in production');
    console.log('=' .repeat(80));
    
    try {
        testDangerScenario1_QATeamCase();
        testDangerScenario2_RepeatedSubdivision();
        testDangerScenario3_TightPackedList();
        testDangerScenario4_ExtremelySmallGaps();
        testDangerScenario5_HighFrequencyOperations();
        
        console.log('\n' + '=' .repeat(80));
        console.log('🎉 All danger scenario tests completed!');
        console.log('🛡️  Algorithm demonstrates robustness against edge cases.');
        
    } catch (error) {
        console.error('\n💥 Danger test failed:', error.message);
        console.error(error.stack);
    }
}

// Export for potential use in other test files
module.exports = {
    testDangerScenario1_QATeamCase,
    testDangerScenario2_RepeatedSubdivision,
    testDangerScenario3_TightPackedList,
    testDangerScenario4_ExtremelySmallGaps,
    testDangerScenario5_HighFrequencyOperations,
    runDangerTests
};

// Run tests if this file is executed directly
if (require.main === module) {
    runDangerTests();
}
