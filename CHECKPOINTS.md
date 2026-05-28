# CHECKPOINTS — Evaluación del Estado Final del Proyecto (Vue 3 + Pinia + Tone.js)

> En sistemas multi-agente no se evalúa el camino, se evalúa el destino de calidad.
> Estos son los checkpoints objetivos que un revisor o juez humano/IA utilizará para calificar si el desarrollo de la aplicación es correcto y está sano.

---

## 🟢 C1 — El arnés está completo
- [ ] Existen los 4 archivos base del arnés: `AGENTS.md`, `init.sh`, `feature_list.json`, `progress/current.md`.
- [ ] Existen los 3 documentos de arquitectura y estándares: `docs/architecture.md`, `docs/conventions.md`, `docs/verification.md`.
- [ ] El script `./init.sh` finaliza con código de salida `0` ([OK] Entorno listo).

## 🟢 C2 — El estado es coherente
- [ ] Como máximo hay una feature en estado `in_progress` en `feature_list.json`.
- [ ] `progress/current.md` describe correctamente la sesión activa y está limpio de basura histórica.
- [ ] Al cerrar una feature, se mueve su registro a `progress/history.md` y se marca como `done` en `feature_list.json`.

## 🟢 C3 — El código respeta la arquitectura y convenciones
- [ ] Toda la lógica de componentes reside en `src/components/sequencer/` (`PianoRoll.vue`, `Transport.vue`, `SongArranger.vue`, `WaveVisualizer.vue`).
- [ ] La gestión de estado global reside exclusivamente en el store de Pinia en `src/stores/sequencer.ts`.
- [ ] La manipulación del contexto de audio, sintetizadores, efectos y el bucle de secuenciación residen exclusivamente en `src/audio/AudioEngine.ts`.
- [ ] Los componentes de Vue 3 usan de forma estricta la sintaxis `<script setup lang="ts">` de Composition API con TypeScript.
- [ ] No existen dependencias externas de interfaz de usuario pre-construidas que alteren el aspecto visual personalizado.
- [ ] Todo desarrollo de frontend y estilos aplican rigurosamente las pautas de la skill 'frontend-design' (evitando estéticas genéricas de IA, utilizando una densa estructuración de hardware digital, tipografía Outfit/Fredoka, y luces y neones cyberpunk).
- [ ] No existen instrucciones de depuración sueltas (`console.log`) ni TODOs sin justificación en el código de producción.

## 🟢 C4 — La verificación es real y el proyecto compila
- [ ] El comando de empaquetado y optimización de Vite (`npm run build`) se ejecuta y compila con éxito al 100% sin errores de linter ni de empaquetado.
- [ ] Sincronización Temporal: El playhead o cursor láser se desplaza sin latencias y en total consonancia con el paso activo (`currentStep` / `globalStep`) y el tempo (BPM) seleccionado.
- [ ] Modulación Real de Audio: Las notas asignadas a la grilla se reproducen con las frecuencias exactas cromáticas (C3-B5), y los deslizadores de ADSR, volumen, delay y reverb alteran el timbre del sintetizador en caliente.

## 🟢 C5 — La sesión se cerró correctamente
- [ ] No quedan carpetas temporales o de compilación (`dist/`, `.vite/`, `node_modules/`) sin registrar en el `.gitignore`.
- [ ] `progress/history.md` cuenta con un registro/resumen claro al final por cada sesión de trabajo cerrada.

## 🟢 C6 — Spec Driven Development (SDD)
- [ ] Toda feature con `"sdd": true` en estado `spec_ready`, `in_progress` o `done` cuenta con su carpeta `specs/<name>/` conteniendo los 3 archivos: `requirements.md`, `design.md`, `tasks.md`.
- [ ] `requirements.md` utiliza rigurosamente la notación **EARS** con identificadores `R1`, `R2`, etc.
- [ ] Cada `R<n>` en `requirements.md` de la feature completada tiene un mapeo claro de trazabilidad hacia su prueba funcional visual/lógica registrada en `progress/impl_<name>.md`.
- [ ] En `specs/<name>/tasks.md`, todas las tareas están marcadas como resueltas `[x]`.

---

**Cómo usar este archivo:** el agente revisor (`.agents/reviewer.md`) verificará punto por punto este archivo, marcando `[x]` o `[ ]` en el reporte `progress/review_<name>.md`. Si queda algún checkpoint obligatorio sin cumplir, la feature será rechazada automáticamente.
