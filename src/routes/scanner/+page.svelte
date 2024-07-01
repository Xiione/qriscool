<script lang="ts">
  import SampleGallery from "$lib/components/scanner/SampleGallery.svelte";
  import Upload from "$lib/components/scanner/Upload.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import camera from "$lib/assets/camera.svg?raw";

  let scanning = false;
  let file: File;
</script>

<main class="relative flex-col items-center justify-center text-left">
  <header>
    <h1 class="my-2 text-4xl text-lime-300 md:my-4">QR is cool</h1>
  </header>
  <div class:hidden={scanning}>
    <p>
      <SampleGallery
        title="Pick a sample"
        on:select={(e) => console.log(e.detail.image)}
      />
    </p>
    <span class="divider">
      <hr />
      <i class="mx-2 self-center">or</i>
      <hr />
    </span>
    <p class="h-40">
      <button
        type="button"
        class="h-full w-full rounded-md border-2 border-solid p-1 text-center hover:border-lime-300 hover:text-lime-300 lg:p-2"
        on:click={() => (scanning = true)}
      >
        <Icon
          class="inline fill-lime-300"
          path={camera}
          box={60}
          width="2rem"
          height="2rem"
        />
        Scan a QR code
      </button>
    </p>
    {#if file}
      <img
        src={URL.createObjectURL(file)}
        alt={`Selected photo: ${file.name}`}
      />
    {/if}
    <span class="divider">
      <hr />
      <i class="mx-2 self-center">or</i>
      <hr />
    </span>
    <p class="h-20">
      <Upload
        on:upload={(e) => {
          console.log(e.detail.file);
          file = e.detail.file;
        }}
        on:uploadasync={(e) => {
          console.log(e.detail);
          // @ts-ignore
          e.detail.fileLoading.then((res) => {
            file = res;
            console.log(file);
          });
        }}
        on:error={(e) => console.error(e.detail.error)}
      />
    </p>
  </div>
  {#if scanning}
    <button on:click={() => scanning = false}>hi</button>
  {/if}
</main>

<style lang="postcss">
  header,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p {
    width: min(40rem, calc(100vw - 2rem));
  }

  hr {
    @apply my-4 md:my-6;
    flex-grow: 1;
  }

  .divider {
    display: flex;
    width: 100%;
  }
</style>
