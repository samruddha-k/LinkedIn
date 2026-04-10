import { useState } from "react";
import { gql, useMutation } from "@apollo/client";

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
    }
  }
`;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [login] = useMutation(LOGIN);

  const handleLogin = async () => {
    const res = await login({ variables: { email, password } });
    localStorage.setItem("token", res.data.login.token);
    window.location.href = "/feed";
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div style={{
        background: "white",
        padding: 30,
        borderRadius: 10,
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        width: 300
      }}>
        <h2 style={{ textAlign: "center" }}>Login</h2>

        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />

        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}