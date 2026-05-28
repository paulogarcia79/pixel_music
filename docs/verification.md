# Verificación del Proyecto (Vue 3 + TypeScript + Tone.js)

> Regla de oro: **el agente no afirma que funciona, lo demuestra**.
> Cada feature desarrollada debe terminar con una prueba ejecutable o una validación real del secuenciador y su flujo de audio.

---

## Niveles de Verificación en Pixel Music

### Nivel 1 — Compilación Limpia (Obligatorio)
Cada cambio o feature implementada debe compilarse en producción sin advertencias graves de linter ni errores de bundler.
Comando a ejecutar en la raíz:
```bash
npm run build
```
Si el comando falla o arroja errores de sintaxis, la feature se considera rechazada.

### Nivel 2 — Sincronización Temporal y Pipeline de Audio (Obligatorio)
Debes verificar activamente que:
1.  **Sincronización del Cursor Láser**: El playhead visual (línea de cursor en Piano Roll y Song Arranger) avance de forma sincronizada con el paso activo del store (`currentStep` o `globalStep`) y al tempo (BPM) configurado, sin desalineaciones de latencia.
2.  **Audio Consistente**: Las notas reproducidas coincidan con las notas cromáticas activadas (C3-B5) en la grilla, y que las envolventes ADSR y efectos de envío (reverb, delay) alteren la señal de audio según los controles del panel.
3.  **Libre de Jitter o Cortes**: La interacción en tiempo real (agregar/quitar notas durante la reproducción) no debe generar clics, pops de audio ni ralentizar el hilo principal de renderizado.

### Nivel 3 — Responsividad y Accesibilidad Visual (Obligatorio para UI)
Dado que es una aplicación web interactiva premium con estética cyberpunk, se debe verificar que:
*   La matriz del secuenciador y el organizador adapten sus anchos en:
    *   Vistas móviles (se oculta el panel lateral de tracks o se permite scroll horizontal adaptativo).
    *   Vistas de tablet (~768px).
    *   Vistas de escritorio (~1200px o superior).
*   El renderizado del analizador en [WaveVisualizer.vue](file:///home/paulo/Desktop/paulo/code/pixel_music/src/components/sequencer/WaveVisualizer.vue) dibuje la onda con fluidez en el elemento Canvas.

### Nivel 4 — Trazabilidad de Requerimientos (Obligatorio para Features SDD)
Cada requerimiento `R<n>` redactado en `specs/<name>/requirements.md` debe poder mapearse a una prueba de comportamiento visual o lógica verificada en el componente correspondiente.

El implementador documentará el mapa de trazabilidad en `progress/impl_<name>.md`:

```markdown
## Trazabilidad de Requerimientos
- R1 (Alternar Nota) → Verificado interactuando con la celda en `PianoRoll.vue` y comprobando la inserción/eliminación del paso correspondiente en el store `sequencer.ts`.
- R2 (Efectos de Pista) → Verificado manipulando los controles deslizantes de reverb y delay en la pista seleccionada, confirmando que alteran la mezcla en el `AudioEngine.ts`.
- R3 (Modo Canción) → Verificado agendando un patrón en el arranger en `SongArranger.vue` y activando la reproducción en modo canción en `Transport.vue`.
```

---

## Proceso de Cierre de Feature

Antes de notificar al `reviewer` para la revisión de una feature, el `implementer` debe:
1.  Ejecutar el script `./init.sh` en la raíz del proyecto para asegurar que el entorno básico está en verde.
2.  Asegurarse de que todas las tareas en `specs/<name>/tasks.md` están marcadas como resueltas `[x]`.
3.  Escribir el reporte en `progress/impl_<name>.md`.
