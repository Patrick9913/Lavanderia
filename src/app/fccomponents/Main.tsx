import React from "react";
import { Home } from "./views/Home";
import { Navbar } from "./Navbar";

export const Main: React.FC = () => {
    return (
        <main className=" w-screen h-screen flex bg-gradient-to-t from-gray-900 to-gray-950 p-2 gap-2">
            <Navbar />
            <Home />
        </main>
    )
}