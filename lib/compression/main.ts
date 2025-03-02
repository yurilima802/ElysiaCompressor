import { CompressorFactory } from "./compressor-factory";
import { StreamCompressorFactory } from "./stream-factory";
import { Elysia } from "elysia";
import memCache from "./cache";
import type { CompressionOptions, ElysiaContext, Compressor } from "./types";
import { constants } from "node:zlib";
import { pipeline } from "stream/promises";

class CompressionHandler {
  constructor(
    private options: CompressionOptions,
    private compressor: Compressor
  ) {}

  private shouldCompress(context: ElysiaContext): boolean {
    const { request, response } = context;
    if (
      this.options.disableByHeader &&
      request.headers.get("x-no-compression")
    ) {
      return false;
    }

    const acceptEncoding = request.headers.get("accept-encoding") || "";
    const acceptEncodingArray = acceptEncoding
      .split(",")
      .map((encoding) => encoding.trim());

    if (!this.options.encodings?.includes(this.compressor.getEncoding())) {
      return false;
    }

    if (!acceptEncodingArray.includes(this.compressor.getEncoding())) {
      return false;
    }

    let text: string;
    let contentType: string;

    if (typeof response === "object" && response !== null) {
      text = JSON.stringify(response);
      contentType = "application/json; charset=utf-8";
    } else if (response !== null && response !== undefined) {
      text = response.toString();
      contentType = "text/plain; charset=utf-8";
    } else {
      return false;
    }

    if (!this.options.compressibleTypes?.test(contentType)) {
      return false;
    }

    const originalSize = Buffer.from(text).length;
    if (originalSize < (this.options.threshold ?? 1024)) {
      return false;
    }

    return true;
  }

  async handleCompression(context: ElysiaContext): Promise<Buffer | void> {
    if (!this.shouldCompress(context)) {
      return;
    }

    const { set, response } = context;
    const algorithm = this.options.algorithm || "gzip";
    const level = this.options.level || constants.Z_DEFAULT_COMPRESSION;
    const useStream = this.options.useStream ?? false;

    if (useStream) {
      const streamFactory = new StreamCompressorFactory();
      const compressionStream = streamFactory.createCompressor(
        algorithm,
        level
      );

      try {
        if (typeof response === "string" || typeof response === "object") {
          const text =
            typeof response === "object" ? JSON.stringify(response) : response;
          const textBuffer = Buffer.from(text);

          const chunks: Buffer[] = [];
          await pipeline(
            textBuffer,
            compressionStream,
            async function* (source) {
              for await (const chunk of source) {
                chunks.push(chunk);
                yield chunk;
              }
            }
          );

          // Concatenando Buffer[] para um uníco Buffer
          const compressed = Buffer.concat(chunks);

          set.headers["Content-Encoding"] =
            compressionStream.compressor.constructor.name
              .replace("Compressor", "")
              .toLowerCase();
          set.headers["Content-Type"] =
            typeof response === "object"
              ? "application/json; charset=utf-8"
              : "text/plain; charset=utf-8";

          return compressed;
        } else {
          return Buffer.from(JSON.stringify(response));
        }
      } catch (error) {
        console.error("Erro de compressão de stream:", error);
        return Buffer.from(JSON.stringify({ error: "Compression error" }));
      }
    } else {
      let text = "";
      let contentType = "";

      if (typeof response === "object" && response !== null) {
        text = JSON.stringify(response);
        contentType = "application/json; charset=utf-8";
      } else if (response !== null && response !== undefined) {
        text = response.toString();
        contentType = "text/plain; charset=utf-8";
      }

      const cacheKey = `${algorithm}-${level}-${text}`;

      if (memCache.has(cacheKey)) {
        const cachedResponse = memCache.get(cacheKey);
        set.headers["Content-Encoding"] = this.compressor.getEncoding();
        set.headers["Content-Type"] = contentType;
        console.log(`Cache hit for ${cacheKey}`);
        return cachedResponse;
      }

      try {
        const compressed = this.compressor.compress(text, level);
        const compressedSize = compressed.length;

        set.headers["Content-Encoding"] = this.compressor.getEncoding();
        set.headers["Content-Type"] = contentType;

        console.log(`Tamanho original: ${Buffer.from(text).length} bytes`);
        console.log(
          `Tamanho comprimido (${this.compressor.getEncoding()}, level ${level}): ${compressedSize} bytes`
        );

        memCache.set(
          cacheKey,
          compressed,
          this.options.cacheTTL ?? 24 * 60 * 60
        );
        console.log(`Cache set for ${cacheKey}`);
        return compressed;
      } catch (error) {
        console.error("Erro de compressão:", error);
        return Buffer.from(text);
      }
    }
  }
}

export const compression = (options: CompressionOptions = {}) => {
  const algorithm = options.algorithm || "gzip";
  const compressorFactory = new CompressorFactory();
  const compressor = compressorFactory.createCompressor(algorithm);
  const handler = new CompressionHandler(options, compressor);

  return (app: Elysia) => {
    app.onAfterHandle(async (context: ElysiaContext) => {
      return handler.handleCompression(context);
    });
    return app;
  };
};
