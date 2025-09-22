import React from "react";
import { Home } from "./views/Home";
import { Navbar } from "./Navbar";
import { useAppContext } from "../context/appcontext";
import  Personal  from "./views/Personal";
import { Consultation } from "./views/Consultation";
import { Statistics } from "./views/statistics/Statistics";
import { Ticketera } from "./views/Ticketera";

export const Main: React.FC = () => {

    const {menu} = useAppContext()

    return (
        <main className=" w-screen h-screen flex md-surface p-2 gap-2">
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
                menu === 4 && (
                    <Statistics />
                )
            }
            {
                menu === 5 && (
                    <Ticketera />
                )
            }
        </main>
    )
}