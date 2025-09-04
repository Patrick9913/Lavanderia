import React from "react";
import { FaParachuteBox } from "react-icons/fa";
import { FaBoxesPacking } from "react-icons/fa6";
import { BsBox2Fill } from "react-icons/bs";
import { BsFillBox2HeartFill } from "react-icons/bs";
import { useAppContext } from "@/app/context/appcontext";
import { STATE_PROPS } from "@/app/types";

export const Home: React.FC = () => {

    const { tickets, users } = useAppContext();

    return (
        <section className=" bg-white rounded flex-1 flex flex-col w-full h-full p-5 overflow-y-hidden">
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
            <div>
                {
                    tickets?.map( t => (
                        <div className=" bg-gray-200 p-2 text-sm rounded flex items-center gap-x-5 hover:bg-gray-300">
                            {
                                users?.filter( u => u.id === t.uid).map( u => (
                                    <>
                                        <div>{u.name} {u.lastname}</div>
                                        <a className=" underline" href={`mailto:${u.mail}`}>{u.mail}</a>
                                        <p className=""><span className=" text-green-500">ID: </span>{u.id}</p>
                                        <p className={`${t.state == 1 && ' bg-emerald-500 text-white rounded-md px-2 py-1'}`}>{STATE_PROPS[t.state]}</p>
                                        <p>{t.date.toDate().toString()}</p>
                                    </>
                                ))
                            }
                        </div>
                    ))
                }
            </div>    
        </section>
    )
}