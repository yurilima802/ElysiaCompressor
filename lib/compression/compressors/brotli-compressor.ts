import { constants, brotliCompressSync } from "node:zlib";
import type { Compressor, BrotliCompressorOptions } from "../types";

export class BrotliCompressor implements Compressor {
  compress(data: string, level: number): Buffer {
    const adjustedLevel = Math.min(11, Math.max(1, level)); // Create a local variable
    const options: BrotliCompressorOptions = {
      params: {
        [constants.BROTLI_PARAM_QUALITY]: adjustedLevel, // Use the local variable
      },
    };
    return brotliCompressSync(data, options);
  }

  getEncoding(): string {
    return "br";
  }
}
