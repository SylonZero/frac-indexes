/**
 * Generates a fractional index between two existing indexes
 * @param {string|null} prevIndex - The index before the desired position
 * @param {string|null} nextIndex - The index after the desired position
 * @returns {string} A new fractional index as a string
 */
function generateFractionalIndex(prevIndex, nextIndex) {
    const stepSize = 0.001;
    
    if (prevIndex === null && nextIndex === null) {
        // List is empty
        const baseIndex = stepSize / 2;
        const jitter = Math.random() * 0.0001; // Small jitter for empty list
        return (baseIndex + jitter).toFixed(10);
    } else if (prevIndex === null) {
        // Beginning of List
        const nextNum = Number(nextIndex);
        const baseIndex = Math.min(stepSize / 2, nextNum / 2);
        const jitter = Math.random() * (baseIndex * 0.1); // 10% of base as max jitter
        return (baseIndex + jitter).toFixed(10);
    } else if (nextIndex === null) {
        // End of List
        const prevNum = Number(prevIndex);
        const baseIndex = prevNum + stepSize;
        const jitter = Math.random() * 0.0001; // Small jitter for end
        return (baseIndex + jitter).toFixed(10);
    } else {
        // Between Two Items - CRITICAL CASE
        const prevNum = Number(prevIndex);
        const nextNum = Number(nextIndex);
        const gap = nextNum - prevNum;
        
        // Safety check for invalid ranges
        if (gap <= 0) {
            throw new Error(`Invalid range: prevIndex (${prevIndex}) must be less than nextIndex (${nextIndex})`);
        }
        
        // For extremely small gaps, use safe midpoint without jitter
        const minSafeGap = 1e-10; // 10 decimal places precision
        if (gap <= minSafeGap) {
            const safeMidpoint = prevNum + (gap / 2);
            return safeMidpoint.toFixed(15); // Higher precision for tiny gaps
        }
        
        // Calculate safe midpoint with bounded jitter
        const midpoint = prevNum + (gap / 2);
        
        // Jitter is limited to 25% of the gap on either side of midpoint
        // This ensures we never exceed boundaries
        const maxJitter = gap * 0.25;
        const jitter = (Math.random() - 0.5) * maxJitter;
        const finalIndex = midpoint + jitter;
        
        // Final safety check with small epsilon to handle floating point precision
        const epsilon = 1e-15;
        if (finalIndex <= (prevNum + epsilon) || finalIndex >= (nextNum - epsilon)) {
            console.warn('Boundary violation detected, using safe midpoint');
            return midpoint.toFixed(15);
        }
        
        return finalIndex.toFixed(15);
    }
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

    const indexes = [];
    
    // Simple sequential approach: generate each index between the previous and next
    let currentPrev = prevIndex;
    
    for (let i = 0; i < count; i++) {
        const newIndex = generateFractionalIndex(currentPrev, nextIndex);
        indexes.push(newIndex);
        currentPrev = newIndex; // Next index will be after this one
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