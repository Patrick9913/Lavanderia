import Link from "next/link";
import React from "react";
import { useAuthContext } from "../context/authcontext";

export const Login: React.FC = () => {

    const {handleSubmit, setPassword, setMail} = useAuthContext()

    return (
        <>
            <main className=" w-screen h-screen md-surface">
                <section className=" w-full h-full flex justify-center items-center p-4">
                    <form onSubmit={handleSubmit} className=" p-8 md-card flex flex-col gap-y-5 w-full max-w-md" action="">
                        <div className=" flex flex-col gap-y-2 items-center justify-center">
                            <h2 className=" font-bold text-3xl">Lavanderia Campamento</h2>
                            <p className=" text-sm text-gray-500">Los Andes</p>
                        </div>
                        <div className=" flex flex-col gap-y-3">
                            <div className=" flex flex-col gap-y-2">
                                <label htmlFor="">Correo<span className="text-orange-500">*</span></label>
                                <input onChange={(e) => setMail(e.target.value)} className=" md-input px-4 py-3" type="mail" />
                            </div>
                            <div className=" flex flex-col gap-y-2">
                                <label htmlFor="">Contraseña<span className=" text-orange-500">*</span></label>
                                <input onChange={(e) => setPassword(e.target.value)} className=" md-input px-4 py-3" type="password" />
                            </div>
                        </div>
                        <div className=" flex flex-col gap-y-2 items-center">
                            <button type="submit" className=" md-btn md-btn-filled w-full">Iniciar Sesión</button>
                            <Link className=" text-sm underline" href={"#"}>¿Olvidaste tu contraseña?</Link>
                            <Link className=" text-sm underline" href={"#"}>Registrarse</Link>
                        </div>
                    </form>
                </section>
            </main>
        </>
    )
}