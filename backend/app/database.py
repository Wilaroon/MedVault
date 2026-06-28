import os
import psycopg2
from psycopg2.extras import RealDictCursor
import time

# 1. Extraemos la URL de la base de datos desde las variables de entorno de Docker
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgresMV:wilxroon232324@medvault_db:5432/medvault_db")


def get_db_connection():
    """
    Establece y retorna una conexión limpia a la base de datos PostgreSQL.
    """
    retries = 5
    while retries > 0:
        try:
            # 🚨 Psycopg2 lee la URL con las credenciales actualizadas
            conn = psycopg2.connect(DATABASE_URL)
            return conn
        except psycopg2.OperationalError as e:
            print(f"🔄 Esperando a la base de datos... Reintentos restantes: {retries}")
            retries -= 1
            time.sleep(2)  # Espera 2 segundos antes de volver a intentar
            
    raise Exception("❌ No se pudo conectar a la base de datos PostgreSQL tras varios intentos.")

def init_db():
    """
    Función para crear la tabla de pacientes automáticamente 
    si no existe al arrancar el servidor.
    """
    commands = ("""
        
        CREATE TABLE IF NOT EXISTS pacientes (
            id SERIAL PRIMARY KEY,
            nombre_completo VARCHAR(150) NOT NULL,
            cedula_id VARCHAR(50) UNIQUE NOT NULL,
            fecha_nacimiento DATE NOT NULL,
            genero VARCHAR(20),
            telefono_contacto VARCHAR(30),
            direccion VARCHAR(255),
            contacto_emergencia_nombre VARCHAR(150),
            tipo_sangre VARCHAR(15),
            seguro_medico VARCHAR(100),
            alergias_conocidas TEXT,
            historial_medico TEXT,
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );"""
        ,
    )
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        # Ejecutamos la creación de la tabla
        for command in commands:
            cur.execute(command)
        # Confirmamos los cambios en la BD
        conn.commit()
        cur.close()
        print("✅ Base de datos inicializada: Tabla 'pacientes' lista.")
    except (Exception, psycopg2.DatabaseError) as error:
        print(f"❌ Error al inicializar la base de datos: {error}")
    finally:
        if conn is not None:
            conn.close()