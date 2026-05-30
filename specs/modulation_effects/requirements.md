# Requirements: Modulation Effects, LFO, and Arpeggiator

Este documento define los requisitos funcionales y no funcionales para la feature de Efectos de Modulación, LFO y Arpegiador integrado, redactados utilizando la sintaxis estricta EARS (Easy Approach to Requirements Syntax).

---

## Requisitos de Sistema (System Requirements)

### 1. Clock Subdivision (Subdivisión de Reloj)

#### R1
El sistema DEBE ejecutar el bucle de secuenciación de `AudioEngine` con una resolución de fusa (`32n`).

#### R2
MIENTRAS el secuenciador principal del Piano Roll avanza por pasos de semicorchea (`16n`), el sistema DEBE disparar las notas de paso polifónicas convencionales cada 2 ticks del reloj de `32n` (es decir, en pasos pares de fusa `step32 % 2 === 0`).

---

### 2. Modulation FX Slot (Efectos de Modulación)

#### R3
El sistema DEBE proveer en cada pista una única ranura de efectos de modulación (`Modulation Slot`) configurable con tipos de efecto `'none' | 'chorus' | 'flanger' | 'phaser'`.

#### R4
MIENTRAS un efecto de modulación esté configurado como `'none'`, el sistema DEBE establecer a `0` la propiedad `wet` de los nodos de Chorus, Flanger y Phaser de la pista correspondiente para evitar el consumo de CPU.

#### R5
MIENTRAS un efecto de modulación esté activo (`'chorus'`, `'flanger'` o `'phaser'`), el sistema DEBE establecer la propiedad `wet` del nodo del efecto seleccionado según el valor de mezcla (`wet`) configurado en el store, y mantener los otros efectos de modulación inactivos con su `wet` en `0`.

#### R6
CUANDO el usuario modifica los parámetros de velocidad (`rate`) o profundidad (`depth`) de los efectos de modulación en la UI, el sistema DEBE actualizar la frecuencia de oscilación y la profundidad de modulación del nodo activo en el `AudioEngine`.

---

### 3. LFO Modulator (Modulador LFO)

#### R7
El sistema DEBE proveer en cada pista un modulador LFO independiente que pueda enrutarse a destinos de modulación: `'none' | 'pitch' | 'filter' | 'volume'`.

#### R8
MIENTRAS el destino del LFO esté configurado como `'none'`, el sistema DEBE desconectar el LFO de cualquier parámetro de audio y restablecer la afinación original (`synth.detune = 0`), abrir completamente el filtro (`20000 Hz`) y mantener la ganancia en `1.0`.

#### R9
MIENTRAS el destino del LFO sea `'pitch'`, el sistema DEBE conectar el LFO al parámetro `detune` del sintetizador de la pista, escalando su amplitud entre `-100 * depth` y `+100 * depth` cents.

#### R10
MIENTRAS el destino del LFO sea `'filter'`, el sistema DEBE conectar el LFO al parámetro de frecuencia de corte (`frequency`) de un filtro lowpass dedicado de la pista, oscilando entre `200` y `200 + (10000 - 200) * depth` Hz.

#### R11
MIENTRAS el destino del LFO sea `'volume'`, el sistema DEBE conectar el LFO a la ganancia de un nodo `Gain` dedicado para tremolo, oscilando la ganancia entre `1.0 - depth` y `1.0`.

---

### 4. Arpeggiator (Arpegiador)

#### R12
El sistema DEBE proveer en cada pista un arpegiador que se active y desactive de forma independiente mediante un parámetro `arp_enabled`.

#### R13
MIENTRAS el arpegiador esté activo y existan notas programadas en el paso actual del Piano Roll, el sistema DEBE reproducir una sola nota del acorde por cada subdivisión temporal seleccionada (`arp_rate` de `'8n'`, `'16n'` o `'32n'`) en lugar del acorde polifónico completo.

#### R14
MIENTRAS el arpegiador ordene las notas, el sistema DEBE aplicar la dirección configurada (`'up'`, `'down'`, `'updown'` o `'random'`) sobre el conjunto de notas del acorde ordenadas cromáticamente y extendidas por el número de octavas configurado (`arp_octaves` de 1 a 3).

#### R15
CUANDO el secuenciador entra en un nuevo paso de semicorchea (`16n`), el sistema DEBE reiniciar el patrón del arpegiador para sincronizar exactamente el primer golpe del acorde.

---

### 5. Eurorack Modular UI (Panel de Dispositivos Eurorack)

#### R16
El sistema DEBE renderizar tres nuevos módulos compactos interactivos y de estética pixel-art neón en el Eurorack Device Panel: uno para la ranura de efectos de modulación (Modulation FX), otro para el LFO, y otro para el Arpeggiator.
