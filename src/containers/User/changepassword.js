import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ListView,
} from 'react-native';
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

const mapStateToProps = state => ({
  locale_en: state.user.locale_en,
  locale_fr: state.user.locale_fr,
});
const mapDispatchToProps = {
  change_password: UserActions.change_password,
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
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
    this.state = {
      current_password: '',
      new_password: '',
      verify_password: '',
      loading: false,
      user_id: '',
    };
    AsyncStorage.getItem('user_id').then(value => {
      this.setState({user_id: value});
    });
  }
  componentDidMount() {
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
  }
  changePassword = () => {
    var current_password = this.state.current_password;
    current_password = current_password.trim();

    var new_password = this.state.new_password;
    new_password = new_password.trim();

    var verify_password = this.state.verify_password;
    verify_password = verify_password.trim();

    if (current_password == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.entercurrentpassword,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (current_password.length < 6) {
      Alert.alert(
        AppConfig.appName,
        Strings.minlenghtpwd,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (new_password == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.enternewpassword,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (new_password.length < 6) {
      Alert.alert(
        AppConfig.appName,
        Strings.minlenghtnpwd,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (verify_password == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.retypeyourpassword,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (verify_password.length < 6) {
      Alert.alert(
        AppConfig.appName,
        Strings.minlenghtcpwd,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (verify_password != new_password) {
      Alert.alert(
        AppConfig.appName,
        Strings.passwordrmismatch,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else {
      var payload = {
        old_password: this.state.current_password,
        password: this.state.new_password,
        confirm_password: this.state.new_password,
        user_id: this.state.user_id,
      };
      this.setState({loading: true});
      this.props
        .change_password(payload)
        .then(resp => {
          this.setState({loading: false});
          if (resp.error) {
            Alert.alert(
              AppConfig.appName,
              resp.error.message,
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
    }
  };
  render = () => (
    <View style={[styles.background]}>
      <NavComponent backArrow={true} title={Strings.changepassword} />
      <View>
        <View style={{height: 280, margin: 10}}>
          <View style={{flex: 0.9, backgroundColor: 'transparent'}}>
            <LblFormInput
              secureTextEntry={true}
              value={this.state.current_password}
              lblText={false}
              height={60}
              placeholderTxt={Strings.currentpassword}
              lblTxt={Strings.currentpassword}
              select_opt={false}
              onChangeText={text => {
                this.setState({current_password: text});
              }}
            />
            <LblFormInput
              secureTextEntry={true}
              value={this.state.new_password}
              lblText={false}
              height={60}
              placeholderTxt={Strings.newpassword}
              lblTxt={Strings.newpassword}
              select_opt={false}
              onChangeText={text => {
                this.setState({new_password: text});
              }}
            />
            <LblFormInput
              secureTextEntry={true}
              value={this.state.verify_password}
              lblText={false}
              height={60}
              placeholderTxt={Strings.repassword}
              lblTxt={Strings.repassword}
              select_opt={false}
              onChangeText={text => {
                this.setState({verify_password: text});
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
