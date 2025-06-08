import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { SplitRatioItemDto } from '../split-ratio-item.dto';

@ValidatorConstraint({ name: 'isSplitRatioSum100', async: false })
export class IsSplitRatioSum100Constraint implements ValidatorConstraintInterface {
  validate(splitRatioItems: SplitRatioItemDto[], args: ValidationArguments) {
    if (!splitRatioItems || splitRatioItems.length === 0) {
      return true; // Empty array is valid (e.g., not shared or no default)
    }
    const sum = splitRatioItems.reduce((acc, item) => acc + (item.percentage || 0), 0);
    return sum === 100;
  }

  defaultMessage(args: ValidationArguments) {
    const items = args.value as SplitRatioItemDto[];
    if (items && items.length > 0) {
        const sum = items.reduce((acc, item) => acc + (item.percentage || 0), 0);
        return `The sum of percentages in defaultSplitRatio must be 100 (current sum: ${sum}).`;
    }
    return 'The sum of percentages in defaultSplitRatio must be 100 if the array is not empty.';
  }
}