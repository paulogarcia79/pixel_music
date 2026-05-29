# Requirements — Pattern Presets

## R1
CUANDO la aplicación se carga por primera vez, el sistema DEBE inicializar el patrón activo 1 con el preset 'Chiptune Techno' y un tempo de 130 BPM.

## R2
El sistema DEBE mostrar un selector desplegable con la etiqueta 'Presets' o 'Ritmos' en la barra superior del secuenciador (`Transport.vue`) que contenga las opciones: 'Chiptune Techno', 'Synthwave Retro', '8-Bit Rock', 'Ambient Space' y 'Empty' (Limpiar Todo).

## R3
CUANDO el usuario selecciona un preset del menú desplegable, el sistema DEBE limpiar todos los sintetizadores existentes llamando a `AudioEngine.clearAllSynths()` para desechar y reciclar los nodos de audio.

## R4
CUANDO el usuario selecciona un preset del menú desplegable, el sistema DEBE sobreescribir las pistas (`tracks`), tipos de sintetizador, envolventes, volumen, efectos y mapa de notas del patrón actual con los datos correspondientes al preset seleccionado.

## R5
CUANDO el usuario selecciona un preset del menú desplegable, el sistema DEBE actualizar el tempo (BPM) del secuenciador al valor definido para dicho preset.

## R6
CUANDO el usuario selecciona la opción 'Empty' (Limpiar Todo) del menú desplegable, el sistema DEBE restablecer el patrón actual a una sola pista por defecto vacía ('Track 1', tipo 'square', sin notas) y el tempo a 120 BPM.

## R7
MIENTRAS el secuenciador se encuentra en reproducción, CUANDO el usuario cambia de preset, el sistema DEBE mantener la reproducción activa secuenciando las notas del nuevo preset sin interrupción, aplicando los nuevos sintetizadores al vuelo.
