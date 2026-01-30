import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, message, language } = body;

    // Validación básica
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Faltan campos requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Email inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Configurar transporter Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: import.meta.env.GMAIL_USER,
        pass: import.meta.env.GMAIL_APP_PASSWORD,
      },
    });

    // Enviar email
    await transporter.sendMail({
      from: `"The Harbor Contact Form" <${import.meta.env.GMAIL_USER}>`,
      to: import.meta.env.GMAIL_USER,
      replyTo: email,
      subject: `[The Harbor] Nuevo mensaje de ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e3a5f; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #1e3a5f; }
            .value { margin-top: 5px; }
            .message-box { background: white; padding: 15px; border-left: 4px solid #3b82f6; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>✉️ Nuevo mensaje desde theharbor.digital</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">De:</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              <div class="field">
                <div class="label">Idioma:</div>
                <div class="value">${language || 'es'}</div>
              </div>
              <div class="field">
                <div class="label">Mensaje:</div>
                <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Nuevo mensaje desde theharbor.digital

De: ${name}
Email: ${email}
Idioma: ${language || 'es'}

Mensaje:
${message}
      `,
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Email enviado correctamente' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error enviando email:', error);
    return new Response(
      JSON.stringify({ error: 'Error al enviar el email. Intenta de nuevo.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
