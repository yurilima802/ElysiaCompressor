import Elysia from 'elysia';
import { gzipSync } from 'bun';

const compressionMiddleware = () => {
  const encoder = new TextEncoder();

  return (app: Elysia) =>
    app.onAfterHandle(async ({ request, set, response }) => {
      // Verifica se a requisição aceita gzip
      if (!request.headers.get('accept-encoding')?.includes('gzip')) {
        return; // Não comprime se o cliente não aceita gzip
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
        return; // Não comprime se a resposta for nula ou indefinida
      }

      const originalSize = encoder.encode(text).length; // Tamanho original

      const compressed = gzipSync(encoder.encode(text));
      const compressedSize = compressed.length; // Tamanho comprimido

      set.headers['Content-Encoding'] = 'gzip';
      set.headers['Content-Type'] = contentType;

      console.log(`Tamanho original: ${originalSize} bytes`);
      console.log(`Tamanho comprimido: ${compressedSize} bytes`);

      // Modificação importante: retorna o body comprimido
      return compressed;
    });
};

new Elysia()
  .use(compressionMiddleware())
  .get('/', () => {
    let longMessage = "Esta é uma mensagem longa para testar a compressão gzip. ";
    longMessage = longMessage.repeat(10); // Repete a mensagem para torná-la maior
    return { message: longMessage };
  })
  .listen(3000, () => {
    console.log('servidor rodando na porta 3000');
  });