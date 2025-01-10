
def validate_login_query():
    return "SELECT id, nombre, apellido, pass, mail, stateuser FROM Users WHERE mail = %s"

def update_session():
    return "UPDATE users set lastentry = %s where id = %s"

def create_account_query():
    return "INSERT INTO users(nombre,apellido,cedula,pass,mail,stateUser, idrol) VALUES(%s,%s,%s,%s,%s,B'0',1)"

