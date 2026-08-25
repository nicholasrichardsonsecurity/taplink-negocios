export function escapeWifiValue(value: string) {
  return value.replace(/([\\;,:"])/g, "\\$1");
}
export function buildWifiUri(ssid: string, password: string) {
  return `WIFI:T:WPA;S:${escapeWifiValue(ssid)};P:${escapeWifiValue(password)};;`;
}
