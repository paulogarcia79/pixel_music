<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  name: string;
}>();

const iconName = computed(() => props.name.toLowerCase().trim());
</script>

<template>
  <!-- Cpu Icon -->
  <svg v-if="iconName === 'cpu'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect width="16" height="16" x="4" y="4" rx="2"/>
    <rect width="6" height="6" x="9" y="9" rx="1"/>
    <path d="M9 1v3"/>
    <path d="M15 1v3"/>
    <path d="M9 20v3"/>
    <path d="M15 20v3"/>
    <path d="M20 9h3"/>
    <path d="M20 15h3"/>
    <path d="M1 9h3"/>
    <path d="M1 15h3"/>
  </svg>

  <!-- Drum Icon -->
  <svg v-else-if="iconName === 'drum'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m2 2 20 20"/>
    <path d="m22 2-20 20"/>
    <ellipse cx="12" cy="9" rx="10" ry="5"/>
    <path d="M7 9v10c0 1 1.79 3 5 3s5-2 5-3V9"/>
  </svg>

  <!-- Keyboard Icon -->
  <svg v-else-if="iconName === 'keyboard'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect width="20" height="12" x="2" y="6" rx="2" ry="2"/>
    <path d="M6 10h.01"/>
    <path d="M10 10h.01"/>
    <path d="M14 10h.01"/>
    <path d="M18 10h.01"/>
    <path d="M6 14h.01"/>
    <path d="M18 14h.01"/>
    <path d="M10 14h4"/>
  </svg>

  <!-- Waves Icon -->
  <svg v-else-if="iconName === 'waves'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.6 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
    <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.6 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
    <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.6 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
  </svg>

  <!-- Music Icon -->
  <svg v-else-if="iconName === 'music'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 18V5l12-2v13"/>
    <circle cx="6" cy="18" r="3"/>
    <circle cx="18" cy="16" r="3"/>
  </svg>

  <!-- Copy Icon -->
  <svg v-else-if="iconName === 'copy'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
  </svg>

  <!-- Trash2 / Trash Icon -->
  <svg v-else-if="iconName === 'trash2' || iconName === 'trash'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 6h18"/>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    <line x1="10" x2="10" y1="11" y2="17"/>
    <line x1="14" x2="14" y1="11" y2="17"/>
  </svg>

  <!-- Volume2 Icon -->
  <svg v-else-if="iconName === 'volume2'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M11 5 6 9H2v6h4l5 4V5z"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
  </svg>

  <!-- ChevronDown Icon -->
  <svg v-else-if="iconName === 'chevrondown'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>

  <!-- ChevronUp Icon -->
  <svg v-else-if="iconName === 'chevronup'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m18 15-6-6-6 6"/>
  </svg>

  <!-- Sliders Icon -->
  <svg v-else-if="iconName === 'sliders'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="4" x2="4" y1="21" y2="14"/>
    <line x1="4" x2="4" y1="10" y2="3"/>
    <line x1="12" x2="12" y1="21" y2="12"/>
    <line x1="12" x2="12" y1="8" y2="3"/>
    <line x1="20" x2="20" y1="21" y2="16"/>
    <line x1="20" x2="20" y1="12" y2="3"/>
    <line x1="2" x2="6" y1="14" y2="14"/>
    <line x1="10" x2="14" y1="8" y2="8"/>
    <line x1="18" x2="22" y1="16" y2="16"/>
  </svg>

  <!-- Activity Icon -->
  <svg v-else-if="iconName === 'activity'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>

  <!-- Radio Icon -->
  <svg v-else-if="iconName === 'radio'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="2"/>
    <path d="M16.24 7.76a6 6 0 0 1 0 8.49"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    <path d="M7.76 16.24a6 6 0 0 1 0-8.49"/>
    <path d="M4.93 19.07a10 10 0 0 1 0-14.14"/>
  </svg>

  <!-- HelpCircle Icon -->
  <svg v-else-if="iconName === 'helpcircle'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <path d="M12 17h.01"/>
  </svg>

  <!-- Layers Icon -->
  <svg v-else-if="iconName === 'layers'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m12 3-10 5 10 5 10-5-10-5Z"/>
    <path d="m2 17 10 5 10-5"/>
    <path d="m2 12 10 5 10-5"/>
  </svg>

  <!-- ShieldAlert Icon -->
  <svg v-else-if="iconName === 'shieldalert'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6v7z"/>
    <line x1="12" x2="12" y1="8" y2="12"/>
    <line x1="12" x2="12.01" y1="16" y2="16"/>
  </svg>

  <!-- Fallback (Simple circle) -->
  <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
  </svg>
</template>
