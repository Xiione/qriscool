<script lang="ts">
  import { onMount } from "svelte";
  import samples from "$lib/scanner/samples.json";
  import SampleImage from "./SampleImage.svelte";
  import { writable } from "svelte/store";

  export let title = "Pick a sample photo";

  const loadCt = 1;
  const initLoadDelay = 30; // ms
  const initLoadTimeout = 3000; // ms
  // known at mount time
  let preloadWidth = { cur: 0 };

  let scroller: HTMLDivElement;
  let scrollerClientWidth: number;
  let row1: HTMLDivElement;
  let row2: HTMLDivElement;
  let row1Width = { cur: 0 };
  let row2Width = { cur: 0 };

  let row1Items: string[] = [];
  let row2Items: string[] = [];

  let numLoaded = 0;
  let numToLoad = 0;

  // used to color border on scroll, and uncolor when unfocused
  let focused = false;
  let currentTouchTimeout: NodeJS.Timeout;

  function scrollLoad() {
    if (
      numLoaded < samples.length &&
      scroller.scrollLeft + scroller.clientWidth + preloadWidth.cur >
        Math.min(row1Width.cur, row2Width.cur)
    ) {
      numToLoad = loadCt;
    }
  }

  $: if (numLoaded < samples.length) {
    if (numToLoad > 0) {
      if (row1Width.cur <= row2Width.cur) {
        row1Items = [...row1Items, samples[numLoaded]];
      } else {
        row2Items = [...row2Items, samples[numLoaded]];
      }
      numToLoad--, numLoaded++;
    }
  }

  onMount(() => {
    preloadWidth.cur =
      parseFloat(getComputedStyle(document.documentElement).lineHeight) * 20;
    // scramble on refresh
    for (let i = samples.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [samples[i], samples[j]] = [samples[j], samples[i]];
    }

    const load = setInterval(scrollLoad, initLoadDelay);
    setTimeout(() => clearInterval(load), initLoadTimeout);
  });
</script>

<div
  class="relative pt-1 hover:border-lime-300 hover:text-lime-300 active:border-lime-300 active:text-lime-300"
  class:border-lime-300={focused}
  class:text-lime-300={focused}
  on:touchstart={() => {
    if (currentTouchTimeout) clearTimeout(currentTouchTimeout);
    focused = true;
  }}
  on:touchend={() => {
    currentTouchTimeout = setTimeout(() => (focused = false), 1000);
  }}
>
  <div class="title absolute flex w-full justify-center">
    <small class="z-10 select-none bg-zinc-900 px-1">{title}</small>
  </div>
  <div class="rounded-md border-2 border-inherit px-3 py-2">
    <div
      bind:this={scroller}
      bind:clientWidth={scrollerClientWidth}
      class="scroller z-0"
      on:scroll={scrollLoad}
    >
      <div bind:this={row1} class="my-1 flex h-20 justify-start space-x-2">
        {#each row1Items as sample}
          <SampleImage
            {sample}
            on:load={() => (row1Width = { cur: row1.scrollWidth })}
            on:select
          />
        {/each}
        {#if numLoaded === samples.length}
          <div class="pr-20" />
        {/if}
      </div>
      <div bind:this={row2} class="my-1 flex h-20 justify-start space-x-2">
        {#each row2Items as sample}
          <SampleImage
            {sample}
            on:load={() => (row2Width = { cur: row2.scrollWidth })}
            on:select
          />
        {/each}
        {#if numLoaded === samples.length}
          <small class=" select-none self-end text-nowrap pr-20">
            You loaded all {samples.length} samples.
          </small>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .scroller {
    display: flex;
    flex-direction: column;
    position: relative;
    overflow-x: scroll;
    mask-image: linear-gradient(to right, white 95%, transparent);
  }
  .title {
    top: -0.25rem;
  }
</style>
