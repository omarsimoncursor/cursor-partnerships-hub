export type Region = 'us-east' | 'us-west' | 'eu' | 'apac' | 'latam' | 'uk';

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

export async function fetchRegionOrders(region: Region) {
  await sleep(600);
  return Array.from({ length: 120 + region.length * 3 }, (_, i) => ({
    id: `${region}-${i}`,
    amount: 40 + (i % 17),
  }));
}

export async function fetchRegionTax(region: Region) {
  await sleep(550);
  const seed = region.length * 1733 + region.charCodeAt(0);
  return 1200 + (seed % 800);
}
