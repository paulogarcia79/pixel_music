# Technical Design: Classic Guitar PolyPluckSynth Bugfix

Este documento detalla las decisiones técnicas y cambios de arquitectura para la implementación de la clase envolvente `PolyPluckSynth` en Pixel Music.

---

## 1. Archivos Afectados

El desarrollo afectará a los siguientes componentes existentes:
- `src/audio/AudioEngine.ts` (Implementación de la clase `PolyPluckSynth` y actualización de la instanciación de `guitar_pixel`)
- `tests/audioEngine.spec.ts` (Pruebas unitarias e integración para el motor de audio)

---

## 2. Modificaciones de Interfaces y Firmas Nuevas

### Clase `PolyPluckSynth`
Se define una clase personalizada al inicio de `src/audio/AudioEngine.ts` que simula la interfaz polifónica de Tone.js para la síntesis de cuerdas punteadas (`Tone.PluckSynth`).

```typescript
class PolyPluckSynth {
  private voices: Tone.PluckSynth[] = [];
  private voiceIndex = 0;
  public volume: Tone.Volume;
  private context: Tone.BaseContext;

  constructor(options: { context: Tone.BaseContext, voicesCount?: number, dampening?: number, resonance?: number }) { ... }
  public connect(dest: Tone.ToneAudioNode): this { ... }
  public set(options: any): this { ... }
  public triggerAttackRelease(notes: string | string[], duration: string | number, time?: number): this { ... }
  public triggerRelease(time?: number): this { ... }
  public dispose(): this { ... }
}
```

---

## 3. Lógica del Motor de Audio (`src/audio/AudioEngine.ts`)

En `createSynthByType`, en lugar de:
```typescript
      case 'guitar_pixel':
        synth = new Tone.PolySynth(Tone.PluckSynth, {
          attackNoise: 1,
          dampening: 4000,
          resonance: 0.95
        }).connect(this.mainVolume);
        break;
```
Se utilizará la nueva clase:
```typescript
      case 'guitar_pixel':
        synth = new PolyPluckSynth({ context, dampening: 4000, resonance: 0.95 });
        break;
```

---

## 4. Alternativa Descartada y Justificación

- **Alternativa descartada**: Hacer que `Tone.PluckSynth` herede de `Monophonic` a través de prototipos dinámicos en tiempo de ejecución.
- **Justificación**: Modificar la jerarquía de prototipos de una librería externa como Tone.js es frágil, difícil de mantener y propenso a errores en compilaciones de producción u optimizaciones de empaquetadores como Vite. La envoltura explícita `PolyPluckSynth` es limpia, encapsulada y sigue principios estándar de POO sin side-effects en otras partes del framework.
