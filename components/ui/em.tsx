import type { ReactNode } from "react";

/**
 * 데이터 문자열 안의 "**굵게**" 표기를 <strong>으로 렌더링한다.
 * 본문(muted) 위에서 강조가 서도록 굵기와 함께 글자색도 끌어올린다.
 */
export function renderEm(text: string): ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  if (parts.length === 1) return text;

  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-foreground">
        {part}
      </strong>
    ) : (
      part
    )
  );
}
