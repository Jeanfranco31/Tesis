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
const checkIdentification = document.getElementById('rb_identification');
const checkPassport = document.getElementById('rb_passport');


async function createAccount() {
    const form = new FormData();
    let valid = true;

    //Validar Nombre y Apellido
    const nombre = inputName.value.trim();
    const apellido = inputApellido.value.trim();
    if (nombre.length >= 3 && apellido.length >= 3) {
        form.append('name', nombre);
        form.append('lastName', apellido);
    } else {
        valid = false;
    }

    // Validar cédula
    const cedula = inputCedula.value.trim();

    if(checkIdentification.checked){
        if (cedula.length === 10 && /^\d+$/.test(cedula)) {

            let validIdentification = validarCedula(cedula);

            if(validIdentification){
                const response = await fetch('/check_cedula', {
                    method: 'POST',
                    body: JSON.stringify({ cedula }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (data.exists) {
                    cedulaMessage.textContent = 'La cédula ingresada ya existe';
                    valid = false;
                } else {
                    form.append('identification', cedula);
                    cedulaMessage.textContent = '';
                }
            }else{
                    cedulaMessage.textContent = 'La cédula ingresada no cumple con el formato del pais';
            }
        } else {
            valid = false;
            cedulaMessage.textContent = 'La cédula debe contener exactamente 10 dígitos.';
        }
    }else if(checkPassport.checked){
        form.append('identification', cedula);
        cedulaMessage.textContent = '';
    }

    // Validar correo electrónico
    const email = inputMail.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expresión regular para validar correos
    if (!emailRegex.test(email)) {
        valid = false;
        emailMessage.textContent = 'El correo no es válido. Introduzca un formato correcto (ejemplo@dominio.com).';
    } else {
        const response = await fetch('/check_email', {
            method: 'POST',
            body: JSON.stringify({ email }),
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const data = await response.json();
        if (data.exists) {
            emailMessage.textContent = 'El correo que ingreso ya existe';
            valid = false;
        } else {
            form.append('email', email);
            emailMessage.textContent = ''; // Limpiar mensaje de error
        }
    }

    // Validar contraseña
    const pass = inputPass.value.trim();
    if (pass.length < 8) {
        valid = false;
        passMessage.textContent = 'La contraseña es débil. Debe tener al menos 8 caracteres.';
    } else if (!/[A-Z]/.test(pass) || !/\d/.test(pass) || !/[!@#$%^&*]/.test(pass)) {
        valid = false;
        passMessage.textContent = 'La contraseña debe incluir mayúsculas, números y caracteres especiales.';
    } else {
        form.append('pass', pass);
        passMessage.textContent = ''; // Limpiar mensaje de error
    }

    //Validar que la contraseña sea igual para confirmar
    const passConfirm = inputVerifyPass.value.trim();
    if(passConfirm !== pass){
        valid = false;
        passMessageVerify.textContent = 'La contraseña no coincide con la anterior';
    }else{
        passMessageVerify.textContent = '';
    }

    // No enviar si hay errores
    if (!valid) {
        console.error('El formulario contiene errores y no se enviará.');
        return;
    }

    try {
        let response = null;
        if (form.get('name') && form.get('lastName') && form.get('identification') && form.get('pass') && form.get('email')) {
            response = await fetch('/createAccount', {
                method: 'POST',
                body: form
            });
        }
        
        const data = await response.json();
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

function validarCedula(cedula) {
    if (cedula.length !== 10 || isNaN(cedula)) {
        return false;
    }

    const digitos = cedula.split('').map(Number);

    if (digitos[0] < 0 || digitos[0] > 6) {
        return false;
    }

    const suma = digitos.slice(0, 9).reduce((acc, digito, index) => {
        if (index % 2 === 0) {
            let doble = digito * 2;
            if (doble > 9) {
                doble -= 9;
            }
            return acc + doble;
        } else {
            return acc + digito;
        }
    }, 0);

    const modulo = suma % 10;
    const digitoVerificador = modulo === 0 ? 0 : 10 - modulo;

    return digitoVerificador === digitos[9];
}

