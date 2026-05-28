# Convenciones de Código (Vue 3 + TypeScript + Tailwind v4)

> Homogeneidad extrema. La IA y los desarrolladores predicen mejor el código cuando el repositorio se parece a sí mismo en todas partes.

---

## 💻 Estilo de JavaScript / TypeScript / Vue 3

*   **Sintaxis moderna**: Usa ECMAScript 6+ (const/let, arrow functions, async/await, destructuración).
*   **Composition API con TypeScript**: Todos los componentes `.vue` deben usar la sintaxis `<script setup lang="ts">`.
*   **Semicolons & Quotes**:
    *   Usa comillas simples `'...'` en archivos `.ts` / `.js` y dentro del bloque `<script>` de Vue.
    *   Usa comillas dobles `"..."` para atributos HTML y directivas de Vue en el `<template>`.
    *   Usa plantillas de cadena (backticks \`...\`) para interpolaciones complejas.

---

## 🏷️ Nomenclatura

| Tipo de Elemento        | Convención    | Ejemplo |
|-------------------------|---------------|---------|
| Archivos de Componente  | `PascalCase`  | `PianoRoll.vue`, `Transport.vue`, `SongArranger.vue` |
| Stores de Pinia         | `camelCase`   | `sequencer.ts` |
| Motores de Audio y Aux  | `PascalCase`  | `AudioEngine.ts` |
| Funciones y Variables   | `camelCase`   | `currentStep`, `toggleNote()`, `isSongMode` |
| Constantes Globales     | `UPPER_SNAKE` | `DEFAULT_BPM`, `MAX_STEPS`, `CHROMATIC_NOTES` |
| Clases CSS / Utilities  | Tailwind v4   | `flex items-center bg-dark-bg text-neon-cyan` |

---

## 🧱 Estructura de un Archivo `.vue`

Cada componente debe seguir exactamente este orden:

```vue
<script setup lang="ts">
// 1. Imports de Vue
import { ref, computed } from 'vue';

// 2. Imports de Iconos / Librerías de utilidades / Motores
import { Play, Square } from 'lucide-vue-next';
import { AudioEngine } from '../../audio/AudioEngine';

// 3. Imports de Stores / Estado Global
import { useSequencerStore } from '../../stores/sequencer';

// 4. Props y Emits (si aplica)
const props = defineProps({
  trackName: { type: String, required: true }
});
const emit = defineEmits(['note-toggle']);

// 5. Instanciación del Store
const store = useSequencerStore();

// 6. Estado Reactivo Interno (refs/reactives)
const isHovered = ref(false);

// 7. Computeds y Funciones locales
const isActiveTrack = computed(() => {
  return store.selectedTrackName === props.trackName;
});

function handlePlayPreview() {
  AudioEngine.playNote('C4', '16n', 'square', props.trackName);
  emit('note-toggle');
}
</script>

<template>
  <div 
    class="p-4 border bg-dark-bg rounded-lg transition-all duration-300"
    :class="[isActiveTrack ? 'border-neon-cyan shadow-[0_0_10px_rgba(5,217,232,0.2)]' : 'border-grid-line']"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <h3 class="font-bold text-neon-cyan uppercase text-xs">{{ trackName }}</h3>
    <button 
      @click="handlePlayPreview" 
      class="flex items-center gap-2 px-3 py-1 bg-neon-pink hover:bg-neon-pink/80 text-white rounded transition-transform active:scale-95"
    >
      <Play class="w-3 h-3" /> Preview
    </button>
  </div>
</template>

<style scoped>
/* Opcional: Solo si se requieren transiciones CSS muy específicas que no cubra Tailwind */
</style>
```

---

## 🎨 Convenciones de Tailwind CSS v4

*   **Configuración en CSS nativo**: En Tailwind v4, las variables del tema de diseño se configuran en el archivo CSS global (`src/style.css`) bajo la directiva `@theme`. No crees archivos `tailwind.config.js`.
*   **Diseño Interactivo y Fluido**: Siempre provee estados interactivos utilizando modificadores:
    *   `hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-out`
    *   `hover:shadow-[0_0_10px_rgba(255,42,109,0.5)] focus:ring-1 focus:ring-neon-pink outline-none`
*   **Aesthetics Retro Cyberpunk y Neon-Punk**:
    *   **Fondos Oscuros**: `bg-dark-bg` para la base oscura del DAW.
    *   **Acentos de Neón**: `text-neon-cyan` (celeste neón), `text-neon-pink` (rosa/fucsia brillante), `text-neon-green` (verde neón brillante).
    *   **Efectos de Brillo (Glow)**: Usa sombras de neón dinámicas como `shadow-[0_0_15px_#05d9e8]` para el cursor de reproducción láser o los pasos activos.
    *   **Bordes de Grilla**: Usa `border-grid-line` para emular las interfaces estructuradas de los secuenciadores de hardware clásico.

---

## ✨ Estética Premium y Skill `frontend-design` (Obligatorio)

Todo desarrollo de interfaces de usuario, layouts, tipografías, transiciones y elementos visuales **DEBE estar estrictamente basado en las pautas y principios de la skill `frontend-design`** para evitar la "estética genérica de IA" y lograr un diseño de nivel de producción que cautive al usuario:

1.  **Dirección Estética Clara**: Comprometerse con una dirección visual definida. En el caso de Pixel Music: una estética **cyberpunk digital táctil de hardware retro** (grillas estructuradas de neón, elementos interactivos con micro-sombras, y animaciones sutiles pero de alta fidelidad como el recorrido del cursor láser).
2.  **No a la Estética Genérica**: Queda terminantemente prohibido usar interfaces planas y ultra-genéricas sobre fondo blanco. Usa tipografías que combinen bien en entornos técnicos y legibles, manteniendo la paleta oscura de neón coherente.
3.  **Animación de Alto Impacto (Motion)**: Sincronizar el cursor láser con la temporización real de audio, dotar a los botones de micro-interacciones rápidas y precisas al hacer clic, e implementar transiciones fluidas al alternar entre modo patrón y modo canción.
4.  **Composición Espacial de Hardware**: Estructurar los paneles de forma densa pero balanceada, tal como los sintetizadores y cajas de ritmo físicos clásicos (controles deslizantes de ADSR alineados, agrupadores de sintetizadores y matriz de secuenciador compacta y responsiva).
