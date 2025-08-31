import { useState, useCallback } from 'react';
import { z } from 'zod';

interface ValidationState<T> {
  data: T;
  errors: Record<keyof T, string[]>;
  isValid: boolean;
  touched: Record<keyof T, boolean>;
}

interface UseValidationOptions<T> {
  schema: z.ZodSchema<T>;
  initialData: T;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export function useValidation<T extends Record<string, unknown>>({
  schema,
  initialData,
  validateOnChange = true,
  validateOnBlur = true,
}: UseValidationOptions<T>) {
  const [state, setState] = useState<ValidationState<T>>({
    data: initialData,
    errors: {} as Record<keyof T, string[]>,
    isValid: false,
    touched: {} as Record<keyof T, boolean>,
  });

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    (field: keyof T, value: unknown): string[] => {
      try {
        // Validate the entire object and extract field-specific errors
        schema.parse({ ...state.data, [field]: value });
        return [];
      } catch (error) {
        if (error instanceof z.ZodError) {
          return error.issues
            .filter(err => err.path.includes(field as string))
            .map(err => err.message);
        }
        return ['Validation error'];
      }
    },
    [schema, state.data]
  );

  /**
   * Validate all fields
   */
  const validateAll = useCallback((): boolean => {
    try {
      schema.parse(state.data);
      setState(prev => ({
        ...prev,
        errors: {} as Record<keyof T, string[]>,
        isValid: true,
      }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<keyof T, string[]> = {} as Record<
          keyof T,
          string[]
        >;

        error.issues.forEach(err => {
          const field = err.path[0] as keyof T;
          if (field) {
            if (!newErrors[field]) {
              newErrors[field] = [];
            }
            newErrors[field].push(err.message);
          }
        });

        setState(prev => ({
          ...prev,
          errors: newErrors,
          isValid: false,
        }));
      }
      return false;
    }
  }, [schema, state.data]);

  /**
   * Update a field value
   */
  const setFieldValue = useCallback(
    (field: keyof T, value: unknown) => {
      setState(prev => {
        const newData = { ...prev.data, [field]: value };
        const newErrors = { ...prev.errors };

        // Clear field errors when value changes
        if (newErrors[field]) {
          delete newErrors[field];
        }

        // Validate field if validateOnChange is enabled
        if (validateOnChange) {
          const fieldErrors = validateField(field, value);
          if (fieldErrors.length > 0) {
            newErrors[field] = fieldErrors;
          }
        }

        return {
          ...prev,
          data: newData,
          errors: newErrors,
          isValid: Object.keys(newErrors).length === 0,
        };
      });
    },
    [validateField, validateOnChange]
  );

  /**
   * Mark a field as touched
   */
  const setFieldTouched = useCallback(
    (field: keyof T, touched: boolean = true) => {
      setState(prev => ({
        ...prev,
        touched: { ...prev.touched, [field]: touched },
      }));

      // Validate field if validateOnBlur is enabled
      if (validateOnBlur && touched) {
        const fieldErrors = validateField(field, state.data[field]);
        setState(prev => ({
          ...prev,
          errors: {
            ...prev.errors,
            [field]: fieldErrors,
          },
        }));
      }
    },
    [validateField, validateOnBlur, state.data]
  );

  /**
   * Update multiple fields at once
   */
  const setFields = useCallback((updates: Partial<T>) => {
    setState(prev => {
      const newData = { ...prev.data, ...updates };
      const newErrors = { ...prev.errors };

      // Clear errors for updated fields
      Object.keys(updates).forEach(key => {
        if (newErrors[key as keyof T]) {
          delete newErrors[key as keyof T];
        }
      });

      return {
        ...prev,
        data: newData,
        errors: newErrors,
      };
    });
  }, []);

  /**
   * Reset form to initial state
   */
  const reset = useCallback(() => {
    setState({
      data: initialData,
      errors: {} as Record<keyof T, string[]>,
      isValid: false,
      touched: {} as Record<keyof T, boolean>,
    });
  }, [initialData]);

  /**
   * Get field error messages
   */
  const getFieldError = useCallback(
    (field: keyof T): string => {
      const errors = state.errors[field];
      return errors && errors.length > 0 ? errors[0] : '';
    },
    [state.errors]
  );

  /**
   * Check if field has errors
   */
  const hasFieldError = useCallback(
    (field: keyof T): boolean => {
      return !!(state.errors[field] && state.errors[field].length > 0);
    },
    [state.errors]
  );

  /**
   * Check if field has been touched
   */
  const isFieldTouched = useCallback(
    (field: keyof T): boolean => {
      return !!state.touched[field];
    },
    [state.touched]
  );

  return {
    // State
    data: state.data,
    errors: state.errors,
    isValid: state.isValid,
    touched: state.touched,

    // Actions
    setFieldValue,
    setFieldTouched,
    setFields,
    validateField,
    validateAll,
    reset,

    // Helpers
    getFieldError,
    hasFieldError,
    isFieldTouched,
  };
}
