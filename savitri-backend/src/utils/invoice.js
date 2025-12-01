// src/utils/invoice.js

const { calculateGST } = require('./helpers');

/**
 * Generate invoice number
 */
const generateInvoiceNumber = (prefix, lastNumber) => {
  const nextNumber = (lastNumber || 0) + 1;
  return `${prefix}${String(nextNumber).padStart(6, '0')}`;
};

/**
 * Generate booking ID
 */
const generateBookingId = (type) => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  const prefix = {
    SPEED_BOAT: 'SB',
    PARTY_BOAT: 'PB',
    FERRY: 'FR',
  }[type] || 'BK';
  
  return `${prefix}-${timestamp}${random}`;
};

/**
 * Calculate invoice totals
 */
const calculateInvoiceTotals = (items, gstSettings = {}) => {
  const { 
    gstEnabled = false, 
    gstPercentage = 18, 
    gstType = 'exclusive' 
  } = gstSettings;
  
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  if (!gstEnabled) {
    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      gstAmount: 0,
      cgst: 0,
      sgst: 0,
      total: parseFloat(subtotal.toFixed(2)),
    };
  }
  
  // Calculate with GST
  const gstCalculation = calculateGST(subtotal, gstPercentage, gstType === 'inclusive');
  
  return {
    subtotal: gstCalculation.baseAmount,
    gstAmount: gstCalculation.gstAmount,
    cgst: gstCalculation.cgst,
    sgst: gstCalculation.sgst,
    total: gstCalculation.totalAmount,
  };
};

/**
 * Format invoice items
 */
const formatInvoiceItems = (items) => {
  return items.map((item, index) => ({
    srNo: index + 1,
    description: item.description || item.name,
    quantity: item.quantity || 1,
    rate: parseFloat(item.price.toFixed(2)),
    amount: parseFloat((item.price * (item.quantity || 1)).toFixed(2)),
  }));
};

/**
 * Create invoice data structure
 */
const createInvoiceData = ({
  invoiceNumber,
  bookingId,
  date,
  customer,
  items,
  gstSettings,
  companyInfo,
}) => {
  const formattedItems = formatInvoiceItems(items);
  const totals = calculateInvoiceTotals(items, gstSettings);
  
  return {
    invoiceNumber,
    bookingId,
    date: new Date(date),
    customer: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || '',
    },
    company: {
      name: companyInfo.name,
      legalName: companyInfo.legalName,
      address: companyInfo.address,
      gstin: companyInfo.gstin,
      pan: companyInfo.pan,
      email: companyInfo.email,
      phone: companyInfo.phone,
    },
    items: formattedItems,
    totals: {
      subtotal: totals.subtotal,
      gstPercentage: gstSettings.gstEnabled ? gstSettings.gstPercentage : 0,
      cgst: totals.cgst,
      sgst: totals.sgst,
      gstAmount: totals.gstAmount,
      total: totals.total,
    },
    gstEnabled: gstSettings.gstEnabled,
    hsnSacCode: gstSettings.hsnSacCode || '',
    footer: companyInfo.invoiceFooter || 'Thank you for your business!',
  };
};

module.exports = {
  generateInvoiceNumber,
  generateBookingId,
  calculateInvoiceTotals,
  formatInvoiceItems,
  createInvoiceData,
};