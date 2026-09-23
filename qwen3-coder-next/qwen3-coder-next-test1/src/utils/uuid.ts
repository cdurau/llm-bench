/**
 * Erstellt eine UUID v4
 */
export function generateUUID(): string {
  // Verwendet.crypto wenn verfügbar, sonst Fallback
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    
    // Setze Version (4) und Variantenbits
    array[6] = (array[6] & 0x0f) | 0x40; // Version 4
    array[8] = (array[8] & 0x3f) | 0x80; // Variantenbits
    
    // Konvertiere zu hex string
    const byteToHex: string[] = [];
    for (let i = 0; i < 256; ++i) {
      byteToHex[i] = (i + 0x100).toString(16).slice(1);
    }
    
    let offset = 0;
    const bth = byteToHex;
    return [
      bth[array[offset++]], bth[array[offset++]], bth[array[offset++]], bth[array[offset++]],
      '-', bth[array[offset++]], bth[array[offset++]],
      '-', bth[array[offset++]], bth[array[offset++]],
      '-', bth[array[offset++]], bth[array[offset++]],
      '-', bth[array[offset++]], bth[array[offset++]], bth[array[offset++]], bth[array[offset++]],
      bth[array[offset++]], bth[array[offset++]], bth[array[offset++]], bth[array[offset++]],
      bth[array[offset++]], bth[array[offset++]], bth[array[offset++]], bth[array[offset++]],
      bth[array[offset++]], bth[array[offset++]], bth[array[offset++]], bth[array[offset++]]
    ].join('');
  }
  
  // Fallback ohne crypto
  const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  const uuid = template.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  
  return uuid;
}
