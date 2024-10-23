import { autorun, observable, toJS } from 'mobx';
import { useRef, useEffect } from 'react';
import * as Yup from 'yup';

const isObject = (obj: any) => obj !== null && typeof obj === 'object';

function setNestedObjectValues(
  object: any,
  value: any,
  visited = new WeakMap(),
  response = {} as any
) {
  for (let k of Object.keys(object)) {
    const val = object[k];
    if (isObject(val)) {
      if (!visited.get(val)) {
        visited.set(val, true);
        // In order to keep array values consistent for both dot path  and
        // bracket syntax, we need to check if this is an array so that
        // this will output  { friends: [true] } and not { friends: { "0": true } }
        response[k] = Array.isArray(val) ? [] : {};
        setNestedObjectValues(val, value, visited, response[k]);
      }
    } else {
      response[k] = value;
    }
  }

  return response;
}

export function setNestedErrors(err: Yup.ValidationError, response = {} as any) {
  const { path, errors, inner } = err;
  if (path && errors && errors[0]) {
    response[path] = errors[0];
  }
  for (const i of inner) {
    setNestedErrors(i, response);
  }

  return response;
}

interface UseFormKeyVal {
  [key: string]: any;
}

interface UseFormProps<T extends UseFormKeyVal> {
  initialValues: T;
  onSubmit: (
    values: T,
    context: {
      state: UseFormState<T>;
      toggleSubmitting: (value: boolean) => void;
    }
  ) => void;
  validate?: any;
  validationSchema?: any;
}

interface UseFormState<T> {
  values: T;
  touched: any;
  errors: any;
  isSubmitting: boolean;
  submitError: any;
}

function stringFallback(val: any) {
  return val == null ? '' : val;
}

export function useMobxForm<T extends UseFormKeyVal>(props: UseFormProps<T>) {
  const { initialValues } = props;

  const ref = useRef((null as any) as UseFormState<T>);
  if (ref.current == null) {
    ref.current = observable({
      values: initialValues,
      touched: {} as any,
      errors: {} as any,
      isSubmitting: false,
      submitError: null,
    });
  }
  const state = ref.current;

  const validate = async () => {
    if (props.validate) {
      state.errors = await props.validate(state.values);
    } else if (props.validationSchema) {
      try {
        await props.validationSchema.validate(state.values, { abortEarly: false });
        state.errors = {};
      } catch (err) {
        state.errors = setNestedErrors(err);
      }
    }
  };

  useEffect(() => autorun(validate), []);

  const handleChange = (fieldName: string) => (event: any) => {
    state.values[fieldName] = event.target.value;
  };

  const handleBlur = (fieldName: string) => (_event: any) => {
    state.touched[fieldName] = true;
  };

  const toggleSubmitting = (value: boolean) => {
    state.isSubmitting = value;
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    toggleSubmitting(true);
    state.touched = setNestedObjectValues(state.values, true);
    validate();
    if (!Object.keys(state.errors).length) {
      try {
        await props.onSubmit(toJS(state.values), { state, toggleSubmitting });
      } catch (submitError) {
        state.submitError = submitError.message;
      } finally {
        toggleSubmitting(false);
      }
    } else {
      toggleSubmitting(false);
    }
  };

  const isDirty = () => {
    for (const [k, v] of Object.entries(state.values)) {
      if (v !== initialValues[k]) return true;
    }
    return false;
  };

  const isSubmitting = () => state.isSubmitting;

  const cantSubmit = () => !isDirty() || isSubmitting() || hasErrors();

  const getSubmitError = () => state.submitError;

  const getFieldProps = (fieldName: string) => ({
    value: stringFallback(state.values[fieldName]),
    onChange: handleChange(fieldName),
    onBlur: handleBlur(fieldName),
  });

  const handleSwitchChange = (fieldName: string) => (event: any) => {
    state.values[fieldName] = event.target.checked;
  };

  const getSwitchProps = (fieldName: string) => ({
    checked: state.values[fieldName] === true,
    onChange: handleSwitchChange(fieldName),
    value: fieldName,
  });

  const getFieldError = (fieldName: string) =>
    state.touched[fieldName] ? state.errors[fieldName] : null;

  const getTextFieldProps = (fieldName: string) => {
    const fieldProps = getFieldProps(fieldName);
    const fieldError = getFieldError(fieldName);
    if (!fieldError) return fieldProps;
    return {
      ...fieldProps,
      helperText: fieldError,
      error: true,
    };
  };

  const hasErrors = () => !!Object.keys(state.errors).length;

  const reset = () => (state.values = { ...initialValues });

  return {
    handleChange,
    handleBlur,
    handleSubmit,
    validate,
    isDirty,
    isSubmitting,
    getFieldProps,
    getTextFieldProps,
    getFieldError,
    getSwitchProps,
    getSubmitError,
    hasErrors,
    cantSubmit,
    state,
    reset,
  };
}
