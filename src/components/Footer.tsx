'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Footer.module.css";
import { getCurrentUser, isUserAdmin } from "@/utils/authRoles";

export default function Footer() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkRole = () => {
      const user = getCurrentUser();
      setIsAdmin(isUserAdmin(user));
    };

    checkRole();
    window.addEventListener("storage", checkRole);
    window.addEventListener("aimprimir3d_auth_changed", checkRole);

    return () => {
      window.removeEventListener("storage", checkRole);
      window.removeEventListener("aimprimir3d_auth_changed", checkRole);
    };
  }, []);

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerGrid}>
          {/* BRAND COLUMN */}
          <div>
            <Image
              src="/img/logonombre.png"
              alt="AIMPRIMIR3D"
              width={190}
              height={45}
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <p className={styles.brandDesc}>
              Taller de fabricación digital y manufactura aditiva. Convertimos ideas y diseños 3D en piezas funcionales y productos reales con la máxima precisión y calidad.
            </p>
          </div>

          {/* EXPLORAR */}
          <div>
            <h4 className={styles.columnTitle}>Explorar</h4>
            <div className={styles.linksList}>
              <Link href="/" className={styles.footerLink}>🏠 Inicio</Link>
              <Link href="/catalogo" className={styles.footerLink}>📦 Catálogo de Productos</Link>
              {!isAdmin && (
                <Link href="/cart" className={styles.footerLink}>🛒 Carrito de Encargos</Link>
              )}
              {isAdmin ? (
                <Link href="/admin" className={styles.footerLink} style={{ color: '#38bdf8' }}>⚙️ Consola de aImprimir3D</Link>
              ) : (
                <Link href="/dashboard" className={styles.footerLink}>🔍 Rastrear Mis Pedidos</Link>
              )}
            </div>
          </div>

          {/* ACCESO / GESTIÓN */}
          <div>
            <h4 className={styles.columnTitle}>{isAdmin ? "Gestión Interna" : "Mi Cuenta"}</h4>
            <div className={styles.linksList}>
              {isAdmin ? (
                <>
                  <Link href="/admin" className={styles.footerLink}>📦 Pedidos & Logística</Link>
                  <Link href="/admin" className={styles.footerLink}>🏷️ Catálogo & Stock</Link>
                  <Link href="/catalogo" className={styles.footerLink}>👁️ Vista Pública Catálogo</Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className={styles.footerLink}>🔐 Iniciar Sesión</Link>
                  <Link href="/auth/register" className={styles.footerLink}>📝 Registro de Clientes</Link>
                  <Link href="/dashboard" className={styles.footerLink}>📦 Rastrear Mis Pedidos</Link>
                </>
              )}
            </div>
          </div>

          {/* CONTACTO - SÓLO SE MUESTRA PARA CLIENTES */}
          {!isAdmin ? (
            <div>
              <h4 className={styles.columnTitle}>Atención al Cliente</h4>
              <div className={styles.contactItem}>
                <span>📞</span>
                <div>
                  <span>Teléfono / WhatsApp:</span><br />
                  <a href="https://wa.me/18494622228" target="_blank" rel="noopener noreferrer" style={{ color: '#00d2ff', fontWeight: 600 }}>
                    +1 (849) 462-2228
                  </a>
                </div>
              </div>

              <div className={styles.contactItem}>
                <span>✉️</span>
                <div>
                  <span>Correo Electrónico:</span><br />
                  <strong>info.aimprimir3d@gmail.com</strong>
                </div>
              </div>

              <div className={styles.paymentBadge}>
                <span>💳 <strong>Pagos Aceptados:</strong> Transferencia bancaria directa, depósito y confirmación manual.</span>
              </div>
            </div>
          ) : (
            <div>
              <h4 className={styles.columnTitle}>Estado de Taller</h4>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6 }}>
                <div>🟢 <strong>Plataforma Operativa</strong></div>
                <div>🏷️ Catálogo sincronizado en tiempo real</div>
                <div>🚚 Gestión de envíos activa</div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM */}
        <div className={styles.footerBottom}>
          <div>
            © {new Date().getFullYear()} <strong>aImprimir3D</strong>. Todos los derechos reservados.
          </div>
          <div>
            Fabricación Digital & Prototipado Profesional
          </div>
        </div>
      </div>
    </footer>
  );
}
