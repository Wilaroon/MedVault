# schemas.py
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict
from datetime import date

class AlergiaSchema(BaseModel):
    name: str
    sev: str

class PacienteCreate(BaseModel):
    nombre: str
    cedula: str
    # validation_alias mapea el camelCase del frontend al snake_case de Python
    fecha_nacimiento: Optional[date] = Field(None, validation_alias="fechaNacimiento")
    genero: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[EmailStr] = None
    direccion: Optional[str] = None
    contacto_emergencia: Optional[Dict[str, str]] = Field(None, validation_alias="contactoEmergencia")
    tipo_sangre: Optional[str] = Field(None, validation_alias="tipoSangre")
    alergias: Optional[List[AlergiaSchema]] = None
    antecedentes: Optional[str] = None
    seguro: Optional[str] = None

class PacienteResponse(PacienteCreate):
    id: int

    class Config:
        from_attributes = True # Reemplaza el viejo orm_mode = True de Pydantic v1