# 🎹 Pixel Music

Pixel Music is an interactive, browser-based digital audio workstation (DAW) and step sequencer. It features a retro aesthetic with extensive sound design controls, multi-track instrumentation, and song arranging capabilities.

---

## 🚀 Key Features

* **32-Step Piano Roll:** Draw note sequences across a three-octave chromatic scale (C3 to B5).
* **Multi-Instrument Tracks:** Multiple synthesizers including retro waveforms (square, pulse, sawtooth, PWM), keys and organs, percussion engines (kick, snare, conga, rimshot, clap), strings, and synthesized brass/bass pads.
* **Sound Design Controls:** Fine-tune the ADSR envelope (Attack and Release), filter values, volume, and send effects (reverb and delay) independently for each track.
* **Song Mode Arranger:** Place patterns on a multi-track arranger grid to compose longer musical tracks.
* **Audio Visualizer & Export:** Built-in real-time waveform visualizer and live-capture recording export functionality.

---

## 🛠️ Technology Stack

* **Frontend Framework:** [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`, TypeScript)
* **Build Tool:** [Vite](https://vite.dev/)
* **Audio Synthesis:** [Tone.js](https://tonejs.github.io/) (Web Audio API wrapper)
* **Styling:** Custom Vanilla CSS & [Tailwind CSS v4](https://tailwindcss.com/)

---

## 📁 Repository Structure

```
├── .agents/               # Multi-agent configurations (leader, spec_author, implementer, reviewer)
├── docs/                  # Architecture, conventions, specifications, and verification protocols
├── specs/                 # Requirements, designs, and tasks for active features (SDD)
├── progress/              # Active progress session trackers and historical logs
├── src/
│   ├── assets/            # Fonts and static assets
│   ├── audio/             # Tone.js Audio Engine synthesizer definitions and scheduling
│   ├── components/        # Vue 3 component tree (Transport, PianoRoll, SongArranger, WaveVisualizer)
│   ├── stores/            # Pinia global store managing tracks, patterns, sequencer, and arranger
│   └── App.vue            # Main application entry point
├── AGENTS.md              # Navigation guide for AI agents
├── CHECKPOINTS.md         # Objective quality checklists for reviewers
├── feature_list.json      # Complete project roadmap and task status tracker
└── init.sh                # Environment verification and setup script
```

---

## ⚙️ Getting Started

### 1. Verification & Setup
Verify your environment by running the base setup script in the project root:
```bash
./init.sh
```

### 2. Run the Development Server
Launch the local Vite server:
```bash
npm run dev
```

### 3. Build for Production
Bundle and optimize the application for production:
```bash
npm run build
```

---

## 🤖 Development Workflow (SDD)

This repository follows a strict **Spec Driven Development (SDD)** process orchestrated by AI subagents:
1. **Spec Creation:** A feature's specification (`requirements.md`, `design.md`, `tasks.md`) is drafted in `specs/<feature_name>/` using EARS notation.
2. **Human Approval:** No implementation begins until a human reviews and approves the spec draft.
3. **Implementation:** Once approved, code is written strictly inside a dedicated `feature/<name>` git branch.
4. **Review & Integration:** Code is reviewed against requirements and checkpoints before merging into `main`.

For coding conventions and styling patterns, please consult [conventions.md](file:///home/paulo/Desktop/paulo/code/pixel_music/docs/conventions.md) and [architecture.md](file:///home/paulo/Desktop/paulo/code/pixel_music/docs/architecture.md).
