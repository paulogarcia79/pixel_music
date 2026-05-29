# Requirements — Track Polyphony

## Estructura de Datos (Step Notes)

### R1
El sistema DEBE almacenar las notas de cada paso en una pista (`TrackInstance`) bajo el formato de un mapa donde las claves son números de paso y los valores son arreglos de cadenas de caracteres (`Record<number, string[]>`), denominados Step Notes.

---

## Operaciones de Estado (sequencer.ts)

### R2
CUANDO se añade una nota en un paso específico mediante `addNote`, el sistema DEBE insertar dicha nota en el arreglo correspondiente a ese paso sin generar duplicados.

### R3
CUANDO se elimina una nota específica en un paso mediante `removeNote` pasándole dicha nota como tercer argumento, el sistema DEBE removerla de la lista de notas de ese paso.

### R4
CUANDO se elimina una nota en un paso mediante `removeNote` y el arreglo de notas de ese paso queda vacío, el sistema DEBE eliminar la entrada de ese paso del mapa de notas de la pista.

### R5
CUANDO se elimina el paso completo mediante `removeNote` sin especificar una nota, el sistema DEBE eliminar la entrada completa de ese paso del mapa de notas de la pista.

### R6
CUANDO se consulta una nota en un paso mediante `getNoteAt`, el sistema DEBE retornar el arreglo de notas de ese paso o `undefined` si no existen notas.

---

## Retrocompatibilidad & Carga de Datos (sequencer.ts)

### R7
CUANDO se carga un proyecto mediante `loadProject`, el sistema DEBE normalizar automáticamente cualquier nota en formato monofónico (tipo `string`) convirtiéndola en un arreglo (`[string]`).

### R8
CUANDO se carga un preset mediante `loadPreset`, el sistema DEBE normalizar automáticamente cualquier nota en formato monofónico (tipo `string`) convirtiéndola en un arreglo (`[string]`).

---

## Motor de Audio (AudioEngine.ts)

### R9
CUANDO se inicializan sintetizadores melódicos mediante `createSynthByType`, el sistema DEBE envolverlos en una instancia de `Tone.PolySynth` para permitir la reproducción polifónica.

### R10
CUANDO se inicializan sintetizadores de percusión mediante `createSynthByType`, el sistema DEBE mantenerlos como monofónicos independientes (`Tone.MembraneSynth`, `Tone.NoiseSynth` o `Tone.MetalSynth`).

### R11
MIENTRAS se reproduce el secuenciador en tiempo real o en el renderizado offline (`exportAudioOffline`), el sistema DEBE disparar de forma polifónica todas las notas correspondientes al paso activo para las pistas melódicas.

### R12
MIENTRAS se reproduce el secuenciador en tiempo real o en el renderizado offline (`exportAudioOffline`), el sistema DEBE disparar el sintetizador de percusión una sola vez en el paso activo si existe al menos una nota registrada en él.

---

## Interfaz de Usuario (PianoRoll.vue)

### R13
CUANDO el usuario hace clic en una celda vacía de la rejilla del PianoRoll, el sistema DEBE añadir la nota correspondiente a ese paso en la pista activa y hacer sonar únicamente esa nota a modo de previsualización.

### R14
CUANDO el usuario hace clic en una celda que ya contiene una nota activa en la rejilla del PianoRoll, el sistema DEBE remover esa nota individual de ese paso en la pista activa sin alterar las demás notas de dicho paso.

### R15
CUANDO se verifica el estado activo de una celda mediante `isNoteActive`, el sistema DEBE evaluar si la nota correspondiente a la fila de la rejilla se encuentra incluida en el arreglo de notas de ese paso para la pista indicada.

### R16
CUANDO se solicitan las notas fantasma de otras pistas en un paso mediante `getGhostNotes`, el sistema DEBE identificar y retornar las pistas que tengan la nota de la celda actual incluida en sus arreglos de notas de ese paso.
