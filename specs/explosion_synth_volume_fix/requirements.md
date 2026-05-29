# Requirements - ExplosionSynth Volume Fix

## R1
El `ExplosionSynth` DEBE exponer una propiedad pública `volume` de tipo `Tone.Param<"decibels">`.

## R2
El `ExplosionSynth` DEBE usar internamente una propiedad privada `volumeNode` de tipo `Tone.Volume`.

## R3
CUANDO se inicialice `ExplosionSynth`, el sistema DEBE asignar `this.volume = this.volumeNode.volume`.

## R4
CUANDO se llame al método `connect` de `ExplosionSynth`, el sistema DEBE conectar `this.volumeNode` al destino de audio en lugar de `this.volume`.

## R5
CUANDO se llame al método `dispose` de `ExplosionSynth`, el sistema DEBE liberar el nodo `this.volumeNode` en lugar de `this.volume`.
