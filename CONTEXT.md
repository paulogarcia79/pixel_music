# Pixel Music Domain

Un secuenciador y estación de trabajo de audio digital (DAW) interactivo y retro para la creación de música basada en rejillas de pasos y síntesis de audio en tiempo real.

## Language

**Track (Pista)**:
Una línea o canal de instrumento individual dentro de un patrón que almacena una secuencia de notas, su volumen, sus parámetros de envolvente y sus envíos de efectos.
_Avoid_: Canal, fila, instrumento independiente.

**Pattern (Patrón)**:
Una rejilla musical estructurada (normalmente de 32 pasos) que agrupa múltiples pistas de instrumentos para formar un bloque o bucle musical reutilizable.
_Avoid_: Compás, loop global.

**Pattern Preset (Patrón Predefinido)**:
Una configuración de inicio que contiene una colección de pistas preestablecidas con notas previamente dibujadas en pasos específicos para servir como plantilla rítmica.
_Avoid_: Ritmo predeterminado, plantilla de compás.


**Step (Paso)**:
La unidad de tiempo fundamental dentro de la rejilla de un secuenciador (por defecto una semicorchea), donde una nota puede ser programada o activada.
_Avoid_: Celda, tick de reloj.

**Polyphony (Polifonía)**:
La capacidad de una pista o instrumento para generar y reproducir múltiples sonidos o notas de forma simultánea en un mismo instante de tiempo.
_Avoid_: Multicanalidad, acordes globales.

**Step Notes (Notas de Paso)**:
El conjunto de una o más notas programadas y reproducidas de manera simultánea en un paso específico del secuenciador.
_Avoid_: Acorde programado, notas de rejilla.


**Arrangement (Arreglo)**:
La estructura global de una composición musical, formada por la colocación secuencial de diversos patrones a lo largo del tiempo en los carriles del Song Arranger.
_Avoid_: Composición, secuenciación global.

**Pattern Placement (Colocación de Patrón)**:
La instancia de un patrón específico programada para reproducirse en un carril del Song Arranger a partir de un paso de inicio definido.
_Avoid_: Bloque de sonido, clip.

**Envelope (Envolvente ADSR)**:
El perfil dinámico que modula la amplitud de un instrumento desde que se activa una nota hasta que se silencia, configurable mediante los parámetros de Attack (Ataque), Decay (Decaimiento), Sustain (Sostenido) y Release (Liberación).
- **Attack (Ataque)**: Tiempo que tarda la señal en llegar desde cero hasta su nivel máximo al activarse la nota.
- **Decay (Decaimiento)**: Tiempo que tarda la señal en descender desde el nivel máximo de ataque hasta el nivel de sostenido.
- **Sustain (Sostenido)**: El nivel de ganancia constante que se mantiene mientras la nota permanece activa.
- **Release (Liberación)**: Tiempo que tarda la señal en desvanecerse por completo una vez que la nota deja de estar activa.
_Avoid_: Duración, volumen de paso.

**FX Send (Envío de Efectos)**:
El nivel o proporción de la señal de una pista que se redirige hacia los procesadores de efectos globales de Reverb y Delay.
_Avoid_: Volumen de efecto, filtro FX.

**Transport (Transporte)**:
Los controles y el estado de reproducción global del DAW, que gestionan el Tempo (BPM), el paso activo, la reproducción, la pausa y la detención.
_Avoid_: Reproductor, reloj externo.

**Playhead (Cursor de Reproducción)**:
La línea indicadora visual (láser neón) que muestra en tiempo real la posición temporal activa dentro del secuenciador o del organizador de canción.
_Avoid_: Cursor, aguja.
