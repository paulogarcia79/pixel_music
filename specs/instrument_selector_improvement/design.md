# Technical Design: Instrument Selector Improvement

Este documento detalla el diseño técnico y las decisiones arquitectónicas para la mejora del selector de instrumentos en el Eurorack Device Panel de Pixel Music.

---

## 1. Archivos Afectados

El desarrollo afectará exclusivamente a la capa de presentación y a las pruebas del componente correspondiente:
*   `src/components/sequencer/DevicePanel.vue` (Rediseño visual, lógica de pestañas y auto-foco reactivo)
*   `tests/components/DevicePanel.spec.ts` (Actualización y ampliación de pruebas unitarias para validar las nuevas pestañas y auto-foco)

El store (`src/stores/sequencer.ts`) y el motor de audio (`src/audio/AudioEngine.ts`) ya dan soporte nativo a todos los tipos de instrumentos del catálogo ampliado, por lo que no requieren modificación en su lógica central.

---

## 2. Modificaciones y Nuevas Estructuras en la UI (`DevicePanel.vue`)

### A. Catálogo Ampliado de 30 Instrumentos
Se reemplazará la constante `INSTRUMENTS` dentro del componente con la lista completa de exactamente 30 instrumentos mapeados con su tipo, nombre legible, icono de píxeles correspondiente y su categoría:

```typescript
type InstrumentCategory = 'WAV' | 'SYN' | 'DRM' | 'KEY';

interface InstrumentDefinition {
  type: InstrumentType;
  name: string;
  icon: string;
  category: InstrumentCategory;
}

const INSTRUMENTS: InstrumentDefinition[] = [
  // WAV
  { type: 'square', name: 'Square Wave', icon: 'cpu', category: 'WAV' },
  { type: 'triangle', name: 'Triangle Wave', icon: 'cpu', category: 'WAV' },
  { type: 'sawtooth', name: 'Sawtooth Wave', icon: 'cpu', category: 'WAV' },
  { type: 'sine', name: 'Sine Wave', icon: 'cpu', category: 'WAV' },
  { type: 'noise', name: 'Noise Generator', icon: 'cpu', category: 'WAV' },
  { type: 'pulse', name: 'Pulse Wave', icon: 'cpu', category: 'WAV' },
  { type: 'pwm', name: 'PWM Oscillator', icon: 'cpu', category: 'WAV' },

  // SYN
  { type: 'bass_synth', name: 'Pixel Bass', icon: 'waves', category: 'SYN' },
  { type: 'sub_bass', name: 'Sub Bass', icon: 'waves', category: 'SYN' },
  { type: 'lead_synth', name: 'Lead Chiptune', icon: 'waves', category: 'SYN' },
  { type: 'super_saw', name: 'Hyper Saw', icon: 'waves', category: 'SYN' },
  { type: 'acid_synth', name: 'Acid Bassline', icon: 'waves', category: 'SYN' },
  { type: 'pad', name: 'Chamber Pad', icon: 'waves', category: 'SYN' },
  { type: 'fm_pluck', name: 'FM Pluck', icon: 'waves', category: 'SYN' },
  { type: 'fm_bell', name: 'FM Bell', icon: 'waves', category: 'SYN' },

  // DRM
  { type: 'kick', name: '8bit Kick', icon: 'drum', category: 'DRM' },
  { type: 'snare', name: 'Pixel Snare', icon: 'drum', category: 'DRM' },
  { type: 'hihat', name: 'Metal HiHat', icon: 'drum', category: 'DRM' },
  { type: 'tom', name: 'Retro Tom', icon: 'drum', category: 'DRM' },
  { type: 'clap', name: 'Chipped Clap', icon: 'drum', category: 'DRM' },
  { type: 'rimshot', name: 'Rimshot', icon: 'drum', category: 'DRM' },
  { type: 'cowbell', name: 'Cowbell', icon: 'drum', category: 'DRM' },

  // KEY
  { type: 'piano_pixel', name: 'Pixel Piano', icon: 'keyboard', category: 'KEY' },
  { type: 'electric_piano', name: 'E-Piano', icon: 'keyboard', category: 'KEY' },
  { type: 'organ_pixel', name: 'Pixel Organ', icon: 'keyboard', category: 'KEY' },
  { type: 'church_organ', name: 'Church Organ', icon: 'keyboard', category: 'KEY' },
  { type: 'guitar_pixel', name: 'Classic Guitar', icon: 'music', category: 'KEY' },
  { type: 'guitar_dist', name: 'Power Chord', icon: 'music', category: 'KEY' },
  { type: 'flute_pixel', name: 'Blowing Flute', icon: 'music', category: 'KEY' },
  { type: 'retro_brass', name: 'Retro Brass', icon: 'music', category: 'KEY' }
];
```

### B. Estado Reactivo Local de la Pestaña Activa
Se declarará una referencia reactiva local para controlar la pestaña visual seleccionada por el usuario:
```typescript
const activeTab = ref<InstrumentCategory>('WAV');
```

### C. Lógica de Auto-Foco Reactivo Bidireccional
Para lograr que la pestaña activa se sincronice reactivamente con el instrumento de la pista seleccionada (bidireccionalidad pista -> tab), se implementará un `watch` sobre el tipo de instrumento de la pista activa:

```typescript
watch(
  () => selectedTrack.value?.type,
  (newType) => {
    if (newType) {
      const matchedInstrument = INSTRUMENTS.find(inst => inst.type === newType);
      if (matchedInstrument) {
        activeTab.value = matchedInstrument.category;
      }
    }
  },
  { immediate: true }
);
```

### D. Rediseño del Layout HTML/Tailwind en la Oscillator Section
Se reemplazará el selector vertical simple por un diseño denso y sofisticado de estilo hardware Eurorack:

1.  **Barra de Pestañas (WAV, SYN, DRM, KEY)**:
    Renderizada horizontalmente al inicio de la Oscillator Section.
    *   Contenedor: `flex border-b border-gray-800/80 mb-2 gap-1`
    *   Botón de pestaña:
        ```html
        <button
          v-for="tab in (['WAV', 'SYN', 'DRM', 'KEY'] as const)"
          :key="tab"
          @click="activeTab = tab"
          class="flex-1 py-1 font-mono text-[9px] font-bold tracking-wider uppercase border-t border-x rounded-t transition-all cursor-pointer text-center"
          :class="[
            activeTab === tab 
              ? 'bg-[#181822] border-neon-cyan/50 text-neon-cyan shadow-[0_-2px_6px_rgba(5,217,232,0.1)]' 
              : 'bg-black/20 border-transparent text-gray-500 hover:text-gray-300 hover:bg-black/40'
          ]"
        >
          {{ tab }}
        </button>
        ```

2.  **Rejilla de dos columnas compacta**:
    Se renderizarán los instrumentos filtrados por `activeTab` en un contenedor con barra de desplazamiento personalizada.
    *   Filtrado reactivo:
        ```typescript
        const filteredInstruments = computed(() => {
          return INSTRUMENTS.filter(inst => inst.category === activeTab.value);
        });
        ```
    *   Contenedor de la Rejilla: `grid grid-cols-2 gap-1 overflow-y-auto max-h-[104px] pr-1 custom-scrollbar`
    *   Botones de instrumento con altura de `24px` (`h-6`):
        ```html
        <button
          v-for="inst in filteredInstruments"
          :key="inst.type"
          class="flex items-center gap-1.5 px-1.5 h-6 bg-black/40 border text-left font-mono text-[8px] rounded uppercase transition-all duration-150 active:scale-95 cursor-pointer min-w-0"
          :class="[
            trackType === inst.type 
              ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/5 shadow-[0_0_8px_rgba(5,217,232,0.15)] font-bold' 
              : 'border-gray-800/60 text-gray-400 hover:border-gray-700 hover:text-gray-300'
          ]"
          @click="trackType = inst.type"
        >
          <PixelIcon :name="inst.icon" class="w-2.5 h-2.5 flex-shrink-0" />
          <span class="truncate">{{ inst.name }}</span>
        </button>
        ```

---

## 3. Alternativa Descartada y Justificación

*   **Alternativa descartada**: Almacenar el estado `activeTab` en el store global de Pinia (`sequencer.ts`).
*   **Justificación**: La categoría seleccionada visualmente en el panel Eurorack es un estado puramente efímero y local de la presentación visual. Persistir este estado en el store global agregaría acoplamiento innecesario, rompería el principio de separación de responsabilidades (ver `docs/architecture.md`) y podría causar efectos colaterales si múltiples vistas intentaran instanciar o modificar la interfaz de forma independiente. Mantenerlo local con un `watch` reactivo asegura modularidad, reactividad fluida y facilidad de prueba.

---

## 4. Manejo de Excepciones

*   **Instrumento fuera de catálogo**: Si una pista es cargada con un tipo de instrumento que no forma parte de los 30 mapeados en `INSTRUMENTS` (por ejemplo, tipos de prueba antiguos), la lógica del `watch` no encontrará coincidencia. En este caso, la pestaña activa se mantendrá en su valor actual de manera silenciosa sin lanzar errores en tiempo de ejecución.
*   **Pista activa nula**: Si no hay ninguna pista seleccionada, el componente renderiza el mensaje de fallback en lugar de la Oscillator Section, previniendo que los computed intenten leer de variables nulas.
