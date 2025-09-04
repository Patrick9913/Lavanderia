'use client';

import React, { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../config"
import { useAuthContext } from "./authcontext";
import { TICKETS_PROPS, USER_PROPS } from "../types";

interface APPCONTEXT_PROPS {
    users: USER_PROPS[] | null;
    tickets: TICKETS_PROPS[] | null;
    menu: number
    setMenu: Dispatch<SetStateAction<number>>
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
            })
            return ticketsUnSuscribe
        } catch (error) {
            console.log("error al obtener los tickets", error)
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
        setMenu
    }

    return (
        <AppContext.Provider value={contextValues}>
            {children}
        </AppContext.Provider>
    )
}