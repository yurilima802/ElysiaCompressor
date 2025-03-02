/**
 * Um cache simples em memória
 *
 */
class MemCache<T> {
  constructor(private cache: Map<string | number | bigint, T> = new Map()) {}

  /**
   * Define um valor no cache com a chave especificada e um tempo de vida (TTL) opcional.
   *
   * @param {string | number | bigint} key - A chave para definir o valor.
   * @param {T} value - O valor a ser definido no cache.
   * @param {number} [TTL=Number.MAX_SAFE_INTEGER] - O tempo de vida (em segundos) para o valor no cache.
   * @return {void} Esta função não retorna nada.
   */
  set(
    key: string | number | bigint,
    value: T,
    TTL: number = Number.MAX_SAFE_INTEGER,
  ): void {
    this.cache.set(key, value);
    setTimeout(() => this.cache.delete(key), TTL * 1000);
  }

  /**
   * Obtém um valor do cache com a chave especificada.
   *
   * @param {string | number | bigint} key - A chave para obter o valor do cache.
   * @return {T | undefined} O valor do cache se existir, caso contrário `undefined`.
   */
  get(key: string | number | bigint): T | undefined {
    return this.cache.get(key);
  }

  /**
   * Verifica se um valor existe no cache com a chave especificada.
   *
   * @param {string | number | bigint} key - A chave a ser verificada no cache.
   * @return {boolean} `true` se o valor existir no cache, `false` caso contrário.
   */
  has(key: string | number | bigint): boolean {
    return this.cache.has(key);
  }

  /**
   * Remove todos os valores do cache.
   *
   * @return {void} Esta função não retorna nada.
   */
  clear(): void {
    this.cache.clear();
  }
}

const memCache = new MemCache<Buffer>();

export default memCache;
