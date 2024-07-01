import { readable, writable } from "svelte/store";
import samples from "$lib/scanner/samples.json";

export const scannedSamples = writable<Set<string>>(new Set());

