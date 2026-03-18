function normalizeAmount(amount) {
  const n = Number(amount);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Map purchase amount (price) to awarded spins.
 * Backward-compatible: unknown amounts => 0 spins.
 */
function spinsForPurchaseAmount(amount) {
  const a = normalizeAmount(amount);

  // Amounts as specified:
  // 20,000 => 1
  // 50,000 => 2
  // 1,00,000 => 3
  // 5,00,000 => 5
  // 10,00,000 => 10
  const map = new Map([
    [20000, 1],
    [50000, 2],
    [100000, 3],
    [500000, 5],
    [1000000, 10],
  ]);

  return map.get(a) ?? 0;
}

module.exports = { spinsForPurchaseAmount };

