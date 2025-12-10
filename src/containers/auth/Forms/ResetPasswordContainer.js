import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View, Image, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as UserActions from '@reduxx/user/actions';
import {Actions} from 'react-native-router-flux';
import {connect} from 'react-redux';
import {AppConfig} from '@constants/';
import Loading from '@components/general/Loading';
import Strings from '@lib/string.js';
import NavComponent from '@components/NavComponent.js';
// Consts and Libs
import {AppStyles, AppSizes, AppColors} from '@theme/';
// Components
import {Spacer, Text, Button, Card, FormInput, LblFormInput} from '@ui/';
import AppUtils from '@lib/util.js';
const mapStateToProps = () => ({});
const mapDispatchToProps = {
  forgot_password: UserActions.forgot_password,
};

/* Styles ====================================================================  */
const styles = StyleSheet.create({
  background: {
    backgroundColor: AppColors.brand.white,
    flex: 1,
  },
  col: {
    width: AppSizes.screen.width / 2 - 10,
  },
  header: {
    fontWeight: 'bold',
    fontSize: 12,
  },

  headerGrey: {
    fontSize: 12,
    color: '#ada8a8',
  },
  normalText11: {
    fontWeight: 'normal',
    fontSize: 11,
  },
  logo: {
    width: AppSizes.screen.width * 0.85,
    resizeMode: 'contain',
  },
  whiteText: {
    color: '#FFF',
  },
  col: {
    width: AppSizes.screen.width / 2 - 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

/* Component ==================================================================== */
class ResetPassword extends Component {
  static componentName = 'ResetPassword';
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      loading: false,
    };
    if (this.props.logout) this.logOut();
  }
  changePassword = () => {
    var email = this.state.email;
    email = email.trim();
    if (email == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.enteryouremail,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (AppUtils.validateEmail(email)) {
      var payload = {email: email};
      this.setState({loading: true});
      this.props
        .forgot_password(payload)
        .then(resp => {
          if (resp.error) {
            var p = resp.error.code;
            if (p == 0) {
              p = Strings.pwdsentsuccessfully;
            } else {
              p = Strings.pwderror;
            }

            Alert.alert(
              AppConfig.appName,
              p,
              [{text: 'OK', onPress: () => Actions.pop()}],
              {cancelable: false},
            );
          } else {
            Alert.alert(
              AppConfig.appName,
              Strings.error,
              [{text: 'OK', onPress: () => console.log('OK Pressed')}],
              {cancelable: false},
            );
          }
        })
        .catch(() => {
          console.log('error');
        });
    } else {
      Alert.alert(
        AppConfig.appName,
        Strings.entervalidemail,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    }
  };
  render = () => (
    <View style={[styles.background]}>
      <NavComponent backArrow={true} title={Strings.forgotpassword} />
      <View>
        <Text style={{padding: 20}}>{Strings.passphrase}</Text>
        <View style={{height: 140, margin: 10}}>
          <View style={{flex: 0.9, backgroundColor: 'transparent'}}>
            <LblFormInput
              value={this.state.email}
              lblText={false}
              height={60}
              placeholderTxt={Strings.enteryouremail}
              lblTxt={Strings.enteryouremail}
              select_opt={false}
              onChangeText={text => {
                this.setState({email: text});
              }}
            />
          </View>
          <Button
            title={Strings.submit}
            backgroundColor={AppColors.brand.btnColor}
            onPress={this.changePassword}
            textStyle={{color: '#FFFFFF'}}
            borderRadius={50}
            fontSize={15}
            buttonStyle={{padding: 14}}
            outlined
          />
        </View>
      </View>
      {this.state.loading ? (
        <View style={AppStyles.LoaderStyle}>
          <Loading color={AppColors.brand.primary} />
        </View>
      ) : null}
    </View>
  );
}

/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword);
