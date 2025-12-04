import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import * as S from "./style";

const NAV_ITEMS = [
  { path: "/", label: "Visão geral" },
  { path: "/insumos", label: "Insumos" },
  { path: "/produtos", label: "Produtos" },
  { path: "/vendas", label: "Vendas" },
  { path: "/vendas-analitico", label: "Vendas (análise)" },
  { path: "/movimentacoes", label: "Movimentações" },
  { path: "/pedidos", label: "Pedidos" },
];

function useIsDesktop(breakpoint = 768) {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.innerWidth >= breakpoint;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia(`(min-width: ${breakpoint}px)`);
    const handler = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
    };

    setIsDesktop(mediaQuery.matches);

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [breakpoint]);

  return isDesktop;
}

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isDesktop = useIsDesktop();
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const renderLinks = (orientation: "desktop" | "mobile") => (
    <div style={{ ...S.links, ...(orientation === "desktop" ? S.linksDesktop : S.linksMobile) }}>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          style={({ isActive }) => ({
            ...S.link,
            ...(isActive ? S.linkActive : {}),
          })}
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  );

  return (
    <header style={S.container}>
      <img style={S.brandImage} src="/assets/branding/marcelina-logo.png" alt="Logomarca Marcelina" />
      {isDesktop ? (
        renderLinks("desktop")
      ) : (
        <>
          <button type="button" style={S.menuButton} onClick={() => setIsMenuOpen((state) => !state)}>
            <span style={S.menuLine} />
            <span style={S.menuLine} />
            <span style={S.menuLine} />
            <span style={S.menuLabel}></span>
          </button>
          {isMenuOpen && (
            <>
              <div style={S.backdrop} onClick={() => setIsMenuOpen(false)} />
              <div style={S.mobilePanel}>{renderLinks("mobile")}</div>
            </>
          )}
        </>
      )}
    </header>
  );
}
