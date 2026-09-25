export const THEME_KEY = "theme";

/**
 * 첫 페인트 전에 저장된 테마를 html[data-theme]에 붙이는 인라인 스크립트.
 * 저장값이 없으면 아무것도 붙이지 않아 시스템 설정(prefers-color-scheme)을 따른다.
 */
export const themeInitScript = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
