// Spaced Repetition System (SRS)

// SM2 Algorithm
function calculateSM2Interval(quality, previousInterval, previousEFactor) {
    let interval;
    let eFactor = previousEFactor;
    
    if (quality >= 4) {
        if (previousInterval === 0) {
            interval = 1;
        } else if (previousInterval === 1) {
            interval = 6;
        } else {
            interval = Math.round(previousInterval * eFactor);
        }
        
        eFactor = eFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (eFactor < 1.3) eFactor = 1.3;
    } else {
        interval = 1;
        eFactor = Math.max(1.3, eFactor - 0.2);
    }
    
    return { interval, eFactor };
}

// Get next review date
function getNextReviewDate(interval) {
    const date = new Date();
    date.setDate(date.getDate() + interval);
    return date;
}