import { autorun, observable, toJS, action } from 'mobx';
import { useEffect, useState } from 'react';
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
  onSubmit: (values: T, context: UseFormState<T>) => void;
  validate?: any;
  validationSchema?: any;
}

interface UseFormState<T> {
  values: T;
  touched: any;
  errors: any;
  isSubmitting: boolean;
  submitError: any;
  currentFocus: string | null;
}

function stringFallback(val: any) {
  return val == null ? '' : val;
}

function booleanFallback(val: any) {
  val = val == null ? false : val;
  if (val === true) return true;
  if (val === false) return false;
  if (val === 'true') return true;
  return false;
}

export function useMobxForm<T extends UseFormKeyVal>(props: UseFormProps<T>) {
  const { initialValues } = props;

  const validate = async (form: UseFormState<T>) => {
    if (props.validate) {
      form.errors = await props.validate(form.values);
    } else if (props.validationSchema) {
      try {
        await props.validationSchema.validate(form.values, { abortEarly: false });
        form.errors = {};
      } catch (err) {
        form.errors = setNestedErrors(err);
        console.log('validate err', form.errors.name);
      }
    }
  };

  const [form] = useState(() =>
    observable(
      {
        values: initialValues,
        touched: {} as any,
        errors: {} as any,
        isSubmitting: false,
        submitError: null as string | null,
        currentFocus: null as string | null,

        get isDirty() {
          for (const [k, v] of Object.entries(this.values)) {
            if (v !== initialValues[k]) return true;
          }
          return false;
        },

        get cantSubmit() {
          return !this.isDirty || this.isSubmitting || this.hasErrors;
        },

        get hasErrors() {
          return !!Object.keys(this.errors).length;
        },

        reset() {
          this.values = { ...initialValues };
        },

        setValue(fieldName: string, value: any) {
          this.values[fieldName] = value;
        },

        setBlur(fieldName: string, value: any = true) {
          if (value) this.currentFocus = null;
          this.touched[fieldName] = value;
        },

        setFocus(fieldName: string, value: any = true) {
          if (value) this.currentFocus = fieldName;
        },

        setSubmitting(value: boolean) {
          this.isSubmitting = value;
        },

        async handleSubmit(event: any) {
          event.preventDefault();
          this.setSubmitting(true);
          this.touched = setNestedObjectValues(this.values, true);
          await validate(this);
          if (!Object.keys(this.errors).length) {
            try {
              await props.onSubmit(toJS(this.values), this);
            } catch (submitError) {
              this.submitError = submitError.message;
            } finally {
              this.setSubmitting(false);
            }
          } else {
            this.setSubmitting(false);
          }
        },

        getBooleanValue(fieldName: string) {
          return booleanFallback(this.values[fieldName]);
        },

        getFieldValue(fieldName: string) {
          return stringFallback(this.values[fieldName]);
        },

        getFieldError(fieldName: string) {
          const { touched, errors } = this;
          return touched[fieldName] ? errors[fieldName] : null;
        },
      },
      {
        handleSubmit: action.bound,
        setValue: action.bound,
        setBlur: action.bound,
        setFocus: action.bound,
        setSubmitting: action.bound,
        reset: action.bound,
      }
    )
  );

  useEffect(() => autorun(() => validate(form)), []);

  return form;
}
