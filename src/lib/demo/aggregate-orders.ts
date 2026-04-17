import { fetchRegionOrders, fetchRegionTax, type Region } from './region-store';

const REGIONS: Region[] = ['us-east', 'us-west', 'eu', 'apac', 'latam', 'uk'];

export interface RegionSummary {
  orders: number;
  tax: number;
}

export async function aggregateOrdersByRegion(): Promise<Record<string, RegionSummary>> {
  const byRegion: Record<string, RegionSummary> = {};
  for (const region of REGIONS) {
    const orders = await fetchRegionOrders(region);
    const tax = await fetchRegionTax(region);
    byRegion[region] = { orders: orders.length, tax };
  }
  return byRegion;
}
