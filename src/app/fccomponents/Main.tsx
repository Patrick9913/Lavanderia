import React from "react";
import { Home } from "./views/Home";
import { Navbar } from "./Navbar";
import { useAppContext } from "../context/appcontext";
import { Personal } from "./views/Personal";
import { Consultation } from "./views/Consultation";
import { Statistics } from "./views/Statistics";

export const Main: React.FC = () => {

    const {menu} = useAppContext()

    return (
        <main className=" w-screen h-screen flex bg-gradient-to-t from-gray-900 to-gray-950 p-2 gap-2">
            <Navbar />
            {
                menu === 1 && (
                    <Home />
                )
            }
            {
                menu === 2 && (
                    <Personal />
                )
            }
            {
                menu === 3 && (
                    <Consultation />
                )
            }
            {
                menu === 4 && (
                    <Statistics />
                )
            }
        </main>
    )
}