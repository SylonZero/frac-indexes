/**
 * Generates a fractional index between two existing indexes
 * @param {string|null} prevIndex - The index before the desired position
 * @param {string|null} nextIndex - The index after the desired position
 * @returns {string} A new fractional index as a string
 */
function generateFractionalIndex(prevIndex, nextIndex) {
    const stepSize = 0.001;

    // Generate a random integer between 10000 and 99999 (inclusive) as jitter
    const jitter = Math.floor(10000 + Math.random() * 90000).toString();
    
    let newIndex;

    if (prevIndex === null && nextIndex === null) {
        // List is empty
        newIndex = (stepSize / 2).toFixed(5);
    } else if (prevIndex === null) {
        // Beginning of List
        newIndex = (Math.min(stepSize / 2, Number(nextIndex) / 2)).toFixed(5);
    } else if (nextIndex === null) {
        // End of List
        newIndex = (Number(prevIndex) + stepSize).toFixed(5);
    } else {
        // Between Two Items
        newIndex = ((Number(prevIndex) + Number(nextIndex)) / 2).toFixed(5);
    }

    // Append random jitter to new index as a string
    newIndex = newIndex + jitter;

    return newIndex;
}

/**
 * Generates multiple fractional indexes between two existing indexes
 * @param {string|null} prevIndex - The index before the desired position
 * @param {string|null} nextIndex - The index after the desired position
 * @param {number} count - Number of indexes to generate
 * @returns {string[]} An array of new fractional indexes
 */
function generateBulkIndexes(prevIndex, nextIndex, count) {
    if (count <= 0) return [];
    if (count === 1) return [generateFractionalIndex(prevIndex, nextIndex)];

    const indexes = new Array(count);
    
    // Generate first index
    indexes[0] = generateFractionalIndex(prevIndex, nextIndex);
    
    // For better distribution, alternate between:
    // 1. Inserting after the last generated index
    // 2. Inserting between existing indexes
    let insertAfter = true;
    
    for (let i = 1; i < count; i++) {
        if (insertAfter) {
            // Insert after the last generated index
            indexes[i] = generateFractionalIndex(indexes[i-1], nextIndex);
        } else {
            // Find the largest gap between existing indexes
            let maxGap = 0;
            let insertPosition = 0;
            
            for (let j = 0; j < i; j++) {
                const current = Number(indexes[j].slice(0, 7)); // Consider only the numeric part
                const next = (j === i - 1) ? 
                    (nextIndex ? Number(nextIndex.slice(0, 7)) : current + 1) : 
                    Number(indexes[j + 1].slice(0, 7));
                const gap = next - current;
                
                if (gap > maxGap) {
                    maxGap = gap;
                    insertPosition = j;
                }
            }
            
            // Insert in the largest gap
            const prevIdx = indexes[insertPosition];
            const nextIdx = insertPosition === i - 1 ? nextIndex : indexes[insertPosition + 1];
            indexes[i] = generateFractionalIndex(prevIdx, nextIdx);
        }
        
        insertAfter = !insertAfter; // Toggle strategy
    }
    
    return indexes;
}

/**
 * Generates indexes for relocating multiple items to a new position
 * @param {string|null} targetPrevIndex - Index before the target position
 * @param {string|null} targetNextIndex - Index after the target position
 * @param {number} count - Number of items to relocate
 * @param {boolean} [distributeEvenly=true] - Whether to distribute items evenly in the target space
 * @returns {string[]} An array of new indexes for the relocated items
 */
function generateRelocationIndexes(targetPrevIndex, targetNextIndex, count, distributeEvenly = true) {
    if (count <= 0) return [];
    if (count === 1) return [generateFractionalIndex(targetPrevIndex, targetNextIndex)];

    if (distributeEvenly) {
        // Calculate evenly spaced positions
        const indexes = new Array(count);
        const start = targetPrevIndex ? Number(targetPrevIndex.slice(0, 7)) : 0;
        const end = targetNextIndex ? Number(targetNextIndex.slice(0, 7)) : start + count * 0.001;
        
        // Calculate step size for even distribution
        const step = (end - start) / (count + 1);
        
        for (let i = 0; i < count; i++) {
            const position = (start + step * (i + 1)).toFixed(5);
            const jitter = Math.floor(10000 + Math.random() * 90000).toString();
            indexes[i] = position + jitter;
        }
        
        return indexes;
    } else {
        // Use bulk insertion if even distribution is not required
        return generateBulkIndexes(targetPrevIndex, targetNextIndex, count);
    }
}

module.exports = { 
    generateFractionalIndex,
    generateBulkIndexes,
    generateRelocationIndexes 
}; 