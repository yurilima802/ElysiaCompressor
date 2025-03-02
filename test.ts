import Elysia from 'elysia';
import { compression } from './lib/compression/main'

interface Product {
  id: number;
  title: string;
  content: string;
}

const products: Product[] = [];

for (let i = 0; i < 0; i++) {
  products.push({ id: i + 1, title: "Produto de Teste", content: "Conteúdo de Teste" });
}


const app = new Elysia()
  .use(
    compression({
      algorithm: 'br',
      level: 5,
      cacheTTL: 60 * 60, // 1 hour
      disableByHeader: true,
      threshold: 10,
      encodings: ['br', 'gzip'],
      compressibleTypes: /^text\/(?!event-stream)|application\/json/u,
      //useStream: true, // Enable stream compression

    })
  ).get('/', () => {
    let longMessage = 'Esta é uma mensagem longa para testar a compressão gzip. ';
    longMessage = longMessage.repeat(1000);
    return { message: longMessage };
  })

  .get("/products", () => {
    return products;
  })

  .listen(3000, () => {
    console.log('servidor rodando na porta 3000');
  });