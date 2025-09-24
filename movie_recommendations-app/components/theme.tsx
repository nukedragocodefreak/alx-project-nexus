import styled, { createGlobalStyle, css, DefaultTheme } from "styled-components";

// Extend DefaultTheme to include your custom theme properties
import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    radius: number;
    shadow: string;
    colors: {
      bg: string;
      surface: string;
      border: string;
      text: string;
      subtext: string;
      accent: string;
      muted: string;
      badge: string;
      dangerBg: string;
      dangerBorder: string;
      dangerText: string;
    };
  }
}

const theme: DefaultTheme = {
  radius: 14,
  shadow: "0 2px 10px rgba(0,0,0,0.06)",
  colors: {
    bg: "#fafafa",
    surface: "#ffffff",
    border: "#e5e5e5",
    text: "#0a0a0a",
    subtext: "#6b7280",
    accent: "#111827",
    muted: "#f4f4f5",
    badge: "#f3f4f6",
    dangerBg: "#fef2f2",
    dangerBorder: "#fecaca",
    dangerText: "#b91c1c",
  },
};
export default theme;

export const Global = createGlobalStyle`
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  html, body, #__next { height: 100%; }
  body { margin:0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, "Apple Color Emoji","Segoe UI Emoji"; background:${theme.colors.bg}; color:${theme.colors.text}; }
  kbd { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
`;

const Surface = styled.div`
  background: ${p => p.theme.colors.surface};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: ${p => p.theme.radius}px;
  box-shadow: ${p => p.theme.shadow};
`;

const HeaderWrap = styled.header`
  position: sticky; top: 0; z-index: 40;
  backdrop-filter: blur(6px);
  background: rgba(255,255,255,0.8);
  border-bottom: 1px solid ${p => p.theme.colors.border};
`;

const Container = styled.div`
  max-width: 1200px; margin: 0 auto; padding: 12px 16px; display:flex; align-items:center; justify-content:space-between; gap:16px;
`;

const Brand = styled.div` display:flex; align-items:center; gap:10px; `;
const AppBadge = styled.div`
  width: 36px; height: 36px; display:grid; place-items:center; border-radius: 12px; background:#fff; border:1px solid ${p=>p.theme.colors.border}; box-shadow:${p=>p.theme.shadow};
`;

const Muted = styled.span` color:${p=>p.theme.colors.subtext}; `;

const Button = styled.button<{variant?: "solid"|"outline"|"ghost"; size?: "sm"|"md"|"icon"}>`
  ${p => {
    const base = css`
      display:inline-flex; align-items:center; justify-content:center; gap:8px;
      border-radius: 999px; cursor:pointer; transition:0.2s ease; font-weight:600;
    `;
    const sizes = {
      sm: css`height:32px; padding:0 12px; font-size:12px;`,
      md: css`height:40px; padding:0 16px; font-size:14px;`,
      icon: css`height:36px; width:36px; font-size:14px;`,
    }[p.size||"md"]; 
    const variant = {
      solid: css`background:${p.theme.colors.accent}; color:#fff; border:1px solid ${p.theme.colors.accent}; &:hover{ filter:brightness(0.92); }`,
      outline: css`background:#fff; color:${p.theme.colors.text}; border:1px solid ${p.theme.colors.border}; &:hover{ background:${p.theme.colors.muted}; }`,
      ghost: css`background:transparent; border:1px solid transparent; color:${p.theme.colors.text}; &:hover{ background:${p.theme.colors.muted}; }`,
    }[p.variant||"solid"]; 
    return css`${base} ${sizes} ${variant}`;
  }}
`;

const InputWrap = styled.div` position:relative; width:100%; max-width:520px; `;
const Input = styled.input`
  width:100%; height:40px; border-radius:999px; border:1px solid ${p=>p.theme.colors.border}; padding:0 48px 0 36px; background:#fff; outline:none; box-shadow:${p=>p.theme.shadow};
  &:focus{ border-color:#c7c7c7; }
`;
const LeftIcon = styled.div` position:absolute; left:12px; top:50%; transform:translateY(-50%); opacity:.6; `;
const RightShortcuts = styled.div` position:absolute; right:8px; top:50%; transform:translateY(-50%); display:flex; gap:6px; `;
const Kbd = styled.span` background:${p=>p.theme.colors.badge}; border:1px solid ${p=>p.theme.colors.border}; border-radius:999px; padding:2px 8px; font-size:12px; `;

const Tabs = styled.div` display:flex; gap:8px; background:${p=>p.theme.colors.muted}; border-radius:999px; padding:4px; width:fit-content; `;
const TabBtn = styled.button<{active?:boolean}>`
  border:none; background:${p=>p.active?"#fff":"transparent"}; color:${p=>p.active? p.theme.colors.text : p.theme.colors.subtext};
  padding:8px 12px; border-radius:999px; cursor:pointer; font-weight:600;
`;

const Main = styled.main` max-width:1200px; margin:0 auto; padding:24px 16px; display:grid; gap:24px; grid-template-columns: 280px 1fr; @media (max-width: 900px){ grid-template-columns: 1fr; } `;

const Card = styled(Surface)` overflow:hidden; `;
const CardBody = styled.div` padding:12px; `;
const CardHeader = styled.div` padding:16px; border-bottom:1px solid ${p=>p.theme.colors.border}; `;
const CardTitle = styled.div` font-weight:700; `;
const CardDescription = styled.div` font-size:13px; color:${p=>p.theme.colors.subtext}; `;

const SliderRow = styled.div` display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; `;
const Range = styled.input.attrs({ type: "range", min: 0, max: 10, step: 0.1 })`
  width:100%;
`;

const GenrePills = styled.div` display:flex; flex-wrap:wrap; gap:8px; max-height:224px; overflow:auto; padding:12px; border:1px solid ${p=>p.theme.colors.border}; border-radius:${p=>p.theme.radius}px; background:#fff; `;
const Pill = styled.button<{active?:boolean}>`
  border:1px solid ${p=>p.active? p.theme.colors.accent : p.theme.colors.border};
  background:${p=>p.active? p.theme.colors.accent : "#fff"}; color:${p=>p.active?"#fff":p.theme.colors.text};
  padding:6px 10px; border-radius:999px; display:inline-flex; gap:6px; align-items:center; font-size:13px; cursor:pointer; transition:0.2s; &:hover{ box-shadow:${p=>p.theme.shadow}; }
`;

const Grid = styled.div` display:grid; grid-template-columns: repeat(2,1fr); gap:16px; @media (min-width:640px){ grid-template-columns: repeat(3,1fr);} @media (min-width:1024px){ grid-template-columns: repeat(4,1fr);} `;

const PosterWrap = styled.div` position:relative; aspect-ratio:2/3; overflow:hidden; `;
const Poster = styled.img` width:100%; height:100%; object-fit:cover; transition: transform .3s ease; ${PosterWrap}:hover & { transform: scale(1.05); }`;
const Overlay = styled.div`
  position:absolute; inset:0; display:flex; align-items:flex-end; justify-content:space-between; gap:8px; padding:12px; color:#fff;
  background: linear-gradient(to top, rgba(0,0,0,.7), rgba(0,0,0,.1) 50%, transparent);
`;
const YearBadge = styled.span` background:#fff; color:#111; border-radius:999px; padding:2px 8px; font-size:12px; font-weight:700; `;
const Tiny = styled.span` font-size:12px; opacity:.9; display:inline-flex; align-items:center; gap:4px; `;

const Danger = styled.div`
  border:1px solid ${p=>p.theme.colors.dangerBorder}; background:${p=>p.theme.colors.dangerBg}; color:${p=>p.theme.colors.dangerText}; padding:12px; border-radius:${p=>p.theme.radius}px; font-size:14px; margin-bottom:12px;
`;

export const Components = {
  Surface,
  HeaderWrap,
  Container,
  Brand,
  AppBadge,
  Muted,
  Button,
  InputWrap,
  Input,
  LeftIcon,
  RightShortcuts,
  Kbd,
  Tabs,
  TabBtn,
  Main,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardDescription,
  SliderRow,
  Range,
  GenrePills,
  Pill,
  Grid,
  PosterWrap,
  Poster,
  Overlay,
  YearBadge,
  Tiny,
  Danger
};