import {
  BrotliCompressor,
  DeflateCompressor,
  GzipCompressor,
} from "./compressors";
import type { Compressor } from "./types";

export class CompressorFactory {
  createCompressor(algorithm: string): Compressor {
    switch (algorithm) {
      case "br":
        return new BrotliCompressor();
      case "deflate":
        return new DeflateCompressor();
      default:
        return new GzipCompressor();
    }
  }
}
