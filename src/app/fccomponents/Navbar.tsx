
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
        <nav className="w-full flex-1 max-w-2xs md-card p-5 flex flex-col justify-between" style={{ color: "var(--md-on-surface)" }}>
            <ul className=" flex flex-col gap-y-1">
                <li>
                    <button
                        onClick={() => setMenu(1)}
                        className={`group flex items-center w-full gap-x-2 rounded-md px-3 py-2 transition-colors`}
                        style={menu === 1 ? { backgroundColor: "var(--md-primary-container)", color: "var(--md-on-primary-container)" } : {}}
                    >
                        <IoHome className="text-current" />
                        <span className="text-sm">Inicio</span>
                    </button>
                </li>
                <li>
                    <button
                        onClick={() => setMenu(2)}
                        className={`group flex items-center w-full gap-x-2 rounded-md px-3 py-2 transition-colors`}
                        style={menu === 2 ? { backgroundColor: "var(--md-primary-container)", color: "var(--md-on-primary-container)" } : {}}
                    >
                        <IoPeopleSharp className="text-current" />
                        <span className="text-sm">Personal</span>
                    </button>
                </li>
                <li>
                    <button
                        onClick={() => setMenu(4)}
                        className={`group flex items-center w-full gap-x-2 rounded-md px-3 py-2 transition-colors`}
                        style={menu === 4 ? { backgroundColor: "var(--md-primary-container)", color: "var(--md-on-primary-container)" } : {}}
                    >
                        <IoStatsChart className="text-current" />
                        <span className="text-sm">Estadísticas</span>
                    </button>
                </li>
                <li>
                    <button
                        onClick={() => setMenu(5)}
                        className={`group flex items-center w-full gap-x-2 rounded-md px-3 py-2 transition-colors`}
                        style={menu === 5 ? { backgroundColor: "var(--md-primary-container)", color: "var(--md-on-primary-container)" } : {}}
                    >
                        <IoTicket className="text-current" />
                        <span className="text-sm">Nuevo Ticket</span>
                    </button>
                </li>
            </ul>
            <div className=" flex flex-col items-start gap-y-2">
                <p className=" text-sm" style={{ color: "var(--md-on-surface)" }}>{currentUser?.email}</p>
                <button className=" text-sm hover:underline" onClick={logout} style={{ color: "var(--md-on-surface)" }}>Cerrar Sesión</button>
                <p className=" text-sm" style={{ color: "var(--md-on-surface)", opacity: 0.7 }}>Todos los derechos reservados</p>
            </div>
        </nav>
    )
}