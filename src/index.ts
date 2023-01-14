import { Type } from './class-ref.type';
import { plainToInstance } from 'class-transformer';

export enum PropertyNamingStrategyEnum {
  /**
   * Example: some_variable_name
   * */
  SNAKE_CASE = 'SNAKE_CASE',
  /**
   * Example: SOME_VARIABLE_NAME
   * */
  SCREAMING_SNAKE_CASE = 'SCREAMING_SNAKE_CASE',
  /**
   * Example: some-variable-name
   * */
  KEBAB_CASE = 'KEBAB_CASE',
  /**
   * Example: SomeVariableName
   * */
  CAMEL_CASE = 'CAMEL_CASE',
  /**
   * Example: someVariableName
   * */
  LOWER_CAMEL_CASE = 'LOWER_CAMEL_CASE',
}

export abstract class PropertyNamingStrategy {
  public abstract propertyNameToWords(property: string): string[];
  public abstract wordsToPropertyName(words: string[]): string;
}

export class SnakePropertyNamingStrategy extends PropertyNamingStrategy {
  public propertyNameToWords(property: string): string[] {
    return property.split('_');
  }

  public wordsToPropertyName(words: string[]): string {
    return words.join('_').toLowerCase();
  }
}

export class ScreamingSnakePropertyNamingStrategy extends PropertyNamingStrategy {
  public propertyNameToWords(property: string): string[] {
    return property.split('_');
  }

  public wordsToPropertyName(words: string[]): string {
    return words.join('_').toUpperCase();
  }
}

export class KebabPropertyNamingStrategy extends PropertyNamingStrategy {
  public propertyNameToWords(property: string): string[] {
    return property.split('-');
  }

  public wordsToPropertyName(words: string[]): string {
    return words.join('-').toLowerCase();
  }
}

export class CamelPropertyNamingStrategy extends PropertyNamingStrategy {
  public propertyNameToWords(property: string): string[] {
    const result: string[] = [];
    let point = 0;

    for (let index = 0; index < property.length; index++) {
      if (!isUpperCase(property[index])) {
        continue;
      }

      result.push(property.substring(point, index));
      point = index;
    }

    result.push(property.substring(point, property.length));

    return result;
  }

  public wordsToPropertyName(words: string[]): string {
    return words
      .map((value) => replaceAt(value, 0, value[0].toUpperCase()))
      .join('');
  }
}

export class LowerCamelPropertyNamingStrategy extends CamelPropertyNamingStrategy {
  public override wordsToPropertyName(words: string[]): string {
    return words
      .map((value, index) =>
        replaceAt(
          value,
          0,
          index === 0 ? value[0].toLowerCase() : value[0].toUpperCase(),
        ),
      )
      .join('');
  }
}

export class PropertyNamingRegister {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  private static REGISTER_LIST: Map<string, Type<PropertyNamingStrategy>> =
    new Map<string, Type<PropertyNamingStrategy>>();

  public static registerStrategy(
    strategy: string,
    classRef: Type<PropertyNamingStrategy>,
  ): void {
    if (PropertyNamingRegister.REGISTER_LIST.has(strategy)) {
      throw new Error(`Strategy (${strategy}) - already exist!`);
    }

    PropertyNamingRegister.REGISTER_LIST.set(strategy, classRef);
  }

  public static getStrategy(
    strategy: string | PropertyNamingStrategyEnum,
  ): PropertyNamingStrategy {
    if (!PropertyNamingRegister.REGISTER_LIST.has(strategy)) {
      throw new Error(`Strategy (${strategy}) - not registered`);
    }

    const classRef = PropertyNamingRegister.REGISTER_LIST.get(strategy);

    return new classRef();
  }
}

export class ObjectCaseBuilder {
  protected strategy: string = PropertyNamingStrategyEnum.LOWER_CAMEL_CASE;

  public getPropertyNamingStrategy(): string {
    return this.strategy;
  }

  public setPropertyNamingStrategy(strategy: string): ObjectCaseBuilder {
    this.strategy = strategy;

    return this;
  }

  public formatObject<T extends object = object>(
    json: string | object,
    currentStrategy: string | PropertyNamingStrategyEnum,
    classRef?: Type<T>,
  ): T {
    const jsonObject: object = json instanceof Object ? json : JSON.parse(json);
    const result: object = {};

    const jsonObjectKeys = Object.keys(jsonObject);

    for (const key of jsonObjectKeys) {
      const words: string[] =
        PropertyNamingRegister.getStrategy(currentStrategy).propertyNameToWords(
          key,
        );

      result[
        PropertyNamingRegister.getStrategy(this.strategy).wordsToPropertyName(
          words,
        )
      ] =
        jsonObject[key] instanceof Object
          ? this.formatObject(jsonObject[key], currentStrategy)
          : jsonObject[key];
    }

    return classRef ? plainToInstance(classRef, result) : (result as T);
  }

  public formatJson(
    json: string | object,
    currentStrategy: string | PropertyNamingStrategyEnum,
  ): string {
    return JSON.stringify(this.formatObject(json, currentStrategy));
  }

  public write<T extends object>(
    json: string,
    classRef: Type<T>,
    currentStrategy: string | PropertyNamingStrategyEnum,
  ): T {
    const instance = new classRef();
    const object = this.formatObject(json, currentStrategy);

    return Object.assign(instance, object);
  }

  public read<T extends object>(
    instance: T,
    currentStrategy: string | PropertyNamingStrategyEnum,
  ): string {
    return this.formatJson(instance, currentStrategy);
  }
}

export function isUpperCase(char: string): boolean {
  return char === char.toUpperCase();
}

export function isLowerCase(char: string): boolean {
  return char === char.toLowerCase();
}

export function replaceAt(
  value: string,
  index: number,
  replacement: string,
): string {
  return `${value.substring(0, index)}${replacement}${value.substring(
    index + replacement.length,
  )}`;
}

PropertyNamingRegister.registerStrategy(
  PropertyNamingStrategyEnum.SNAKE_CASE,
  SnakePropertyNamingStrategy,
);
PropertyNamingRegister.registerStrategy(
  PropertyNamingStrategyEnum.SCREAMING_SNAKE_CASE,
  ScreamingSnakePropertyNamingStrategy,
);
PropertyNamingRegister.registerStrategy(
  PropertyNamingStrategyEnum.KEBAB_CASE,
  KebabPropertyNamingStrategy,
);
PropertyNamingRegister.registerStrategy(
  PropertyNamingStrategyEnum.CAMEL_CASE,
  CamelPropertyNamingStrategy,
);
PropertyNamingRegister.registerStrategy(
  PropertyNamingStrategyEnum.LOWER_CAMEL_CASE,
  LowerCamelPropertyNamingStrategy,
);
