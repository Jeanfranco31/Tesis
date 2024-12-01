const inputName = document.getElementById('inputName');
const inputApellido = document.getElementById('inputApellido');
const inputCedula = document.getElementById('inputIdentification');
const inputMail = document.getElementById('inputMail');
const inputPass = document.getElementById('inputPass');
const inputVerifyPass = document.getElementById('inputVerifyPass');
const cedulaMessage = document.getElementById('cedulaMessage');
const passMessage = document.getElementById('passMessage');
const emailMessage = document.getElementById('emailMessage');
const passMessageVerify = document.getElementById('passMessageVerify');



async function createAccount() {
    const form = new FormData();
    form.append('name', inputName.value);
    form.append('lastName', inputApellido.value);
    form.append('email'   , inputMail.value);
    form.append('pass'    , inputPass.value);

    // Validar cédula
    let valid = true;
    const cedula = inputCedula.value;
    if (cedula.length === 10 && /^\d+$/.test(cedula)) {
        form.append('identification', cedula);
        cedulaMessage.textContent = ''; // Limpiar mensaje de error
    } else {
        valid = false;
        cedulaMessage.textContent = 'La cédula debe contener exactamente 10 dígitos.';
    }

    // Validar contraseña
    const pass = inputPass.value;
    if (pass.length < 8) {
        valid = false;
        passMessage.textContent = 'La contraseña es débil. Debe tener al menos 8 caracteres.';
    } else if (!/[A-Z]/.test(pass) || !/\d/.test(pass) || !/[!@#$%^&*]/.test(pass)) {
        valid = false;
        passMessage.textContent = 'La contraseña debe incluir mayúsculas, números y caracteres especiales.';
    } else {
        passMessage.textContent = ''; // Limpiar mensaje de error
    }

    // Validar correo electrónico
    const email = inputMail.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expresión regular para validar correos
    if (!emailRegex.test(email)) {
        valid = false;
        emailMessage.textContent = 'El correo no es válido. Introduzca un formato correcto (ejemplo@dominio.com).';
    } else {
        emailMessage.textContent = ''; // Limpiar mensaje de error
    }

    //Validar que la contraseña sea igual para confirmar
    const passConfirm = inputVerifyPass.value;
    if(passConfirm == pass){
        valid = true;
        passMessageVerify.textContent = '';
    }else{
        passMessageVerify.textContent = 'La contraseña no coincide con la anterior';
    }

    // No enviar si hay errores
    if (!valid) return;

    try {
        const response = await fetch('/createAccount', {
            method: 'POST',
            body: form
        });
        const data = await response.json();
        console.log(data)
        if (data.created) {
            window.location.href = data.redirect_url;
        } else {
            document.getElementById('message_content').innerHTML =
            `
                <div style="height:50px; display:flex; justify-content:center; align-items:center;background-color:red;">
                    <p style="text-align:center;">${data.message}</p>
                </div>
            `
            setTimeout(() => {
                document.getElementById('message_content').innerHTML = '';
            }, 4000);
        }
    } catch (error) {
        console.error('Error:', error);
    }

}

function redirectLogin(){
    
}