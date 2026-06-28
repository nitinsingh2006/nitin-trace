import { describe, it, expect } from 'vitest';
import { compressShareData, decompressShareData } from '../../utils/share.js';

describe('Share Utilities', () => {
  it('correctly compresses and decompresses code and language', async () => {
    const code = 'const hello = "world";\nconsole.log(hello);';
    const language = 'javascript';

    const hash = await compressShareData(code, language);
    expect(hash).toBeTypeOf('string');
    expect(hash.length).toBeGreaterThan(0);

    const result = await decompressShareData(hash);
    expect(result.code).toBe(code);
    expect(result.language).toBe(language);
  });

  it('handles empty code and different languages', async () => {
    const code = '';
    const language = 'python';

    const hash = await compressShareData(code, language);
    const result = await decompressShareData(hash);

    expect(result.code).toBe(code);
    expect(result.language).toBe(language);
  });
});
