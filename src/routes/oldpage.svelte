<script lang="ts">
  import Drawing from "./Drawing.svelte";
  import { writable } from "svelte/store";

  function arrayToSquareMatrix(arr: number[], rowLength: number): boolean[][] {
    if (arr.length % rowLength !== 0) {
      throw new Error("Array length is not a multiple of row length.");
    }

    const matrix: boolean[][] = [];
    for (let i = 0; i < arr.length; i += rowLength) {
      const row: boolean[] = arr
        .slice(i, i + rowLength)
        .map((value) => value === 1);
      matrix.push(row);
    }

    return matrix;
  }

  const defaultGrid: boolean[][] = arrayToSquareMatrix(
    [
      1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1,
      1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1,
      1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1,
      1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1,
      1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1,
      1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1,
      1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
      1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0,
      0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0,
      0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1,
      1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1,
      1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0,
      1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1,
      1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1,
      1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0,
      1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1,
      1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0,
      1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
      1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1,
      1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1,
      1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1,
      1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1,
    ],
    25,
  );
  const data = writable(defaultGrid);
</script>

<main>
  <Drawing {data} defaultData={defaultGrid} />
</main>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap");

  @font-face {
    font-family: "Maniac";
    /* sorry are we even licensed to use this publicly? */
    src: url("https://purduecpu.github.io/fonts/Maniac.ttf") format("truetype");
  }

  img {
    max-width: 100%;
    height: auto;
  }

  .cpu {
    font-family: "Maniac", "Impact", sans-serif;
    font-size: 2em;
    color: #ffd700;
    text-align: center;
    margin-top: 2rem;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: "Montserrat", sans-serif;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    font-size: 1.3rem;
    accent-color: black;
  }

  * {
    font-family: inherit;
  }

  .btn {
    background-color: #daaa00;
    color: #fff;
    padding: 10px 40px;
    text-decoration: none;
    margin: 20px;
    font-weight: 900;
    display: inline-block;
    transition: all 0.1s ease-in-out;
    cursor: pointer;
    transform: skewX(-10deg);
    border: 3px solid #fff1db;
    font-size: 1.5rem;
  }

  .btn.main {
    background-color: #ed301f;
    border: 3px solid #ff7d00;
  }

  .btn:hover {
    background-color: #ed5f1f;
    transform: scaleX(1.1);
    transition: all 0.3s ease-in-out;
  }

  .center {
    flex-direction: column;
    align-items: center;
    display: flex;
    justify-content: center;
  }

  .bg {
    background-color: #f1e9e4;
  }

  #msgs {
    height: 60vh;
    background: #252525;
    overflow-y: scroll;
    color: white;
    display: flex;
    flex-direction: column;
    padding: 5px 15px;
    overflow-wrap: anywhere;
  }

  .term-big {
    font-size: 1.9rem;
    font-weight: 800;
    margin: 15px 0;
  }

  .term-normal {
    color: #a5ffa5;
    font-weight: 500;
    font-family: monospace;
    font-size: 1.1rem;
  }

  .term-error {
    color: #ff8d63;
    font-weight: 700;
    font-family: monospace;
    font-size: 1.1rem;
  }

  .term-input {
    margin-top: 10px;
    font-family: monospace;
    font-size: 1.1rem;
    white-space: pre;
  }

  .term-normal.term-user {
    color: #84f1ff;
    white-space: pre;
    margin: 10px 0;
  }

  .term-indent {
    width: 1.2em;
    display: inline-block;
  }

  /*https://stackoverflow.com/a/16344548*/
  .blink {
    animation: blinker 0.7s cubic-bezier(0.98, -0.01, 0.09, 1.01) infinite
      alternate;
  }

  .arrow {
    max-height: 10rem;
    flex-shrink: 1;
  }

  .arrow-center {
    max-width: 90%;
    flex-shrink: 0.12;
  }

  .section {
    padding: 20px;
  }

  .link {
    border: none;
    background: none;
    font-size: 1em;
    text-decoration: underline;
    cursor: pointer;
    padding: 0;
    margin: 0;
  }

  a.nostyle {
    text-decoration: none;
  }

  a:not(.btn, .nostyle),
  .link {
    color: #ed5f1f;
    font-weight: 900;
    transition: all 0.1s ease-in-out;
  }

  a:not(.btn, .nostyle):hover,
  .link:hover {
    color: #ff7d00;
    transition: all 0.3s ease-in-out;
  }

  @keyframes blinker {
    to {
      opacity: 0;
    }
  }

  h1,
  h1 > input {
    font-size: 2rem;
    font-weight: 900;
    margin: 10px 0;
  }

  h2,
  h2 > input,
  h2 > button {
    font-weight: 900;
    font-size: 2rem;
    margin: 10px 0;
  }

  .container {
    max-width: 1000px;
    margin: 0 auto;
  }

  .sep {
    border: 2px solid #ffd72c;
    width: 70vw;
    margin: 30px auto;
  }

  .drawing-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .group {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    margin: 2rem 0;
  }

  .group > input,
  .group > select {
    flex-shrink: 1;
    flex-basis: 100px;
    flex-grow: 1;
  }

  label {
    flex-shrink: 1;
    flex-grow: 0.2;
    font-weight: 700 !important;
  }

  input:not([type]),
  input[type="text"],
  select {
    border: 3px solid black;
    font-size: 1.3rem;
    margin: 5px;
    padding: 8px;
    max-width: 100%;
    box-shadow: none;
    margin: 5px 1rem;
  }

  .group p {
    width: 100%;
    padding-left: 10px;
    margin: 0;
  }

  .group p::before {
    content: "➡";
    margin-right: 20px;
  }

  .full {
    color: #830000;
  }

  .status {
    border-width: 3px;
    border-style: solid;
    margin: 20px auto;
    padding: 20px;
    min-width: min(70vw, 700px);
    max-width: 700px;
  }

  .status.error {
    border-color: red;
    box-shadow: red 10px 10px 0px 0px;
  }

  .status.success {
    border-color: #86de68;
    box-shadow: #86de68 10px 10px 0px 0px;
  }

  .group input.missing {
    border-color: red !important;
    background: #fff3f3;
    box-shadow: inset red -10px 0px 0px 2px !important;
  }

  .group input:focus-visible {
    outline: none;
    box-shadow: #ff8900 3px 2px 0px 2px !important;
    border-color: #ed5f1f !important;
  }

  label.missing-label::before {
    content: "🚨";
    margin-right: 15px;
  }

  .gallery {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    flex-wrap: wrap;
    align-items: center;
    margin: 20px auto;
  }

  .gallery div,

  .gallery.pad div {
    padding: 20px;
  }

  .gallery.pad div h1,
  .gallery.pad div h2 {
    margin-top: 0;
  }

  .pretty {
    margin-right: 0;
    white-space: normal;
  }

  .pretty .state label,
  .pretty .state {
    text-indent: 0;
  }

  /*.pretty .state label > span {*/
  /*    display: inline-block;*/
  /*    padding-left: 1.8em;*/
  /*    line-height: 1.3em;*/
  /*}*/

  .pretty .state label::after,
  .pretty .state label::before,
  .pretty .state::after,
  .pretty .state::before {
    top: -1px !important;
  }

  .code {
    font-family: monospace;
    padding: 5px;
    background: #efefef;
    border-radius: 5px;
    line-height: 2em;
    white-space: break-spaces;
    overflow-wrap: anywhere;
  }

  textarea {
    font-family: monospace;
    padding: 5px;
    background: #f8f8f8;
    border-radius: 5px;
    line-height: 2em;
    font-size: 1.1em;
    width: 100%;
    margin: 10px 0;
    resize: vertical;
    min-height: 300px;
  }

  #editor {
    width: 100%;
    min-height: 500px;
    resize: vertical;
  }

  .team:nth-child(even) {
    background: #e1e1e1;
  }

  .teams {
    border-top: solid;
    border-bottom: solid;
    border-spacing: 0;
    width: 100%;
    border-collapse: collapse;
  }

  .team {
    padding: 5px;
  }

  .team td {
    padding: 0 15px;
  }

  .pts,
  .verdict {
    text-align: right;
    width: 0;
  }

  .pts {
    font-weight: bold;
  }

  .verdict.ok {
    color: #32ce00;
  }

  .verdict:not(.ok) {
    color: #e11000;
  }

  .schedule {
    border-spacing: 0 5px;
  }

  .schedule td:first-child {
    text-align: right;
    padding: 5px 5px 5px 12px;
    background: #162136;
    border-radius: 7px 0 0 7px;
    color: white;
    min-width: 70px;

    font-size: 1rem;
    font-weight: bold;
  }

  .schedule td:last-child {
    padding-left: 17px;
  }

  .huge {
    font-size: 4rem;
  }

  @media (min-width: 600px) {
    .cpu {
      font-size: 5.5em;
    }

    .schedule td:first-child {
      font-size: 1.3rem;
    }

    h1,
    h1 > input {
      font-size: 2.4rem;
    }
  }
</style>
