import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

const toastifyStyle = {
  background:
    document.documentElement.className === 'lightTheme'
      ? 'rgba(255, 255, 255, 0.8)'
      : 'rgba(49, 49, 49, 0.8)',
  color:
    document.documentElement.className === 'lightTheme' ? 'rgb(51, 51, 51)' : 'rgb(233, 233, 233)',
  border: '2px solid rgb(95, 61, 196)',
  borderRadius: '5px',
  boxShadow: 'none',
  fill: 'red',
};

export const disconnectToast = () => {
  Toastify({
    text: 'Пользователь отключился',
    duration: 2000,
    //destination: "http://skorobogach-i-galoshi.tk/",
    newWindow: true,
    close: true,
    gravity: 'bottom', // `top` or `bottom`
    position: 'right', // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: toastifyStyle,
    onClick: function () {}, // Callback after click
  }).showToast();
};

export const testToast = (text: string) => {
  Toastify({
    text,
    duration: 6000,
    //destination: "http://skorobogach-i-galoshi.tk/",
    newWindow: true,
    close: true,
    gravity: 'bottom', // `top` or `bottom`
    position: 'right', // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: toastifyStyle,
    onClick: function () {}, // Callback after click
  }).showToast();
};

export const closeToast = () =>
  Toastify({
    text: 'Соединение прервано. Нажмите здесь.',
    duration: 0,
    newWindow: true,
    close: false,
    gravity: 'bottom', // `top` or `bottom`
    position: 'right', // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: toastifyStyle,
    onClick: function () {
      location.reload();
    }, // Callback after click
  }).showToast();
