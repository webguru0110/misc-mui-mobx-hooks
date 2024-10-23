import React, { useState } from 'react';
import { observable, action } from 'mobx';

export function useMobxMUIMenu() {
  return useState(() =>
    observable(
      {
        anchorEl: null as HTMLElement | null,
        handleClick(event: React.MouseEvent<HTMLButtonElement>) {
          this.anchorEl = event.currentTarget;
        },
        handleClose() {
          this.anchorEl = null;
        },
        get menuProps() {
          const { anchorEl, handleClose } = this;
          return {
            anchorEl,
            open: !!anchorEl,
            onClose: handleClose,
          };
        },
      },
      {
        handleClick: action.bound,
        handleClose: action.bound,
      }
    )
  )[0];
}
