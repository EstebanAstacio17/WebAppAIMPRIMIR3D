import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('RESEND_API_KEY no está configurado.');
      return NextResponse.json(
        { error: 'Servicio de correo pendiente de configuración de API Key.' },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);
    const { to, subject, type, orderDetails } = await request.json();

    let htmlContent = '';

    if (type === 'new_order') {
      htmlContent = `
        <h1>Nuevo Pedido en AIMPRIMIR3D</h1>
        <p>Gracias por tu pedido. Aquí están los detalles:</p>
        <p><strong>Pedido:</strong> ${orderDetails?.id || ''}</p>
        <p><strong>Estado:</strong> Pendiente de cotización/pago</p>
        <p>Nos pondremos en contacto contigo pronto con el total a pagar.</p>
      `;
    } else if (type === 'status_update') {
      htmlContent = `
        <h1>Actualización de tu Pedido</h1>
        <p>El estado de tu pedido #${orderDetails?.id || ''} ha cambiado a: <strong>${orderDetails?.status || ''}</strong></p>
        <p>Puedes ver más detalles en tu panel de control.</p>
      `;
    }

    const data = await resend.emails.send({
      from: 'AIMPRIMIR3D <pedidos@aimprimir3d.com.do>',
      to: [to],
      subject: subject,
      html: htmlContent,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error al enviar correo:', error);
    return NextResponse.json({ error: error.message || 'Error al enviar correo.' }, { status: 500 });
  }
}
