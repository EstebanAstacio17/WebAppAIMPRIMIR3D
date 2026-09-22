import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <main className="container" style={{ padding: "60px 20px", minHeight: "80vh" }}>
        <h1 style={{ color: "var(--primary)", marginBottom: "10px" }}>Mi Panel</h1>
        <p style={{ opacity: 0.8, marginBottom: "40px" }}>Bienvenido. Aquí puedes gestionar tus encargos y notificaciones.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
          
          <div className="glass" style={{ padding: "30px" }}>
            <h3 style={{ color: "var(--accent)", marginBottom: "20px" }}>Tus Pedidos Activos</h3>
            
            <div style={{ border: "1px solid var(--glass-border)", padding: "20px", borderRadius: "12px", marginBottom: "15px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontWeight: 600 }}>Pedido #1024</span>
                <span style={{ background: "#e0f2fe", color: "#0284c7", padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 600 }}>
                  En Producción
                </span>
              </div>
              <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>1x Figura de Acción a Medida</p>
              <p style={{ fontSize: "0.8rem", color: "var(--accent)", marginTop: "10px" }}>Última actualización: Hoy</p>
            </div>

            <div style={{ border: "1px solid var(--glass-border)", padding: "20px", borderRadius: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontWeight: 600 }}>Pedido #1025</span>
                <span style={{ background: "#fef3c7", color: "#d97706", padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 600 }}>
                  Pendiente de Pago
                </span>
              </div>
              <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>2x Llaveros Personalizados 3D</p>
              <p style={{ fontSize: "0.8rem", color: "var(--accent)", marginTop: "10px" }}>Cotización enviada a tu correo</p>
            </div>
          </div>

          <div className="glass" style={{ padding: "30px" }}>
            <h3 style={{ color: "var(--accent)", marginBottom: "20px" }}>Notificaciones</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li style={{ padding: "15px 0", borderBottom: "1px solid var(--glass-border)" }}>
                <strong style={{ display: "block", marginBottom: "5px" }}>Pago Confirmado</strong>
                <span style={{ fontSize: "0.9rem", opacity: 0.8 }}>Tu pago para el pedido #1024 ha sido confirmado. Hemos iniciado la producción.</span>
              </li>
              <li style={{ padding: "15px 0" }}>
                <strong style={{ display: "block", marginBottom: "5px" }}>¡Bienvenido a AIMPRIMIR3D!</strong>
                <span style={{ fontSize: "0.9rem", opacity: 0.8 }}>Gracias por crear tu cuenta. Explora el catálogo para hacer tu primer encargo.</span>
              </li>
            </ul>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
