//Selectors
let header = document.querySelector('.header');
let hamburgerMenu = document.querySelector('.hamburger-menu');

window.addEventListener('scroll', function() {
    let windowPosition = window.scrollY > 250; // becomes solid after scrolling 250
    header.classList.toggle('active', windowPosition)
} )

hamburgerMenu.addEventListener('click', function() {
    header.classList.toggle('menu-open');
})