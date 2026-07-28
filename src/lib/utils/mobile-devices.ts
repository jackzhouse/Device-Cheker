export const MAC_ADDRESS_PATTERN = /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/;

export const normalizeMacAddress = (value: unknown) => String(value || '').trim().toUpperCase();

export const getMobileDeviceMacError = (
  value: unknown,
  index: number,
  devices: Array<{ macAddress?: string }> = [],
) => {
  const macAddress = normalizeMacAddress(value);
  if (!macAddress) return undefined;
  if (!MAC_ADDRESS_PATTERN.test(macAddress)) return 'invalid';

  const duplicate = devices.some((device, deviceIndex) => (
    deviceIndex !== index && normalizeMacAddress(device.macAddress) === macAddress
  ));
  return duplicate ? 'duplicate' : undefined;
};
