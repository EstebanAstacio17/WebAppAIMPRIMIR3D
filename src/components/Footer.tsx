import Image from "next/image";
import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
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
              Taller de fabricación digital y manufactura aditiva. Convertimos tus diseños 3D en productos reales con la máxima precisión y calidad.
            </p>
          </div>

          {/* EXPLORAR */}
          <div>
            <h4 className={styles.columnTitle}>Explorar</h4>
            <div className={styles.linksList}>
              <Link href="/" className={styles.footerLink}>🏠 Inicio</Link>
              <Link href="/catalogo" className={styles.footerLink}>📦 Catálogo 3D</Link>
              <Link href="/#cotizador" className={styles.footerLink}>⚡ Cotizador en Vivo</Link>
              <Link href="/#servicios" className={styles.footerLink}>🛠️ Servicios Técnicos</Link>
              <Link href="/#como-funciona" className={styles.footerLink}>💡 ¿Cómo Funciona?</Link>
            </div>
          </div>

          {/* CLIENTES & ACCESO */}
          <div>
            <h4 className={styles.columnTitle}>Mi Cuenta</h4>
            <div className={styles.linksList}>
              <Link href="/auth/login" className={styles.footerLink}>🔐 Iniciar Sesión</Link>
              <Link href="/auth/register" className={styles.footerLink}>📝 Registro de Clientes</Link>
              <Link href="/dashboard" className={styles.footerLink}>📦 Rastrear Mis Pedidos</Link>
              <Link href="/cart" className={styles.footerLink}>🛒 Mi Carrito de Encargos</Link>
              <Link href="/admin" className={styles.footerLink}>⚙️ Acceso Administrativo</Link>
            </div>
          </div>

          {/* CONTACTO & UBICACIÓN */}
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
              <span>💳 <strong>Pagos Aceptados:</strong> Transferencia bancaria directa, depósito y confirmación manual trazable.</span>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className={styles.footerBottom}>
          <div>
            © {new Date().getFullYear()} <strong>aImprimir3D</strong>. Todos los derechos reservados.
          </div>
          <div>
            Desarrollado con tecnología Next.js & Supabase
          </div>
        </div>
      </div>
    </footer>
  );
}
