from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import date
from typing import Optional

import psycopg2
import json
from app.schemas import PacienteCreate
from app.database import init_db, get_db_connection


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
        
        # Query completa con las columnas reales de tu Postgres
        query = """
            INSERT INTO pacientes (
                nombre_completo, cedula_id, fecha_nacimiento, genero, 
                telefono_contacto, direccion, contacto_emergencia_nombre, 
                tipo_sangre, seguro_medico, alergias_conocidas, historial_medico
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id;
        """
        
        # 💡 Convertimos las estructuras complejas a texto JSON para la BD si tus columnas son tipo JSON o TEXT
        contacto_json = json.dumps(paciente.contacto_emergencia) if paciente.contacto_emergencia else None
        # Mapeamos la lista de objetos de alergia a un string legible o JSON
        alergias_json = json.dumps([a.model_dump() for a in paciente.alergias]) if paciente.alergias else None

        # Pasamos los valores usando los nombres exactos definidos en app/schemas.py
        cur.execute(query, (
            paciente.nombre,               # de "nombre" en el frontend
            paciente.cedula,               # de "cedula" en el frontend
            paciente.fecha_nacimiento,     # traducido de "fechaNacimiento"
            paciente.genero,               # de "genero"
            paciente.telefono,             # de "telefono"
            paciente.direccion,            # de "direccion"
            contacto_json,                 # traducido de "contactoEmergencia"
            paciente.tipo_sangre,          # traducido de "tipoSangre"
            paciente.seguro,               # de "seguro"
            alergias_json,                 # de "alergias"
            paciente.antecedentes          # de "antecedentes"
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
        # Atrapa errores de duplicados (IntegrityError) u otros problemas
        if conn:
            conn.rollback()
        raise HTTPException(status_code=400, detail=f"Error en la base de datos: {str(e)}")
    finally:
        if conn:
            conn.close()



# 🔍 ENDPOINT PARA EXTRAER
@app.get("/api/pacientes")
def obtener_pacientes():
    conn = None
    try:
        conn = get_db_connection()
        from psycopg2.extras import RealDictCursor
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("SELECT * FROM pacientes ORDER BY fecha_registro DESC;")
        pacientes = cur.fetchall()
        
        cur.close()
        return pacientes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()