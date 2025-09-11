export interface Match {
  id: string;
  title: string;
  dateTime?: Date;
  location?: string;
  description?: string;
  players: string[]; // array de IDs de usuarios
  requiredPlayers: number;
  organizerId: string; // ID del organizador
}

//chequear tipos de Datos, opcionales, ¿descripcion?