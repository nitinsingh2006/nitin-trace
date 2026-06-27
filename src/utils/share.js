/**
 * NitinTrace — Shareable URL Compression Utilities
 * Uses browser-native CompressionStream (gzip) for compact base64-url sharing.
 */

/**
 * Compress code and language into a short URL-safe base64 string
 * @param {string} code - source code
 * @param {string} language - programming language
 * @returns {Promise<string>} compressed hash
 */
export async function compressShareData(code, language) {
  const data = JSON.stringify({ c: code, l: language });
  const bytes = new TextEncoder().encode(data);

  const compressionStream = new CompressionStream('gzip');
  const writer = compressionStream.writable.getWriter();
  writer.write(bytes);
  writer.close();

  const reader = compressionStream.readable.getReader();
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  // Concatenate chunks into a single ArrayBuffer
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const compressedBytes = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    compressedBytes.set(chunk, offset);
    offset += chunk.length;
  }

  // Convert Uint8Array to base64
  let binary = '';
  for (let i = 0; i < compressedBytes.byteLength; i++) {
    binary += String.fromCharCode(compressedBytes[i]);
  }
  const base64 = btoa(binary);

  // Make base64 URL-safe
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Decompress a URL-safe base64 hash back to code and language
 * @param {string} hash - compressed hash string
 * @returns {Promise<{code: string, language: string}>} decompressed data
 */
export async function decompressShareData(hash) {
  if (!hash) throw new Error('No hash provided for decompression.');

  // Restore standard base64 characters
  let base64 = hash.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const decompressionStream = new DecompressionStream('gzip');
  const writer = decompressionStream.writable.getWriter();
  writer.write(bytes);
  writer.close();

  const reader = decompressionStream.readable.getReader();
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  // Concatenate chunks
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const decompressedBytes = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    decompressedBytes.set(chunk, offset);
    offset += chunk.length;
  }

  const text = new TextDecoder().decode(decompressedBytes);
  const parsed = JSON.parse(text);

  return {
    code: parsed.c || '',
    language: parsed.l || 'javascript'
  };
}

/**
 * Generate a full shareable link for the current code and language
 * @param {string} code
 * @param {string} language
 * @returns {Promise<string>} Shareable URL
 */
export async function generateShareUrl(code, language) {
  const hash = await compressShareData(code, language);
  const url = new URL(window.location.href);
  url.searchParams.set('s', hash);
  return url.toString();
}

/**
 * Compress code and trace steps into a URL-safe base64 string
 * @param {string} code - source code
 * @param {Array} steps - trace steps array
 * @returns {Promise<string>} compressed hash
 */
export async function compressTrace(code, steps) {
  const data = JSON.stringify({ c: code, s: steps });
  const bytes = new TextEncoder().encode(data);

  const compressionStream = new CompressionStream('gzip');
  const writer = compressionStream.writable.getWriter();
  writer.write(bytes);
  writer.close();

  const reader = compressionStream.readable.getReader();
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const compressedBytes = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    compressedBytes.set(chunk, offset);
    offset += chunk.length;
  }

  let binary = '';
  for (let i = 0; i < compressedBytes.byteLength; i++) {
    binary += String.fromCharCode(compressedBytes[i]);
  }
  const base64 = btoa(binary);

  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Generate a shareable URL with compressed trace data in the hash fragment
 * @param {string} code - source code
 * @param {string} language - programming language
 * @param {Array} steps - trace steps array
 * @returns {Promise<string>} Shareable URL
 */
export async function generateShareUrlWithSteps(code, language, steps) {
  const hash = await compressTrace(code, steps);
  const url = new URL(window.location.href);
  url.hash = `#trace=${hash}`;
  return url.toString();
}

/**
 * Parse compressed trace data from the URL hash fragment
 * @returns {Promise<{code: string, steps: Array}|null>} decompressed data or null
 */
export async function parseShareUrl() {
  const match = window.location.hash.match(/^#trace=(.+)$/);
  if (!match) return null;

  const hash = match[1];
  let base64 = hash.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const decompressionStream = new DecompressionStream('gzip');
  const writer = decompressionStream.writable.getWriter();
  writer.write(bytes);
  writer.close();

  const reader = decompressionStream.readable.getReader();
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const decompressedBytes = new Uint8Array(totalLength);
  let o = 0;
  for (const chunk of chunks) {
    decompressedBytes.set(chunk, o);
    o += chunk.length;
  }

  const text = new TextDecoder().decode(decompressedBytes);
  const parsed = JSON.parse(text);

  return {
    code: parsed.c || '',
    steps: parsed.s || []
  };
}
