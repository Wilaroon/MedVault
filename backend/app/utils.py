import random
from datetime import date, datetime


# Lista fija de 15 diagnósticos posibles (placeholder hasta tener
# un módulo real de diagnósticos clínicos).
DIAGNOSTICOS = [
    "Hipertensión arterial",
    "Diabetes tipo 2",
    "Asma bronquial",
    "Migraña crónica",
    "Gastritis",
    "Artritis reumatoide",
    "Hipotiroidismo",
    "Dermatitis atópica",
    "Ansiedad generalizada",
    "Reflujo gastroesofágico",
    "Anemia ferropénica",
    "Rinitis alérgica",
    "Lumbalgia crónica",
    "Insomnio",
    "Obesidad grado I",
]

AVATAR_COLORS = [
    "#F87171", "#FB923C", "#FBBF24", "#A3E635",
    "#34D399", "#22D3EE", "#60A5FA", "#A78BFA",
    "#F472B6", "#94A3B8",
]


def calcular_edad(fecha_nacimiento: date | None) -> int | None:
    if not fecha_nacimiento:
        return None
    hoy = date.today()
    edad = hoy.year - fecha_nacimiento.year
    # Restar 1 si aún no ha cumplido años este año
    if (hoy.month, hoy.day) < (fecha_nacimiento.month, fecha_nacimiento.day):
        edad -= 1
    return edad


def calcular_iniciales(nombre_completo: str) -> str:
    if not nombre_completo:
        return "??"
    partes = nombre_completo.strip().split()
    if len(partes) == 1:
        return partes[0][:2].upper()
    return (partes[0][0] + partes[-1][0]).upper()


def avatar_bg_for(paciente_id: int) -> str:
    # Determinístico según el id, así el color no cambia entre llamadas
    return AVATAR_COLORS[paciente_id % len(AVATAR_COLORS)]


def diagnostico_for(paciente_id: int) -> str:
    # Determinístico según el id (mismo paciente -> mismo diagnóstico
    # en cada GET), pero "random" entre pacientes distintos.
    rnd = random.Random(paciente_id)
    return rnd.choice(DIAGNOSTICOS)


def formatear_last_visit(fecha_registro) -> str | None:
    if not fecha_registro:
        return None
    if isinstance(fecha_registro, (datetime, date)):
        return fecha_registro.strftime("%Y-%m-%d")
    return str(fecha_registro)


def fila_a_paciente_response(row: dict) -> dict:
    """
    Convierte una fila cruda de la tabla `pacientes` (RealDictCursor)
    al formato que espera el dashboard del frontend.
    """
    alergias = row.get("alergias_conocidas") or []
    # Si la columna todavía es TEXT con JSON serializado, psycopg2 la
    # entrega como string; si ya es JSONB, la entrega como lista/dict.
    if isinstance(alergias, str):
        import json
        try:
            alergias = json.loads(alergias)
        except (ValueError, TypeError):
            alergias = []

    contacto = row.get("contacto_emergencia")
    if isinstance(contacto, str):
        import json
        try:
            contacto = json.loads(contacto)
        except (ValueError, TypeError):
            contacto = None

    paciente_id = row["id"]

    return {
        "id": paciente_id,
        "name": row.get("nombre_completo"),
        "initials": calcular_iniciales(row.get("nombre_completo")),
        "age": calcular_edad(row.get("fecha_nacimiento")),
        "gender": row.get("genero"),
        "avatarBg": avatar_bg_for(paciente_id),
        "diag": diagnostico_for(paciente_id),
        "lastVisit": formatear_last_visit(row.get("fecha_registro")),
        "allergies": alergias,
        "allergies_count": len(alergias) if alergias else 0,
        "vitals": {},
        "meds": [],
        "bloodType": row.get("tipo_sangre"),
        "phone": row.get("telefono_contacto"),
        "email": row.get("email"),
        "address": row.get("direccion"),
        "emergency": contacto,
        "insurance": row.get("seguro_medico"),
        "history": [row.get("historial_medico")] if row.get("historial_medico") else [],
    }