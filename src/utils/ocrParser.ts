import type { Product } from '../types/api';

export interface OcrDraftItem {
  id: string;
  description: string;
  productId: number | '';
  quantity: number;
  unitPrice: string;
}

export interface OcrDraft {
  receiptNumber: string;
  purchaseDate: string;
  totalAmount: string;
  items: OcrDraftItem[];
}

const moneyPattern = '(\\d{1,6}(?:[.,]\\d{3})*[.,]\\d{2})';

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function moneyValue(value: string) {
  return value.replace(/\./g, '').replace(',', '.');
}

function createItem(index: number, description: string, quantityText: string, totalText: string, products: Product[], unitPriceText?: string): OcrDraftItem | undefined {
  const quantity = Number(quantityText.replace(',', '.'));
  const total = Number(moneyValue(totalText));
  const unitPrice = unitPriceText ? Number(moneyValue(unitPriceText)) : total / quantity;
  const letterCount = (description.match(/[a-záàâãéêíóôõúç]/gi) || []).length;
  if (!description || /\b(pagar|pagamento|total|valor|desconto|pix|troco)\b/i.test(description) || letterCount < 4 || !Number.isFinite(total) || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice)) return undefined;
  return {
    id: `${Date.now()}-${index}`,
    description,
    productId: findProductId(description, products),
    quantity,
    unitPrice: unitPrice.toFixed(2),
  };
}

function toLocalDate(value: string) {
  const match = value.match(/(\d{2})[/-](\d{2})[/-](\d{4})/);
  if (!match) return '';
  return `${match[3]}-${match[2]}-${match[1]}T12:00`;
}

function findProductId(description: string, products: Product[]) {
  const normalizedDescription = normalize(description);
  const product = products.find((candidate) => {
    const name = normalize(candidate.name);
    return name && (normalizedDescription === name || normalizedDescription.includes(name) || name.includes(normalizedDescription));
  });
  return product?.id || '';
}

export function parseReceiptText(text: string, products: Product[]): OcrDraft {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const totalLine = lines.find((line) => /\b(total|valor a pagar|valor final)\b/i.test(line));
  const totalMatch = totalLine?.match(new RegExp(moneyPattern));
  const dateMatch = text.match(/\d{2}[/-]\d{2}[/-]\d{4}/);
  const numberLine = lines.find((line) => /\b(cupom|coo|numero|n[ºo°]?)\b/i.test(line));
  const numberMatch = numberLine?.match(/\d{3,}/);
  const ignored = /\b(total|subtotal|troco|desconto|pagamento|dinheiro|cartao|cartão|pix|cpf|cnpj|data|hora|cupom|coo|numero|n[ºo°]?|pagar|valor|forma|fiscal|consumidor|consulte|chave)\b/i;
  const items: OcrDraftItem[] = [];
  let pendingDescription: string | undefined;

  for (const [index, line] of lines.entries()) {
    const detailMatch = line.match(new RegExp(`^\\D*(\\d+[.,]\\d+)\\s+\\S+\\s+\\D+${moneyPattern}\\s+${moneyPattern}$`, 'i'));
    if (pendingDescription && detailMatch) {
      const item = createItem(index, pendingDescription, detailMatch[1], detailMatch[3], products, detailMatch[2]);
      if (item) items.push(item);
      pendingDescription = undefined;
      continue;
    }
    if (ignored.test(line)) {
      pendingDescription = undefined;
      continue;
    }
    const itemHeader = line.match(/^[^0-9]{0,3}\d{3}\s+(?:\d+\s+)?(.+)$/);
    if (itemHeader) {
      pendingDescription = itemHeader[1].trim();
      continue;
    }
    const singleLineMatch = !/\bx\b/i.test(line) && line.match(new RegExp(`^(.+?)\\s+(?:x\\s*)?(\\d+(?:[.,]\\d+)?)?\\s*${moneyPattern}$`, 'i'));
    if (singleLineMatch) {
      const item = createItem(index, singleLineMatch[1].replace(/^[\d\s*-]+/, '').trim(), singleLineMatch[2] || '1', singleLineMatch[3], products);
      if (item) items.push(item);
    }
  }

  return {
    receiptNumber: numberMatch?.[0] || '',
    purchaseDate: dateMatch ? toLocalDate(dateMatch[0]) : '',
    totalAmount: totalMatch ? moneyValue(totalMatch[1]) : '',
    items,
  };
}
