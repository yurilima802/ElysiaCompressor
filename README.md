# Middleware de Compressão para Elysia

Este middleware fornece compressão de resposta para aplicações Elysia, utilizando algoritmos como Brotli, Gzip e Deflate. Ele oferece suporte a compressão em memória e compressão de stream, além de cache para melhorar o desempenho.


## Observação, Para otimizar o desempenho, foi configurado um limite mínimo de 1024 bytes. A compressão de tamanhos menores pode resultar em um aumento do tamanho dos bytes, comprometendo a performance.


## Fluxo de Compressão

O fluxo de compressão é dividido em várias etapas, permitindo flexibilidade e otimização.

### 1. Configuração do Middleware

O middleware é configurado com opções que definem o comportamento da compressão.

**`src/index.ts`:**

```typescript
import Elysia from 'elysia';
import { compression } from './lib/compression/main';

const app = new Elysia()
  .use(
    compression({
      algorithm: 'br',
      level: 5,
      cacheTTL: 60 * 60,
      disableByHeader: true,
      threshold: 512,
      encodings: ['br', 'gzip'],
      compressibleTypes: /^text\/(?!event-stream)|application\/json/u,
      useStream: true,
    })
  )
  .get('/', () => {
    let longMessage = 'This is a long message to test compression. ';
    longMessage = longMessage.repeat(100);
    return { message: longMessage };
  })
  .listen(3000, () => {
    console.log('Server running on port 3000');
  });
```

* **`algorithm`**: Algoritmo de compressão a ser usado (padrão: `gzip`).
* **`level`**: Nível de compressão (padrão: padrão do algoritmo).
* **`cacheTTL`**: Tempo de vida do cache em segundos.
* **`disableByHeader`**: Desativa a compressão se o cabeçalho `x-no-compression` estiver presente.
* **`threshold`**: Tamanho mínimo da resposta para aplicar compressão.
* **`encodings`**: Lista de codificações suportadas.
* **`compressibleTypes`**: Expressão regular para tipos de conteúdo compressíveis.
* **`useStream`**: Habilita compressão de stream.

### 2. Processamento da Requisição

Quando uma requisição é recebida, o middleware verifica se a compressão deve ser aplicada.

**`lib/compression/main`:**

* **`shouldCompress`**: Verifica se a resposta deve ser comprimida com base nas opções e cabeçalhos da requisição.
* **`handleCompression`**: Aplica a compressão à resposta.

### 3. Compressão

A compressão é realizada usando a `CompressorFactory` ou a `StreamCompressorFactory`, dependendo da opção `useStream`.

**`lib/compression/compressor-factory.ts`:**

* Cria instâncias de `BrotliCompressor`, `GzipCompressor` ou `DeflateCompressor` com base no algoritmo especificado.

**`lib/compression/stream-factory.ts`:**

* Cria streams de compressão usando `Transform` e instâncias de `ICompressor`.

**`lib/compression/compressors/`:**

* Implementações dos algoritmos de compressão (Brotli, Gzip, Deflate).

### 4. Cache

O resultado da compressão é armazenado em cache para melhorar o desempenho de requisições subsequentes.

**`lib/compression/cache.ts`:**

* Implementação de um cache em memória usando `Map`.

### 5. Resposta

A resposta comprimida é enviada ao cliente com o cabeçalho `Content-Encoding` apropriado.

## Tipagem

A tipagem é definida em `lib/compression/types.ts` para garantir a consistência e a segurança de tipo do código.

## Implementação de Compressão

* **Compressão em Memória:** Utiliza a `CompressorFactory` para criar instâncias de compressores que processam toda a resposta de uma vez.
* **Compressão de Stream:** Utiliza a `StreamCompressorFactory` para criar streams de compressão que processam a resposta em partes, reduzindo o consumo de memória.

## Como Executar

1.  Clone o repositório.
2.  Instale as dependências com `bun install`.
3.  Execute a aplicação com `bun run dev`.

## Estrutura de Arquivos

```
lib/
    compression/
        compressors/
            brotli-compressor.ts
            deflate-compressor.ts
            gzip-compressor.ts
        index.ts
        cache.ts
        compression-middleware.ts
        compressor-factory.ts
        stream-factory.ts
        types.ts
index.ts
```

## Dependências

* `elysia`
* `node:zlib`
* `stream/promises`

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

