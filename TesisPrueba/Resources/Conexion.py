import pyodbc

server = 'nombre_del_servidor'  # e.g., 'localhost\\SQLEXPRESS' o 'ip_del_servidor'
database = 'nombre_de_la_base_de_datos'

def get_connection():
    try:
        conexion = pyodbc.connect(
            'DRIVER={ODBC Driver 17 for SQL Server};'
            f'SERVER={server};'
            f'DATABASE={database};'
        )
        print("Conexión exitosa")
    except pyodbc.Error as e:
        print("Error en la conexión:", e)