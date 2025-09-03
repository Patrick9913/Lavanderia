'use client';
import { useState } from "react";
import { Application } from "./Application";
import { Login } from "./fccomponents/Login";

export default function Home() {

  const [view, setView] = useState<number>(0)

  return (
    <>
      {
        view === 1 ? (
          <Login />
        ) : (
          <Application />
        )
      }
    </>
  );
}
