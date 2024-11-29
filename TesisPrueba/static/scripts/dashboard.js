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

async function viewUsers() {
    try {
        // Fetch de la vista HTML
        const response = await fetch("/gestion-usuarios");
        const data = await response.text();
        main_content.innerHTML = data;
        home_content.style.display = 'none';

        // Asegúrate de que no haya duplicados del script
        const existingScript = document.querySelector('script[src="../static/scripts/gestion-usuarios.js"]');
        if (existingScript) {
            // Si el script ya existe, elimínalo para evitar conflictos
            existingScript.remove();
        }

        // Crear y agregar el nuevo script
        const script = document.createElement("script");
        script.src = "../static/scripts/gestion-usuarios.js";
        script.onload = () => {
            console.log("Script gestion-usuarios.js cargado y ejecutado.");
            if (typeof cargarUsuarios === "function") {
                cargarUsuarios(); // Llama a la función directamente después de cargar el script
            }
        };
        script.onerror = () => {
            console.error("Error al cargar el script gestion-usuarios.js.");
        };
        document.body.appendChild(script);

    } catch (error) {
        console.error("Error al cargar la vista de usuarios:", error);
    }
}


async function viewImages(){
    const response = await fetch("/upload-image")
    const data = await response.text();
    main_content.innerHTML = data;
    home_content.style.display = 'none';


    const existingScript = document.querySelector('script[src="../static/scripts/file.js"]');
    if (!existingScript) {
        const script = document.createElement("script");
        script.src = "../static/scripts/file.js";
        document.body.appendChild(script);
    }
}