/**
 * Currencies offered by the invoice and receipt tools.
 *
 * `symbol` is what shows on screen. `pdfSymbol` is what the PDF can actually
 * print: pdf-lib's standard fonts are WinAnsi-encoded, so ₦, ₵, ₹, ₩ and the
 * rest simply cannot be drawn. Where that is the case the ISO code is used
 * instead, which is unambiguous on a financial document and is what most
 * cross-border invoices use anyway.
 */
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  /** Falls back to the code when the symbol is not WinAnsi-printable. */
  pdfSymbol: string;
}

/** True when every character can be drawn by a WinAnsi standard font. */
export const isPdfPrintable = (s: string) =>
  s.length > 0 && !/[^\x20-\x7E -ÿ]/.test(s);

const c = (code: string, name: string, symbol: string): Currency => ({
  code,
  name,
  symbol,
  pdfSymbol: isPdfPrintable(symbol) ? symbol : `${code} `,
});

export const CURRENCIES: Currency[] = [
  c("NGN", "Nigerian naira", "₦"),
  c("USD", "US dollar", "$"),
  c("EUR", "Euro", "€"),
  c("GBP", "British pound", "£"),
  c("GHS", "Ghanaian cedi", "₵"),
  c("KES", "Kenyan shilling", "KSh "),
  c("ZAR", "South African rand", "R"),
  c("EGP", "Egyptian pound", "E£"),
  c("XOF", "West African CFA franc", "CFA "),
  c("XAF", "Central African CFA franc", "FCFA "),
  c("MAD", "Moroccan dirham", "MAD "),
  c("TZS", "Tanzanian shilling", "TSh "),
  c("UGX", "Ugandan shilling", "USh "),
  c("RWF", "Rwandan franc", "RF "),
  c("CAD", "Canadian dollar", "CA$"),
  c("AUD", "Australian dollar", "A$"),
  c("NZD", "New Zealand dollar", "NZ$"),
  c("CHF", "Swiss franc", "CHF "),
  c("SEK", "Swedish krona", "kr "),
  c("NOK", "Norwegian krone", "kr "),
  c("DKK", "Danish krone", "kr "),
  c("PLN", "Polish złoty", "zł "),
  c("INR", "Indian rupee", "₹"),
  c("PKR", "Pakistani rupee", "Rs "),
  c("BDT", "Bangladeshi taka", "৳"),
  c("CNY", "Chinese yuan", "¥"),
  c("JPY", "Japanese yen", "¥"),
  c("KRW", "South Korean won", "₩"),
  c("SGD", "Singapore dollar", "S$"),
  c("HKD", "Hong Kong dollar", "HK$"),
  c("MYR", "Malaysian ringgit", "RM "),
  c("IDR", "Indonesian rupiah", "Rp "),
  c("PHP", "Philippine peso", "₱"),
  c("THB", "Thai baht", "฿"),
  c("VND", "Vietnamese dong", "₫"),
  c("AED", "UAE dirham", "AED "),
  c("SAR", "Saudi riyal", "SAR "),
  c("QAR", "Qatari riyal", "QAR "),
  c("TRY", "Turkish lira", "₺"),
  c("ILS", "Israeli shekel", "₪"),
  c("BRL", "Brazilian real", "R$"),
  c("MXN", "Mexican peso", "MX$"),
  c("ARS", "Argentine peso", "AR$"),
  c("CLP", "Chilean peso", "CLP "),
  c("COP", "Colombian peso", "COP "),
  c("UAH", "Ukrainian hryvnia", "₴"),
  c("RUB", "Russian rouble", "₽"),
  c("CZK", "Czech koruna", "Kč "),
  c("HUF", "Hungarian forint", "Ft "),
  c("RON", "Romanian leu", "lei "),
];

export const getCurrency = (code: string) =>
  CURRENCIES.find((x) => x.code === code);

/** Zero-decimal currencies, where "1,000.00" would be wrong. */
const NO_DECIMALS = new Set(["JPY", "KRW", "VND", "CLP", "UGX", "RWF", "XOF", "XAF", "IDR"]);

export const currencyDecimals = (code: string) => (NO_DECIMALS.has(code) ? 0 : 2);

export function formatMoney(amount: number, symbol: string, code: string) {
  const digits = currencyDecimals(code);
  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}
