
export const EMAIL_SIGNATURE = `
Rajan Ibrahim Omar Sundi
Tech Manager
TILETA TEAM
`;

export interface BaseEmailData {
  userName: string;
}

export interface OrderEmailData extends BaseEmailData {
  orderNumber: string;
  total: string;
  status?: string;
  items?: Array<{ name: string; quantity: number; price: string | number }>;
  deliveryAddress?: string;
  businessName?: string;
}

export interface VerificationEmailData extends BaseEmailData {
  code: string;
}

export const templates = {
  welcome: (data: BaseEmailData) => ({
    subject: "Welcome to Tileta!",
    body: `
Hello ${data.userName},

Welcome to Tileta! We're excited to have you join our hyper-local marketplace. Whether you're a student looking for a quick meal, a business owner reaching more customers, or an agent helping with deliveries, we're here to make things easier for you.

Explore our marketplace and start your Tileta journey today.

${EMAIL_SIGNATURE}
    `.trim(),
  }),

  orderConfirmation: (data: OrderEmailData) => ({
    subject: `Order Confirmed - #${data.orderNumber}`,
    body: `
Hello ${data.userName},

Your order #${data.orderNumber} has been successfully placed.

Order Summary:
Total: ${data.total}
Delivery Address: ${data.deliveryAddress}

${data.items ? `Items:\n${data.items.map(i => `- ${i.name} x${i.quantity} (${typeof i.price === 'number' ? i.price + ' NGN' : i.price})`).join('\n')}` : ''}

We'll notify you when your order is accepted and on its way.

${EMAIL_SIGNATURE}
    `.trim(),
  }),

  orderStatusUpdate: (data: OrderEmailData) => ({
    subject: `Update on Order #${data.orderNumber} - ${data.status}`,
    body: `
Hello ${data.userName},

Your order #${data.orderNumber} status has been updated to: ${data.status}.

${data.status === 'delivered' ? 'Enjoy your purchase! Thank you for choosing Tileta.' : 'We will continue to keep you updated on the progress.'}

${EMAIL_SIGNATURE}
    `.trim(),
  }),

  verificationCode: (data: VerificationEmailData) => ({
    subject: "Your Tileta Verification Code",
    body: `
Hello ${data.userName},

Your verification code is: ${data.code}

Please use this code to complete your activity on Tileta. For security reasons, do not share this code with anyone.

${EMAIL_SIGNATURE}
    `.trim(),
  }),

  passwordReset: (data: BaseEmailData & { resetLink: string }) => ({
    subject: "Reset Your Tileta Password",
    body: `
Hello ${data.userName},

We received a request to reset your password. You can do so by clicking the link below:

${data.resetLink}

If you didn't request this, you can safely ignore this email.

${EMAIL_SIGNATURE}
    `.trim(),
  }),

  newOrderForSeller: (data: OrderEmailData & { sellerName: string }) => ({
    subject: `New Order Received - #${data.orderNumber}`,
    body: `
Hello ${data.sellerName},

Congratulations! You have received a new order #${data.orderNumber} on Tileta.

Order Details:
Customer: ${data.userName}
Total: ${data.total}

Please log in to your seller dashboard to accept and process this order.

${EMAIL_SIGNATURE}
    `.trim(),
  }),

  loginAlert: (data: BaseEmailData & { time: string; device: string }) => ({
    subject: "New Login Alert",
    body: `
Hello ${data.userName},

We detected a new login to your Tileta account at ${data.time} on device ${data.device}.

If this wasn't you, please change your password immediately.

${EMAIL_SIGNATURE}
    `.trim(),
  })
};

