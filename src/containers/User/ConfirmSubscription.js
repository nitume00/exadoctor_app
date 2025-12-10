/**
 * Subscription Plans
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ListView,
  Alert,
  ScrollView,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as UserActions from '@reduxx/user/actions';
import {connect} from 'react-redux';
import {AppConfig} from '@constants/';
// Consts and Libs
import {AppStyles, AppSizes, AppColors, AppFonts} from '@theme/';
import Strings from '@lib/string.js';
import AppUtil from '@lib/util';
// Components
import {Spacer, Text, Button, LblFormInput} from '@ui/';
import NavComponent from '@components/NavComponent.js';
import Loading from '@components/general/Loading';
import Rave from 'react-native-rave-sdk';
const mapStateToProps = state => {
  return {
    user: state.user.user_data,
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};
const mapDispatchToProps = {
  users: UserActions.users,
  user_subscriptions: UserActions.user_subscriptions,
  payment_gateways: UserActions.payment_gateways,
};
/* Styles ==================================================================== */
const styles = StyleSheet.create({
  background: {
    backgroundColor: AppColors.brand.primary,
    flex: 1,
  },
  logo: {
    width: AppSizes.screen.width * 0.85,
    resizeMode: 'contain',
  },
  whiteText: {
    color: '#FFF',
  },
  input: {
    margin: 15,
    height: 20,
  },
  label: {
    color: '#a8a8aa',
    fontSize: 16,
  },
  inputBlock: {
    borderBottomWidth: 0.3,
    borderBottomColor: '#cecece',
    marginBottom: 20,
  },
});

/* Component ==================================================================== */
class confirmSubscription extends Component {
  static componentName = 'confirmSubscription';
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      nodata: 0,
      userLang: 'en',
      user: props.user ? props.user : '',
      plans: props.plan ? JSON.parse(props.plan) : '',
      pay: 0,
      subscription_details: '',
      is_test_mode: true,
    };
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
    this.onSuccess = this.onSuccess.bind(this);
    this.onFailure = this.onFailure.bind(this);
    this.onClose = this.onClose.bind(this);
    this.placeSubscription.bind(this);
  }

  async componentDidMount() {
    this.site_currency = await AsyncStorage.getItem('CURRENCY_SYMBOL');
    this.site_currency_code = await AsyncStorage.getItem('SITE_CURRENCY_CODE');
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
    this.props
      .payment_gateways()
      .then(resp => {
        if (
          resp &&
          resp.RaveByFlutterwave &&
          resp.RaveByFlutterwave.is_test_mode == 1
        ) {
          this.setState({is_test_mode: true});
        } else if (
          resp &&
          resp.RaveByFlutterwave &&
          resp.RaveByFlutterwave.is_test_mode == 0
        ) {
          this.setState({is_test_mode: false});
        }
      })
      .catch(error => {});
  }
  placeSubscription = () => {
    this.props
      .user_subscriptions({
        post_type: 'POST',
        subscription_id: this.state.plans.id,
        subscription_status_id: 1,
      })
      .then(resp => {
        if (resp.error.code == 0) {
          this.setState({subscription_details: resp.data, pay: 1});
        }
      })
      .catch(() => {
        this.setState({pay: 0});
        console.log('error');
      });
  };
  componentWillUnmount() {
    if (this.props.reload) this.props.reload();
  }
  onSuccess(data) {
    console.log('success', data);
    // You can get the transaction reference from successful transaction charge response returned and handle your transaction verification here
    Actions.pop();
  }

  onFailure(data) {
    Alert.alert(
      '',
      Strings.paymenterror,
      [{text: 'Ok', onPress: () => Actions.pop()}],
      {cancelable: false},
    );
    console.log('error', data);
  }

  onClose() {
    Alert.alert(
      '',
      Strings.paymenterror,
      [{text: 'Ok', onPress: () => Actions.pop()}],
      {cancelable: false},
    );
    //navigate to the desired screen on rave close
  }
  render = () => {
    var subscriptionBlock = [];
    if (this.state.plans !== '') {
      subscriptionBlock.push(
        <View
          style={{
            flex: 1,
            margin: 5,
            padding: 10,
            borderWidth: 1,
            borderColor: AppColors.brand.navbar,
            borderRadius: 10,
          }}>
          <View style={{flexDirection: 'row'}}>
            <Text style={[AppStyles.boldedFontText, {fontSize: 14, flex: 0.5}]}>
              {this.state.plans.name}
            </Text>
            <Text
              style={[
                AppStyles.regularFontText,
                {fontSize: 13, flex: 0.5, textAlign: 'right'},
              ]}>
              <Text style={[AppStyles.boldedFontText, {fontSize: 12}]}>
                {this.site_currency}
                {this.state.plans.price}
              </Text>{' '}
              / {this.state.plans.interval_unit}
            </Text>
          </View>
          <Text
            style={[
              AppStyles.lightFontText,
              {fontSize: 12, flex: 0.5, marginBottom: 10},
            ]}>
            {this.state.plans.description}
          </Text>
          <View Style={{height: 10}} />
          <Button
            style={{
              height: 30,
              padding: 5,
              backgroundColor: AppColors.brand.btnColor,
            }}
            title={Strings.paynow}
            onPress={this.placeSubscription}
            backgroundColor={AppColors.brand.btnColor}
            fontSize={14}
          />
        </View>,
      );
    }
    console.log(
      'hhhh == ' +
        JSON.stringify(this.state.plans) +
        '==' +
        JSON.stringify(this.state.subscription_details),
    );
    return (
      <View>
        <NavComponent backArrow={true} title={Strings.confirmpayment} />
        {this.state.pay == 1 && this.state.subscription_details !== '' ? (
          <Rave
            amount={this.state.plans.price.toString()}
            currency={this.site_currency_code}
            email={this.state.user.email}
            firstname={
              this.state.user.user_profile &&
              this.state.user.user_profile.first_name != ''
                ? this.state.user.user_profile.first_name
                : this.state.user.username
            }
            lastname={
              this.state.user.user_profile &&
              this.state.user.user_profile.last_name != ''
                ? this.state.user.user_profile.last_name
                : this.state.user.username
            }
            publickey="12345678"
            encryptionkey="12345678"
            meta={[{metaname: 'color', metavalue: AppColors.brand.navbar}]}
            production={this.state.is_test_mode}
            paymentplan={this.state.plans.rave_plan_id}
            txref={'user_subscription_id-' + this.state.subscription_details.id}
            onSuccess={res => this.onSuccess(res)}
            onFailure={e => this.onFailure(e)}
            onClose={e => this.onClose(e)}
          />
        ) : (
          <ScrollView style={{flex: 1}}>
            {subscriptionBlock.length ? subscriptionBlock : null}
          </ScrollView>
        )}
      </View>
    );
  };
}

/* Export Component ==================================================================== */
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(confirmSubscription);
