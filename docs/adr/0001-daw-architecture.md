# Architecture of Pixel Music DAW

We decided to use Vue 3 (Composition API) for UI presentation, Pinia for single-source-of-truth state management, and Tone.js for high-fidelity audio synthesis and scheduling, to decouple audio logic from rendering cycles and ensure precise timing.
