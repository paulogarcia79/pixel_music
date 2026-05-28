# Arquitectura del Proyecto (Vue 3 + Pinia + Tone.js)

> Este documento define el estándar de calidad arquitectónica del proyecto Pixel Music. Los agentes revisores evalúan el código contra estas directrices.

---

## 🏗️ Principios Arquitectónicos

La aplicación se estructura como una **Single Page Application (SPA)** interactiva construida con **Vue 3 (Composition API + TypeScript)**, **Pinia** para la gestión de estado global, **Tone.js** para el motor de audio digital, y **Tailwind CSS v4**. Está organizada en tres capas desacopladas para garantizar la mantenibilidad y sincronización en tiempo real:

```
┌────────────────────────────────────────────────────────┐
│             Presentación (Componentes Vue)              │
│  - Transport.vue (Controles globales, BPM, Modos)      │
│  - PianoRoll.vue (Rejilla interactiva para notas)       │
│  - SongArranger.vue (Planimetría de patrones)           │
│  - WaveVisualizer.vue (Visualizador de forma de onda)  │
└──────────────────────────┬─────────────────────────────┘
                           │ (Lee Estado / Ejecuta Acciones)
                           ▼
┌────────────────────────────────────────────────────────┐
│            Capa de Estado Global (Pinia Store)         │
│  - sequencer.ts (Pistas, Notas, Volumen, ADSR, FX)    │
└──────────────────────────┬─────────────────────────────┘
                           │ (Suscripción y Sincronización)
                           ▼
┌────────────────────────────────────────────────────────┐
│           Capa de Procesamiento de Audio (Tone.js)     │
│  - AudioEngine.ts (Inicialización, Nodos FX, Loop)     │
│  - Tone.Transport (Sincronización temporal exacta)     │
└────────────────────────────────────────────────────────┘
```

### 1. Capa de Presentación (Componentes Vue)
*   Ubicada en `src/components/sequencer/`.
*   Usa exclusivamente `<script setup lang="ts">` con TypeScript.
*   **Separación de responsabilidades**: Los componentes visuales consumen el estado del store y ejecutan acciones definidas en Pinia. No manipulan de forma directa la lógica de bajo nivel del contexto de audio (`AudioContext`) ni instancian sintetizadores nativos.
*   Los estilos visuales se configuran mediante clases utilitarias de **Tailwind CSS v4** directamente en la plantilla para lograr la estética retro-futurista de alta gama.

### 2. Capa de Estado (Pinia Store)
*   Ubicada en `src/stores/sequencer.ts`.
*   Mantiene la configuración actual del secuenciador:
    *   **Pistas y Patrones**: Pistas de instrumentos (`TrackInstance`) con su mapa de notas (`step -> note`), tipo de sintetizador, volumen, efectos de envío (reverb, delay) y envolvente ADSR.
    *   **Configuración Temporal**: BPM actual, paso de reproducción activo (`currentStep`), paso global en modo canción y modo de reproducción activo (`isSongMode`).
    *   **Organizador de Canción**: Placements de patrones dentro de la estructura general de arreglos.

### 3. Capa de Procesamiento de Audio (AudioEngine)
*   Ubicada en `src/audio/AudioEngine.ts`.
*   Encapsula el ciclo de vida de los sintetizadores y efectos de Tone.js.
*   **Pipeline de Procesamiento de Audio**:
    *   **Nodos de Generación**: Instrumentos adaptativos creados según el tipo (`kick`, `snare`, `sawtooth`, `fm_pluck`, `super_saw`, etc.).
    *   **Línea de Efectos por Pista**: Los nodos de síntesis se conectan en serie con efectos dinámicos (`Tone.FeedbackDelay` -> `Tone.Freeverb`) y finalmente al bus Master de volumen.
    *   **Bus de Salida Máster**: Procesa la mezcla final a través de un compresor (`Tone.Compressor`), un limitador final (`Tone.Limiter`), y bifurca la señal hacia el analizador de forma de onda (`Tone.Waveform`) y la grabadora en vivo (`Tone.Recorder`).
*   **Bucle de Secuenciación**: Utiliza `Tone.Transport.scheduleRepeat` para evaluar, a intervalos de semicorchea (`16n`), qué notas deben reproducirse según el paso activo en el store, asegurando precisión de audio (jitter-free).

---

## 🚨 Qué NO Hacer (Restricciones Duras)

*   ❌ **No instanciar sintetizadores o efectos de Tone.js** directamente dentro de los componentes Vue. Toda creación o modificación de nodos de audio debe realizarse a través del `AudioEngine`.
*   ❌ **No duplicar el estado del secuenciador** en referencias internas del componente. Utiliza el store de Pinia para mantener una fuente única de verdad.
*   ❌ **No escribir lógica de temporización basada en `setInterval` o `requestAnimationFrame`** para secuenciar audio. La reproducción de eventos debe agendarse usando la línea de tiempo de `Tone.Transport` para evitar desincronizaciones en el hilo principal del navegador.
*   ❌ **No dejar logs de depuración activos** (`console.log`) en commits finales destinados a producción.
