const inputMail = document.getElementById('mail');
const inputPassword = document.getElementById('password');
const emailMessageError = document.getElementById('emailMessage');
const passMessageError = document.getElementById('passMessage');

    async function getLogin() {
        const form = new FormData();
        let ruta;
        let valid = true;

        const email = inputMail.value;
        const response = await fetch('/check_email', {
            method: 'POST',
            body: JSON.stringify({ email }),
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const data = await response.json();
        // Validar correo
        if (email === '') {
            emailMessageError.textContent = 'Debe ingresar su correo';
            valid = false;
        } else if (!data.exists) {
            valid = false;
            emailMessageError.textContent = 'El correo que ingreso no existe';
        } else {
            form.append('mail', email);
            emailMessageError.textContent = ''; // Limpiar mensaje de error
        }

        const pass = inputPassword.value;
        if (pass === '') {
            valid = false;
            passMessageError.textContent = 'Debe ingresar su contraseña';
        } else {
            form.append('pass', pass);
            passMessageError.textContent = '';
        }

        if (!valid) {
            console.error('El formulario contiene errores y no se enviará.');
            return;
        }

        try {
            const response = await fetch('/validateLogin', {
                method: 'POST',
                body: form
            });
            const data = await response.json();
            console.log(data)
            if (data.authenticated) {
            this.ruta = data.redirect_url;
                localStorage.setItem('token',data.token)
                localStorage.setItem('user', data.user)
                localStorage.setItem('id', data.id);
                localStorage.setItem('rol', data.idRol)
                let idUser = data.id;
                await getPaths(idUser);
                await getFrames(data.id);

                window.location.href = this.ruta;

            } else {
                if(data.stateuser === '1'){
                    document.getElementById('message_content').innerHTML =
                    `
                        <div style="position:absolute; padding:10px 30px; top:5%; left:50%; transform: translateX(-50%); background-color:rgb(214, 5, 5 );">
                            <p style="text-align:center; color:#ffffff;">${data.message}</p>
                        </div>
                    `
                    setTimeout(() => {
                        document.getElementById('message_content').innerHTML = '';
                    }, 4000);
                } else if (data.stateuser === '0'){
                    document.getElementById('message_content').innerHTML =
                    `
                        <div style="position:absolute; padding:10px 30px; top:5%; left:50%; transform: translateX(-50%); background-color:rgb(214, 5, 5 );">
                            <p style="text-align:center; color:#ffffff;">Al parecer tu cuenta esta deshabilitada. Comunicate con un administrador.</p>
                        </div>
                    `
                    setTimeout(() => {
                        document.getElementById('message_content').innerHTML = '';
                    }, 4000);
                }
            }
        } catch (error) {
        console.error('Error:', error);
        document.getElementById('message_content').innerHTML = `
            <div style="position:absolute; padding:10px 30px; top:5%; left:50%; transform: translateX(-50%); background-color:rgb(214, 5, 5 );">
                <p style="text-align:center; color:#ffffff;">Ocurrió un error al iniciar sesión. Inténtalo de nuevo.</p>
            </div>
        `;
        setTimeout(() => {
            document.getElementById('message_content').innerHTML = '';
        }, 4000);
    }
    }

    async function getPaths(idUser){
        try{
            let form = new FormData();
            console.log(idUser)
            form.append('id',idUser);

            let request = await fetch('/all_paths',{
                method: 'POST',
                body: form
            });

            let response = await request.json();
            localStorage.setItem('paths', JSON.stringify(response));
        }catch(error){
            console.log(error);
        }
    }

    async function getFrames(idUser){
        try{
            let form = new FormData();
            console.log(idUser)
            form.append('id',idUser);

            let request = await fetch('/get_frames',{
                method: 'POST',
                body: form
            });

            let response = await request.json();
            console.log(response)
            localStorage.setItem('frames', JSON.stringify(response.response));
        }catch(error){
            console.log(error);
        }
    }

    document.getElementById('login-form').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            document.getElementById('login-button').click(); // Simular el clic en el botón
        }
    });
