<template>
  <div class="confirm-wrapper" style="display: none">
    <div class="confirm-container">
      <h1 class="confirm-title">Вы точно хотите очистить всю доску?</h1>
      <div class="hr-custom"></div>
      <div class="confirm-btns-container">
        <button class="confirm-btn" id="confirm-cancel">Отменить</button>
        <button class="confirm-btn" id="confirm-agree">Подтвердить</button>
      </div>
    </div>
  </div>
</template>

<style>
.confirm-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  z-index: var(--z-index-max);

  background-color: var(--clr-background-transparent);

  display: flex;
  justify-content: center;
  align-items: center;
}

.confirm-container {
  background-color: var(--clr-background-transparent);
  border: 2px solid var(--clr-border);
  border-radius: 5px;

  padding: 20px;
}

.hr-custom {
  width: 100%;
  height: 2px;
  background-color: var(--clr-border);
  margin: 20px 0;
}

.confirm-title {
  color: var(--clr-text);
  font-size: 1.5rem;
}

.confirm-btns-container {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.confirm-btn {
  color: var(--clr-text);
  background-color: var(--clr-background-transparent);
  border: 2px solid var(--clr-border);
  border-radius: 5px;

  padding: 7px 12px;
  font-size: 1.125rem;
  cursor: pointer;
}

#confirm-agree {
  background-color: rgb(177, 97, 97);
}
</style>
