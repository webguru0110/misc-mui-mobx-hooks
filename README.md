# @joenoon/misc-mui-mobx-hooks <!-- omit in toc -->

This is a collection of useful hooks when working with [material-ui](https://github.com/mui-org/material-ui) and [mobx-react-hooks](https://github.com/joenoon/mobx-react-hooks).

These hooks can be used directly or as a starting point for creating your own hooks.

```
yarn add @joenoon/misc-mui-mobx-hooks @joenoon/mobx-react-hooks
```

`mobx` and `react` are peer dependencies, so make sure they are installed

- [useMobxForm](#useMobxForm)
- [useMobxDialogControl](#useMobxDialogControl)
- [useMobxMUIMenu](#useMobxMUIMenu)

## useMobxForm

```tsx
import * as Yup from 'yup';
import { useObserver } from '@joenoon/mobx-react-hooks/macro';
import { useMobxForm } from '@joenoon/misc-mui-mobx-hooks';
import { UseMobxDialogControl } from '@joenoon/misc-mui-mobx-hooks';

interface Props {
  dialogControl: UseMobxDialogControl;
  user: {
    email?: string;
    name?: string;
  };
}

export const UserForm: React.FunctionComponent<Props> = props => {
  useObserver();

  const { user } = props;

  const submitToServer = async (values: any): Promise<any> => {
    // actually submit
  };

  const form = useMobxForm({
    initialValues: {
      email: (user && user.email) || '',
      name: (user && user.name) || '',
    },
    onSubmit: async (values, context) => {
      console.log('onSubmit', values, context);
      const res = await submitToServer(values);
      if (res.success) {
        props.dialogControl.close();
      } else if (res.errors) {
        throw new Error(res.errors.join('\n'));
      }
    },
    validationSchema: Yup.object().shape({
      email: Yup.string().required('Email required.'),
      name: Yup.string().required('Name is required.'),
    }),
  });

  return (
    <Dialog {...props.dialogControl.dialogProps} fullWidth>
      <DialogTitle>UserForm</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Email"
          type="email"
          fullWidth
          {...form.getTextFieldProps('email')}
        />
        <TextField
          margin="dense"
          label="Name"
          type="text"
          fullWidth
          {...form.getTextFieldProps('name')}
        />
      </DialogContent>
      <DialogActions>
        <Typography color="error">{form.getSubmitError()}</Typography>
        <Button onClick={props.dialogControl.close}>Cancel</Button>
        <Button
          onClick={form.handleSubmit}
          color="primary"
          variant="contained"
          disabled={form.cantSubmit()}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

## useMobxDialogControl

```tsx
import { useObserver } from '@joenoon/mobx-react-hooks/macro';
import { useMobxDialogControl } from '@joenoon/misc-mui-mobx-hooks';

export const DoSomethingButton: React.FunctionComponent = () => {
  useObserver();
  const dialog = useMobxDialogControl();
  const onComplete = () => {
    // ... do something
    dialog.close();
  };
  return (
    <>
      <Button variant="contained" color="secondary" onClick={dialog.open}>
        Do something?
      </Button>
      <Dialog {...dialog.dialogProps} fullWidth>
        <DialogTitle>Really do something?</DialogTitle>
        <DialogContent>
          <DialogContentText>This cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={dialog.close}>Cancel</Button>
          <Button onClick={onComplete} color="secondary" variant="contained">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
```

## useMobxMUIMenu

```tsx
import { useObserver } from '@joenoon/mobx-react-hooks/macro';
import { useMobxMUIMenu } from '@joenoon/misc-mui-mobx-hooks';

export const IconWithMenu: React.FunctionComponent = () => {
  useObserver();

  const moreMenu = useMobxMUIMenu();

  const onRename = () => {
    // for example: renameDialog.open();
    moreMenu.handleClose();
  };
  const onDelete = () => {
    // for example: deleteDialog.open();
    moreMenu.handleClose();
  };

  return (
    <>
      <IconButton color="default" onClick={moreMenu.handleClick}>
        <MoreVertIcon />
      </IconButton>
      <Menu {...moreMenu.menuProps}>
        <MenuItem onClick={onRename}>Rename</MenuItem>
        <MenuItem onClick={onDelete}>Delete</MenuItem>
      </Menu>
    </>
  );
};
```
