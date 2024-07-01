<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { writable } from "svelte/store";

  let input: HTMLInputElement;
  let button: HTMLButtonElement;
  const dragging = writable(false);
  const dragEntered = writable(false);
  const dispatch = createEventDispatcher();

  function isValidImageUrl(url: string) {
    return /\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i.test(url);
  }

  async function urlToFile(url: string): Promise<File> {
    const response = await fetch(url);
    const data = await response.blob();
    const name = url.split("/").pop()?.split("?").shift() || "image";
    const file = new File([data], name, { type: data.type });
    return file;
  }

  function handleFileInputChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = input.files;
    if (!files) return;

    for (const file of files) {
      if (file.type.startsWith("image/")) {
        dispatch("upload", { file });
      } else {
        dispatch("error", {
          error: new Error(`The uploaded image file is invalid: ${file}`),
        });
      }
    }
  }

  async function handlePaste(e: ClipboardEvent) {
    const items = e.clipboardData?.items;

    if (!items) return;

    for (const item of items) {
      // ignore the html img element chromium(?) gives on copy
      if (item.kind === "string" && item.type !== "text/html") {
        item.getAsString((text) => {
          if (isValidImageUrl(text)) {
            try {
              dispatch("uploadasync", { fileLoading: urlToFile(text) })
            } catch (error) {
              dispatch("error", { error });
            }
          } else {
            dispatch("error", {
              error: new Error(`The pasted image URL is invalid: ${text}`),
            });
          }
        });
      }
    }
    if (e.clipboardData?.files?.length) {
      input.files = e.clipboardData.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    const items = e.dataTransfer?.items;

    if (!items) return;
    for (const item of items) {
      // ignore the html img element chromium(?) gives on copy
      if (item.kind === "string" && item.type !== "text/html") {
        item.getAsString((text) => {
          if (isValidImageUrl(text)) {
            try {
              dispatch("uploadasync", { fileLoading: urlToFile(text) })
            } catch (error) {
              dispatch("error", { error });
            }
          } else {
            dispatch("error", {
              error: new Error(`The dropped image URL is invalid: ${text}`),
            });
          }
        });
      }
    }
    if (e.dataTransfer?.files?.length) {
      input.files = e.dataTransfer.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }
</script>

<svelte:window
  on:paste={handlePaste}
  on:dragstart={() => ($dragging = true)}
  on:dragend={() => ($dragging = false)}
/>

<button
  type="button"
  bind:this={button}
  class="h-full w-full rounded-md border-2 border-solid p-1 text-center hover:border-lime-300 hover:text-lime-300 lg:p-2"
  class:border-lime-300={$dragging && $dragEntered}
  class:text-lime-300={$dragging && $dragEntered}
  on:click={() => input.click()}
  on:dragover|preventDefault
  on:dragenter={() => ($dragEntered = true)}
  on:dragleave={() => ($dragEntered = false)}
  on:dragexit={() => ($dragEntered = false)}
  on:drop={handleDrop}
>
  <input
    type="file"
    accept="image/*"
    bind:this={input}
    class="hidden"
    on:change={handleFileInputChange}
  />
  {#if !$dragging}
    Click to upload an image, or drag or paste an image/image URL
  {:else}
    Drop an image here
  {/if}
</button>

<style>
</style>

