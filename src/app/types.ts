import { Timestamp } from "firebase/firestore";

export interface USER_PROPS {
  id?: string;
  name: string;
  lastname: string;
  mail?: string;
  dni: string | number;
  tickets?: string[];
  nationality: string;
  originCompany: string;
}

export enum STATE_PROPS {
  "Recibido" = 1,
  "En proceso" = 2,
  "Listo" = 3,
  "Entregado" = 4
}

export interface TICKETS_PROPS {
  id?: string;
  uid: string;               // ID del usuario que creó o posee el ticket
  state: number;        // Estado del ticket, usando el enum
  date: Timestamp;           // Fecha de creación o asignación
  description?: string;      // (opcional) Descripción del problema o solicitud
  updatedAt?: Timestamp;     // (opcional) Última actualización
  assignedTo?: string;       // (opcional) UID del técnico o persona asignada
  items?: { [key: string]: number }; // (opcional) Prendas y cantidades
}

// dejo esos comentarios para que se entienda bien a que se refiere cada propiedad, la interfaz esta sujeta a cambios

export interface EMPRESA_PROPS {
  id?: string;          
  nombre: string;       
  pais?: string;        // País (opcional)
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
