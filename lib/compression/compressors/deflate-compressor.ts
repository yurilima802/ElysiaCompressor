import { deflateSync } from "node:zlib";
import type { Compressor, ZlibCompressorOptions } from "../types";

export class DeflateCompressor implements Compressor {
  compress(data: string, level: number): Buffer {
    const adjustedLevel = Math.min(9, Math.max(0, level));
    const options: ZlibCompressorOptions = { level: adjustedLevel };
    return deflateSync(data, options);
  }

  getEncoding(): string {
    return "deflate";
  }
}
