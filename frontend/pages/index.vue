<template>
  <div class="whiteboard-container select-none">
    <canvas
      class="w-full h-screen"
      ref="canvas"
      v-on:mousedown="startDrawing"
      v-on:mouseup="stopDrawing"
      v-on:mouseleave="stopDrawing"
      v-on:mousemove="draw"
    />
    <Dock />
  </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig();
const isDrawing = ref(false);
const canvas = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);
const ws = ref<WebSocket | null>(null);
const lastPoints = ref<{ x: number; y: number }[]>([]);
const lastCursorPos = ref({ x: 0, y: 0 });

function startDrawing(event: MouseEvent) {
  isDrawing.value = true;
  lastCursorPos.value = { x: event.clientX, y: event.clientY };
}

function stopDrawing() {
  isDrawing.value = false;
  if (lastPoints.value.length > 0) {
    ws.value?.send(JSON.stringify({ type: 'draw', points: lastPoints.value }));
    lastPoints.value = [];
  }
}

function drawLine(points: { x: number; y: number }[]) {
  if (!ctx.value) return;

  ctx.value.beginPath();
  ctx.value.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.value.lineTo(points[i].x, points[i].y);
  }
  ctx.value.stroke();
}

function draw(event: MouseEvent) {
  if (!isDrawing.value || !ctx.value) return;

  const { offsetX, offsetY } = event;

  ctx.value.beginPath();
  ctx.value.moveTo(lastCursorPos.value.x, lastCursorPos.value.y);
  ctx.value.lineTo(offsetX, offsetY);
  ctx.value.stroke();
  lastPoints.value.push({ x: offsetX, y: offsetY });

  lastCursorPos.value = { x: offsetX, y: offsetY };
}

function handleResize() {
  if (!canvas.value || !ctx.value) return;
  const imgData = ctx.value.getImageData(
    0,
    0,
    canvas.value.width,
    canvas.value.height
  );

  canvas.value.width = canvas.value.clientWidth;
  canvas.value.height = canvas.value.clientHeight;
  ctx.value.lineWidth = 2;
  ctx.value.lineCap = 'round';
  ctx.value.strokeStyle = '#ffffff';

  ctx.value.putImageData(imgData, 0, 0);
}

onMounted(() => {
  if (!canvas.value) return;
  ctx.value = canvas.value.getContext('2d');
  handleResize();
  window.addEventListener('resize', handleResize);
  ws.value = new WebSocket(`${runtimeConfig.public.apiBase}/ws`);
  ws.value.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'draw') {
      drawLine(data.points);
    }
  };
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  ws.value?.close();
});
</script>

<style scoped>
.whiteboard-container {
  background-color: #000000;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%235e5e5e' fill-opacity='0.4'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>
