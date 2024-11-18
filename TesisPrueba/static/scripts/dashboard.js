const sidebar = document.getElementById('toggle_button');
const nav = document.getElementById('nav');

let position = -250;

sidebar.addEventListener('click', () =>{
    if(position === -250){
        position = 0;
    } else {
        position = -250;
    }
    nav.style.left = `${position}px`;
});
