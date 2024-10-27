import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
@Injectable()
export class UniqueProductsValidator implements ValidatorConstraintInterface {
  validate(products: any[]): boolean {
    if (!Array.isArray(products)) return false;
    const productIds = products.map((product) => product.product_id);
    return productIds.length === new Set(productIds).size;
  }

  defaultMessage(): string {
    return 'Array contains duplicate products.';
  }
}

export function UniqueProducts(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: UniqueProductsValidator,
    });
  };
}
