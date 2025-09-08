'use client';

import React, { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useMemo, useState } from "react";
import { addDoc, arrayUnion, collection, doc, onSnapshot, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../config"
import { useAuthContext } from "./authcontext";
import { TICKETS_PROPS, USER_PROPS } from "../types";
import Swal from "sweetalert2";

interface APPCONTEXT_PROPS {
    users: USER_PROPS[] | null;
    tickets: TICKETS_PROPS[] | null;
    menu: number
    setMenu: Dispatch<SetStateAction<number>>
    userDni: string;
    setUserDni: Dispatch<SetStateAction<string>>;
    items: { [key: string]: number };
    toggleItem: (item: string, cantidad: number) => void;
    prendas: string[];
    selectedUser: USER_PROPS | undefined;
    createTicket: () => Promise<void>;
    description?: string;
    setDescription?: Dispatch<SetStateAction<string>>;
    updateTicketState: (ticketId: string, nextState: number) => Promise<void>;
}

export const AppContext = createContext<APPCONTEXT_PROPS | undefined>(undefined)

export const useAppContext = () => {
    const context = useContext(AppContext);
    if ( !context ) throw new Error("El contexto debe ser consumido por componentes que se encuentren dentro de él")
    return context
}

export const AppContextProvider: React.FC<{children: ReactNode}> = ({children}) => {

    const {currentUser} = useAuthContext()
    const usersRef = collection(db, "users");
    const ticketsRef = collection(db, "tickets")
    const [users, setUsers] = useState<USER_PROPS[] | null>(null)
    const [tickets, setTickets] = useState<TICKETS_PROPS[] | null>(null)
    const [menu, setMenu] = useState<number>(1)
    const [userDni, setUserDni] = useState<string>("")
    const [items, setItems] = useState<{ [key: string]: number }>({})
    const [description, setDescription] = useState<string>("")

    const prendas = useMemo(
    () => [
        "Camisas",
        "Pantalones",
        "Remeras",
        "Buzos",
        "Camperas",
        "Chalecos",
        "Abrigos",
        "Ropa interior",
        "Medias",
        "Guantes",
        "Gorros",
        "Sábanas",
        "Fundas de almohada",
        "Frazadas",
        "Colchas",
        "Cubre camas",
        "Toallas",
        "Toallones",
        "Cortinas"
    ],
    []
    )

    const selectedUser = useMemo(() => users?.find((u) => u.dni.toString() === userDni), [users, userDni])

    const fetchUsers = () => {
        try {
            const unsuscribe = onSnapshot(usersRef, (snapshot) => {
                const usersData = snapshot.docs.map((doc) => ({
                    ...(doc.data()) as USER_PROPS, id: doc.id
                }))
                setUsers(usersData)
            })
            return unsuscribe;
        } catch (error) {
            console.log("error al obtener los datos", error)
        }
    }

    const fetchTickets = () => {
        try {
            const ticketsUnSuscribe = onSnapshot(ticketsRef, (snapshot) => {
                const ticketsData = snapshot.docs.map((doc) => ({
                    ...(doc.data()) as TICKETS_PROPS, id: doc.id
                }))
                // Ordenar por fecha descendente (más reciente primero) de forma robusta
                const toMs = (t: TICKETS_PROPS): number => {
                    const d: any = (t as any)?.date
                    if (!d) return 0
                    if (typeof d.toMillis === 'function') return d.toMillis()
                    if (d instanceof Date) return d.getTime()
                    if (typeof d === 'number') return d
                    return 0
                }
                const ordered = ticketsData.sort((a, b) => toMs(b) - toMs(a))
                setTickets(ordered)
            })
            return ticketsUnSuscribe
        } catch (error) {
            console.log("error al obtener los tickets", error)
        }
    }

    const toggleItem = (item: string, cantidad: number) => {
        setItems((prev) => ({
            ...prev,
            [item]: cantidad,
        }))
    }

    const createTicket = async () => {
        if (!selectedUser) return

        try {
            const ticketPayload: TICKETS_PROPS = {
                uid: selectedUser.id as string,
                state: 1,
                date: Timestamp.now(),
                description: description,
                items: items,
            }

            const ticketRef = await addDoc(collection(db, "tickets"), ticketPayload)

            if (!selectedUser?.id) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "El usuario no tiene un ID válido",
                })
                return
            }

            const userRef = doc(db, "users", selectedUser.id)
            await updateDoc(userRef, {
                tickets: arrayUnion(ticketRef.id),
            })
            Swal.fire({
                icon: "success",
                title: "Ticket generado correctamente",
                timer: 1000,
            })
            setItems({})
            setUserDni("")
        } catch (error) {
            console.error("Error creando ticket:", error)
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Hubo un error generando el ticket",
                timer: 1000,
            })
        }
    }

    const updateTicketState = async (ticketId: string, nextState: number) => {
        try {
            const ticketRef = doc(db, "tickets", ticketId)
            await updateDoc(ticketRef, { state: nextState, updatedAt: Timestamp.now() })
        } catch (error) {
            console.log("error al actualizar estado del ticket", error)
            Swal.fire({ icon: "error", title: "Error", text: "No se pudo actualizar el estado" })
        }
    }

    useEffect(() => {
        fetchUsers();
        fetchTickets();
    }, [currentUser])

    const contextValues: APPCONTEXT_PROPS = {
        tickets,
        users,
        menu,
        setMenu,
        userDni,
        setUserDni,
        items,
        toggleItem,
        prendas,
        selectedUser,
        createTicket,
        description,
        setDescription,
        updateTicketState,
    }

    return (
        <AppContext.Provider value={contextValues}>
            {children}
        </AppContext.Provider>
    )
}