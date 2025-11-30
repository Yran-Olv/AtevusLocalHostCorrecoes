import Redis from "ioredis";
import hmacSHA512 from "crypto-js/hmac-sha512";
import Base64 from "crypto-js/enc-base64";
import { REDIS_URI_CONNECTION } from "../config/redis";

/**
 * Singleton para gerenciar cache Redis
 * ioredis já retorna Promises nativamente, não precisa de promisify
 */
class CacheSingleton {
  private redis: Redis;

  private static instance: CacheSingleton;

  private constructor(redisInstance: Redis) {
    this.redis = redisInstance;
  }

  public static getInstance(redisInstance: Redis): CacheSingleton {
    if (!CacheSingleton.instance) {
      CacheSingleton.instance = new CacheSingleton(redisInstance);
    }
    return CacheSingleton.instance;
  }

  private static encryptParams(params: any) {
    const str = JSON.stringify(params);
    const key = Base64.stringify(hmacSHA512(params, str));
    return key;
  }

  /**
   * Define um valor no cache Redis
   * @param key - Chave do cache
   * @param value - Valor a ser armazenado
   * @param option - Opção do Redis (ex: "EX" para TTL)
   * @param optionValue - Valor da opção (ex: segundos para TTL)
   */
  public async set(
    key: string,
    value: string,
    option?: string,
    optionValue?: string | number
  ): Promise<string> {
    // ioredis já retorna Promise, não precisa de promisify
    if (option !== undefined && optionValue !== undefined) {
      return this.redis.set(key, value, option, optionValue);
    }

    return this.redis.set(key, value);
  }

  /**
   * Obtém um valor do cache Redis
   * @param key - Chave do cache
   * @returns Valor armazenado ou null se não existir
   */
  public async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  /**
   * Obtém todas as chaves que correspondem a um padrão
   * @param pattern - Padrão de busca (ex: "sessions:*")
   * @returns Array de chaves encontradas
   */
  public async getKeys(pattern: string): Promise<string[]> {
    return this.redis.keys(pattern);
  }

  /**
   * Remove uma chave do cache Redis
   * @param key - Chave a ser removida
   * @returns Número de chaves removidas
   */
  public async del(key: string): Promise<number> {
    return this.redis.del(key);
  }

  /**
   * Remove todas as chaves que correspondem a um padrão
   * @param pattern - Padrão de busca (ex: "sessions:*")
   */
  public async delFromPattern(pattern: string): Promise<void> {
    const all = await this.getKeys(pattern);
    await Promise.all(all.map(item => this.del(item)));
  }

  /**
   * Define um valor no cache usando parâmetros criptografados como parte da chave
   * Útil para criar chaves únicas baseadas em objetos
   * @param key - Prefixo da chave
   * @param params - Parâmetros a serem criptografados e adicionados à chave
   * @param value - Valor a ser armazenado
   * @param option - Opção do Redis (ex: "EX" para TTL)
   * @param optionValue - Valor da opção (ex: segundos para TTL)
   */
  public async setFromParams(
    key: string,
    params: any,
    value: string,
    option?: string,
    optionValue?: string | number
  ): Promise<string> {
    const finalKey = `${key}:${CacheSingleton.encryptParams(params)}`;
    if (option !== undefined && optionValue !== undefined) {
      return this.set(finalKey, value, option, optionValue);
    }
    return this.set(finalKey, value);
  }

  /**
   * Obtém um valor do cache usando parâmetros criptografados como parte da chave
   * @param key - Prefixo da chave
   * @param params - Parâmetros a serem criptografados e adicionados à chave
   * @returns Valor armazenado ou null se não existir
   */
  public async getFromParams(key: string, params: any): Promise<string | null> {
    const finalKey = `${key}:${CacheSingleton.encryptParams(params)}`;
    return this.get(finalKey);
  }

  /**
   * Remove uma chave do cache usando parâmetros criptografados como parte da chave
   * @param key - Prefixo da chave
   * @param params - Parâmetros a serem criptografados e adicionados à chave
   * @returns Número de chaves removidas
   */
  public async delFromParams(key: string, params: any): Promise<number> {
    const finalKey = `${key}:${CacheSingleton.encryptParams(params)}`;
    return this.del(finalKey);
  }

  public getRedisInstance(): Redis {
    return this.redis;
  }
}

const redisInstance = new Redis(REDIS_URI_CONNECTION);

export default CacheSingleton.getInstance(redisInstance);