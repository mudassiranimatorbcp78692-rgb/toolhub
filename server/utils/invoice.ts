import { ordersTable } from '../../shared/schema';

export interface InvoiceData {
  invoiceId: string;
  customerName: string;
  customerEmail: string;
  planName: string;
  price: string;
  date: string;
  status: string;
}

export function generateInvoiceHTML(data: InvoiceData): string {
  const amount = parseFloat(data.price);
  const tax = (amount * 0.05).toFixed(2);
  const total = (amount + parseFloat(tax)).toFixed(2);

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 20px; }
    .header h1 { margin: 0; color: #1f2937; }
    .details { margin: 20px 0; }
    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .total-row { font-weight: bold; font-size: 16px; background: #f3f4f6; padding: 10px; margin-top: 10px; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 Invoice</h1>
    <p style="margin: 5px 0; color: #6b7280;">Office Tools Hub</p>
  </div>

  <div class="details">
    <h2 style="color: #1f2937; margin-bottom: 15px;">Invoice Details</h2>
    <div class="row">
      <strong>Invoice ID:</strong>
      <span>${data.invoiceId}</span>
    </div>
    <div class="row">
      <strong>Date:</strong>
      <span>${data.date}</span>
    </div>
    <div class="row">
      <strong>Status:</strong>
      <span style="color: #f59e0b; font-weight: bold;">${data.status.toUpperCase()}</span>
    </div>
  </div>

  <div class="details">
    <h2 style="color: #1f2937; margin-bottom: 15px;">Bill To</h2>
    <div class="row">
      <strong>Name:</strong>
      <span>${data.customerName}</span>
    </div>
    <div class="row">
      <strong>Email:</strong>
      <span>${data.customerEmail}</span>
    </div>
  </div>

  <div class="details">
    <h2 style="color: #1f2937; margin-bottom: 15px;">Subscription</h2>
    <div class="row">
      <strong>Plan:</strong>
      <span>${data.planName}</span>
    </div>
    <div class="row">
      <strong>Amount:</strong>
      <span>$${data.price}</span>
    </div>
    <div class="row">
      <strong>Tax (5%):</strong>
      <span>$${tax}</span>
    </div>
    <div class="total-row">
      <div style="display: flex; justify-content: space-between;">
        <span>TOTAL:</span>
        <span>$${total}</span>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Thank you for your subscription! Upon payment confirmation, your ${data.planName} plan will be activated immediately.</p>
    <p>If you have any questions, please reply to this email.</p>
    <p>© 2025 Office Tools Hub. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}

export function generateInvoiceText(data: InvoiceData): string {
  return `
INVOICE - Office Tools Hub

Invoice ID: ${data.invoiceId}
Date: ${data.date}
Status: ${data.status.toUpperCase()}

BILL TO:
${data.customerName}
${data.customerEmail}

SUBSCRIPTION DETAILS:
Plan: ${data.planName}
Amount: $${data.price}
Tax (5%): $${(parseFloat(data.price) * 0.05).toFixed(2)}
Total: $${(parseFloat(data.price) * 1.05).toFixed(2)}

Thank you for choosing Office Tools Hub!
  `;
}
