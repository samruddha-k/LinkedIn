import { useState } from "react";
import { gql, useMutation } from "@apollo/client";

const REGISTER = gql`
  mutation Register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      token
    }
  }
`;

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [register] = useMutation(REGISTER);

  const handle = async () => {
    const res = await register({ variables: form });
    localStorage.setItem("token", res.data.register.token);
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
        <h2 style={{ textAlign: "center" }}>Register</h2>

        <input placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Password" type="password" onChange={(e) => setForm({ ...form, password: e.target.value })} />

        <button onClick={handle}>Register</button>
      </div>
    </div>
  );
}