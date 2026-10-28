import { describe, expect, it } from 'vitest';
import { parseReceiptText } from './ocrParser';

describe('parseReceiptText', () => {
  it('extracts receipt fields and matches an existing product', () => {
    const draft = parseReceiptText(
      'CUPOM 12345\nDATA 05/11/2026\n001 789 ARROZ\n2,000 Un x 5,00 10,00\nTOTAL 10,00',
      [{ id: 7, name: 'Arroz', barcode: '', category: '', brand: '', unit: '', description: '' }],
    );

    expect(draft.receiptNumber).toBe('12345');
    expect(draft.purchaseDate).toBe('2026-11-05T12:00');
    expect(draft.totalAmount).toBe('10.00');
    expect(draft.items).toEqual([expect.objectContaining({
      description: 'ARROZ',
      productId: 7,
      quantity: 2,
      unitPrice: '5.00',
    })]);
  });

  it('accepts OCR prefixes on item codes and detail lines', () => {
    const draft = parseReceiptText(
      '= 007 1309 PRES NOBRE S/C FI\nS: 1.000 Un x 0,30 0,30\nVALOR TOTAL R$ 62,86',
      [],
    );

    expect(draft.items).toEqual([expect.objectContaining({
      description: 'PRES NOBRE S/C FI',
      quantity: 1,
      unitPrice: '0.30',
    })]);
  });
});
