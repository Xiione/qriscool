<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import {
    PUBLIC_SAMPLES_FNAME,
    PUBLIC_SAMPLES_URL,
    PUBLIC_IMAGECDN_URL,
  } from "$env/static/public";

  export let sample: string;
  const dispatch = createEventDispatcher();
  let image: HTMLImageElement;

  const cdnArgs = ["height=100"];
  const raw = `${PUBLIC_SAMPLES_URL}/${sample}/${PUBLIC_SAMPLES_FNAME}`;
  // const src = `${PUBLIC_IMAGECDN_URL}/${encodeURIComponent(raw)}?${cdnArgs.join("&")}`;
</script>

<button type="button" class="min-w-max" on:click={() => dispatch("select", {image})}>
  <img
    bind:this={image}
    class="h-full"
    draggable="true"
    src={raw}
    title={`${sample}`}
    alt={`Sample QR code photo: ${sample}`}
    on:load={() => dispatch("load")}
    in:fade={{ duration: 200 }}
  />
</button>
