import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `LunchUp <${config.email.user}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Template email pour nouvelle commande
 */
export const orderConfirmationTemplate = (orderNumber: string, total: number): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #FF6B35;">Commande Confirmée</h2>
      <p>Votre commande <strong>${orderNumber}</strong> a été reçue avec succès.</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Total à payer:</strong> ${total} FCFA</p>
        <p><strong>Heure estimée de livraison:</strong> 12h-15h</p>
      </div>
      <p>Vous recevrez un appel de confirmation sous peu.</p>
      <p style="color: #666; margin-top: 20px; font-size: 12px;">
        © 2026 LunchUp - Service de livraison de lunch box
      </p>
    </div>
  `;
};

/**
 * Template email pour notification admin
 */
export const adminNotificationTemplate = (
  orderNumber: string,
  customerName: string,
  items: string,
  total: number
): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #FF6B35;">Nouvelle Commande Reçue</h2>
      <p>Une nouvelle commande vient d'être passée:</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>N° Commande:</strong> ${orderNumber}</p>
        <p><strong>Client:</strong> ${customerName}</p>
        <p><strong>Articles:</strong> ${items}</p>
        <p><strong>Montant:</strong> ${total} FCFA</p>
      </div>
      <p>Connectez-vous au dashboard pour traiter cette commande.</p>
    </div>
  `;
};
