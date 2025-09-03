import React from "react";
import { IoHome } from "react-icons/io5";
import { IoStatsChart } from "react-icons/io5";
import { IoHandLeftSharp } from "react-icons/io5";
import { IoPeopleSharp } from "react-icons/io5";

export const Navbar: React.FC = () => {
    return (
        <nav className="w-full flex-1 max-w-2xs bg-white rounded-md p-5 flex flex-col justify-between">
            <ul className=" flex flex-col gap-y-2">
                <li>
                    <button className=" group flex items-center gap-x-2">
                        <IoHome className=" group" />
                        <span className=" group text-sm">Inicio</span>
                    </button>
                </li>
                <li>
                    <button className=" flex items-center gap-x-2">
                        <IoPeopleSharp />
                        <span className=" text-sm">Personal</span>
                    </button>
                </li><li>
                    <button className=" flex items-center gap-x-2">
                        <IoHandLeftSharp />
                        <span className=" text-sm">Consulta</span>
                    </button>
                </li><li>
                    <button className=" flex items-center gap-x-2">
                        <IoStatsChart />
                        <span className=" text-sm">Estadisticas</span>
                    </button>
                </li>
            </ul>
            <div>

            </div>
        </nav>
    )
}