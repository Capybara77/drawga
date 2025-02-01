<template>
  <div class="settings-wrapper">
    <button class="settings-show-btn" id="settings-show-btn">
      <span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="settings-show-icon feather feather-settings"
        >
          <circle cx="12" cy="12" r="3"></circle>
          <path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
          ></path>
        </svg>
      </span>
    </button>
    <section class="settings-container" style="display: none">
      <button class="settings-item" onclick="location.replace('/login')" id="user-btn">
        <div class="settings-item-icon">
          <!-- <?xml version="1.0" encoding="utf-8"?> -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="cursor-icon fill-icon feather feather-user"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div class="settings-item-text">Профиль</div>
        <div class="settings-item-shortcut">Ctrl+U</div>
      </button>
      <button class="settings-item" id="save-btn">
        <div class="settings-item-icon">
          <!-- <?xml version="1.0" encoding="utf-8"?> -->
          <svg xmlns="http://www.w3.org/2000/svg" class="cursor-icon fill-icon" viewBox="0 0 24 24">
            <path
              d="M10 2L10 11L6 11L12 17L18 11L14 11L14 2L10 2 z M 2 20L2 22L22 22L22 20L2 20 z"
            />
          </svg>
        </div>
        <div class="settings-item-text">Сохранить файл</div>
        <div class="settings-item-shortcut">Ctrl+D</div>
      </button>
      <button class="settings-item" id="save-server-btn">
        <div class="settings-item-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="cursor-icon feather feather-upload-cloud"
          >
            <polyline points="16 16 12 12 8 16"></polyline>
            <line x1="12" y1="12" x2="12" y2="21"></line>
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
            <polyline points="16 16 12 12 8 16"></polyline>
          </svg>
        </div>
        <div class="settings-item-text">Сохранить доску на сервере</div>
        <div class="settings-item-shortcut">Ctrl+Shift+O</div>
      </button>
      <button class="settings-item" id="clear-btn">
        <div class="settings-item-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="cursor-icon fill-icon"
            viewBox="0 0 256 256"
          >
            <rect width="256" height="256" fill="none"></rect>
            <path
              d="M224,56a8,8,0,0,1-8,8h-8V208a16,16,0,0,1-16,16H64a16,16,0,0,1-16-16V64H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,56ZM88,32h80a8,8,0,0,0,0-16H88a8,8,0,0,0,0,16Z"
            ></path>
          </svg>
        </div>
        <div class="settings-item-text">Очистить полотно</div>
        <div class="settings-item-shortcut">Ctrl+Shift+Del</div>
      </button>
      <hr />
      <button class="settings-item" id="change-theme-btn">
        <div class="settings-item-icon" id="moon-icon-container" style="display: block">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="cursor-icon feather feather-moon"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </div>

        <div class="settings-item-icon" id="sun-icon-container" style="display: none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="cursor-icon feather feather-sun"
          >
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        </div>

        <div class="settings-item-text" id="theme-inner-text">Темная тема</div>
        <div class="settings-item-shortcut">Ctrl+Shift+T</div>
      </button>
    </section>
  </div>
</template>
