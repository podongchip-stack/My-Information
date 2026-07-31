import type { L10n } from "@/lib/i18n";

export interface Certification {
  name: L10n;
  issuer: L10n;
  /** YYYY.MM */
  date: string;
}

/**
 * 자격증 목록 — KPI 타일에 개수와 최근 취득일이 집계된다.
 * 실제 취득 내역으로 채운다. 비어 있으면 타일에 "목록 준비 중"으로 표시된다.
 */
export const certifications: Certification[] = [];
