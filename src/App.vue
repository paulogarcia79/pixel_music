<script setup lang="ts">
import Transport from './components/sequencer/Transport.vue';
import PianoRoll from './components/sequencer/PianoRoll.vue';
</script>

<template>
  <div class="h-screen flex flex-col bg-dark-bg selection:bg-neon-pink selection:text-white">
    <!-- Header / Transport -->
    <Transport />

    <!-- Main Content -->
    <main class="flex-1 flex overflow-hidden">
      <!-- Sidebar (Future tracks list) -->
      <aside class="w-64 border-r border-grid-line bg-dark-bg/50 hidden md:block p-4">
        <h2 class="text-neon-cyan text-xs uppercase tracking-tighter mb-4 border-b border-grid-line pb-2">Tracks</h2>
        <div class="space-y-2">
          <div class="p-2 border border-neon-cyan/30 text-neon-cyan text-xs cursor-pointer bg-neon-cyan/5">
            Track 1 [SQUARE]
          </div>
          <button class="w-full p-2 border border-dashed border-grid-line text-grid-line text-[10px] hover:border-neon-cyan hover:text-neon-cyan transition-colors">
            + ADD TRACK
          </button>
        </div>
      </aside>

      <!-- Piano Roll Area -->
      <PianoRoll />
    </main>

    <!-- Footer / Status Bar -->
    <footer class="bg-dark-bg border-t border-grid-line px-4 py-1 flex justify-between items-center text-[9px] text-neon-cyan/40 uppercase tracking-widest">
      <div>Status: Ready</div>
      <div>Project: New_Composition_01</div>
      <div>Memory: Stable</div>
    </footer>
  </div>
</template>

<style>
/* Estilos globales adicionales si son necesarios */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
::-webkit-scrollbar-track {
  background: #01012b;
}
::-webkit-scrollbar-thumb {
  background: #1a1a3a;
}
::-webkit-scrollbar-thumb:hover {
  background: #05d9e8;
}
</style>
