<script lang="ts">
  import { onMount } from "svelte";
  import type { Writable } from "svelte/store";
  import type { ModuleMask } from "$lib";
  import { buildCodewordMask, buildBlockMask, buildGroupOutline } from "$lib";
  import { VERSIONS } from "jsqr-es6/dist/decoder/version";

  export let data: Writable<boolean[][]>;
  export let defaultData: boolean[][];

  let drawingCanvas: HTMLCanvasElement;
  let drawingCtx: CanvasRenderingContext2D;

  let hoverCanvas: HTMLCanvasElement;
  let hoverCtx: CanvasRenderingContext2D;

  let codewordMaskCanvas: HTMLCanvasElement;
  let codewordMaskCtx: CanvasRenderingContext2D;

  const scale = 20;
  let lastLoc: [number, number] | null = null;
  let bbox: DOMRect | null = null;

  const version = VERSIONS[2 - 1];
  const ecLevel = 2;
  const hoverMasks: ModuleMask[] = [buildCodewordMask(version)];
  hoverMasks.push(buildBlockMask(hoverMasks[0], ecLevel));

  const n = $data.length;
  const m = $data[0].length;

  function bres(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
  ): [number, number][] {
    const swap = Math.abs(y1 - y0) > Math.abs(x1 - x0);
    if (swap) [x0, y0, x1, y1] = [y0, x0, y1, x1];
    if (y1 < y0) [x0, y0, x1, y1] = [x1, y1, x0, y0];

    let pts: [number, number][] = [];
    let y = y0;
    const dx = x1 > x0 ? 1 : -1;

    for (let x = x0; x1 > x0 ? x <= x1 : x >= x1; x += dx) {
      if ((y - y0) * Math.abs(x1 - x0) < Math.abs(x - x0) * (y1 - y0)) y++;
      pts.push(swap ? [y, x] : [x, y]);
    }

    return pts;
  }

  function fill(i: number, j: number) {
    const currentData = $data;
    currentData[i][j] = true;
    data.set(currentData);
    drawingCtx.fillRect(
      (j * drawingCanvas.width) / m,
      (i * drawingCanvas.height) / n,
      drawingCanvas.width / m,
      drawingCanvas.height / n,
    );
  }

  function clearCanvas() {
    data.set(defaultData.map((row) => [...row]));
    drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    const currentData = $data;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        if (currentData[i][j]) fill(i, j);
      }
    }
  }

  function handleMouseMove(ev: MouseEvent) {
    if (ev.buttons == 1) draw(ev.clientX, ev.clientY);
    highlightCell(ev.clientX, ev.clientY);
  }

  function handleMouseDown(ev: MouseEvent) {
    bbox = drawingCanvas.getBoundingClientRect();
    lastLoc = null;
    draw(ev.clientX, ev.clientY);
  }

  function draw(x: number, y: number) {
    if (!bbox) return;
    const i = Math.floor((n * (y - bbox.top)) / bbox.height);
    if (i < 0 || i >= n) return;
    const j = Math.floor((m * (x - bbox.left)) / bbox.width);
    if (j < 0 || j >= m) return;

    const pts = lastLoc == null ? [[i, j]] : bres(lastLoc[0], lastLoc[1], i, j);

    drawingCtx.fillStyle = "black";
    for (const [a, b] of pts) fill(a, b);
    lastLoc = [i, j];
  }

  function highlightHoverMasks(i: number, j: number) {
    hoverCtx.strokeStyle = "blue";
    hoverCtx.lineWidth = 4;

    for (let k = 1; k < hoverMasks.length; k++) {
      const cur = hoverMasks[k];
      const group = cur.mask[i][j];
      if (group < 0) {
        continue;
      }
      hoverCtx.stroke(buildGroupOutline(cur.mask, cur.groups[group], scale));
    }
  }

  function highlightCell(x: number, y: number) {
    if (!bbox) return;
    const i = Math.floor((n * (y - bbox.top)) / bbox.height);
    const j = Math.floor((m * (x - bbox.left)) / bbox.width);
    clearHover();

    highlightHoverMasks(i, j);

    hoverCtx.strokeStyle = "red";
    hoverCtx.lineWidth = 2;
    hoverCtx.strokeRect(
      (j * hoverCanvas.width) / m + hoverCtx.lineWidth / 2,
      (i * hoverCanvas.height) / n + hoverCtx.lineWidth / 2,
      hoverCanvas.width / m - hoverCtx.lineWidth,
      hoverCanvas.height / n - hoverCtx.lineWidth,
    );
  }

  function clearHover() {
    hoverCtx.reset();
  }

  function drawCodewordMask() {
    const codewordMask = hoverMasks[0];
    codewordMaskCtx.lineWidth = 2;
    codewordMaskCtx.strokeStyle = "darkorchid";
    for (let i = 0; i < codewordMask.groups.length; i++) {
      codewordMaskCtx.stroke(
        buildGroupOutline(codewordMask.mask, codewordMask.groups[i], scale),
      );
    }
  }

  onMount(async () => {
    drawingCanvas.width = m * scale;
    drawingCanvas.height = n * scale;
    hoverCanvas.width = m * scale;
    hoverCanvas.height = n * scale;
    codewordMaskCanvas.width = m * scale;
    codewordMaskCanvas.height = n * scale;

    drawingCtx = drawingCanvas.getContext("2d")!;
    hoverCtx = hoverCanvas.getContext("2d")!;
    codewordMaskCtx = codewordMaskCanvas.getContext("2d")!;

    drawingCtx.imageSmoothingEnabled = false;
    hoverCtx.imageSmoothingEnabled = true;
    codewordMaskCtx.imageSmoothingEnabled = false;

    clearCanvas();
    drawCodewordMask();
  });
</script>

<div class="drawing-container">
  <div class="canvas-wrapper" on:mouseout={clearHover}>
    <canvas
      bind:this={drawingCanvas}
      width="200"
      height="200"
      id="drawing"
      on:mousemove={handleMouseMove}
      on:mousedown={handleMouseDown}
    ></canvas>
    <canvas
      bind:this={codewordMaskCanvas}
      width="200"
      height="200"
      id="codewordMask"
    >
    </canvas>
    <canvas bind:this={hoverCanvas} width="200" height="200" id="hover"
    ></canvas>
  </div>
  <button type="button" on:click={clearCanvas} class="btn"
    ><h2>Clear</h2></button
  >
</div>

<style>
  .drawing-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .canvas-wrapper {
    position: relative;
  }
  canvas {
    cursor: crosshair;
    image-rendering: pixelated;
  }
  #hover {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
  }
  #codewordMask {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
  }
  .btn {
    margin-top: 10px;
  }
</style>
