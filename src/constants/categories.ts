export interface Category {
  label: string;
  value: string;
}

export const CATEGORIES: Category[] = [
  { label: "Animais", value: "animais" },
  { label: "Crianças e adolescentes", value: "criancas" },
  { label: "Alimentação e nutrição", value: "alimentos" },
  { label: "Roupas e itens básicos", value: "roupas" },
  { label: "Assistência social", value: "assistencia_social" },
  { label: "Educação", value: "educacao" },
  { label: "Saúde", value: "saude" },
  { label: "Meio ambiente", value: "meio_ambiente" },
  { label: "Direitos humanos", value: "direitos_humanos" },
  { label: "Moradia", value: "moradia" },
  { label: "Pessoas idosas", value: "pessoas_idosas" },
  { label: "Pessoas com deficiência", value: "pessoas_com_deficiencia" },
  { label: "Cultura, esporte e lazer", value: "cultura_esporte_lazer" },
  { label: "Ajuda humanitária", value: "ajuda_humanitaria" },
  { label: "Outros", value: "outros" },
];
