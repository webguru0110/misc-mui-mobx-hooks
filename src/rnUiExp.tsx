import React, { useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  ViewProps,
  TouchableOpacityProps,
  TextProps,
  GestureResponderEvent,
  TextInputProps,
  TextInput,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Modal from 'modal-enhanced-react-native-web';

export const theme = StyleSheet.create({
  buttonView: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'red',
    borderRadius: 4,
  },
  buttonText: {
    fontSize: 14,
    textTransform: 'uppercase',
    color: '#fff',
  },
  buttonViewDisabled: {
    backgroundColor: '#ddd',
  },
  buttonTextDisabled: {
    color: '#eee',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldError: {
    color: 'red',
    paddingVertical: 5,
  },
  fieldLabel: {
    color: '#666',
  },
  textInput: {
    paddingHorizontal: 0,
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: '#ddd',
    outlineStyle: 'none',
  },
  textInputFocused: {
    borderBottomColor: 'green',
  },
  textInputError: {
    borderBottomColor: 'red',
  },
  dialogContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  dialogTitle: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  dialogContent: {
    paddingVertical: 20,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

export const variants = {
  contained: StyleSheet.create({
    buttonView: {
      backgroundColor: 'green',
    },
  }),
  joe: StyleSheet.create({
    buttonView: {
      borderColor: 'orange',
      borderWidth: 5,
    },
  }),
};

interface ButtonProps extends ViewProps {
  onPress?: ((event: GestureResponderEvent) => void) | undefined;
  disabled?: boolean;
  viewProps?: ViewProps;
  touchableOpacityProps?: TouchableOpacityProps;
  textProps?: TextProps;
  children: React.ReactNode | string;
  style?: never;
}

export function Button(props: ButtonProps) {
  return (
    <TouchableOpacity
      {...props.touchableOpacityProps}
      style={props.touchableOpacityProps ? props.touchableOpacityProps.style : null}
      onPress={props.onPress}
      disabled={props.disabled}
    >
      <View
        {...props.viewProps}
        style={[
          theme.buttonView,
          props.disabled ? theme.buttonViewDisabled : null,
          props.viewProps ? props.viewProps.style : null,
        ]}
      >
        {typeof props.children === 'string' ? (
          <Text
            {...props.textProps}
            style={[
              theme.buttonText,
              props.disabled ? theme.buttonTextDisabled : null,
              props.textProps ? props.textProps.style : null,
            ]}
          >
            {props.children}
          </Text>
        ) : (
          props.children
        )}
      </View>
    </TouchableOpacity>
  );
}

interface FieldErrorProps extends TextProps {
  children?: string | undefined | null;
}

export function FieldError(props: FieldErrorProps) {
  return props.children ? <Text {...props} style={[theme.fieldError, props.style]} /> : null;
}

interface TextFieldProps {
  label: string;
  required?: boolean;
  errorMessage?: string;
  hasFocus?: boolean;
  containerProps?: ViewProps;
  textInputProps?: TextInputProps;
  labelProps?: TextProps;
  errorProps?: TextProps;
}

export function TextField(props: TextFieldProps) {
  return (
    <View
      {...props.containerProps}
      style={[theme.fieldContainer, props.containerProps ? props.containerProps.style : null]}
    >
      <Text
        {...props.labelProps}
        style={[theme.fieldLabel, props.labelProps ? props.labelProps.style : null]}
      >
        {props.label}
        {props.required ? ' *' : null}
      </Text>
      <TextInput
        {...props.textInputProps}
        style={[
          theme.textInput,
          props.hasFocus ? theme.textInputFocused : null,
          props.errorMessage ? theme.textInputError : null,
          props.textInputProps ? props.textInputProps.style : null,
        ]}
      />
      <FieldError>{props.errorMessage}</FieldError>
    </View>
  );
}

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export function Dialog(props: DialogProps) {
  return (
    <Modal
      animationType="fade"
      isVisible={props.isOpen}
      onBackdropPress={props.onClose}
      onBackButtonPress={props.onClose}
    >
      <View {...props} style={[theme.dialogContainer, props.style]} />
    </Modal>
  );
}

interface DialogTitleProps extends TextProps {
  children?: React.ReactNode;
}

function DialogTitle(props: DialogTitleProps) {
  return <Text {...props} style={[theme.dialogTitle, props.style]} />;
}

Dialog.Title = DialogTitle;

interface DialogContentProps extends ViewProps {
  children?: React.ReactNode;
}

function DialogContent(props: DialogContentProps) {
  return <View {...props} style={[theme.dialogContent, props.style]} />;
}

Dialog.Content = DialogContent;

interface DialogActionsProps extends ViewProps {
  children?: React.ReactNode;
}

function DialogActions(props: DialogActionsProps) {
  return <View {...props} style={[theme.dialogActions, props.style]} />;
}

Dialog.Actions = DialogActions;

/**
 * Web browsers emulate mouse events (and hover states) after touch events.
 * This code infers when the currently-in-use modality supports hover
 * (including for multi-modality devices) and considers "hover" to be enabled
 * if a mouse movement occurs more than 1 second after the last touch event.
 * This threshold is long enough to account for longer delays between the
 * browser firing touch and mouse events on low-powered devices.
 */
const { canUseDOM } = require('fbjs/lib/ExecutionEnvironment');

let isHoverEnabled = false;
const HOVER_THRESHOLD_MS = 1000;
let lastTouchTimestamp = 0;

function enableHover() {
  if (isHoverEnabled || Date.now() - lastTouchTimestamp < HOVER_THRESHOLD_MS) {
    return;
  }
  isHoverEnabled = true;
}

function disableHover() {
  lastTouchTimestamp = Date.now();
  if (isHoverEnabled) {
    isHoverEnabled = false;
  }
}

if (canUseDOM) {
  document.addEventListener('touchstart', disableHover, true);
  document.addEventListener('touchmove', disableHover, true);
  document.addEventListener('mousemove', enableHover, true);
}

interface HoverableProps {
  children: (isHovered: boolean) => React.ReactNode;
  onHoverIn?: () => any;
  onHoverOut?: () => any;
}

export function Hoverable(props: HoverableProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showHover, setShowHover] = useState(true);

  const onMouseEnter = (e: any) => {
    if (isHoverEnabled && !isHovered) {
      const { onHoverIn } = props;
      if (onHoverIn) onHoverIn();
      setIsHovered(true);
    }
  };

  const onMouseLeave = (e: any) => {
    if (isHovered) {
      const { onHoverOut } = props;
      if (onHoverOut) onHoverOut();
      setIsHovered(false);
    }
  };

  const onResponderGrant = () => {
    setShowHover(false);
  };

  const onResponderRelease = () => {
    setShowHover(true);
  };

  const { children } = props;
  const child = children(showHover && isHovered);

  return React.cloneElement(React.Children.only(child as any), {
    onMouseEnter,
    onMouseLeave,
    // prevent hover showing while responder
    onResponderGrant,
    onResponderRelease,
    // if child is Touchable
    onPressIn: onResponderGrant,
    onPressOut: onResponderRelease,
  });
}
