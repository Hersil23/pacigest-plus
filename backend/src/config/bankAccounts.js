// ============================================
// CUENTAS BANCARIAS POR PAÍS
// ============================================

const bankAccounts = {
  // ============================================
  // ESPAÑA
  // ============================================
  españa: {
    country: 'España',
    currency: 'EUR',
    accounts: [
      {
        type: 'IBAN',
        bank: 'BBVA España',
        accountNumber: 'ES12 3456 7890 1234 5678 9012',
        swift: 'BBVAESMM',
        holder: 'Tu Nombre Completo',
        instructions: 'Realizar transferencia SEPA a la cuenta indicada. En el concepto incluir: "PaciGest - [Tu Email]"'
      }
    ],
    notes: 'Las transferencias SEPA suelen tardar 1-2 días hábiles.'
  },

  // ============================================
  // ARGENTINA
  // ============================================
  argentina: {
    country: 'Argentina',
    currency: 'ARS',
    accounts: [
      {
        type: 'CBU',
        bank: 'Mercado Pago',
        accountNumber: '0000003100012345678901',
        alias: 'pacigest.arg',
        cuit: '20-12345678-9',
        holder: 'Tu Nombre Completo',
        instructions: 'Realizar transferencia bancaria al CBU indicado. En el concepto incluir: "PaciGest - [Tu Email]"'
      },
      {
        type: 'CVU',
        bank: 'Brubank',
        accountNumber: '0000007900123456789012',
        alias: 'pacigest.brubank',
        cuit: '20-12345678-9',
        holder: 'Tu Nombre Completo',
        instructions: 'Transferencia mediante CVU. Concepto: "PaciGest - [Tu Email]"'
      }
    ],
    notes: 'Las transferencias en Argentina son instantáneas. Convertir USD a ARS al tipo de cambio oficial del día.',
    exchangeNote: 'Tipo de cambio referencia: Dólar MEP o Blue según acuerdo.'
  },

  // ============================================
  // VENEZUELA
  // ============================================
  venezuela: {
    country: 'Venezuela',
    currency: 'USD',
    accounts: [
      {
        type: 'Zelle',
        email: 'tu-email@ejemplo.com',
        holder: 'Tu Nombre Completo',
        instructions: 'Enviar pago por Zelle al email indicado. En el memo incluir: "PaciGest - [Tu Email]"'
      },
      {
        type: 'Binance Pay',
        binanceId: '123456789',
        email: 'tu-email@ejemplo.com',
        holder: 'Tu Nombre Completo',
        acceptedCrypto: ['USDT', 'BUSD', 'BTC'],
        instructions: 'Enviar pago por Binance Pay al ID indicado. Monedas aceptadas: USDT, BUSD, BTC. Incluir en nota: "PaciGest - [Tu Email]"'
      },
      {
        type: 'Banco Local',
        bank: 'Banco de Venezuela',
        accountNumber: '0102-1234-56-1234567890',
        accountType: 'Corriente',
        holder: 'Tu Nombre Completo',
        cedula: 'V-12.345.678',
        instructions: 'Transferencia en Bolívares o USD (según disponibilidad). Concepto: "PaciGest - [Tu Email]"',
        currency: 'VES'
      },
      {
        type: 'Pago Móvil',
        bank: 'Banco de Venezuela',
        phone: '+58 414-1234567',
        cedula: 'V-12.345.678',
        holder: 'Tu Nombre Completo',
        instructions: 'Pago móvil al número indicado. Concepto: "PaciGest - [Tu Email]"',
        currency: 'VES'
      }
    ],
    notes: 'Múltiples opciones disponibles. Zelle y Binance Pay para pagos en USD. Banco local y Pago Móvil para Bolívares.',
    exchangeNote: 'Para pagos en Bolívares, aplicar tasa de cambio del día según BCV.'
  },

  // ============================================
  // USA
  // ============================================
  usa: {
    country: 'United States',
    currency: 'USD',
    accounts: [
      {
        type: 'ACH/Wire',
        bank: 'Chase Bank',
        accountNumber: '123456789',
        routingNumber: '987654321',
        accountType: 'Checking',
        holder: 'Your Full Name',
        swift: 'CHASUS33',
        instructions: 'Wire transfer or ACH to the account indicated. Memo: "PaciGest - [Your Email]"'
      },
      {
        type: 'Zelle',
        email: 'your-email@example.com',
        phone: '+1 555-123-4567',
        holder: 'Your Full Name',
        instructions: 'Send payment via Zelle to the email/phone indicated. Memo: "PaciGest - [Your Email]"'
      }
    ],
    notes: 'Zelle transfers are instant. Wire transfers may take 1-2 business days and may incur fees.'
  }
};

const getBankAccountsByCountry = (country) => {
  return bankAccounts[country] || null;
};

const getAvailableCountries = () => {
  return Object.keys(bankAccounts).map(key => ({
    code: key,
    name: bankAccounts[key].country,
    currency: bankAccounts[key].currency
  }));
};

module.exports = {
  bankAccounts,
  getBankAccountsByCountry,
  getAvailableCountries
};