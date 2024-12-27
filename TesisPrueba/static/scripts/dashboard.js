const sidebar = document.getElementById('toggle_button');
const nav = document.getElementById('nav');
const name = document.getElementById('name-user');
const main_content = document.getElementById('main_container');
const home_content = document.getElementById('main_section_container');

document.addEventListener('DOMContentLoaded', () => {
    const nameCache = localStorage.getItem('user');
    if(nameCache){
        name.textContent = nameCache;
    }
});

let position = -250;
sidebar.addEventListener('click', () =>{
    if(position === -250){
        position = 0;
    } else {
        position = -250;
    }
    nav.style.left = `${position}px`;
});

async function viewCloseSession(){
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    localStorage.removeItem('user');
    window.location.href = "/login";
}