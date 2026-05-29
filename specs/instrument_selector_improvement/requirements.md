# Requirements: Instrument Selector Improvement

Este documento define las especificaciones técnicas para el rediseño de la interfaz de selección de instrumentos en el Eurorack Device Panel de Pixel Music, redactadas utilizando la notación estándar **EARS** (Easy Approach to Requirements Syntax).

---

## 1. Catálogo e Integración de Instrumentos

### R1
El sistema DEBE proveer un catálogo unificado de exactamente 30 instrumentos distribuidos de forma balanceada en cuatro categorías exclusivas: `WAV` (ondas básicas), `SYN` (sintetizadores retro y pads), `DRM` (percusión digital y generadores de transitorios) y `KEY` (teclados, cuerdas e instrumentos tradicionales).

### R2
El sistema DEBE agrupar los 30 instrumentos del catálogo bajo las siguientes categorías de forma estricta:
*   **Categoría WAV** (7 instrumentos):
    1.  `square` (Square Wave)
    2.  `triangle` (Triangle Wave)
    3.  `sawtooth` (Sawtooth Wave)
    4.  `sine` (Sine Wave)
    5.  `noise` (Noise Generator)
    6.  `pulse` (Pulse Wave)
    7.  `pwm` (PWM Oscillator)
*   **Categoría SYN** (8 instrumentos):
    1.  `bass_synth` (Pixel Bass)
    2.  `sub_bass` (Sub Bass)
    3.  `lead_synth` (Lead Chiptune)
    4.  `super_saw` (Hyper Saw)
    5.  `acid_synth` (Acid Bassline)
    6.  `pad` (Chamber Pad)
    7.  `fm_pluck` (FM Pluck)
    8.  `fm_bell` (FM Bell)
*   **Categoría DRM** (7 instrumentos):
    1.  `kick` (8bit Kick)
    2.  `snare` (Pixel Snare)
    3.  `hihat` (Metal HiHat)
    4.  `tom` (Retro Tom)
    5.  `clap` (Chipped Clap)
    6.  `rimshot` (Rimshot)
    7.  `cowbell` (Cowbell)
*   **Categoría KEY** (8 instrumentos):
    1.  `piano_pixel` (Pixel Piano)
    2.  `electric_piano` (E-Piano)
    3.  `organ_pixel` (Pixel Organ)
    4.  `church_organ` (Church Organ)
    5.  `guitar_pixel` (Classic Guitar)
    6.  `guitar_dist` (Power Chord)
    7.  `flute_pixel` (Blowing Flute)
    8.  `retro_brass` (Retro Brass)

---

## 2. Interfaz de Usuario y Layout (Oscillator Section)

### R3
MIENTRAS el Eurorack Device Panel esté abierto y haya una pista activa seleccionada, el sistema DEBE mostrar una barra de cabecera con cuatro pestañas de navegación etiquetadas como `WAV`, `SYN`, `DRM` y `KEY` en la Oscillator Section del panel.

### R4
CUANDO el usuario haga clic en una de las pestañas (`WAV`, `SYN`, `DRM` o `KEY`), el sistema DEBE cambiar la pestaña activa de la interfaz y actualizar la rejilla inferior para mostrar única y exclusivamente los instrumentos pertenecientes a esa categoría.

### R5
MIENTRAS se visualicen los instrumentos correspondientes a la pestaña de categoría activa, el sistema DEBE estructurar los botones en una rejilla compacta de exactamente dos columnas (`grid-cols-2`).

### R6
MIENTRAS se rendericen los botones de instrumento dentro de la rejilla, el sistema DEBE aplicar a cada botón una altura física fija y compacta de exactamente `24px` (`h-6`).

### R7
MIENTRAS se visualicen los instrumentos, el sistema DEBE destacar visualmente el botón correspondiente al instrumento activo de la pista seleccionada (si se encuentra en la pestaña actual) aplicando estilos de alta visibilidad (borde neón y fondo translúcido acentuado).

---

## 3. Auto-Foco Reactivo y Bidireccional

### R8
CUANDO la pista seleccionada cambie en el secuenciador o se cargue un proyecto/preset, el sistema DEBE deducir reactiva y automáticamente la categoría (`WAV`, `SYN`, `DRM` o `KEY`) asociada al tipo de instrumento de la pista recién enfocada y conmutar la pestaña activa del selector a dicha categoría.

### R9
CUANDO el usuario seleccione una pista que ya esté enfocada pero su tipo de instrumento cambie a través de cualquier otra vía (como presets o comandos globales), el sistema DEBE reactivar la conmutación de pestaña de forma síncrona y automática.

### R10
CUANDO el usuario haga clic en cualquiera de los botones de instrumento de la rejilla compacta de dos columnas, el sistema DEBE actualizar de forma reactiva e inmediata la propiedad `type` del track seleccionado en el store global.
