export interface SkillGroup {
  category: string;
  items: string[];
}

export const skills: SkillGroup[] = [
  {
    category: "Development Language",
    items: ["Java", "Python", "C++", "Swift"],
  },
  {
    category: "AI Learning Experience",
    items: ["YOLO", "Ollama", "Qwen 2.5", "Stacked LSTM", "DensePose", "SMPL-X"],
  },
  {
    category: "Tools",
    // TODO: 실제 사용 스택으로 조정 (PyTorch / TensorFlow / LLM 파인튜닝 등)
    items: ["PSpice ( ORCAD )", "MATLAB", "Ansys"],
  },
  {
    category: "자격증 ( 예정 ... )",
    items: ["전기기사","전기공사기사", "정보보안기사" ,"SQLD", "ADsP", "DAP", "CompTIA Security+"],
  },
];
