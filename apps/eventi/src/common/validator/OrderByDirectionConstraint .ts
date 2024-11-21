import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: true, name: 'OrderByDirectionConstraint' })
export class OrderByDirectionConstraint
  implements ValidatorConstraintInterface
{
  private whitelist: string[];
  private useWhitelist: boolean;

  constructor(whitelist: string[], useWhitelist: boolean) {
    this.whitelist = whitelist;
    this.useWhitelist = useWhitelist;
  }
  // eslint-disable-next-line
  validate(value: any, args?: ValidationArguments) {
    if (value === undefined) {
      return true;
    }

    if (typeof value !== 'object' || value === null) {
      return false;
    }

    for (const key in value) {
      if (this.useWhitelist && !this.whitelist.includes(key)) {
        return false;
      }

      if (value[key] !== 'ASC' && value[key] !== 'DESC') {
        return false;
      }
    }

    return true;
  }
  // eslint-disable-next-line
  defaultMessage?(args?: ValidationArguments) {
    return `Each value in "orderBy" must be "ASC" or "DESC". ${
      this.useWhitelist ? `Allowed keys are: ${this.whitelist.join(', ')}.` : ''
    }`;
  }
}

export function OrderByDirection(
  whitelist: string[] = [],
  useWhitelist = false,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'OrderByDirection',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [whitelist, useWhitelist],
      validator: new OrderByDirectionConstraint(whitelist, useWhitelist),
    });
  };
}
