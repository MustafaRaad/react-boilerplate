/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import { useCallback, useState } from "react";

type UseControllableStateProps<T> = {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
};

/**
 * Generic controllable/uncontrollable state hook.
 * Keeps internal state when value is undefined, otherwise mirrors the controlled value.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateProps<T>) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      if (isControlled) {
        const resolved =
          typeof next === "function"
            ? (next as (prev: T) => T)(currentValue as T)
            : next;
        onChange?.(resolved);
        return;
      }

      setInternalValue((prev) => {
        const resolved =
          typeof next === "function"
            ? (next as (prev: T) => T)(prev)
            : next;
        onChange?.(resolved);
        return resolved;
      });
    },
    [currentValue, isControlled, onChange]
  );

  return [currentValue, setValue] as const;
}
