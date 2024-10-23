import { useState } from 'react';
import { observable, action } from 'mobx';

interface UseMobxDialogControlArgs {
  beforeOpen?: any;
  beforeClose?: any;
}

let dialogInstance = 0;

export function useMobxDialogControl(opts?: UseMobxDialogControlArgs) {
  return useState(() =>
    observable(
      {
        isOpen: false,
        counter: 0,
        dialogInstance: dialogInstance += 1,
        async open() {
          if (opts && opts.beforeOpen) await opts.beforeOpen();
          this.isOpen = true;
          this.counter += 1;
        },
        async close() {
          if (opts && opts.beforeClose) await opts.beforeClose();
          this.isOpen = false;
        },
        get key() {
          return `${this.dialogInstance}-${this.counter}`;
        },
        get dialogProps() {
          return {
            key: this.key,
            open: this.isOpen,
            onClose: this.close,
          };
        },
      },
      {
        open: action.bound,
        close: action.bound,
      }
    )
  )[0];
}

export type UseMobxDialogControl = ReturnType<typeof useMobxDialogControl>;
