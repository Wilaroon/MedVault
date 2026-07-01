import hashlib
import secrets
from datetime import datetime
from fastapi import Header, HTTPException, Depends
from psycopg2.extras import RealDictCursor
from app.database import get_db_connection

VALID_ROLES = {"admin", "medico", "enfermeria"}

# In-memory session store: token -> { usuario_id, rol, cedula, expira }
# Se pierde al reiniciar el backend, lo cual es aceptable para MVP.
_SESSIONS: dict[str, dict] = {}


def hash_password(password: str, salt: str | None = None) -> str:
    if salt is None:
        salt = secrets.token_hex(16)
    h = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
    return f"{salt}${h}"


def verify_password(password: str, stored: str) -> bool:
    try:
        salt, h = stored.split("$", 1)
    except ValueError:
        return False
    expected = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
    return secrets.compare_digest(expected, h)


def create_session(usuario: dict) -> str:
    token = secrets.token_urlsafe(32)
    _SESSIONS[token] = {
        "usuario_id": usuario["id"],
        "cedula": usuario["cedula"],
        "nombre": usuario["nombre"],
        "rol": usuario["rol"],
        "creado": datetime.utcnow(),
    }
    return token


def destroy_session(token: str) -> None:
    _SESSIONS.pop(token, None)


def _extract_token(authorization: str | None) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Falta token de autenticación")
    return authorization.split(" ", 1)[1].strip()


def get_current_user(authorization: str | None = Header(default=None)) -> dict:
    token = _extract_token(authorization)
    session = _SESSIONS.get(token)
    if not session:
        raise HTTPException(status_code=401, detail="Sesión inválida o expirada")
    return {**session, "token": token}


def require_admin(current: dict = Depends(get_current_user)) -> dict:
    if current.get("rol") != "admin":
        raise HTTPException(status_code=403, detail="Se requiere rol de administrador")
    return current


def seed_admin_if_empty() -> None:
    """Crea un usuario admin por defecto si la tabla usuarios está vacía."""
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM usuarios;")
        count = cur.fetchone()[0]
        if count == 0:
            default_cedula = "8-888-8888"
            default_password = "admin123"
            pw_hash = hash_password(default_password)
            cur.execute(
                """
                INSERT INTO usuarios (cedula, nombre, rol, password_hash, activo)
                VALUES (%s, %s, %s, %s, TRUE);
                """,
                (default_cedula, "Administrador MedVault", "admin", pw_hash),
            )
            conn.commit()
            print(
                f"\n🔐 Usuario admin creado por defecto:\n"
                f"   cédula:   {default_cedula}\n"
                f"   password: {default_password}\n"
                f"   ⚠️  Cambia la contraseña en cuanto puedas.\n"
            )
        cur.close()
    except Exception as e:
        print(f"⚠️  No se pudo sembrar admin por defecto: {e}")
    finally:
        if conn:
            conn.close()
