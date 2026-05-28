# Requirements - Intuitive UI Redesign

Este documento define los requisitos funcionales para el rediseño de interfaz de usuario de Pixel Music, estructurados bajo la notación EARS (Easy Approach to Requirements Syntax).

---

## R1
El sistema DEBE estructurar la interfaz de usuario principal mediante un diseño que integre:
1. Una barra lateral izquierda simplificada enfocada en la gestión de pistas.
2. Un área de trabajo central/derecha que divida verticalmente el Piano Roll y el Song Arranger.
3. Un Panel de Dispositivo (Device Panel) inferior colapsable para controles avanzados de la pista seleccionada.

## R2
MIENTRAS el Panel de Dispositivo inferior esté colapsado, el sistema DEBE mostrar únicamente una barra de expansión o botón minimalista en la parte inferior del área de secuenciación.

## R3
CUANDO el usuario haga clic en la barra o botón de expansión/colapso, el sistema DEBE alternar la visibilidad (mostrar/ocultar) del Panel de Dispositivo inferior.

## R4
El Panel de Dispositivo inferior DEBE diseñarse estéticamente como un módulo Eurorack digital pixel-art de hardware retro.

## R5
El Panel de Dispositivo inferior DEBE agrupar de forma física y visual los controles avanzados de la pista seleccionada en tres subsecciones de hardware diferenciadas:
1. **Oscillator Section**: Contiene un selector visual del tipo de instrumento/sintetizador (`type`).
2. **ADSR Envelope Section**: Contiene perillas rotatorias de control para el tiempo de Ataque (`attack`) y Relajación (`release`).
3. **FX Rack Section**: Contiene perillas rotatorias de control para la cantidad de envío de Reverberación (`reverbWet`) y Delay (`delayWet`).

## R6
Las perillas rotatorias visuales de ADSR y FX en el Panel de Dispositivo DEBEN permitir modificar sus respectivos parámetros mediante interacción directa de arrastre de ratón (drag vertical/horizontal) o rueda de desplazamiento.

## R7
El Panel de Dispositivo inferior DEBE incluir un mini-visualizador interactivo que represente gráficamente la curva de la envolvente de amplitud (ADSR) de la pista seleccionada.

## R8
CUANDO el usuario modifique los valores de `attack` o `release` mediante las perillas o controles del panel de dispositivo, el mini-visualizador de envolvente DEBE redibujar de forma inmediata y en tiempo real la curva gráfica correspondiente en pantalla para reflejar los nuevos límites temporales.

## R9
El sistema DEBE representar las pistas en la barra lateral izquierda mediante tarjetas delgadas (Slim Track Strips), optimizadas para ocupar el menor espacio vertical y horizontal.

## R10
Cada tarjeta de pista en la barra lateral DEBE mostrar un icono de categoría identificativo basado en el tipo de instrumento actual:
- Icono `Keyboard` para teclas y órganos (`piano_pixel`, `electric_piano`, `honky_tonk`, `organ_pixel`, `church_organ`).
- Icono `Drum` para percusión (`kick`, `snare`, `hihat`, `tom`, `clap`, `crash`, `conga`, `cowbell`, `woodblock`, `shaker`, `rimshot`).
- Icono `Waves` para sintetizadores retro (`bass_synth`, `sub_bass`, `lead_synth`, `super_saw`, `acid_synth`, `pad`, `fm_pluck`, `fm_bell`, `retro_brass`, `ghost_synth`).
- Icono `Music` para cuerdas y vientos (`guitar_pixel`, `guitar_dist`, `flute_pixel`, `clarinet_pixel`, `retro_oboe`).
- Icono `Cpu` para formas de onda básicas (`square`, `triangle`, `sawtooth`, `noise`, `sine`, `pulse`, `pwm`).

## R11
Cada tarjeta de pista en la barra lateral DEBE incluir únicamente controles rápidos: un deslizador de volumen horizontal super-compacto, un botón de silencio (Mute) prominente, un botón discreto de duplicar, y un botón discreto de eliminar.

## R12
MIENTRAS una pista de la barra lateral esté seleccionada en el secuenciador, la tarjeta de dicha pista DEBE mostrar un borde activo con iluminación de neón fluorescente brillante (cyan).

## R13
El Piano Roll DEBE incluir tres botones de salto y filtrado rápido de octava etiquetados como "C3-B3 (Low)", "C4-B4 (Mid)" y "C5-B5 (High)" ubicados en su barra de herramientas.

## R14
CUANDO el usuario haga clic en uno de los botones de salto rápido de octava, el Piano Roll DEBE filtrar las filas visibles de la cuadrícula de notas para mostrar únicamente las 12 notas correspondientes a la octava seleccionada.

## R15
El Piano Roll DEBE incorporar un selector de escala musical ("Scale Helper") con las opciones "Chromatic", "C Major", "C Minor" y "A Minor".

## R16
MIENTRAS una escala del Scale Helper esté seleccionada y no sea "Chromatic", el Piano Roll DEBE aplicar un sombreado o iluminación de fondo diferenciada a las filas de notas de la grilla que formen parte de dicha escala musical, facilitando la composición melódica guiada.

## R17
MIENTRAS el ratón del usuario pase (hover) sobre cualquier celda vacía de la cuadrícula del Piano Roll, el sistema DEBE superponer de manera sutil y de baja opacidad la letra correspondiente a la nota musical de la fila (ej. "C4", "G#5") en dicha celda.

## R18
El Song Arranger DEBE estructurarse mediante carriles visuales horizontales para cada pista de arreglo, claramente separados por líneas guía retro.

## R19
Cada bloque de patrón colocado en un carril del Song Arranger DEBE colorearse dinámicamente con un tono de neón distintivo basado en su número de patrón (`patternId`), y su ancho visual DEBE ser exactamente proporcional a su longitud de pasos (ej. bloques de 32 pasos deben tener el doble de ancho que los de 16).

## R20
CUANDO el usuario haga clic sobre un espacio vacío dentro de un carril del Song Arranger, el sistema DEBE colocar un nuevo bloque de patrón en la posición del paso alineada con la configuración del Snap.

## R21
CUANDO el usuario haga clic sobre un bloque de patrón ya existente en cualquier carril del Song Arranger, el sistema DEBE eliminar inmediatamente dicho bloque de patrón de la línea de tiempo.

## R22
MIENTRAS se reproduzca la composición en modo canción (`isSongMode`), el Song Arranger DEBE desplazar en tiempo real una línea de reproducción láser vertical con brillo de neón (playhead) sincronizada exactamente con el paso global activo (`globalStep`).
