from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import date
from typing import Optional
from app.database import init_db, get_db_connection
import psycopg2

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

class PacienteSchema(BaseModel):
    nombre_completo: str
    cedula_id: str
    fecha_nacimiento: date
    genero: str
    telefono_contacto: Optional[str] = None
    direccion: Optional[str] = None
    contacto_emergencia_nombre: Optional[str] = None
    tipo_sangre: Optional[str] = None
    seguro_medico: Optional[str] = None
    alergias_conocidas: Optional[str] = None
    historial_medico: Optional[str] = None

    # 🚨 CORREGIDO: Configuración interna oficial de Pydantic v2
    model_config = {
        "populate_by_name": True
    }

@app.get("/")
def read_root():
    return {"message": "¡MedVault API operando con tus esquemas originales!"}



# 🚀 ENDPOINT CORREGIDO CON RESPUESTA EXPLÍCITA
@app.post("/api/pacientes", status_code=201)
def crear_paciente(paciente: PacienteSchema):
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Query completa con todas las columnas de tu tabla
        query = """
            INSERT INTO pacientes (
                nombre_completo, cedula_id, fecha_nacimiento, genero, 
                telefono_contacto, direccion, contacto_emergencia_nombre, 
                tipo_sangre, seguro_medico, alergias_conocidas, historial_medico
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id;
        """
        
        # Pasamos absolutamente todos los valores mapeados
        cur.execute(query, (
            paciente.nombre_completo,
            paciente.cedula_id,
            paciente.fecha_nacimiento,
            paciente.genero,
            paciente.telefono_contacto,
            paciente.direccion,
            paciente.contacto_emergencia_nombre,
            paciente.tipo_sangre,
            paciente.seguro_medico,
            paciente.alergias_conocidas,
            paciente.historial_medico
        ))
        
        nuevo_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        
        return {
            "status": "success",
            "message": "Paciente registrado con éxito",
            "id": int(nuevo_id)
        }
        
    except psycopg2.IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"Error de integridad: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
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