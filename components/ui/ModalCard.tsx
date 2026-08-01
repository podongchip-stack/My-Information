"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

/**
 * 카드를 클릭하면 상세 모달이 뜨는 래퍼.
 * card/modal 슬롯 모두 서버에서 렌더링된 노드를 받는다.
 * 카드 안의 링크·버튼 클릭은 모달을 열지 않는다.
 */
export default function ModalCard({
  card,
  modal,
  label,
  closeLabel,
  panelClassName = "border-line-strong",
}: {
  card: ReactNode;
  modal: ReactNode;
  label: string;
  closeLabel: string;
  /** 모달 패널 테두리색 — 카테고리 색을 넘길 수 있다 */
  panelClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    // 닫힐 때 포커스를 모달을 연 요소로 되돌린다
    const opener = document.activeElement as HTMLElement | null;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      // Tab 포커스를 모달 안에 가둔다
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !panelRef.current.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    // 모달이 떠 있는 동안 뒤 배경 스크롤을 잠근다
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      opener?.focus?.();
    };
  }, [open]);

  const onCardClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("a, button")) return;
    setOpen(true);
  };

  const onCardKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={label}
        onClick={onCardClick}
        onKeyDown={onCardKey}
        className="h-full cursor-pointer"
      >
        {card}
      </div>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label={label}
          >
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <div
              ref={panelRef}
              className={`modal-in relative max-h-[85svh] w-full max-w-lg overflow-y-auto rounded-lg border bg-surface p-6 ${panelClassName}`}
            >
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label={closeLabel}
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-md text-faint transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                ✕
              </button>
              {modal}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
