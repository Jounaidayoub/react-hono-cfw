// src/App.tsx
// import { createAuthClient } from "better-auth/react";

import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
// import cloudflareLogo from "./assets/Cloudflare_Logo.svg";
// import honoLogo from "./assets/hono.svg";
import "./App.css";
import { authClient } from "../lib/auth-client";

function App() {
  //   const [count, setCount] = useState(0);
  //   const [name, setName] = useState("unknown");

  const { data: session } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");

  const signUp = async () => {
    console.log("Signing up", { email, password, name: userName });
    await authClient.signUp.email(
      {
        email,
        password,
        name: userName,
      },
      {
        onSuccess: () => {
          alert("Signed up successfully!");
        },
        onError: (ctx) => {
          console.log(ctx.error);
          alert(ctx.error.message);
        },
      }
    );
  };

  const signIn = async () => {
    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onSuccess: () => {
          alert("Signed in successfully!");
        },
        onError: (ctx) => {
          console.log(ctx.error);
          alert(ctx.error.message);
        },
      }
    );
  };

  const signOut = async () => {
    await authClient.signOut();
  };

  return (
    <>
      <div className="card">
        {session ? (
          <div>
            <h2>Welcome, {session.user.name}!</h2>
            <p>Email: {session.user.email}</p>
            <button onClick={signOut}>Sign Out</button>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              maxWidth: "300px",
              margin: "0 auto",
            }}
          >
            <h2>Auth Test</h2>
            <input
              type="text"
              placeholder="Name (for sign up)"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={signIn}>Sign In</button>
              <button onClick={signUp}>Sign Up</button>
            </div>
            <button
              onClick={async () =>
                await authClient.signIn.social({
                  provider: "google",
                  callbackURL: window.location.origin,
                })
              }
            >
              Sign in with Google
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
