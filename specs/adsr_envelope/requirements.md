# Requirements: ADSR Envelope and Physical Modeling

Este documento define el comportamiento esperado de la envolvente ADSR (Attack, Decay, Sustain, Release) y de los controles de modelado físico (Dampening, Resonance), especificados mediante la notación estándar **EARS** (Easy Approach to Requirements Syntax).

---

## 1. Store y Modelado de Datos

### R1
El sistema DEBE incluir las propiedades `decay`, `sustain`, `dampening` y `resonance` en el modelo de estado de cada pista (`TrackInstance`) dentro del store de la aplicación.

### R2
El sistema DEBE asignar valores por defecto estables (`decay: 0.1` en segundos, `sustain: 0.8` como factor de ganancia de 0.0 a 1.0, `dampening: 4000` en Hz, `resonance: 0.95` como factor de 0.0 a 1.0) al instanciar nuevas pistas o cargar proyectos antiguos que carezcan de estos parámetros.

### R3
CUANDO la acción `setTrackADSR` sea invocada en el store con parámetros de Attack, Decay, Sustain y Release, el sistema DEBE actualizar reactivamente los cuatro valores de envolvente de la pista correspondiente.

### R4
CUANDO la acción `setTrackPhysicalModel` sea invocada en el store con parámetros de Dampening y Resonance, el sistema DEBE actualizar reactivamente ambos valores de modelado físico de la pista correspondiente.

---

## 2. Interfaz de Usuario (Eurorack Device Panel)

### R5
MIENTRAS el panel Eurorack esté abierto y haya una pista activa seleccionada que NO sea del tipo percusión, el sistema DEBE mostrar cuatro perillas (`Knob`) etiquetadas como Attack, Decay, Sustain y Release para modular los parámetros ADSR de la pista seleccionada.

### R6
MIENTRAS el panel Eurorack esté abierto y la pista activa seleccionada sea del tipo de sintetizador de modelado físico `guitar_pixel`, el sistema DEBE mostrar controles interactivos adicionales de tipo perilla (`Knob`) para Dampening y Resonance.

### R7
MIENTRAS la pista activa seleccionada NO sea del tipo de sintetizador de modelado físico `guitar_pixel`, el sistema NO DEBE mostrar los controles interactivos de Dampening y Resonance en el panel Eurorack.

### R8
CUANDO el usuario modifique cualquiera de los parámetros de Attack, Decay, Sustain o Release a través de las perillas correspondientes en pistas no percusivas, el sistema DEBE redibujar reactivamente la trayectoria visual del mini-visualizador SVG (`envelopePath`) en tiempo real utilizando los cuatro valores dinámicos reales actualizados.

### R13
MIENTRAS la pista activa seleccionada sea del tipo de instrumento percusivo, el sistema NO DEBE mostrar las perillas ADSR ni la curva SVG de envolvente, y DEBE mostrar un bloque de mensaje explicativo que indique que la envolvente transitoria es gestionada automáticamente por el sintetizador.

---

## 3. Motor de Audio (AudioEngine) y Modulación

### R9
CUANDO una pista con notas programadas inicie su reproducción en tiempo real, el sistema DEBE actualizar y aplicar los parámetros dinámicos de Attack, Decay, Sustain y Release a la envolvente del sintetizador correspondiente en el `AudioEngine`.

### R10
CUANDO una pista con tipo de instrumento `guitar_pixel` inicie su reproducción en tiempo real, el sistema DEBE actualizar y aplicar los parámetros dinámicos de Dampening y Resonance al sintetizador `PluckSynth` en el `AudioEngine`.

### R11
CUANDO el usuario realice una preescucha (función `playNote` en `AudioEngine`) de una nota individual sobre una pista activa, el sistema DEBE instanciar el sintetizador temporal aplicando los valores de envolvente ADSR de dicha pista.

### R12
CUANDO el usuario realice una exportación offline (`exportAudioOffline` en `AudioEngine`), el sistema DEBE aplicar los parámetros ADSR completos (y Dampening/Resonance para `guitar_pixel`) de cada pista al motor de síntesis offline para cada nota programada.
