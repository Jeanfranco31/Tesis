const sidebar = document.getElementById('toggle_button');
const nav = document.getElementById('nav');
const name = document.getElementById('name-user');
const toggleIcon = document.getElementById('toggle_icon');

let position = -280;

sidebar.addEventListener('click', () => {
    if (position === -280) {
        position = 0;
        toggleIcon.classList.add('rotated');
    } else {
        position = -280;
        toggleIcon.classList.remove('rotated');
    }
    nav.style.left = `${position}px`;
});

document.addEventListener('DOMContentLoaded', async () => {
    const nameCache = localStorage.getItem('user');
    if (nameCache) {
        name.textContent = nameCache;
    }
});

async function viewCloseSession(){
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    localStorage.removeItem('user');
    window.location.href = "/login";
}