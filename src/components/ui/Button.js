/**
 * Buttons
 *
     <Button text={'Server is down'} />
 *
 * React Native Starter App
 * https://github.com/mcnamee/react-native-starter-app
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button} from '@rneui/themed';

// Consts and Libs
import {AppColors, AppFonts, AppSizes} from '@theme/';

/* Component ==================================================================== */
class CustomButton extends Component {
  static propTypes = {
    small: PropTypes.bool,
    large: PropTypes.bool,
    outlined: PropTypes.bool,
    backgroundColor: PropTypes.string,
    onPress: PropTypes.func,
    icon: PropTypes.shape({
      name: PropTypes.string,
    }),
  };

  static defaultProps = {
    small: false,
    large: false,
    outlined: false,
    icon: {},
    backgroundColor: null,
    onPress: null,
  };

  buttonProps = () => {
    // Defaults
    const props = {
      title: 'Coming Soon...',
      color: '#fff',
      fontWeight: this.props.fontWeight,
      onPress: this.props.onPress,
      fontFamily: AppFonts.base.family,
      fontSize: AppFonts.base.size,
      borderRadius: 0,
      raised: true,
      buttonStyle: {
        padding: 12,
      },
      containerViewStyle: {
        marginLeft: 0,
        marginRight: 0,
      },
      ...this.props,
      backgroundColor: this.props.backgroundColor || AppColors.brand.primary,
      small: false,
      large: false,
      icon:
        this.props.icon && this.props.icon.name
          ? {
              size: 14,
              ...this.props.icon,
            }
          : null,
    };

    // Overrides
    // Size
    if (this.props.small) {
      props.fontSize = 12;
      props.buttonStyle.padding = 8;

      if (props.icon && props.icon.name) {
        props.icon = {
          size: 14,
          ...props.icon,
        };
      }
    }
    if (this.props.buttonHeight) {
      props.buttonStyle.flex = 1;
    }
    if (this.props.large) {
      props.fontSize = 20;
      props.buttonStyle.padding = 15;

      if (props.icon && props.icon.name) {
        props.icon = {
          size: 20,
          ...props.icon,
        };
      }
    }

    // Outlined
    if (this.props.outlined) {
      props.raised = false;
      props.backgroundColor = this.props.backgroundColor || 'transparent';
      props.color = AppColors.brand.primary;
      props.buttonStyle.borderWidth = this.props.borderWidth;
      props.buttonStyle.borderColor = this.props.borderColor;

      if (props.icon && props.icon.name) {
        props.icon = {
          color: AppColors.brand.primary,
          ...props.icon,
        };
      }
    }

    return props;
  };

  render = () => {
    return (
      <Button
        {...this.buttonProps()}
        buttonStyle={{
          flex: this.props.buttonHeight ? 1 : null,
          backgroundColor: '#364469',
          borderRadius: 0,
        }}
      />
    );
  };
}

/* Export Component ==================================================================== */
export default CustomButton;
