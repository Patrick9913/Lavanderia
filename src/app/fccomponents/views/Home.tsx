import React, { useState } from "react";
import { FaParachuteBox } from "react-icons/fa";
import { FaBoxesPacking } from "react-icons/fa6";
import { BsBox2Fill } from "react-icons/bs";
import { BsFillBox2HeartFill } from "react-icons/bs";
import { useAppContext } from "@/app/context/appcontext";
import { STATE_PROPS } from "@/app/types";

export const Home: React.FC = () => {

    const { tickets, users } = useAppContext();

    const [ticketForm, setTicketForm] = useState<boolean>(false)

    return (
        <section className=" bg-white rounded flex-1 flex flex-col w-full h-full p-5 overflow-y-scroll">
            <div className=" flex h-fit gap-x-2 mb-8">
                <button className="bg-blue-500 cursor-pointer text-white px-6 py-1 rounded-md text-sm flex items-center gap-x-2">
                    <FaParachuteBox className="w-5 h-10" />
                    <span>Recibidas</span>
                </button>
                <button className="bg-blue-500 cursor-pointer text-white px-6 py-1 rounded-md text-sm flex items-center gap-x-2">
                    <FaBoxesPacking className="w-5 h-10" />
                    <span>En Proceso</span>
                </button>
                <button className="bg-blue-500 cursor-pointer text-white px-6 py-1 rounded-md text-sm flex items-center gap-x-2">
                    <BsBox2Fill className="w-5 h-10" />
                    <span>Listas</span>
                </button>
                <button className="bg-blue-500 cursor-pointer text-white px-6 py-1 rounded-md text-sm flex items-center gap-x-2">
                    <BsFillBox2HeartFill className="w-5 h-10" />
                    <span>Entregadas</span>
                </button>
            </div>
            <h2 className=" text-3xl font-light mb-8">Tickets</h2>
            <button onClick={() => setTicketForm(!ticketForm)} className=" bg-blue-500 cursor-pointer text-sm text-white px-6 py-1 w-fit rounded text-start mb-8">Nuevo Ticket</button>
            <div>
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-gray-300">
                            <th className="px-2 py-1 text-left">Estado</th>
                            <th className="px-2 py-1 text-left">Usuario</th>
                            <th className="px-2 py-1 text-left">Email</th>
                            <th className="px-2 py-1 text-left">DNI</th>
                            <th className="px-2 py-1 text-left">Fecha</th>
                            <th className="px-2 py-1 text-left text-emerald-500">ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets?.map((t, i) => (
                        users
                            ?.filter(u => u.id === t.uid)
                            .map(u => (
                            <tr key={i} className="border-b hover:bg-gray-100">
                                <td className="px-2 py-2">
                                <span
                                    className={`rounded-md px-2 py-1 ${
                                    (t.state == 1 && 'bg-emerald-500 text-white') ||
                                    (t.state == 2 && 'bg-blue-500 text-white')
                                    }`}
                                >
                                    {STATE_PROPS[t.state]}
                                </span>
                                </td>
                                <td className="px-2 py-2">{u.name} {u.lastname}</td>
                                <td className="px-2 py-2">
                                <a className="underline" href={`mailto:${u.mail}`}>{u.mail}</a>
                                </td>
                                <td className="px-2 py-2">
                                    {u.dni}
                                </td>
                                <td className="px-2 py-2">{t.date.toDate().toLocaleDateString()}</td>
                                <td className="px-2 py-2">{t.uid}</td>
                            </tr>
                            ))
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    )
}