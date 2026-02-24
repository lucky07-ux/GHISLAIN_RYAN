import twilio from 'twilio';
import { IOrder, IOrderItem } from '../types/index.js';
import { IDeliveryDriverDoc } from '../models/DeliveryDriver.js';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendWhatsApp = async (to: string, message: string) => {
  try {
    const formattedNumber = to.startsWith('+') ? to : `+${to}`;

    const result = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${formattedNumber}`,
      body: message
    });

    console.log('✅ WhatsApp envoyé! SID:', result.sid);
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur WhatsApp:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

export const templates = {
  orderConfirmed: (order: IOrder) => `
Bonjour ${order.customerInfo.name},

Votre commande #${order.orderNumber} a été confirmée avec succès! ✅

⏰ Commandé le: ${new Date(order.createdAt || new Date()).toLocaleString('fr-FR')}

👤 Contact: ${order.customerInfo.phone}
${order.customerInfo.email ? `📧 Email: ${order.customerInfo.email}` : ''}

📦 Récapitulatif:
${order.items.map((item: any) => `• ${item.name} x${item.quantity}`).join('\n')}

💰 Total: ${order.pricing.total} FCFA
🚚 Livraison: ${order.deliveryInfo.address}

💳 Paiement: ${order.payment.method === 'orange_money' ? 'Orange Money' :
              order.payment.method === 'mtn_momo' ? 'MTN Mobile Money' : 'Espèces'}
${order.payment.phoneNumber ? `📱 Numéro paiement: ${order.payment.phoneNumber}` : ''}

${order.specialInstructions ? `📝 Vos instructions: ${order.specialInstructions}` : ''}

Nous préparons votre commande avec soin. Vous serez notifié dès qu'elle sera en route.

Merci d'avoir choisi LunchUp! 🍱
Service client: +237 6 91 71 02 89
  `.trim(),

  paymentConfirmed: (order: IOrder) => `
Bonjour ${order.customerInfo.name},

Votre paiement de ${order.pricing.total} FCFA a été confirmé! ✅

👤 Contact: ${order.customerInfo.phone}

📦 Commande: #${order.orderNumber}
💳 Méthode: ${order.payment.method === 'orange_money' ? 'Orange Money' :
              order.payment.method === 'mtn_momo' ? 'MTN Mobile Money' : 'Espèces'}
✅ Statut: Payé

Votre délicieux repas sera livré très bientôt!

LunchUp - Bon appétit! 🍱
  `.trim(),

  orderShipped: (order: IOrder, driver: IDeliveryDriverDoc) => `
Bonjour ${order.customerInfo.name},

Votre commande #${order.orderNumber} est en route! 🚴

👤 Votre contact: ${order.customerInfo.phone}

🚚 Livreur: ${driver.name}
📞 Contact livreur: ${driver.phone}

Livraison prévue dans 15-30 minutes à:
📍 ${order.deliveryInfo.address}

${order.payment.method === 'cash' ? `💰 Préparez ${order.pricing.total} FCFA en espèces` : '✅ Paiement déjà effectué'}

À très bientôt! LunchUp 🍱
  `.trim(),

  orderDelivered: (order: IOrder) => `
Bonjour ${order.customerInfo.name},

Votre commande #${order.orderNumber} a été livrée avec succès! ✅

👤 Votre contact: ${order.customerInfo.phone}

Nous espérons que vous avez apprécié votre repas! 🍱

⭐ Votre avis compte! Partagez votre expérience:
👉 lunchup.cm/community

Merci de votre confiance!
LunchUp - À très bientôt! 😊

Service client: +237 6 91 71 02 89
  `.trim()
};
