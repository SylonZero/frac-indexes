/**
 * ES5-Compatible Fractional Indexing Library
 * 
 * This file provides the same functionality as index.js but using only ES5 syntax
 * for compatibility with older browsers and environments.
 */

/**
 * Generates a fractional index between two existing indexes
 * @param {string|null} prevIndex - The index before the desired position
 * @param {string|null} nextIndex - The index after the desired position
 * @returns {string} A new fractional index as a string
 */
function generateFractionalIndex(prevIndex, nextIndex) {
    var stepSize = 0.001;
    
    if (prevIndex === null && nextIndex === null) {
        // List is empty
        var baseIndex = stepSize / 2;
        var jitter = Math.random() * 0.0001; // Small jitter for empty list
        return (baseIndex + jitter).toFixed(10);
    } else if (prevIndex === null) {
        // Beginning of List
        var nextNum = Number(nextIndex);
        var baseIndex = Math.min(stepSize / 2, nextNum / 2);
        var jitter = Math.random() * (baseIndex * 0.1); // 10% of base as max jitter
        return (baseIndex + jitter).toFixed(10);
    } else if (nextIndex === null) {
        // End of List
        var prevNum = Number(prevIndex);
        var baseIndex = prevNum + stepSize;
        var jitter = Math.random() * 0.0001; // Small jitter for end
        return (baseIndex + jitter).toFixed(10);
    } else {
        // Between Two Items - CRITICAL CASE
        var prevNum = Number(prevIndex);
        var nextNum = Number(nextIndex);
        var gap = nextNum - prevNum;
        
        // Safety check for invalid ranges
        if (gap <= 0) {
            throw new Error('Invalid range: prevIndex (' + prevIndex + ') must be less than nextIndex (' + nextIndex + ')');
        }
        
        // For extremely small gaps, use safe midpoint without jitter
        var minSafeGap = 1e-10; // 10 decimal places precision
        if (gap <= minSafeGap) {
            var safeMidpoint = prevNum + (gap / 2);
            return safeMidpoint.toFixed(15); // Higher precision for tiny gaps
        }
        
        // Calculate safe midpoint with bounded jitter
        var midpoint = prevNum + (gap / 2);
        
        // Jitter is limited to 25% of the gap on either side of midpoint
        // This ensures we never exceed boundaries
        var maxJitter = gap * 0.25;
        var jitter = (Math.random() - 0.5) * maxJitter;
        var finalIndex = midpoint + jitter;
        
        // Final safety check with small epsilon to handle floating point precision
        var epsilon = 1e-15;
        if (finalIndex <= (prevNum + epsilon) || finalIndex >= (nextNum - epsilon)) {
            if (typeof console !== 'undefined' && console.warn) {
                console.warn('Boundary violation detected, using safe midpoint');
            }
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

    var indexes = [];
    
    // Simple sequential approach: generate each index between the previous and next
    var currentPrev = prevIndex;
    
    for (var i = 0; i < count; i++) {
        var newIndex = generateFractionalIndex(currentPrev, nextIndex);
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
 * @param {boolean} [distributeEvenly] - Whether to distribute items evenly in the target space (default: true)
 * @returns {string[]} An array of new indexes for the relocated items
 */
function generateRelocationIndexes(targetPrevIndex, targetNextIndex, count, distributeEvenly) {
    // Handle default parameter for ES5 compatibility
    if (typeof distributeEvenly === 'undefined') {
        distributeEvenly = true;
    }
    
    if (count <= 0) return [];
    if (count === 1) return [generateFractionalIndex(targetPrevIndex, targetNextIndex)];

    if (distributeEvenly) {
        // Calculate evenly spaced positions
        var indexes = new Array(count);
        var start = targetPrevIndex ? Number(targetPrevIndex.slice(0, 7)) : 0;
        var end = targetNextIndex ? Number(targetNextIndex.slice(0, 7)) : start + count * 0.001;
        
        // Calculate step size for even distribution
        var step = (end - start) / (count + 1);
        
        for (var i = 0; i < count; i++) {
            var position = (start + step * (i + 1)).toFixed(5);
            var jitter = Math.floor(10000 + Math.random() * 90000).toString();
            indexes[i] = position + jitter;
        }
        
        return indexes;
    } else {
        // Use bulk insertion if even distribution is not required
        return generateBulkIndexes(targetPrevIndex, targetNextIndex, count);
    }
}

// ES5-compatible module exports
// Support both CommonJS and browser globals
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    // Node.js/CommonJS environment
    module.exports = {
        generateFractionalIndex: generateFractionalIndex,
        generateBulkIndexes: generateBulkIndexes,
        generateRelocationIndexes: generateRelocationIndexes
    };
} else if (typeof window !== 'undefined') {
    // Browser environment - attach to window
    window.FractionalIndexing = {
        generateFractionalIndex: generateFractionalIndex,
        generateBulkIndexes: generateBulkIndexes,
        generateRelocationIndexes: generateRelocationIndexes
    };
}
