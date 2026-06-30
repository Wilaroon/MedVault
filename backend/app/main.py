from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from psycopg2.extras import RealDictCursor, Json

import json
from app.schemas import PacienteCreate
from app.database import init_db, get_db_connection
from app.utils import fila_a_paciente_response


# 1. Instanciamos FastAPI
app = FastAPI(title="MedVault API", version="1.0")

# 2. Configuración de CORS para conectar con tu Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 3. Inicializar la base de datos al arrancar
@app.on_event("startup")
def startup_event():
    init_db()


@app.get("/")
def read_root():
    return {"message": "¡MedVault API operando con tus esquemas originales!"}


@app.post("/api/pacientes", status_code=201)
def crear_paciente(paciente: PacienteCreate):
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Query con las columnas reales de Postgres, incluyendo
        # email y contacto_emergencia (ahora JSONB)
        query = """
            INSERT INTO pacientes (
                nombre_completo, cedula_id, fecha_nacimiento, genero,
                telefono_contacto, email, direccion, contacto_emergencia,
                tipo_sangre, seguro_medico, alergias_conocidas, historial_medico
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id;
        """

        # Json(...) le dice a psycopg2 que serialice el dict/list
        # directamente como JSONB, sin pasar por json.dumps manual.
        contacto_data = (
            paciente.contacto_emergencia.model_dump()
            if paciente.contacto_emergencia else None
        )
        alergias_data = (
            [a.model_dump() for a in paciente.alergias]
            if paciente.alergias else []
        )

        cur.execute(query, (
            paciente.nombre,
            paciente.cedula,
            paciente.fecha_nacimiento,
            paciente.genero,
            paciente.telefono,
            paciente.email,
            paciente.direccion,
            Json(contacto_data) if contacto_data else None,
            paciente.tipo_sangre,
            paciente.seguro,
            Json(alergias_data),
            paciente.antecedentes,
        ))

        nuevo_id = cur.fetchone()[0]
        conn.commit()
        cur.close()

        return {
            "status": "success",
            "message": "Paciente registrado con éxito",
            "id": int(nuevo_id)
        }

    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=400, detail=f"Error en la base de datos: {str(e)}")
    finally:
        if conn:
            conn.close()


# 🔍 ENDPOINT PARA EXTRAER (formato dashboard)
@app.get("/api/pacientes")
def obtener_pacientes():
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("SELECT * FROM pacientes ORDER BY fecha_registro DESC;")
        filas = cur.fetchall()

        cur.close()

        # Transformamos cada fila cruda de la BD al objeto que
        # espera el frontend (name, initials, age, diag, etc.)
        pacientes = [fila_a_paciente_response(dict(row)) for row in filas]
        return pacientes

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()