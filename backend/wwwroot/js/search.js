const boards = document.getElementsByClassName('board-item');

// const searchInput = document.getElementsByClassName('boards-find')[0];
const searchInput = document.querySelector('.boards-find');

searchInput.addEventListener("input", e => {
    const str = e.target.value.toLowerCase();

    for (var i = 0; i < boards.length; i++) {
        const title = boards[i].querySelector('.board-item-title').innerText.toLowerCase();

        if (title.includes(str)) {
            console.log(title)
            boards[i].style.display = 'flex'
        }
        else {
            boards[i].style.display = 'none'
        }
    }
})