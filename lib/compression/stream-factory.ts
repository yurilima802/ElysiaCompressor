import { Transform } from "stream";
import {
  brotliCompressSync,
  gzipSync,
  deflateSync,
  type BrotliOptions,
  type ZlibOptions,
  constants,
} from "node:zlib";

export interface ICompressor {
  compress(chunk: Buffer, level: number): Buffer;
}

class BrotliCompressor implements ICompressor {
  compress(chunk: Buffer, level: number): Buffer {
    const options: BrotliOptions = {
      params: { [constants.BROTLI_PARAM_QUALITY]: level },
    };
    // Converte o Buffer para Uint8Array
    return brotliCompressSync(new Uint8Array(chunk), options);
  }
}

class GzipCompressor implements ICompressor {
  compress(chunk: Buffer, level: number): Buffer {
    const options: ZlibOptions = { level };
    // Converte o Buffer para Uint8Array
    return gzipSync(new Uint8Array(chunk), options);
  }
}

class DeflateCompressor implements ICompressor {
  compress(chunk: Buffer, level: number): Buffer {
    const options: ZlibOptions = { level };
    // Converte o Buffer para Uint8Array
    return deflateSync(new Uint8Array(chunk), options);
  }
}

// Compression Stream using interface
export class CompressionStream extends Transform {
  public compressor: ICompressor;

  constructor(compressor: ICompressor, private level = 6) {
    super();
    this.compressor = compressor;
  }

  _transform(
    chunk: Buffer,
    _encoding: BufferEncoding,
    callback: (error?: Error | null, chunk?: Buffer) => void,
  ): void {
    try {
      const compressed = this.compressor.compress(chunk, this.level);
      callback(null, compressed);
    } catch (error) {
      callback(error as Error);
    }
  }
}

// Stream Compressor Factory using interface
export class StreamCompressorFactory {
  createCompressor(algorithm: string, level = 6): CompressionStream {
    let compressor: ICompressor;
    switch (algorithm) {
      case "br":
        compressor = new BrotliCompressor();
        break;
      case "deflate":
        compressor = new DeflateCompressor();
        break;
      default:
        compressor = new GzipCompressor();
        break;
    }
    return new CompressionStream(compressor, level);
  }
}
