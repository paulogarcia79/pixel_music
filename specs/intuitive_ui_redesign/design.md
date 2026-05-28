# Design - Intuitive UI Redesign

Este documento detalla las decisiones técnicas de diseño de software para implementar el rediseño de interfaz de usuario de Pixel Music.

---

## 1. Estructura de Componentes y Archivos

### 🚀 Nuevos Componentes
1.  **`src/components/sequencer/DevicePanel.vue`**:
    -   **Propósito**: Panel inferior plegable de estilo rack Eurorack modular pixel-art. Muestra los controles avanzados (ADSR, FX, Oscilador) y la envolvente interactiva del track seleccionado.
    -   **Ubicación en el Layout**: Se acopla en la parte inferior del contenedor del secuenciador (debajo del Piano Roll y el Song Arranger, o alineado con ellos).
2.  **`src/components/sequencer/Knob.vue`**:
    -   **Propósito**: Componente reutilizable de perilla rotatoria (tactile rotary knob). Implementa el rastreo de arrastre (drag) con el ratón para aumentar/disminuir valores de forma fluida y rota un indicador visual pixelado en un ángulo de `-135deg` a `+135deg`.

### 🛠️ Componentes Modificados
1.  **`src/App.vue`**:
    -   Rediseño del grid principal para dar soporte a un layout Ableton-style:
        -   Sidebar izquierdo colapsado o reducido a 240px (`w-60`).
        -   Eliminación de la configuración detallada de parámetros del sidebar.
        -   Adición del componente `<DevicePanel />` en la base.
    -   Gestión del estado reactivo `isDevicePanelOpen` (boolean) y su persistencia opcional.
2.  **`src/components/sequencer/PianoRoll.vue`**:
    -   Adición de los botones de filtro de octava en el header del Piano Roll.
    -   Adición del selector de Escala (Scale Helper).
    -   Modificación del renderizado de la grilla para aplicar clases condicionales a filas inactivas fuera de la escala y para inyectar filtros basados en la octava activa.
    -   Implementación del evento `@mouseenter` / `@mouseleave` en cada celda para establecer el estado de hover y renderizar el overlay de texto de la nota correspondiente (`note`).
3.  **`src/components/sequencer/SongArranger.vue`**:
    -   Rediseño estético de los bloques del arranger utilizando colores de neón consistentes mapeados a cada ID de patrón (ej. `bg-neon-pink/20 border-neon-pink` para P1, `bg-neon-cyan/20 border-neon-cyan` para P2, etc.).
    -   Adición de interacción simplificada de borrado de bloques con un solo clic sobre el bloque (`@click.stop="store.removePlacement(track.id, p.id)"`).
    -   Optimización del estilo del playhead con efectos de brillo neon.

---

## 2. Firmas y Modificaciones de APIs y Tipos

### 📍 Mapeo de Categorías de Instrumentos (`src/stores/sequencer.ts`)
Definiremos una constante en una utilidad o directamente en el componente para agrupar los `InstrumentType` en 5 categorías claras y mapearlas a sus respectivos iconos de **Lucide Vue**:
```typescript
import { Keyboard, Drum, Waves, Music, Cpu } from 'lucide-vue-next';

export const INSTRUMENT_CATEGORIES: Record<InstrumentType, { icon: any; category: string }> = {
  // Retro Basics
  square: { icon: Cpu, category: 'Basic' },
  triangle: { icon: Cpu, category: 'Basic' },
  sawtooth: { icon: Cpu, category: 'Basic' },
  noise: { icon: Cpu, category: 'Basic' },
  sine: { icon: Cpu, category: 'Basic' },
  pulse: { icon: Cpu, category: 'Basic' },
  pwm: { icon: Cpu, category: 'Basic' },

  // Percussion
  kick: { icon: Drum, category: 'Drum' },
  snare: { icon: Drum, category: 'Drum' },
  hihat: { icon: Drum, category: 'Drum' },
  tom: { icon: Drum, category: 'Drum' },
  clap: { icon: Drum, category: 'Drum' },
  crash: { icon: Drum, category: 'Drum' },
  conga: { icon: Drum, category: 'Drum' },
  cowbell: { icon: Drum, category: 'Drum' },
  woodblock: { icon: Drum, category: 'Drum' },
  shaker: { icon: Drum, category: 'Drum' },
  rimshot: { icon: Drum, category: 'Drum' },

  // Keys & Organs
  piano_pixel: { icon: Keyboard, category: 'Keys' },
  electric_piano: { icon: Keyboard, category: 'Keys' },
  honky_tonk: { icon: Keyboard, category: 'Keys' },
  organ_pixel: { icon: Keyboard, category: 'Keys' },
  church_organ: { icon: Keyboard, category: 'Keys' },

  // Strings & Vents
  guitar_pixel: { icon: Music, category: 'Strings' },
  guitar_dist: { icon: Music, category: 'Strings' },
  flute_pixel: { icon: Music, category: 'Strings' },
  clarinet_pixel: { icon: Music, category: 'Strings' },
  retro_oboe: { icon: Music, category: 'Strings' },

  // Synths
  bass_synth: { icon: Waves, category: 'Synth' },
  sub_bass: { icon: Waves, category: 'Synth' },
  lead_synth: { icon: Waves, category: 'Synth' },
  super_saw: { icon: Waves, category: 'Synth' },
  acid_synth: { icon: Waves, category: 'Synth' },
  pad: { icon: Waves, category: 'Synth' },
  fm_pluck: { icon: Waves, category: 'Synth' },
  fm_bell: { icon: Waves, category: 'Synth' },
  retro_brass: { icon: Waves, category: 'Synth' },
  ghost_synth: { icon: Waves, category: 'Synth' }
};
```

### 📍 Nuevas Propiedades Reactivas Locales
En **`PianoRoll.vue`**:
-   `activeOctave = ref<'all' | 'low' | 'mid' | 'high'>('all')`
-   `activeScale = ref<'chromatic' | 'major' | 'minor' | 'aminor'>('chromatic')`
-   `hoveredCell = ref<{ step: number; note: string } | null>(null)`

---

## 3. Lógica del Visualizador de Envolvente ADSR en el Device Panel

El visualizador gráfico interactivo de la envolvente se implementará mediante una sección con un elemento `<canvas>` o un `<svg>` reactivo que calcule y trace la curva ADSR basándose en la configuración de la pista actual.

### 📐 Ecuación Visual de la Envolvente
Para una representación visual estéticamente coherente e interactiva en Pixel Art:
-   **Ancho Total**: 200px. **Alto Total**: 80px.
-   El punto inicial comienza en `(0, 80)`.
-   **Ataque (Attack)**: Se mapea linealmente el valor `attack` (entre 0.001s y 2.0s) a un ancho de pantalla de `0px` a `80px`. La coordenada final del Ataque es `(AttackWidth, 10)` (el pico del volumen).
-   **Sustain/Decay**: Dado que el motor simplificado usa un ADSR con Decay fijo/nulo en la especificación inicial, mantendremos un nivel de Sustain estático al `70%` de altura `(alto = 31px)`. Trazamos una línea desde el pico del Ataque hasta `(AttackWidth + 15, 31)`.
-   **Release (Release)**: Se mapea linealmente el valor `release` (entre 0.01s y 4.0s) a un ancho en pantalla de `5px` a `80px`. Se traza una línea desde el nivel de Sustain `(AttackWidth + 15 + 40, 31)` hasta `(AttackWidth + 15 + 40 + ReleaseWidth, 80)` (silencio absoluto).
-   El fondo del canvas simulará una pantalla retro digital oscura con rejilla fluorescente.

---

## 4. Lógica del Scale Helper (Asistente de Escalas)

Para resaltar las notas en-escala dentro de la escala seleccionada en el Piano Roll:
-   Filtraremos cada nota de la lista cromática (`notes`) para ver si su altura básica sin octava (ej. "C", "D#") pertenece al conjunto de notas de la escala en tonalidad de Do (C):
    -   **C Major**: `['C', 'D', 'E', 'F', 'G', 'A', 'B']`
    -   **C Minor**: `['C', 'D', 'D#', 'F', 'G', 'G#', 'A#']`
    -   **A Minor**: `['A', 'B', 'C', 'D', 'E', 'F', 'G']`
-   Implementaremos una función reactiva:
    ```typescript
    const isNoteInSelectedScale = (note: string) => {
      if (activeScale.value === 'chromatic') return true;
      const noteName = note.replace(/\d+/, ''); // Extrae "C#", "F", etc.
      if (activeScale.value === 'major') {
        return ['C', 'D', 'E', 'F', 'G', 'A', 'B'].includes(noteName);
      }
      if (activeScale.value === 'minor') {
        return ['C', 'D', 'D#', 'F', 'G', 'G#', 'A#'].includes(noteName);
      }
      if (activeScale.value === 'aminor') {
        return ['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(noteName);
      }
      return true;
    };
    ```
-   Si la nota no pertenece a la escala seleccionada, su fila en el Piano Roll se sombreará atenuándose con un fondo oscuro translúcido (`bg-black/50 opacity-40`) y bordes apagados.

---

## 5. Gestión del Arrastre del Ratón en el Componente `Knob.vue`

Para implementar perillas rotatorias de alta fidelidad:
-   El componente escuchará los eventos `@mousedown` / `@touchstart` en el elemento de la perilla.
-   Registrará manejadores de eventos globales para `mousemove` / `mouseup` y `touchmove` / `touchend`.
-   Al arrastrar hacia arriba/derecha, aumentará linealmente el valor de forma continua en función de la sensibilidad configurada, y al arrastrar hacia abajo/izquierda, lo disminuirá.
-   El ángulo de rotación se calcula reactivamente como:
    ```typescript
    const angle = computed(() => {
      const percentage = (props.modelValue - props.min) / (props.max - props.min);
      // Mapea de -135 a +135 grados
      return -135 + percentage * 270;
    });
    ```
-   Visualmente usará un diseño de círculo pixel-art con una línea indicadora blanca que rotará dinámicamente con `transform: rotate(${angle}deg)`.

---

## 6. Alternativas Descartadas e Ingeniería de Calidad

*   **Alternativa Descartada: Uso de Sliders Nativos con Formato Circular por CSS**
    -   *Justificación*: Los sliders HTML nativos (`<input type="range">`) son muy difíciles de estilizar en forma de esfera tridimensional o dial circular de forma consistente en todos los navegadores móviles y de escritorio. El resultado visual suele ser plano y poco atractivo, rompiendo la inmersión en la estética retro-Eurorack de hardware musical digital que el usuario de Pixel Music espera. Crear un componente personalizado basado en coordenadas de arrastre garantiza control total del estilo y una sensación física premium.
*   **Alternativa Descartada: Modificar y Guardar Escalas y Rangos en la Store de Pinia**
    -   *Justificación*: La visualización del Piano Roll (salto de octavas, escala seleccionada para ayuda visual) es un estado puramente de interfaz de presentación y no afecta de ninguna manera la secuenciación de audio subyacente o la exportación de archivos JSON. Mantener este estado local en `PianoRoll.vue` es lo más óptimo para mantener el store global `sequencer.ts` limpio y centrado exclusivamente en el dominio de datos (Data Layer) y el pipeline de audio de bajo nivel, tal como lo prescribe `docs/architecture.md`.
