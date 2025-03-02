import Elysia from 'elysia';
import {
  brotliCompressSync,
  gzipSync,
  deflateSync,
  constants,
} from 'node:zlib';

type CompressionAlgorithm = 'gzip' | 'brotli' | 'deflate';

interface CompressionOptions {
  algorithm?: CompressionAlgorithm;
  level?: number; // Nível de compressão
}

const compressionMiddleware = (options: CompressionOptions = {}) => {
  const algorithm = options.algorithm || 'gzip';
  let level = options.level || constants.Z_DEFAULT_COMPRESSION;

  return (app: Elysia) =>
    app.onAfterHandle(async ({ request, set, response }) => {
      const acceptEncoding = request.headers.get('accept-encoding') || '';
      const acceptEncodingArray = acceptEncoding.split(',').map((encoding) => encoding.trim());
      if (!acceptEncodingArray.includes(algorithm === 'brotli' ? 'br' : algorithm)) {
        return;
      }

      let text: string;
      let contentType: string;

      if (typeof response === 'object' && response !== null) {
        text = JSON.stringify(response);
        contentType = 'application/json; charset=utf-8';
      } else if (response !== null && response !== undefined) {
        text = response.toString();
        contentType = 'text/plain; charset=utf-8';
      } else {
        return;
      }

      const originalSize = Buffer.from(text).length;
      let compressed: Buffer;
      let compressedSize: number;

      try {
        switch (algorithm) {
          case 'brotli':
            level = Math.min(11, Math.max(1, level));
            compressed = brotliCompressSync(text, {
              params: {
                [constants.BROTLI_PARAM_QUALITY]: level,
              },
            });
            set.headers['Content-Encoding'] = 'br';
            break;
          case 'deflate':
            level = Math.min(9, Math.max(0, level));
            compressed = deflateSync(text, { level });
            set.headers['Content-Encoding'] = 'deflate';
            break;
          default:
            level = Math.min(9, Math.max(0, level));
            compressed = gzipSync(text, { level });
            set.headers['Content-Encoding'] = 'gzip';
        }

        compressedSize = compressed.length;
        set.headers['Content-Type'] = contentType;
        console.log(`Tamanho original: ${originalSize} bytes`);
        console.log(`Tamanho comprimido (${algorithm}, level ${level}): ${compressedSize} bytes`);
        return compressed;
      } catch (error) {
        console.error('Erro de compressão:', error);
        return Buffer.from(text);
      }
    });
};

new Elysia()
.use(compressionMiddleware({ algorithm: 'brotli', level: 3 }))
.get('/', () => {
  let longMessage = 'Esta é uma mensagem longa para testar a compressão gzip. ';
  longMessage = longMessage.repeat(1000); // Aumente o tamanho dos dados
  return { message: longMessage };
})
  .listen(3000, () => {
    console.log('servidor rodando na porta 3000');
  });