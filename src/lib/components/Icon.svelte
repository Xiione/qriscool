<!-- https://stackoverflow.com/a/66135688 -->
<script lang="ts">
    export let path;
    export let box: number;

    export let width = '1rem';
    export let height = '1rem';
    export let focusable: string | number | null | undefined = undefined;
</script>

<svg
    class={$$props.class}
    {focusable}
    {width}
    {height}
    viewBox="0 0 {box} {box}">{@html path}</svg
>
