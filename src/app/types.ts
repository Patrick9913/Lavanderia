import { Timestamp } from "firebase/firestore";

export interface USER_PROPS {
    name: string;
    lastname: string;
    mail?: string;
    dni: number;
    tickets?: string[]
}

export enum STATE_PROPS {
    Recbidos = 1,
    Proceso = 2,
    Listo = 3,
    Entregado = 4
}

export interface TICKETS_PROPS {
  uid: string;               // ID del usuario que creó o posee el ticket
  state: number;        // Estado del ticket, usando el enum
  date: Timestamp;           // Fecha de creación o asignación
  description?: string;      // (opcional) Descripción del problema o solicitud
  updatedAt?: Timestamp;     // (opcional) Última actualización
  assignedTo?: string;       // (opcional) UID del técnico o persona asignada
}

// dejo esos comentarios para que se entienda bien a que se refiere cada propiedad, la interfaz esta sujeta a cambios

