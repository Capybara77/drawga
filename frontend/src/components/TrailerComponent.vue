<template>
  <div id="me" class="trailer"></div>
</template>

<style>
.trailer {
  display: block;

  width: 15px;
  height: 15px;
  border-radius: 100%;

  background-color: var(--clr-trailer);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100000;

  pointer-events: none;
}
</style>
