import { deflateSync } from "node:zlib";
import type { Compressor, ZlibCompressorOptions } from "../types";

export class DeflateCompressor implements Compressor {
  compress(data: string, level: number): Buffer {
    const adjustedLevel = Math.min(9, Math.max(0, level)); // Create a local variable
    const options: ZlibCompressorOptions = { level: adjustedLevel }; // Use the local variable
    return deflateSync(data, options);
  }

  getEncoding(): string {
    return "deflate";
  }
}
