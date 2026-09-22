import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function CartPage() {
  return (
    <>
      <Navbar />
      <main className="container" style={{ padding: "60px 20px", minHeight: "80vh" }}>
        <h1 style={{ color: "var(--primary)", marginBottom: "30px" }}>Tu Carrito de Encargos</h1>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "40px" }}>
          <div className="glass" style={{ padding: "30px" }}>
            <div style={{ borderBottom: "1px solid var(--glass-border)", paddingBottom: "20px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ color: "var(--primary)" }}>Figura de Acción a Medida</h3>
                  <p style={{ opacity: 0.8, fontSize: "0.9rem" }}>Tiempo estimado: 5-7 días</p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button className="btn btn-outline" style={{ padding: "5px 15px" }}>-</button>
                  <span>1</span>
                  <button className="btn btn-outline" style={{ padding: "5px 15px" }}>+</button>
                  <button style={{ color: "red", marginLeft: "15px" }}>🗑️</button>
                </div>
              </div>
            </div>
            {/* Si estuviera vacío */}
            {/* <p style={{ textAlign: "center", opacity: 0.7, padding: "40px 0" }}>Tu carrito está vacío.</p> */}
          </div>

          <div className="glass" style={{ padding: "30px", height: "fit-content" }}>
            <h3 style={{ marginBottom: "20px", color: "var(--primary)" }}>Resumen del Pedido</h3>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
              <span>Subtotal:</span>
              <strong>Por Cotizar</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "25px", paddingBottom: "15px", borderBottom: "1px solid var(--glass-border)" }}>
              <span>Envío:</span>
              <strong>Por Cotizar</strong>
            </div>
            
            <p style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: "20px", lineHeight: "1.5" }}>
              Una vez envíes el encargo, te contactaremos con la cotización final y los métodos de pago.
            </p>
            
            <Link href="/dashboard" className="btn btn-primary" style={{ width: "100%", textAlign: "center" }}>
              Enviar Encargo
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
