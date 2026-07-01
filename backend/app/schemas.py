from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Literal
from datetime import date, datetime


class AlergiaSchema(BaseModel):
    name: str
    sev: str


class ContactoEmergenciaSchema(BaseModel):
    nombre: str
    telefono: str


class PacienteCreate(BaseModel):
    """
    Contrato OFICIAL que el backend acepta.
    El frontend debe enviar los campos en snake_case (ver tabla de
    equivalencias abajo). Ya no se usan validation_alias / camelCase:
    el frontend se adapta a este contrato, no al revés.

    Equivalencias respecto al JSON viejo del frontend:
        fechaNacimiento    -> fecha_nacimiento
        contactoEmergencia -> contacto_emergencia
        tipoSangre         -> tipo_sangre
    """
    nombre: str
    cedula: str
    fecha_nacimiento: Optional[date] = None
    genero: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[EmailStr] = None
    direccion: Optional[str] = None
    contacto_emergencia: Optional[ContactoEmergenciaSchema] = None
    tipo_sangre: Optional[str] = None
    alergias: Optional[List[AlergiaSchema]] = None
    antecedentes: Optional[str] = None
    seguro: Optional[str] = None


class PacienteResponse(BaseModel):
    """
    Forma en la que el backend devuelve cada paciente al frontend
    (formato dashboard), según el contrato:
    { id, name, initials, age, gender, avatarBg, diag, lastVisit,
      allergies, vitals, meds, bloodType, phone, email, address,
      emergency, insurance, history }
    """
    id: int
    name: str
    initials: str
    age: Optional[int] = None
    gender: Optional[str] = None
    avatarBg: str
    diag: str
    lastVisit: Optional[str] = None
    allergies: List[AlergiaSchema] = []
    allergies_count: int = 0
    vitals: Dict = {}
    meds: List[str] = []
    bloodType: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    emergency: Optional[ContactoEmergenciaSchema] = None
    insurance: Optional[str] = None
    history: List[str] = []

    class Config:
        from_attributes = True


# ============================================================
# Usuarios y autenticación
# ============================================================

RolUsuario = Literal["admin", "medico", "enfermeria"]


class UsuarioCreate(BaseModel):
    cedula: str = Field(min_length=3, max_length=50)
    nombre: str = Field(min_length=2, max_length=150)
    rol: RolUsuario
    password: str = Field(min_length=6, max_length=200)


class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = Field(default=None, min_length=2, max_length=150)
    rol: Optional[RolUsuario] = None
    activo: Optional[bool] = None
    password: Optional[str] = Field(default=None, min_length=6, max_length=200)


class UsuarioResponse(BaseModel):
    id: int
    cedula: str
    nombre: str
    rol: RolUsuario
    activo: bool
    fecha_creacion: Optional[datetime] = None


class LoginRequest(BaseModel):
    cedula: str
    password: str


class LoginResponse(BaseModel):
    token: str
    usuario: UsuarioResponse