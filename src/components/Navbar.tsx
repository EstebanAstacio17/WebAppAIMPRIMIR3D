'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "./Navbar.module.css";

import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* TOP ANNOUNCEMENT BAR */}
      <div className={styles.topAnnouncement}>
        <div className={`container ${styles.topAnnouncementInner}`}>
          <div className={styles.announcementLeft}>
            <span className="status-dot"></span>
            <span className={styles.announcementText}>
              <strong>Granja 3D Operativa:</strong> Impresión FDM & Resina 8K • Envíos a todo el país
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

          {/* DESKTOP NAVIGATION */}
          <nav className={styles.desktopNav}>
            <Link href="/" className={styles.navItem}>
              Inicio
            </Link>
            <Link href="/catalogo" className={styles.navItem}>
              Catálogo
            </Link>
            <Link href="/dashboard" className={styles.navItem}>
              Mis Pedidos
            </Link>
            <Link href="/admin" className={styles.navItem}>
              Admin
            </Link>
          </nav>

          {/* RIGHT ACTIONS */}
          <div className={styles.navActions}>
            <Link href="/cart" className={styles.cartBtn} title="Ver Carrito">
              <span className={styles.cartIcon}>🛒</span>
              {totalCount > 0 && (
                <span className={styles.cartBadge}>{totalCount}</span>
              )}
            </Link>

            <Link href="/auth/login" className={styles.accountBtn}>
              <span className={styles.userIcon}>👤</span>
              <span>Mi Cuenta</span>
            </Link>

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
            <Link href="/#cotizador" onClick={() => setMobileMenuOpen(false)} className={styles.mobileNavItem}>
              ⚡ Cotizador Instantáneo
            </Link>
            <Link href="/#servicios" onClick={() => setMobileMenuOpen(false)} className={styles.mobileNavItem}>
              🛠️ Servicios de Fabricación
            </Link>
            <Link href="/#como-funciona" onClick={() => setMobileMenuOpen(false)} className={styles.mobileNavItem}>
              💡 ¿Cómo Funciona?
            </Link>
            <div className={styles.mobileMenuDivider}></div>
            <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className={styles.mobileNavItem}>
              👤 Mi Cuenta / Iniciar Sesión
            </Link>
            <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className={styles.mobileNavItem}>
              ⚙️ Panel de Administración
            </Link>
            <Link href="/catalogo" onClick={() => setMobileMenuOpen(false)} className="btn btn-cyan" style={{ marginTop: '10px' }}>
              ⚡ Iniciar Encargo Ahora
            </Link>
          </div>
        )}
      </header>
    </>
  );
}

