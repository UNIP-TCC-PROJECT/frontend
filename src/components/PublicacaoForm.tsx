import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { api } from "../services/api";

interface PublicacaoFormProps {
  onCreated: () => void;
}

export default function PublicacaoForm({
  onCreated,
}: PublicacaoFormProps) {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sending, setSending] = useState(false);
  const imageInput = useRef<HTMLInputElement>(null);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    setError("");
    setSuccess("");
    setImage(null);

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 2 MB.");
      event.target.value = "";
      return;
    }

    setImage(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!description.trim()) {
      setError("Informe a descrição da publicação.");
      return;
    }

    if (!image) {
      setError("Selecione uma imagem JPG, PNG ou WebP.");
      return;
    }

    const formData = new FormData();
    formData.append("description", description);
    formData.append("image", image);

    try {
      setSending(true);
      await api.post("/publicacoes", formData);
      setDescription("");
      setImage(null);

      if (imageInput.current) {
        imageInput.current.value = "";
      }

      setSuccess("Publicação criada com sucesso.");
      onCreated();
    } catch (err) {
      const response = (
        err as {
          response?: {
            data?: { message?: string | string[] };
          };
        }
      ).response?.data;

      setError(
        Array.isArray(response?.message)
          ? response.message.join(" ")
          : response?.message ?? "Não foi possível criar a publicação.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mx-auto mb-6 w-full max-w-xl space-y-4 bg-[#FFBE1F] p-4 sm:p-6">
      <h2 className="border-[2px] border-[#A51645] bg-[#FFD43B] p-3 text-lg font-bold text-black shadow-[4px_4px_0_#5B4210] sm:text-xl">
        Nova publicação
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="publicacao-description"
            className="mb-2 block text-sm font-bold text-black"
          >
            Descrição
          </label>
          <textarea
            id="publicacao-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={2000}
            rows={4}
            className="w-full border-[2px] border-[#A51645] bg-white p-3 text-black outline-none focus:ring-2 focus:ring-[#A51645]"
            placeholder="Conte as novidades da ONG..."
          />
          <p className="mt-1 text-right text-sm font-medium text-black">
            {description.length}/2000
          </p>
        </div>

        <div>
          <label
            htmlFor="publicacao-image"
            className="mb-2 block text-sm font-bold text-black"
          >
            Imagem (JPG, PNG ou WebP; até 2 MB)
          </label>
          <input
            ref={imageInput}
            id="publicacao-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="block w-full border-[2px] border-[#A51645] bg-[#FFD43B] p-3 text-sm text-black file:mr-3 file:border-0 file:bg-[#A51645] file:px-3 file:py-2 file:font-bold file:text-white"
          />
        </div>

        {error && (
          <p role="alert" className="border-2 border-red-700 bg-white p-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        {success && (
          <p role="status" className="border-2 border-green-700 bg-white p-3 text-sm font-medium text-green-800">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="border-[3px] border-[#A51645] bg-[#FFD43B] px-6 py-3 font-extrabold text-[#A51645] shadow-[5px_5px_0_#5B4210] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_#5B4210] disabled:cursor-wait disabled:opacity-60"
        >
          {sending ? "Publicando..." : "Publicar"}
        </button>
      </form>
    </section>
  );
}
