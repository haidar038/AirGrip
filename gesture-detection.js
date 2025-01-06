class GestureDetector {
    constructor() {
        this.model = null;
        this.isGrabbing = false;
        this.lastGestureTime = 0;
        this.gestureThrottle = 500; // ms
    }

    async initialize() {
        this.model = await handpose.load();
        console.log('Handpose model loaded');
    }

    async detectGestures(video) {
        if (!this.model) return null;

        const predictions = await this.model.estimateHands(video);
        if (!predictions.length) return null;

        const hand = predictions[0];

        // Calculate finger curl using landmarks
        const fingerStates = this.analyzeFingerCurl(hand.landmarks);

        const now = Date.now();
        if (now - this.lastGestureTime < this.gestureThrottle) return null;

        this.lastGestureTime = now;
        return this.classifyGesture(fingerStates);
    }

    analyzeFingerCurl(landmarks) {
        const fingertips = [8, 12, 16, 20]; // Index, middle, ring, pinky
        const mcp = [5, 9, 13, 17]; // Metacarpophalangeal joints

        return fingertips.map((tip, i) => {
            const tipPoint = landmarks[tip];
            const mcpPoint = landmarks[mcp[i]];

            const distance = Math.sqrt(Math.pow(tipPoint[0] - mcpPoint[0], 2) + Math.pow(tipPoint[1] - mcpPoint[1], 2));

            return distance < 50; // Threshold for considering finger curled
        });
    }

    classifyGesture(fingerStates) {
        const allCurled = fingerStates.every((curled) => curled);
        const allExtended = fingerStates.every((curled) => !curled);

        if (allCurled && !this.isGrabbing) {
            this.isGrabbing = true;
            return 'grab';
        } else if (allExtended && this.isGrabbing) {
            this.isGrabbing = false;
            return 'release';
        }
        return null;
    }
}
