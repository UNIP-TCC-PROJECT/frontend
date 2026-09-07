import { useAuth } from "../context/AuthContext";

export default function Perfil() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Minha conta</h1>

      <p>Nome: {user?.name}</p>
      <p>Email: {user?.email}</p>
      <p>Tipo: {user?.type}</p>
      <p>Status: {user?.status}</p>
    </div>
  );
}
