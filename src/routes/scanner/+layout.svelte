<script>
  import "../../app.css";
</script>

<div class="flex justify-center">
  <slot />
</div>

<style lang="postcss">
  :global(html) {
    background-color: theme(colors.zinc.900);
    color: theme(colors.white);
    font-family: Menlo;
  }
  :global(body) {
    overscroll-behavior-x: none;
  }
</style>
