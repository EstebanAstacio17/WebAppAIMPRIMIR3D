'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "./Navbar.module.css";
import { useCart } from "@/context/CartContext";
import { getCurrentUser, isUserAdmin } from "@/utils/authRoles";

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
      if (user) {
        setUserName(user.name || "Cliente");
        setIsAdmin(isUserAdmin(user));
      } else {
        setUserName(null);
        setIsAdmin(false);
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  return (
    <>
      {/* TOP ANNOUNCEMENT BAR */}
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

          {/* DESKTOP CLIENT NAVIGATION */}
          <nav className={styles.desktopNav}>
            <Link href="/" className={styles.navItem}>
              Inicio
            </Link>
            <Link href="/catalogo" className={styles.navItem}>
              Catálogo
            </Link>
            {/* ONLY VISIBLE WHEN CLIENT IS LOGGED IN */}
            {userName && (
              <Link href="/dashboard" className={styles.navItem}>
                Mis Pedidos
              </Link>
            )}
            {/* ONLY VISIBLE TO AIMPRIMIR3D ADMINS */}
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
                ⚙️ Gestión aImprimir3D
              </Link>
            )}
            <a href="https://wa.me/18494622228" target="_blank" rel="noopener noreferrer" className={styles.navItem}>
              Contacto
            </a>
          </nav>

          {/* RIGHT ACTIONS */}
          <div className={styles.navActions}>
            <Link href="/cart" className={styles.cartBtn} title="Ver Carrito">
              <span className={styles.cartIcon}>🛒</span>
              {totalCount > 0 && (
                <span className={styles.cartBadge}>{totalCount}</span>
              )}
            </Link>

            {userName ? (
              <Link href="/dashboard" className={styles.accountBtn}>
                <span className={styles.userIcon}>👤</span>
                <span>Hola, {userName}</span>
              </Link>
            ) : (
              <Link href="/auth/login" className={styles.accountBtn}>
                <span className={styles.userIcon}>👤</span>
                <span>Iniciar Sesión</span>
              </Link>
            )}

            <Link href="/catalogo" className="btn btn-primary" style={{ padding: '9px 20px', fontSize: '0.88rem' }}>
              <span>Iniciar Encargo</span>
            </Link>

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
            {userName && (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className={styles.mobileNavItem}>
                🔍 Mis Pedidos
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className={styles.mobileNavItem} style={{ color: '#0071e3', fontWeight: 600 }}>
                ⚙️ Gestión aImprimir3D
              </Link>
            )}
            <a 
              href="https://wa.me/18494622228" 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={() => setMobileMenuOpen(false)} 
              className={styles.mobileNavItem}
            >
              💬 Contacto WhatsApp
            </a>
            <div className={styles.mobileMenuDivider}></div>
            {userName ? (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className={styles.mobileNavItem}>
                👤 Panel de {userName}
              </Link>
            ) : (
              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className={styles.mobileNavItem}>
                👤 Iniciar Sesión / Registrarse
              </Link>
            )}
            <Link href="/catalogo" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ marginTop: '10px' }}>
              Iniciar Encargo Ahora
            </Link>
          </div>
        )}
      </header>
    </>
  );
}
