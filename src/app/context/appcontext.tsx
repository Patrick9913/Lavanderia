import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../config"

interface APPCONTEXT_PROPS {

}

export const AppContext = createContext<APPCONTEXT_PROPS | undefined>(undefined)

export const useAppContext = () => {
    const context = useContext(AppContext);
    if ( !context ) throw new Error("El contexto debe ser consumido por componentes que se encuentren dentro de él")
    return context
}

export const AppContextProvider: React.FC<{children: ReactNode}> = ({children}) => {

    const usersRef = collection(db, "users");
    const [users, setUsers] = useState<USER_PROPS[] | null>(null)

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

    useEffect(() => {
        fetchUsers();
    }, [])

    return (
        <AppContextProvider>
            {children}
        </AppContextProvider>
    )
}