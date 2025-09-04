import React from "react";
import { FaParachuteBox } from "react-icons/fa";
import { FaBoxesPacking } from "react-icons/fa6";
import { BsBox2Fill } from "react-icons/bs";
import { BsFillBox2HeartFill } from "react-icons/bs";

export const Home: React.FC = () => {
    return (
        <section className=" bg-white rounded flex-1 flex w-full h-full p-5 overflow-y-hidden">
            <div className=" flex h-fit gap-x-2 mb-8">
                <div className=" bg-pink-200 px-6 py-1 rounded-md text-sm flex items-center gap-x-2">
                    <FaParachuteBox className=" w-5 h-10" />
                    <p>Recibidas</p>
                </div>
                <div className=" bg-pink-200 px-6 py-1 rounded-md text-sm flex items-center gap-x-2">
                    <FaBoxesPacking className=" w-5 h-10" />
                    <p>En Proceso</p>
                </div>
                <div className=" bg-pink-200 px-6 py-1 rounded-md text-sm flex items-center gap-x-2">
                    <BsBox2Fill className=" w-5 h-10" />
                    <p>Listas</p>
                </div>
                <div className=" bg-pink-200 px-6 py-1 rounded-md text-sm flex items-center gap-x-2">
                    <BsFillBox2HeartFill className=" w-5 h-10" />
                    <p>Entregadas</p>
                </div>
            </div>
        </section>
    )
}