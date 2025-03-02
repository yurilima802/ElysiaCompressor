// src/middleware/compression/types.ts

import type { BrotliOptions, ZlibOptions } from "node:zlib";
import type { Context } from "elysia";

export interface Compressor {
  compress(data: string, level: number): Buffer;
  getEncoding(): string;
}

export class MemCache<T> {
  private cache: Map<string | number | bigint, T>;

  constructor(cache: Map<string | number | bigint, T> = new Map()) {
    this.cache = cache;
  }

  set(
    key: string | number | bigint,
    value: T,
    TTL: number = Number.MAX_SAFE_INTEGER,
  ): void {
    this.cache.set(key, value);
    setTimeout(() => this.cache.delete(key), TTL * 1000);
  }

  get(key: string | number | bigint): T | undefined {
    return this.cache.get(key);
  }

  has(key: string | number | bigint): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export interface CompressionOptions {
  algorithm?: string;
  level?: number;
  cacheTTL?: number;
  disableByHeader?: boolean;
  threshold?: number;
  encodings?: string[];
  compressibleTypes?: RegExp;
  useStream?: boolean;
}

export interface ICompressor {
  compress(chunk: Buffer, level: number): Buffer;
}

export interface BrotliCompressorOptions extends BrotliOptions {
  params: {
    [key: number]: number;
  };
}

export interface ZlibCompressorOptions extends ZlibOptions {
  level: number;
}

export type ElysiaContext = Context;
