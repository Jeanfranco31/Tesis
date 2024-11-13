import pyodbc

server = 'DESKTOP-C9HNIMU'
database = 'Operaciones2024'
def get_connection():
    connection = pyodbc.Connection
    try:
        connection = pyodbc.connect(
            'DRIVER={ODBC Driver 17 for SQL Server};'
            f'SERVER={server};'
            f'DATABASE={database};'
            'Trusted_Connection=yes;'
        )
        print("Conexión exitosa")
    except pyodbc.Error as e:
        print("Error en la conexión:", e)

    return connection