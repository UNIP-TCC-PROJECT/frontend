import { useAuth } from "../context/useAuth";

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
