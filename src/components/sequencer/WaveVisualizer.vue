<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { AudioEngine } from '../../audio/AudioEngine';

const canvasRef = ref<HTMLCanvasElement | null>(null);
let animationId: number;

const draw = () => {
  if (!canvasRef.value) return;
  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const analyser = AudioEngine.getAnalyser();
  if (!analyser) {
    animationId = requestAnimationFrame(draw);
    return;
  }

  const values = analyser.getValue();
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);
  
  // Set glow effect
  ctx.shadowBlur = 10;
  ctx.shadowColor = '#05d9e8';
  ctx.strokeStyle = '#05d9e8';
  ctx.lineWidth = 2;

  ctx.beginPath();
  const sliceWidth = width / values.length;
  let x = 0;

  for (let i = 0; i < values.length; i++) {
    const v = (values[i] as number);
    const y = (v * height / 2) + (height / 2);

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  ctx.lineTo(width, height / 2);
  ctx.stroke();

  animationId = requestAnimationFrame(draw);
};

onMounted(() => {
  draw();
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);
});
</script>

<template>
  <div class="h-12 w-48 bg-dark-bg/80 border border-grid-line relative overflow-hidden rounded">
    <canvas 
      ref="canvasRef" 
      width="192" 
      height="48" 
      class="w-full h-full"
    ></canvas>
    <div class="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(5,217,232,0.1)_1px,transparent_1px)] bg-[length:100%_4px]"></div>
  </div>
</template>
