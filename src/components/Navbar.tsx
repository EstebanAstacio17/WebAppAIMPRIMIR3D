'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "./Navbar.module.css";
import { useCart } from "@/context/CartContext";
import { getCurrentUser, isUserAdmin, logoutUser } from "@/utils/authRoles";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { totalCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    // Check user session & role
    const checkAuth = () => {
      const user = getCurrentUser();
      const adminRole = isUserAdmin(user);
      setIsAdmin(adminRole);
      if (user) {
        setUserName(user.name || (adminRole ? "Staff" : "Cliente"));
      } else {
        setUserName(null);
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    window.addEventListener("aimprimir3d_auth_changed", checkAuth);
    window.addEventListener("focus", checkAuth);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("aimprimir3d_auth_changed", checkAuth);
      window.removeEventListener("focus", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUserName(null);
    setIsAdmin(false);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* TOP ANNOUNCEMENT BAR (SÓLO VISIBLE PARA CLIENTES/VISITANTES, OCULTO PARA STAFF) */}
      {!isAdmin && (
        <div className={styles.topAnnouncement}>
          <div className={`container ${styles.topAnnouncementInner}`}>
            <div className={styles.announcementLeft}>
              <span className="status-dot"></span>
              <span className={styles.announcementText}>
                <strong>Piezas y Diseños Únicos a Medida:</strong> Cobertura y envíos seguros a todo el país
              </span>
            </div>

            <div className={styles.announcementRight}>
              <a href="https://wa.me/18494622228" target="_blank" rel="noopener noreferrer" className={styles.topContact}>
                <span>WhatsApp:</span> <strong>849-462-2228</strong>
              </a>
              <span className={styles.divider}>|</span>
              <a href="mailto:info.aimprimir3d@gmail.com" className={styles.topContact}>
                info.aimprimir3d@gmail.com
              </a>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING / STICKY GLASS NAVBAR */}
      <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
        <div className={`container ${styles.navContainer}`}>
          {/* BRAND LOGO */}
          <Link href="/" className={styles.brandLink}>
            <Image
              src="/img/logonombre.png"
              alt="aImprimir3D - Taller de Fabricación Digital"
              width={180}
              height={42}
              className={styles.logoImg}
              priority
            />
          </Link>

          {/* DESKTOP CLIENT / STAFF NAVIGATION */}
          <nav className={styles.desktopNav}>
            <Link href="/" className={styles.navItem}>
              Inicio
            </Link>
            <Link href="/catalogo" className={styles.navItem}>
              Catálogo
            </Link>

            {/* MIS PEDIDOS - VISIBLE SOLO PARA CLIENTES REGISTRADOS */}
            {userName && !isAdmin && (
              <Link href="/dashboard" className={styles.navItem}>
                Mis Pedidos
              </Link>
            )}

            {/* ONLY VISIBLE TO AIMPRIMIR3D STAFF */}
            {isAdmin && (
              <Link
                href="/admin"
                className={styles.navItem}
                style={{
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.1)',
                  padding: '4px 12px',
                  borderRadius: '980px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                ⚙️ Gestión & Inventario
              </Link>
            )}

            {/* CONTACTO - OCULTO PARA EL STAFF DE AIMPRIMIR3D */}
            {!isAdmin && (
              <a href="https://wa.me/18494622228" target="_blank" rel="noopener noreferrer" className={styles.navItem}>
                Contacto
              </a>
            )}
          </nav>

          {/* RIGHT ACTIONS */}
          <div className={styles.navActions}>
            {/* CARRITO: TOTALMENTE OCULTO PARA EL STAFF */}
            {!isAdmin && (
              <Link href="/cart" className={styles.cartBtn} title="Ver Carrito">
                <span className={styles.cartIcon}>🛒</span>
                {totalCount > 0 && (
                  <span className={styles.cartBadge}>{totalCount}</span>
                )}
              </Link>
            )}

            {userName ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link href={isAdmin ? "/admin" : "/dashboard"} className={styles.accountBtn}>
                  <span className={styles.userIcon}>{isAdmin ? "🛠️" : "👤"}</span>
                  <span>{isAdmin ? "Panel Staff" : `Hola, ${userName}`}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-outline-dark"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    borderRadius: '980px',
                    color: '#64748b',
                    borderColor: '#cbd5e1',
                  }}
                  title="Cerrar Sesión"
                >
                  Salir 🚪
                </button>
              </div>
            ) : (
              <Link href="/auth/login" className={styles.accountBtn}>
                <span className={styles.userIcon}>👤</span>
                <span>Iniciar Sesión</span>
              </Link>
            )}

            {isAdmin ? (
              <Link href="/admin" className="btn btn-outline-dark" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                ⚙️ Consola Admin
              </Link>
            ) : (
              <Link href="/catalogo" className="btn btn-primary" style={{ padding: '9px 20px', fontSize: '0.88rem' }}>
                Iniciar Encargo
              </Link>
            )}

            {/* MOBILE HAMBURGER BUTTON */}
            <button 
              className={styles.hamburgerBtn}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir Menú"
            >
              <span className={styles.bar}></span>
              <span className={styles.bar}></span>
              <span className={styles.bar}></span>
            </button>
          </div>
        </div>

        {/* MOBILE DROPDOWN MENU */}
        {mobileMenuOpen && (
          <div className={`${styles.mobileMenu} glass animate-fade-in`}>
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className={styles.mobileNavItem}>
              🏠 Inicio
            </Link>
            <Link href="/catalogo" onClick={() => setMobileMenuOpen(false)} className={styles.mobileNavItem}>
              📦 Catálogo de Productos
            </Link>
            {!isAdmin && (
              <Link href="/cart" onClick={() => setMobileMenuOpen(false)} className={styles.mobileNavItem}>
                🛒 Ver Carrito ({totalCount})
              </Link>
            )}
            {userName && !isAdmin && (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className={styles.mobileNavItem}>
                🔍 Mis Pedidos
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className={styles.mobileNavItem} style={{ color: '#38bdf8', fontWeight: 600 }}>
                ⚙️ Consola de Gestión & Stock
              </Link>
            )}
            {!isAdmin && (
              <a 
                href="https://wa.me/18494622228" 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => setMobileMenuOpen(false)} 
                className={styles.mobileNavItem}
              >
                💬 Contacto WhatsApp
              </a>
            )}
            <div className={styles.mobileMenuDivider}></div>
            {userName ? (
              <>
                <Link href={isAdmin ? "/admin" : "/dashboard"} onClick={() => setMobileMenuOpen(false)} className={styles.mobileNavItem}>
                  {isAdmin ? "🛠️ Consola aImprimir3D" : `👤 Panel de ${userName}`}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={styles.mobileNavItem}
                  style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', color: '#ef4444', cursor: 'pointer' }}
                >
                  🚪 Cerrar Sesión
                </button>
              </>
            ) : (
              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className={styles.mobileNavItem}>
                👤 Iniciar Sesión / Registrarse
              </Link>
            )}
            {!isAdmin && (
              <Link href="/catalogo" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ marginTop: '10px' }}>
                Iniciar Encargo
              </Link>
            )}
          </div>
        )}
      </header>
    </>
  );
}
