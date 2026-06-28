from pydantic import BaseModel, Field
from datetime import date
from typing import Optional

class PacienteSchema(BaseModel):
    # Usamos Field(alias=...) para que Python entienda el nombre del formulario del navegador
    nombre_completo: str = Field(..., alias="Ej Juan Pérez")
    cedula_id: str = Field(..., alias="8-888-8888")
    fecha_nacimiento: date = Field(..., alias="Fecha de nacimiento")
    genero: str = Field(..., alias="Género")
    telefono_contacto: Optional[str] = Field(None, alias="6000-0000")
    direccion: Optional[str] = Field(None, alias="Calle, ciudad, provincia")
    contacto_emergencia_nombre: Optional[str] = Field(None, alias="Nombre del familiar")
    tipo_sangre: Optional[str] = Field(None, alias="Tipo de sangre")
    seguro_medico: Optional[str] = Field(None, alias="Aseguradora / póliza")
    alergias_conocidas: Optional[str] = Field(None, alias="Ej Penicilina (severa), Ibuprofeno (moderada)")
    historial_medico: Optional[str] = Field(None, alias="Diagnósticos previos, cirugías, condiciones crónicas...")

    class Config:
        populate_by_name = True