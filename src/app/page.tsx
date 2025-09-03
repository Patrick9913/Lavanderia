'use client';
import { Application } from "./Application";
import { Login } from "./fccomponents/Login";
import { useAuthContext } from "./context/authcontext";

export default function Home() {

  const {isLoggedIn} = useAuthContext()

  return (
    <>
      {
        isLoggedIn ? (
          <Application />
        ) : (
          <Login />
        )
      }
    </>
  );
}
