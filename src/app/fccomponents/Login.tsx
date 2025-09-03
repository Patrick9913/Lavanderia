import Link from "next/link";
import React from "react";

export const Login: React.FC = () => {
    return (
        <>
            <main className=" w-screen h-screen bg-gradient-to-t from-gray-900 to-gray-950">
                <section className=" w-full h-full flex justify-center items-center">
                    <form className=" p-10 rounded bg-white shadow flex flex-col gap-y-5" action="">
                        <div className=" flex flex-col gap-y-2 items-center justify-center">
                            <h2 className=" font-bold text-3xl">Lavanderia Campamento</h2>
                            <p className=" text-sm text-gray-500">Los Andes</p>
                        </div>
                        <div className=" flex flex-col gap-y-3">
                            <div className=" flex flex-col gap-y-2">
                                <label htmlFor="">Correo<span className="text-orange-500">*</span></label>
                                <input className=" rounded px-6 py-3 shadow" type="mail" />
                            </div>
                            <div className=" flex flex-col gap-y-2">
                                <label htmlFor="">Contraseña<span className=" text-orange-500">*</span></label>
                                <input className=" rounded px-6 py-3 shadow" type="password" />
                            </div>
                        </div>
                        <div className=" flex flex-col gap-y-2 items-center">
                            <button className=" cursor-pointer rounded px-6 py-3 w-full bg-cyan-800 text-white">Iniciar Sesión</button>
                            <Link className=" text-sm underline" href={"#"}>¿Olvidaste tu contraseña?</Link>
                            <Link className=" text-sm underline" href={"#"}>Registrarse</Link>
                        </div>
                    </form>
                </section>
            </main>
        </>
    )
}