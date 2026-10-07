import { useState } from "react";
import { useAuth } from "../../../context/useAuth";
import { imagemUrl } from "../../../services/api";

function ProfileIcon() {
  const { user } = useAuth();
  const [erro, setErro] = useState(false);

  const foto = imagemUrl(user?.profileImage);

  // Se tem foto e ela carregou, mostra a foto
  if (foto && !erro) {
    return (
      <img
        src={foto}
        alt={user?.name ?? "Perfil"}
        onError={() => setErro(true)}
        className="w-full h-full rounded-full object-cover"
      />
    );
  }

  // Senão, o boneco de sempre
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6 text-blue-700"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 1115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75V19.5z"
      />
    </svg>
  );
}

export default ProfileIcon;