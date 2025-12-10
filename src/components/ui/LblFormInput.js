/**
 * Input Screen
 *
 *
 */
import React, {Component} from 'react';
import {View, Image, Text, TextInput} from 'react-native';
import Strings from '@lib/string.js';
import PropTypes from 'prop-types';
// Consts and Libs
import {AppStyles, AppSizes, AppColors, AppFonts} from '@theme/';
// Components
import {FormInput} from '@ui/';
import {Icon} from '@rneui/themed';

/* Component ==================================================================== */
class LblFormInput extends Component {
  static componentName = 'LblFormInput';
  constructor(props) {
    super(props);
  }
  static propTypes = {
    color: PropTypes.string,
    textAlign: PropTypes.string,
    color: PropTypes.string,
    type: PropTypes.string,
    placeholderTextColor: PropTypes.string,
    style: PropTypes.oneOfType([PropTypes.array, PropTypes.shape({})]),
    textStyle: PropTypes.oneOfType([PropTypes.array, PropTypes.shape({})]),
  };
  static defaultProps = {
    style: {},
    textStyle: {},
    color: 'white',
    type: 'text',
    textAlign: 'center',
    placeholderTextColor: '#ececec',
  };
  render = () => {
    const {
      style,
      color,
      textAlign,
      textStyle,
      type,
      placeholderTextColor,
      ...textProps
    } = this.props;
    var textStyleLocal = new Array();

    textStyleLocal.push({
      color: AppColors.brand.txtinputcolor,
      fontFamily: AppFonts.base.family,
      paddingLeft: 10,
      paddingRight: 0,
      paddingTop: 15,
      paddingBottom: 10,
      margin: 0,
      fontSize: 14,
    });

    if (this.props.textAlignVertical)
      textStyleLocal.push({textAlignVertical: this.props.textAlignVertical});
    if (this.props.background)
      textStyleLocal.push({backgroundColor: AppColors.brand.secondary});
    if (this.props.width) textStyleLocal.push({width: this.props.width});
    var multiline = false;
    if (this.props.multiline) multiline = this.props.multiline;
    var numberOfLines = 1;
    if (this.props.numberOfLines) numberOfLines = this.props.numberOfLines;
    var placeholdercolor = AppColors.brand.txtplaceholder;
    console.log('placeholdercolor dd' + AppColors.brand.txtplaceholder);
    if (this.props.placeholdercolor) {
      console.log('placeholdercolor 111 ' + this.props.placeholdercolor);
      placeholdercolor = this.props.placeholdercolor;
    }

    console.log('placeholdercolor ' + placeholdercolor);
    var height = 60;
    if (this.props.height) height = this.props.height;
    var editable = true;
    if (this.props.editable == false) editable = false;

    var value = '';
    if (this.props.value) value = this.props.value + '';
    var select_opt = 0;
    if (this.props.select_opt) select_opt = 1;

    var reg_image = null;
    if (this.props.reg_image) {
      if (this.props.reg_image == 'regname')
        reg_image = require('@images/regname.png');
      else if (this.props.reg_image == 'regpassword')
        reg_image = require('@images/regpassword.png');
      else if (this.props.reg_image == 'regemail')
        reg_image = require('@images/regemail.png');
      else if (this.props.reg_image == 'reglanguage')
        reg_image = require('@images/reglanguage.png');
      else if (this.props.reg_image == 'regspeciality')
        reg_image = require('@images/regspeciality.png');
      else if (this.props.reg_image == 'regpincode')
        reg_image = require('@images/regpincode.png');
    }
    var autoCapitalize = 'none';
    if (this.props.autoCapitalize) autoCapitalize = this.props.autoCapitalize;
    var underlineColor = AppColors.brand.black;
    if (this.props.underline == false) underlineColor = 'transparent';

    return (
      <View style={[style, {height: height}]}>
        {this.props.lblText ? (
          <Text
            style={[
              {color: AppColors.brand.black, fontSize: 14},
              AppStyles.regularFontText,
            ]}>
            {this.props.lblTxt}:
          </Text>
        ) : null}
        <View style={{flexDirection: 'row'}}>
          {reg_image ? (
            <View
              style={{
                flex: 0.1,
                justifyContent: 'center',
                alignItems: 'center',
                borderBottomWidth: 0.3,
                borderColor: AppColors.brand.black,
              }}>
              <Image
                source={reg_image}
                style={{
                  margin: 0,
                  padding: 0,
                  height: 40,
                  width: 40,
                  resizeMode: 'contain',
                }}
              />
            </View>
          ) : null}
          <View
            style={{
              flex: 1,
              borderBottomWidth: 0.3,
              borderColor: underlineColor,
            }}>
            <TextInput
              placeholderTextColor={placeholdercolor}
              style={textStyleLocal}
              editable={editable}
              value={value}
              keyboardType={
                this.props.keyboardType ? this.props.keyboardType : 'default'
              }
              placeholder={this.props.placeholderTxt}
              autoCapitalize={autoCapitalize}
              underlineColorAndroid={'transparent'}
              numberOfLines={numberOfLines}
              multiline={multiline}
              autoCorrect={false}
              {...textProps}
            />
          </View>
          {select_opt ? (
            <View
              style={{
                flex: 0.1,
                justifyContent: 'center',
                alignItems: 'center',
                borderBottomWidth: 0.3,
                borderColor: AppColors.brand.black,
                paddingRight: 10,
              }}>
              <Image
                source={require('@images/down_arrow.png')}
                style={{marginTop: 5}}
              />
            </View>
          ) : null}
        </View>
      </View>
    );
  };
}

/* Export Component ==================================================================== */
export default LblFormInput;
