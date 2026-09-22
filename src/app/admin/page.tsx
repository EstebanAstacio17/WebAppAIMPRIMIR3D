import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AdminPage() {
  return (
    <>
      <Navbar />
      <main className="container" style={{ padding: "60px 20px", minHeight: "80vh" }}>
        <h1 style={{ color: "var(--primary)", marginBottom: "10px" }}>Suite de Administración</h1>
        <p style={{ opacity: 0.8, marginBottom: "40px" }}>Gestiona los encargos, actualiza estatus y confirma pagos.</p>

        <div className="glass" style={{ padding: "30px", overflowX: "auto" }}>
          <h3 style={{ color: "var(--accent)", marginBottom: "20px" }}>Encargos Recientes</h3>
          
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--glass-border)", textAlign: "left" }}>
                <th style={{ padding: "15px 10px" }}>ID Pedido</th>
                <th style={{ padding: "15px 10px" }}>Cliente</th>
                <th style={{ padding: "15px 10px" }}>Artículos</th>
                <th style={{ padding: "15px 10px" }}>Estatus</th>
                <th style={{ padding: "15px 10px" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              
              <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
                <td style={{ padding: "15px 10px", fontWeight: 500 }}>#1025</td>
                <td style={{ padding: "15px 10px" }}>
                  Juan Pérez <br/>
                  <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>juan@correo.com</span>
                </td>
                <td style={{ padding: "15px 10px" }}>2x Llaveros 3D</td>
                <td style={{ padding: "15px 10px" }}>
                  <select className="input" style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} defaultValue="pending">
                    <option value="pending">Pendiente Cotización</option>
                    <option value="payment_confirmed">Pago Confirmado</option>
                    <option value="in_production">En Producción</option>
                    <option value="completed">Completado</option>
                  </select>
                </td>
                <td style={{ padding: "15px 10px" }}>
                  <button className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "0.8rem", marginRight: "10px" }}>Guardar</button>
                  <button className="btn btn-outline" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>Ver Detalle</button>
                </td>
              </tr>

              <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
                <td style={{ padding: "15px 10px", fontWeight: 500 }}>#1024</td>
                <td style={{ padding: "15px 10px" }}>
                  María Gómez <br/>
                  <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>maria@correo.com</span>
                </td>
                <td style={{ padding: "15px 10px" }}>1x Figura de Acción</td>
                <td style={{ padding: "15px 10px" }}>
                  <select className="input" style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} defaultValue="in_production">
                    <option value="pending">Pendiente Cotización</option>
                    <option value="payment_confirmed">Pago Confirmado</option>
                    <option value="in_production">En Producción</option>
                    <option value="completed">Completado</option>
                  </select>
                </td>
                <td style={{ padding: "15px 10px" }}>
                  <button className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "0.8rem", marginRight: "10px" }}>Guardar</button>
                  <button className="btn btn-outline" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>Ver Detalle</button>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </>
  );
}
