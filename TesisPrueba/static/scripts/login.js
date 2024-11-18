const inputMail = document.getElementById('mail');
const inputPassword = document.getElementById('password');

async function getLogin() {
    const form = new FormData();
    form.append('mail', inputMail.value);
    form.append('pass', inputPassword.value);
    try {
        const response = await fetch('/validateLogin', {
            method: 'POST',
            body: form
        });
        const data = await response.json();
        console.log(data)
        if (data.authenticated) {
            localStorage.setItem('token',data.token)
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

