<script lang="ts">
  import { onMount } from "svelte";
  import QrScanner from "qr-scanner";

  let video: HTMLVideoElement;
  let videoContainer: HTMLDivElement;
  let camHasCamera: HTMLSpanElement;
  let camList: HTMLSelectElement;
  let camHasFlash: HTMLSpanElement;
  let flashToggle: HTMLButtonElement;
  let flashState: HTMLSpanElement;
  let camQrResult: HTMLSpanElement;
  let camQrResultTimestamp: HTMLSpanElement;
  let fileSelector: HTMLInputElement;
  let fileQrResult: HTMLSpanElement;
  let scanRegionHighlightStyleSelect: HTMLSelectElement;
  let showScanRegion: HTMLInputElement;
  let inversionModeSelect: HTMLSelectElement;
  let startButton: HTMLButtonElement;
  let stopButton: HTMLButtonElement;

  let scanner: QrScanner;

  function setResult(label: HTMLSpanElement, result: any) {
    label.textContent = result.data;
    camQrResultTimestamp.textContent = new Date().toString();
    label.style.color = "teal";
    clearTimeout((label as any).highlightTimeout);
    (label as any).highlightTimeout = setTimeout(
      () => (label.style.color = "inherit"),
      100,
    );
  }

  const updateFlashAvailability = () => {
    scanner.hasFlash().then((hasFlash) => {
      camHasFlash.textContent = hasFlash.toString();
      flashToggle.style.display = hasFlash ? "inline-block" : "none";
    });
  };

  onMount(async () => {
    scanner = new QrScanner(video, (result) => setResult(camQrResult, result), {
      onDecodeError: (error) => {
        if (camQrResult) {
          camQrResult.textContent = error as string;
          camQrResult.style.color = "inherit";
        }
      },
      highlightScanRegion: true,
      highlightCodeOutline: true,
    });

    scanner.start().then(() => {
      updateFlashAvailability();
      QrScanner.listCameras(true).then((cameras) =>
        cameras.forEach((camera) => {
          const option = document.createElement("option");
          option.value = camera.id;
          option.text = camera.label;
          camList.add(option);
        }),
      );
    });

    QrScanner.hasCamera().then(
      (hasCamera) => (camHasCamera.textContent = hasCamera.toString()),
    );

    window.addEventListener("DOMContentLoaded", () => {
      scanRegionHighlightStyleSelect.addEventListener("change", (e) => {
        videoContainer.className = (e.target as HTMLSelectElement).value;
        scanner._updateOverlay(); // reposition the highlight because style 2 sets position: relative
      });

      showScanRegion.addEventListener("change", (e) => {
        const input = e.target as HTMLInputElement;
        const label = input.parentNode;
        label!.parentNode!.insertBefore(scanner.$canvas, label!.nextSibling);
        scanner.$canvas.style.display = input.checked ? "block" : "none";
      });

      inversionModeSelect.addEventListener("change", (event) => {
        scanner.setInversionMode(
          (event.target as HTMLSelectElement).value as QrScanner.InversionMode,
        );
      });

      camList.addEventListener("change", (event) => {
        scanner
          .setCamera((event.target as HTMLSelectElement).value)
          .then(updateFlashAvailability);
      });

      flashToggle.addEventListener("click", () => {
        scanner
          .toggleFlash()
          .then(
            () => (flashState.textContent = scanner.isFlashOn() ? "on" : "off"),
          );
      });

      startButton.addEventListener("click", () => {
        scanner.start();
      });

      stopButton.addEventListener("click", () => {
        scanner.stop();
      });

      fileSelector.addEventListener("change", (event) => {
        const file = fileSelector.files![0];
        if (!file) {
          return;
        }
        QrScanner.scanImage(file, { returnDetailedScanResult: true })
          .then((result) => setResult(fileQrResult, result))
          .catch((e) =>
            setResult(fileQrResult, { data: e || "No QR code found." }),
          );
      });
    });
  });

  // onDestroy(() => {
  //   scanner.stop();
  // });
</script>

<h1>Scan from WebCam:</h1>
<div id="video-container" bind:this={videoContainer}>
  <video id="qr-video" bind:this={video}></video>
</div>
<div>
  <label>
    Highlight Style
    <select
      id="scan-region-highlight-style-select"
      bind:this={scanRegionHighlightStyleSelect}
    >
      <option value="default-style">Default style</option>
      <option value="example-style-1">Example custom style 1</option>
      <option value="example-style-2">Example custom style 2</option>
    </select>
  </label>
  <label>
    <input id="show-scan-region" type="checkbox" bind:this={showScanRegion} />
    Show scan region canvas
  </label>
</div>
<div>
  <select id="inversion-mode-select" bind:this={inversionModeSelect}>
    <option value="original"
      >Scan original (dark QR code on bright background)</option
    >
    <option value="invert"
      >Scan with inverted colors (bright QR code on dark background)</option
    >
    <option value="both">Scan both</option>
  </select>
  <br />
</div>
<b>Device has camera: </b>
<span id="cam-has-camera" bind:this={camHasCamera}></span>
<br />
<div>
  <b>Preferred camera:</b>
  <select id="cam-list" bind:this={camList}>
    <option value="environment" selected>Environment Facing (default)</option>
    <option value="user">User Facing</option>
  </select>
</div>
<b>Camera has flash: </b>
<span id="cam-has-flash" bind:this={camHasFlash}></span>
<div>
  <button id="flash-toggle" bind:this={flashToggle}
    >📸 Flash: <span id="flash-state" bind:this={flashState}>off</span></button
  >
</div>
<br />
<b>Detected QR code: </b>
<span id="cam-qr-result" bind:this={camQrResult}>None</span>
<br />
<b>Last detected at: </b>
<span id="cam-qr-result-timestamp" bind:this={camQrResultTimestamp}></span>
<br />
<button id="start-button" bind:this={startButton}>Start</button>
<button id="stop-button" bind:this={stopButton}>Stop</button>
<hr />

<h1>Scan from File:</h1>
<input type="file" id="file-selector" bind:this={fileSelector} on:change={() => {
        const file = fileSelector.files[0];
        if (!file) {
          return;
        }
        QrScanner.scanImage(file, { returnDetailedScanResult: true })
          .then((result) => setResult(fileQrResult, result))
          .catch((e) => {
            console.error(e)
            setResult(fileQrResult, { data: e || "No QR code found." })
          }
          );
      }} />
<b>Detected QR code: </b>
<span id="file-qr-result" bind:this={fileQrResult}>None</span>

<style>
  div {
    margin-bottom: 16px;
  }

  #video-container {
    line-height: 0;
  }

  #video-container.example-style-1 .scan-region-highlight-svg,
  #video-container.example-style-1 .code-outline-highlight {
    stroke: #64a2f3 !important;
  }

  #video-container.example-style-2 {
    position: relative;
    width: max-content;
    height: max-content;
    overflow: hidden;
  }
  #video-container.example-style-2 .scan-region-highlight {
    border-radius: 30px;
    outline: rgba(0, 0, 0, 0.25) solid 50vmax;
  }
  #video-container.example-style-2 .scan-region-highlight-svg {
    display: none;
  }
  #video-container.example-style-2 .code-outline-highlight {
    stroke: rgba(255, 255, 255, 0.5) !important;
    stroke-width: 15 !important;
    stroke-dasharray: none !important;
  }

  #flash-toggle {
    display: none;
  }

  hr {
    margin-top: 32px;
  }
  input[type="file"] {
    display: block;
    margin-bottom: 16px;
  }
</style>
