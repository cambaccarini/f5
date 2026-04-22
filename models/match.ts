export interface Match {
  id: string;
  title: string;
  date?: string; // formato DD/MM/AAAA 
  time?: string; // formato HH:MM
  location?: string;
  description?: string;
  players: string[]; // array de IDs de usuarios
  requiredPlayers: number;
  organizerId: string; // ID del organizador
}

//chequear tipos de Datos, opcionales, ¿descripcion?
//agregar lo de mixto/fem/masc