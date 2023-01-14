## Description
Is simple util who can change object key names by case strategy. For example, your yml config uses `snake case` but you need a javascript object with keys in the `lower camel case`. It is this simple functionality give this package!

## Installation

```bash
$ npm i --save object-case-builder
```

## Examples
### `snake-case` to `lower camel case`
```ts
import {
  ObjectCaseBuilder,
  PropertyNamingStrategyEnum,
} from 'object-case-builder';

const input: object = {
  'max_users_count': 1,
  'auth_secret_token': 'SECRET TOKEN',
  'credit_card_number': 00000000000000,
}

const output: object = new ObjectCaseBuilder()
  .setPropertyNamingStrategy(PropertyNamingStrategyEnum.LOWER_CAMEL_CASE)
  .formatObject(
    input,
    PropertyNamingStrategyEnum.SNAKE_CASE
  );

console.log(output);

/* console output
{
  maxUsersCount: 1,
  authSecretToken: 'SECRET TOKEN',
  creditCardNumber: 00000000000000
}
*/
```

### `kebab-case` to `screaming-snake-case`
```ts
import {
  ObjectCaseBuilder,
  PropertyNamingStrategyEnum,
} from 'object-case-builder';

const input: object = {
  'message-content': 'test',
  'timestamp': 1673698827991,
  'author-name': 'nikyoff',
}

const output: object = new ObjectCaseBuilder()
  .setPropertyNamingStrategy(PropertyNamingStrategyEnum.SCREAMING_SNAKE_CASE)
  .formatObject(
    input,
    PropertyNamingStrategyEnum.KEBAB_CASE
  );

console.log(output);

/* console output
{
  'MESSAGE_CONTENT': 'test',
  'TIMESTAMP': 1673698827991,
  'AUTHOR_NAME': 'nikyoff',
}
*/
```

### Build class output
Sometime you need transform your output to class and thats possible!


```ts
//message-data.ts
import { Expose, Transform } from "class-transformer";

export class MessageData {
  @Expose()
  @Transform(params => params.value instanceof Date ? params.value : new Date(params.value))
  public createTimestamp: Date;

  @Expose()
  public messageContent: string;
}
```

```ts
import {
  ObjectCaseBuilder,
  PropertyNamingStrategyEnum,
} from 'object-case-builder';
import { MessageData } from './message-data'


const input: object = {
  'create_timestamp': 1673698827991,
  'message-content': 'test',
}

const output: MessageData = new ObjectCaseBuilder<MessageData>()
  .setPropertyNamingStrategy(PropertyNamingStrategyEnum.LOWER_CAMEL_CASE)
  .formatObject(
    input,
    PropertyNamingStrategyEnum.SNAKE_CASE,
    MessageData
  );
```

### Register custom case
#### Implement class for your case
```ts
//screaming-snake.property-naming-strategy.ts
export class ScreamingSnakePropertyNamingStrategy extends PropertyNamingStrategy {
  public propertyNameToWords(property: string): string[] {
    return property.split('_');
  }

  public wordsToPropertyName(words: string[]): string {
    return words.join('_').toUpperCase();
  }
}
```

#### Register strategy

```ts
import { PropertyNamingRegister } from 'object-case-builder';
import { ScreamingSnakePropertyNamingStrategy } from './screaming-snake.property-naming-strategy';

PropertyNamingRegister.registerStrategy(
  'SCREAMING_SNAKE_CASE',
  ScreamingSnakePropertyNamingStrategy,
);
```
