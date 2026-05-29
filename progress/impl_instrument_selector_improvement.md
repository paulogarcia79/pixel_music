# Trazabilidad de Requisitos - Instrument Selector Improvement

Este archivo documenta la trazabilidad estricta entre cada Requisito (R1-R10) definido en `specs/instrument_selector_improvement/requirements.md` y las pruebas concretas que certifican su correcto funcionamiento y cumplimiento en la suite de pruebas del proyecto.

---

| Requisito | Descripción | Test de Validación Asignado | Archivo de Test |
|-----------|-------------|----------------------------|-----------------|
| **R1** | Catálogo de exactamente 30 instrumentos distribuidos en 4 categorías exclusivas (`WAV`, `SYN`, `DRM`, `KEY`). | `R1-R10: verifies the complete redesigned instrument selector, layout grid, tabs, active classes, reactive store update and bidirectional auto-focus` | `tests/components/DevicePanel.spec.ts` |
| **R2** | Agrupación exacta y restrictiva de los 30 instrumentos del catálogo bajo sus categorías correspondientes. | `R1-R10: verifies the complete redesigned instrument selector, layout grid, tabs, active classes, reactive store update and bidirectional auto-focus` | `tests/components/DevicePanel.spec.ts` |
| **R3** | Muestra una barra de cabecera con cuatro pestañas de navegación (`WAV`, `SYN`, `DRM`, `KEY`) al cargar el panel con una pista activa. | `R1-R10: verifies the complete redesigned instrument selector, layout grid, tabs, active classes, reactive store update and bidirectional auto-focus` | `tests/components/DevicePanel.spec.ts` |
| **R4** | Al hacer clic en una pestaña, cambia la pestaña activa y filtra la rejilla para mostrar sólo los instrumentos correspondientes. | `R1-R10: verifies the complete redesigned instrument selector, layout grid, tabs, active classes, reactive store update and bidirectional auto-focus` | `tests/components/DevicePanel.spec.ts` |
| **R5** | Estructura los botones de instrumento en una rejilla compacta de exactamente dos columnas (`grid-cols-2`). | `R1-R10: verifies the complete redesigned instrument selector, layout grid, tabs, active classes, reactive store update and bidirectional auto-focus` | `tests/components/DevicePanel.spec.ts` |
| **R6** | Aplica a cada botón de instrumento una altura física compacta y fija de exactamente `24px` (`h-6`). | `R1-R10: verifies the complete redesigned instrument selector, layout grid, tabs, active classes, reactive store update and bidirectional auto-focus` | `tests/components/DevicePanel.spec.ts` |
| **R7** | Destaca visualmente el botón del instrumento activo en la pestaña seleccionada (estilos neón y borde activo). | `R1-R10: verifies the complete redesigned instrument selector, layout grid, tabs, active classes, reactive store update and bidirectional auto-focus` | `tests/components/DevicePanel.spec.ts` |
| **R8** | Conmuta automáticamente la pestaña de categoría activa al cambiar la pista seleccionada en el secuenciador según su tipo. | `R1-R10: verifies the complete redesigned instrument selector, layout grid, tabs, active classes, reactive store update and bidirectional auto-focus` | `tests/components/DevicePanel.spec.ts` |
| **R9** | Reactiva la conmutación de pestaña de forma reactiva y automática si el tipo cambia por presets o comandos globales. | `R1-R10: verifies the complete redesigned instrument selector, layout grid, tabs, active classes, reactive store update and bidirectional auto-focus` | `tests/components/DevicePanel.spec.ts` |
| **R10** | Al hacer clic en cualquiera de los botones de instrumento, actualiza de forma reactiva la propiedad `type` de la pista en el store global. | `R1-R10: verifies the complete redesigned instrument selector, layout grid, tabs, active classes, reactive store update and bidirectional auto-focus` | `tests/components/DevicePanel.spec.ts` |

---

## Certificación de Ejecución de Pruebas

Toda la suite de pruebas del proyecto (compuesta por **65 tests automáticos**) ha sido ejecutada a través de `./init.sh` y `npx vitest run`, obteniendo un **100% de éxito en verde** sin errores ni advertencias de compilación.
