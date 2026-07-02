from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from psycopg2.extras import RealDictCursor, Json

from app.schemas import (
    PacienteCreate,
    UsuarioCreate,
    UsuarioUpdate,
    UsuarioResponse,
    LoginRequest,
    LoginResponse,
)
from app.database import init_db, get_db_connection
from app.utils import fila_a_paciente_response
from app.auth import (
    hash_password,
    verify_password,
    create_session,
    destroy_session,
    get_current_user,
    require_admin,
    seed_admin_if_empty,
)


app = FastAPI(title="MedVault API", version="1.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    init_db()
    seed_admin_if_empty()


@app.get("/")
def read_root():
    return {"message": "¡MedVault API operando con autenticación!"}


# ============================================================
# Autenticación
# ============================================================

@app.post("/api/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            "SELECT id, cedula, nombre, rol, password_hash, activo, fecha_creacion "
            "FROM usuarios WHERE cedula = %s;",
            (payload.cedula,),
        )
        row = cur.fetchone()
        cur.close()

        if not row:
            raise HTTPException(status_code=401, detail="Cédula o contraseña incorrecta")
        if not row["activo"]:
            raise HTTPException(status_code=403, detail="Usuario inactivo. Contacte al administrador.")
        if not verify_password(payload.password, row["password_hash"]):
            raise HTTPException(status_code=401, detail="Cédula o contraseña incorrecta")

        usuario = {
            "id": row["id"],
            "cedula": row["cedula"],
            "nombre": row["nombre"],
            "rol": row["rol"],
            "activo": row["activo"],
            "fecha_creacion": row["fecha_creacion"],
        }
        token = create_session(usuario)
        return {"token": token, "usuario": usuario}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en login: {e}")
    finally:
        if conn:
            conn.close()


@app.post("/api/logout")
def logout(current=Depends(get_current_user)):
    destroy_session(current["token"])
    return {"status": "ok"}


@app.get("/api/me", response_model=UsuarioResponse)
def me(current=Depends(get_current_user)):
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            "SELECT id, cedula, nombre, rol, activo, fecha_creacion "
            "FROM usuarios WHERE id = %s;",
            (current["usuario_id"],),
        )
        row = cur.fetchone()
        cur.close()
        if not row:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return dict(row)
    finally:
        if conn:
            conn.close()


# ============================================================
# Gestión de usuarios (solo admin)
# ============================================================

@app.get("/api/usuarios", response_model=list[UsuarioResponse])
def listar_usuarios(_admin=Depends(require_admin)):
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            "SELECT id, cedula, nombre, rol, activo, fecha_creacion "
            "FROM usuarios ORDER BY fecha_creacion DESC;"
        )
        rows = cur.fetchall()
        cur.close()
        return [dict(r) for r in rows]
    finally:
        if conn:
            conn.close()


@app.post("/api/usuarios", response_model=UsuarioResponse, status_code=201)
def crear_usuario(payload: UsuarioCreate, _admin=Depends(require_admin)):
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        pw_hash = hash_password(payload.password)
        try:
            cur.execute(
                """
                INSERT INTO usuarios (cedula, nombre, rol, password_hash, activo)
                VALUES (%s, %s, %s, %s, TRUE)
                RETURNING id, cedula, nombre, rol, activo, fecha_creacion;
                """,
                (payload.cedula, payload.nombre, payload.rol, pw_hash),
            )
        except Exception as e:
            conn.rollback()
            if "unique" in str(e).lower() or "duplicate" in str(e).lower():
                raise HTTPException(status_code=409, detail=f"Ya existe un usuario con cédula {payload.cedula}")
            raise
        row = cur.fetchone()
        conn.commit()
        cur.close()
        return dict(row)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creando usuario: {e}")
    finally:
        if conn:
            conn.close()


@app.patch("/api/usuarios/{usuario_id}", response_model=UsuarioResponse)
def actualizar_usuario(usuario_id: int, payload: UsuarioUpdate, _admin=Depends(require_admin)):
    updates = []
    values = []
    if payload.nombre is not None:
        updates.append("nombre = %s")
        values.append(payload.nombre)
    if payload.rol is not None:
        updates.append("rol = %s")
        values.append(payload.rol)
    if payload.activo is not None:
        updates.append("activo = %s")
        values.append(payload.activo)
    if payload.password is not None:
        updates.append("password_hash = %s")
        values.append(hash_password(payload.password))
    if not updates:
        raise HTTPException(status_code=400, detail="Nada que actualizar")

    values.append(usuario_id)
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            f"UPDATE usuarios SET {', '.join(updates)} WHERE id = %s "
            f"RETURNING id, cedula, nombre, rol, activo, fecha_creacion;",
            tuple(values),
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        conn.commit()
        cur.close()
        return dict(row)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error actualizando usuario: {e}")
    finally:
        if conn:
            conn.close()


# ============================================================
# Pacientes
# ============================================================

@app.post("/api/pacientes", status_code=201)
def crear_paciente(paciente: PacienteCreate, _user=Depends(require_admin)):
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        query = """
            INSERT INTO pacientes (
                nombre_completo, cedula_id, fecha_nacimiento, genero,
                telefono_contacto, email, direccion, contacto_emergencia,
                tipo_sangre, seguro_medico, alergias_conocidas, historial_medico
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id;
        """

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


@app.get("/api/pacientes")
def obtener_pacientes(_user=Depends(get_current_user)):
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("SELECT * FROM pacientes ORDER BY fecha_registro DESC;")
        filas = cur.fetchall()

        cur.close()

        pacientes = [fila_a_paciente_response(dict(row)) for row in filas]
        return pacientes

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()
