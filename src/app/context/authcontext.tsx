import React, { createContext, ReactNode, useContext } from "react";

interface AUTHCONTEXT_PROPS {

}

export const AuthContext = createContext<AUTHCONTEXT_PROPS | undefined>(undefined)

export const useAuthContext = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error ("El contexto de autenticacion debe ser utilzado por componentes que se encuentren dentro de él")
    return context;
}

export const AuthContextProvider: React.FC<{children: ReactNode}> = ({children}) => {
    return (
        <AuthContextProvider>
            {children}
        </AuthContextProvider>
    )
}