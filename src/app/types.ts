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

export interface STATISTICS_PROPS {
  totalTickets: number;                    // Total de tickets en el sistema
  totalUsers: number;                      // Total de usuarios registrados
  ticketsByState: {                        // Cantidad de tickets por estado
    received: number;                      // Estado "Recibido"
    inProcess: number;                     // Estado "En proceso"
    ready: number;                         // Estado "Listo"
    delivered: number;                     // Estado "Entregado"
  };
  ticketsToday: number;                    // Tickets creados hoy
  ticketsThisWeek: number;                 // Tickets creados esta semana
  ticketsThisMonth: number;                // Tickets creados este mes
  averageProcessingTime: number;           // Tiempo promedio de procesamiento (en horas)
  topItems: { [key: string]: number };    // Items más procesados
  usersByCompany: { [company: string]: number }; // Usuarios por empresa de origen
  completionRate: number;                  // Porcentaje de tickets completados
  pendingTickets: number;                  // Tickets pendientes (estados 1-3)
  lastUpdated: Timestamp;                  // Última actualización de estadísticas
}

export interface USER_METRICS {
  userId: string;
  userName: string;
  userDni: number;
  company: string;
  totalTickets: number;
  totalItems: number;
  averageItemsPerTicket: number;
  lastVisit: Date;
  firstVisit: Date;
  frequency: number; // tickets per month
  favoriteItems: { [item: string]: number };
  ticketsByState: {
    received: number;
    inProcess: number;
    ready: number;
    delivered: number;
  };
  averageProcessingTime: number;
  loyaltyScore: number; // 0-100
  itemsLaundry: { [item: string]: number };
}


