# Tasks Checklist: Modulation Effects, LFO, and Arpeggiator

Este documento contiene la lista ordenada de tareas discretas que deben ser implementadas para completar la feature de Efectos de Modulación, LFO y Arpegiador. Cada paso referencia los IDs de requisitos (`R<n>`) que cubre.

---

## Checklist de Implementación

### Fase 1: Estado del Secuenciador (Pinia Store)

- [x] **T1 — Modificar `src/stores/sequencer.ts`**:
  * Extender la interfaz `TrackInstance` con las propiedades de modFX, LFO y arpegiador.
  * Añadir las inicializaciones y valores por defecto en `createDefaultTrack`, `loadProject` y `loadPreset`.
  * Añadir las nuevas acciones `setTrackModFX`, `setTrackLFO` y `setTrackArpeggiator`.
  * *Cubre: R3, R7, R12.*

---

### Fase 2: Motor de Audio (AudioEngine - Nodos y Flujo)

- [x] **T2 — Subdivisión a 32n en `AudioEngine.ts`**:
  * Modificar `scheduleRepeat` del loop en `setupLoop()` para correr a subdivisión `'32n'`.
  * Modificar el cálculo del paso del Piano Roll (`step16`) de forma que avance cada 2 ticks de fusa (`step32`).
  * Asegurar que el callback visual `setCurrentStep(step16)` solo se invoque en ticks pares de fusa (`step32 % 2 === 0`).
  * *Cubre: R1, R2.*

- [x] **T3 — Cadena en serie de modulación en `getOrCreateLiveNodes`**:
  * Modificar la interfaz `TrackNodes` para incluir las instancias permanentes de: `lfoFilter`, `lfoGain`, `lfo`, `chorus`, `flanger` y `phaser`.
  * Instanciar los nodos con configuraciones neutras por defecto.
  * Conectar el flujo: `synth -> lfoGain -> lfoFilter -> phaser -> flanger -> chorus -> delay -> reverb`.
  * *Cubre: R3, R4.*

---

### Fase 3: Procesamiento Dinámico de Modulación y LFO

- [x] **T4 — Lógica en tiempo real de Modulation FX**:
  * Implementar el método privado `updateModulationFX(nodes, track, time)` en `AudioEngine.ts`.
  * Configurar las propiedades `wet`, `frequency` y `depth` de los nodos de Chorus, Flanger y Phaser basándose en la configuración activa de la ranura de modulación (`modFX_type`).
  * Invocar esta actualización dentro de `setupLoop()` y en `exportAudioOffline()`.
  * *Cubre: R5, R6.*

- [x] **T5 — Lógica en tiempo real del LFO**:
  * Implementar el método privado `updateLFO(nodes, track, time)` en `AudioEngine.ts`.
  * Desconectar el LFO en cada tick y restablecer los parámetros no modulados a sus valores por defecto (detune = 0, filter = 20000 Hz, gain = 1.0) si el target es `'none'`.
  * Conectar y configurar el LFO para los destinos `'pitch'`, `'filter'` y `'volume'` aplicando los rangos y profundidades de modulación establecidos en los requisitos.
  * Invocar esta actualización en `setupLoop()` y en `exportAudioOffline()`.
  * *Cubre: R8, R9, R10, R11.*

---

### Fase 4: Lógica de Secuenciación del Arpegiador

- [x] **T6 — Motor del Arpegiador en `AudioEngine.ts`**:
  * Modificar el bucle de secuenciación en `setupLoop()` para interceptar la reproducción cuando `track.arp_enabled === true`.
  * Implementar una función auxiliar para ordenar cromáticamente el acorde y expandirlo por el número de octavas (`track.arp_octaves`).
  * Soportar las direcciones de arpegio: `'up'`, `'down'`, `'updown'` y `'random'`.
  * Almacenar y actualizar el índice del arpegiador de forma persistente en `nodes.arpState`.
  * Reiniciar el patrón de arpegiación en el cambio de semicorchea (`step32 % 2 === 0`) para garantizar la sincronización.
  * *Cubre: R13, R14, R15.*

---

### Fase 5: Interfaz de Usuario (Eurorack Device Panel)

- [x] **T7 — Rediseñar `src/components/sequencer/DevicePanel.vue`**:
  * Integrar visualmente los tres submódulos lado a lado: Modulation FX (tipo, rate, depth, wet), LFO (target, rate, depth, waveform) y Arpeggiator (enable toggle, rate, direction, octavas).
  * Consumir y sincronizar reactivamente las nuevas acciones y propiedades del store.
  * Utilizar componentes `Knob` y selectores táctiles retro-neón acordes con la estética retro-cyberpunk general y las directrices de la skill `frontend-design`.
  * *Cubre: R16.*

---

## Plan de Pruebas y Trazabilidad

Añadir una nueva suite de pruebas unitarias en `tests/modulationEffects.spec.ts` que cubra los siguientes escenarios:

- [x] **T8 — Unit Tests para el Motor de Audio**:
  * **Test 1**: Verificar que el loop de `AudioEngine` corre a `32n` y que las notas de paso convencionales se disparan cada 2 ticks (*Cubre: R1, R2*).
  * **Test 2**: Verificar que con `modFX_type = 'none'`, todos los `wet` de la cadena modFX están en `0` (*Cubre: R4*).
  * **Test 3**: Verificar que activar `'chorus'`, `'flanger'` o `'phaser'` cambia su respectivo `wet` y mantiene los otros en `0` (*Cubre: R5*).
  * **Test 4**: Verificar que el LFO en `'none'` desconecta las modulaciones y restablece afinación (`0`), filtro (`20000 Hz`) y ganancia (`1.0`) (*Cubre: R8*).
  * **Test 5**: Verificar que el LFO asignado a `'pitch'` modula `detune` (*Cubre: R9*).
  * **Test 6**: Verificar que el LFO asignado a `'filter'` modula el filtro lowpass dedicado (*Cubre: R10*).
  * **Test 7**: Verificar que el LFO asignado a `'volume'` modula la ganancia dedicada (*Cubre: R11*).
  * **Test 8**: Verificar que el arpegiador reproduce notas secuenciales según la velocidad y dirección configuradas y que reinicia su estado al cambiar de semicorchea (*Cubre: R13, R14, R15*).

- [x] **T9 — Unit Tests para la Interfaz de Usuario**:
  * **Test 9**: Verificar que `DevicePanel.vue` renderiza correctamente los tres módulos interactivos y de estética pixel-art neón para modFX, LFO y arpegiador (*Cubre: R16*).
