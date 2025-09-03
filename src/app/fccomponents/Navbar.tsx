import React from "react";
import { IoHome } from "react-icons/io5";
import { IoStatsChart } from "react-icons/io5";
import { IoHandLeftSharp } from "react-icons/io5";
import { IoPeopleSharp } from "react-icons/io5";
import { useAppContext } from "../context/appcontext";

export const Navbar: React.FC = () => {
    const {setMenu} = useAppContext()
    return (
        <nav className="w-full flex-1 max-w-2xs bg-white rounded-md p-5 flex flex-col justify-between">
            <ul className=" flex flex-col gap-y-3">
                <li>
                    <button onClick={() => setMenu(1)} className=" group flex items-center gap-x-2">
                        <IoHome className=" group group-hover:text-cyan-500" />
                        <span className=" group group-hover:text-cyan-500 group-hover:underline text-sm">Inicio</span>
                    </button>
                </li>
                <li>
                    <button onClick={() => setMenu(2)} className=" group flex items-center gap-x-2">
                        <IoPeopleSharp className=" group group-hover:text-cyan-500" />
                        <span className=" group group-hover:text-cyan-500 group-hover:underline text-sm">Personal</span>
                    </button>
                </li><li>
                    <button onClick={() => setMenu(3)} className=" group flex items-center gap-x-2">
                        <IoHandLeftSharp className=" group group-hover:text-cyan-500" />
                        <span className=" group group-hover:text-cyan-500 group-hover:underline text-sm">Consulta</span>
                    </button>
                </li><li>
                    <button onClick={() => setMenu(4)} className=" group flex items-center gap-x-2">
                        <IoStatsChart className=" group group-hover:text-cyan-500" />
                        <span className=" group group-hover:text-cyan-500 group-hover:underline text-sm">Estadisticas</span>
                    </button>
                </li>
            </ul>
            <div>
                <p className=" text-sm">Patrick Ordoñez - Administrador</p>
                <p className=" text-sm text-gray-500">Todos los derechos reservados</p>
            </div>
        </nav>
    )
}