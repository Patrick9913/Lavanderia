
import React from "react";
import { IoHome } from "react-icons/io5";
import { IoStatsChart } from "react-icons/io5";
import { IoHandLeftSharp } from "react-icons/io5";
import { IoPeopleSharp } from "react-icons/io5";
import { useAppContext } from "../context/appcontext";
import { useAuthContext } from "../context/authcontext";
import { IoTicket } from "react-icons/io5";

export const Navbar: React.FC = () => {

    const {setMenu, menu} = useAppContext()
    const {logout, currentUser} = useAuthContext()

    return (
        <nav className="w-full flex-1 max-w-2xs bg-white rounded-md p-5 flex flex-col justify-between">
            <ul className=" flex flex-col gap-y-1">
                <li>
                    <button
                        onClick={() => setMenu(1)}
                        className={`group flex items-center w-full gap-x-2 rounded-md px-3 py-2 transition-colors ${
                        menu === 1 ? "bg-gray-200 text-cyan-500" : "hover:bg-gray-200"
                        }`}
                    >
                        <IoHome className="text-current" />
                        <span className="text-sm">Inicio</span>
                    </button>
                </li>
                <li>
                    <button
                        onClick={() => setMenu(2)}
                        className={`group flex items-center w-full gap-x-2 rounded-md px-3 py-2 transition-colors ${
                        menu === 2 ? "bg-gray-200 text-cyan-500" : "hover:bg-gray-200"
                        }`}
                    >
                        <IoPeopleSharp className="text-current" />
                        <span className="text-sm">Personal</span>
                    </button>
                </li>
                <li>
                    <button
                        onClick={() => setMenu(4)}
                        className={`group flex items-center w-full gap-x-2 rounded-md px-3 py-2 transition-colors ${
                        menu === 4 ? "bg-gray-200 text-cyan-500" : "hover:bg-gray-200"
                        }`}
                    >
                        <IoStatsChart className="text-current" />
                        <span className="text-sm">Estadísticas</span>
                    </button>
                </li>
                <li>
                    <button
                        onClick={() => setMenu(5)}
                        className={`group flex items-center w-full gap-x-2 rounded-md px-3 py-2 transition-colors ${
                        menu === 5 ? "bg-gray-200 text-cyan-500" : "hover:bg-gray-200"
                        }`}
                    >
                        <IoTicket className="text-current" />
                        <span className="text-sm">Nuevo Ticket</span>
                    </button>
                </li>
            </ul>
            <div className=" flex flex-col items-start gap-y-2">
                <p className=" text-sm">{currentUser?.email}</p>
                <button className=" text-sm hover:underline" onClick={logout}>Cerrar Sesión</button>
                <p className=" text-sm text-gray-500">Todos los derechos reservados</p>
            </div>
        </nav>
    )
}