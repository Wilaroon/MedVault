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
            conn = psycopg2.connect(DATABASE_URL)
            return conn
        except psycopg2.OperationalError as e:
            print(f"🔄 Esperando a la base de datos... Reintentos restantes: {retries}")
            retries -= 1
            time.sleep(2)

    raise Exception("❌ No se pudo conectar a la base de datos PostgreSQL tras varios intentos.")


def init_db():
    """
    Crea la tabla de pacientes si no existe, y además aplica
    migraciones idempotentes (ALTER TABLE) para bases de datos
    que ya existían con el esquema viejo.
    """
    create_table = """
        CREATE TABLE IF NOT EXISTS pacientes (
            id SERIAL PRIMARY KEY,
            nombre_completo VARCHAR(150) NOT NULL,
            cedula_id VARCHAR(50) UNIQUE NOT NULL,
            fecha_nacimiento DATE NOT NULL,
            genero VARCHAR(20),
            telefono_contacto VARCHAR(30),
            email VARCHAR(150),
            direccion VARCHAR(255),
            contacto_emergencia JSONB,
            tipo_sangre VARCHAR(15),
            seguro_medico VARCHAR(100),
            alergias_conocidas JSONB,
            historial_medico TEXT,
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """

    create_usuarios = """
        CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            cedula VARCHAR(50) UNIQUE NOT NULL,
            nombre VARCHAR(150) NOT NULL,
            rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'medico', 'enfermeria')),
            password_hash VARCHAR(255) NOT NULL,
            activo BOOLEAN NOT NULL DEFAULT TRUE,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """

    # Migraciones para bases de datos que ya existían con el
    # esquema viejo. Cada una es segura de re-ejecutar (idempotente).
    migrations = [
        "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS email VARCHAR(150);",
        "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS contacto_emergencia JSONB;",
        "ALTER TABLE pacientes ALTER COLUMN fecha_registro SET DEFAULT CURRENT_TIMESTAMP;",
    ]

    # Migraciones "peligrosas" que solo aplican si la columna vieja
    # todavía existe. Se manejan aparte porque pueden fallar si los
    # datos no son compatibles (ver nota abajo).
    conditional_migrations = [
        # Si existe la columna vieja contacto_emergencia_nombre, la eliminamos
        # (ya no se usa: ahora todo vive en la columna contacto_emergencia JSONB)
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name='pacientes' AND column_name='contacto_emergencia_nombre'
            ) THEN
                ALTER TABLE pacientes DROP COLUMN contacto_emergencia_nombre;
            END IF;
        END $$;
        """,
        # Convertir alergias_conocidas de TEXT a JSONB si todavía es TEXT.
        # OJO: esto falla si hay filas con texto que no sea JSON válido.
        # Si falla, revisa esos datos manualmente antes de reintentar.
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name='pacientes'
                  AND column_name='alergias_conocidas'
                  AND data_type = 'text'
            ) THEN
                ALTER TABLE pacientes
                ALTER COLUMN alergias_conocidas TYPE JSONB
                USING CASE
                    WHEN alergias_conocidas IS NULL OR alergias_conocidas = ''
                    THEN '[]'::jsonb
                    ELSE alergias_conocidas::jsonb
                END;
            END IF;
        END $$;
        """,
    ]

    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(create_table)
        cur.execute(create_usuarios)
        conn.commit()

        for migration in migrations:
            cur.execute(migration)
        conn.commit()

        for migration in conditional_migrations:
            try:
                cur.execute(migration)
                conn.commit()
            except (Exception, psycopg2.DatabaseError) as mig_error:
                conn.rollback()
                print(f"⚠️  No se pudo aplicar una migración (puede ser normal si ya se aplicó antes): {mig_error}")

        cur.close()
        print("✅ Base de datos inicializada y migrada: Tabla 'pacientes' lista.")
    except (Exception, psycopg2.DatabaseError) as error:
        print(f"❌ Error al inicializar la base de datos: {error}")
    finally:
        if conn is not None:
            conn.close()