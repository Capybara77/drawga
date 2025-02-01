<template>
  <div class="options-wrapper" style="display: none">
    <div class="options-color-container" id="options-color-fill">
      <p>Цвет зарисовки</p>
      <div class="color-container">
        <div class="color-picker"></div>
        <!-- <div class="color-list" id="color-list" style="display: none">
              @foreach (var color in Model) {
              <div class="color-item" id="color-item" style="background-color: @color"></div>
              }
            </div> -->
        <div class="color-picker-input">
          <p>#</p>
          <input placeholder="000000" type="text" id="color-picker-input" />
        </div>
      </div>
    </div>
    <div class="options-color-container" id="options-color-border">
      <p>Цвет границы</p>
      <div class="color-container">
        <div class="color-picker" id="stroke-color-picker"></div>
        <!-- <div class="color-list" id="stroke-color-list" style="display: none">
              @foreach (var color in Model) {
              <div class="color-item" id="stroke-color-item" style="background-color: @color"></div>
              }
            </div> -->
        <div class="color-picker-input" id="stroke-color-picker-container">
          <p>#</p>
          <input placeholder="000000" type="text" id="stroke-color-picker-input" />
        </div>
      </div>
    </div>
    <div class="options-color-container" id="options-color-text">
      <p>Цвет текста</p>
      <div class="color-container">
        <div class="color-picker" id="text-color-picker"></div>
        <!-- <div class="color-list" id="text-color-list" style="display: none">
              @foreach (var color in Model) {
              <div class="color-item" id="text-color-item" style="background-color: @color"></div>
              }
            </div> -->
        <div class="color-picker-input" id="text-color-picker-container">
          <p>#</p>
          <input placeholder="000000" type="text" id="text-color-picker-input" />
        </div>
      </div>
    </div>
    <div class="options-container" id="width-options-container">
      <p>Толщина линии</p>
      <div class="options-btns-container">
        <div>
          <button class="option-btn width-btn" id="small-width-btn" data-line-width="5">
            smol
          </button>
        </div>
        <div>
          <button
            class="option-btn width-btn active-option"
            id="middle-width-btn"
            data-line-width="12"
          >
            norm
          </button>
        </div>
        <div>
          <button class="option-btn width-btn" id="large-width-btn" data-line-width="20">
            larj
          </button>
        </div>
      </div>
    </div>
    <div class="options-container" id="font-size-options-container">
      <p>Размер текста</p>
      <div class="options-btns-container">
        <div>
          <button class="option-btn font-size-btn" id="font-s-btn" data-font-size="0.875rem">
            S
          </button>
        </div>
        <div>
          <button
            class="option-btn font-size-btn active-option"
            id="font-m-btn"
            data-font-size="1rem"
          >
            M
          </button>
        </div>
        <div>
          <button class="option-btn font-size-btn" id="font-l-btn" data-font-size="1.2rem">
            L
          </button>
        </div>
        <div>
          <button class="option-btn font-size-btn" id="font-xl-btn" data-font-size="1.5rem">
            XL
          </button>
        </div>
      </div>
    </div>
    <div class="options-container" id="opacity-options-container">
      <p>Прозрачность линии</p>
      <input type="range" min="0.1" max="1" value="1" step="0.1" id="input-opacity" />
    </div>
    <div class="options-container" id="fill-style-options-container">
      <p>Стиль заливки</p>
      <div class="fill-style-options-container">
        <button class="fill-style-btn active-fill-style" data-fill-option="hachure">hachure</button>
        <button class="fill-style-btn" data-fill-option="solid">solid</button>
        <button class="fill-style-btn" data-fill-option="zigzag">zigzag</button>
        <button class="fill-style-btn" data-fill-option="cross-hatch">cross-hatch</button>
        <button class="fill-style-btn" data-fill-option="dashed">dashed</button>
        <button class="fill-style-btn" data-fill-option="zigzag-line">zigzag-line</button>
      </div>
    </div>
  </div>
</template>
