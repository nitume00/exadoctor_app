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
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Actions} from 'react-native-router-flux';
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

const mapStateToProps = state => {
  return {
    user: state.user.user_data,
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};
const mapDispatchToProps = {
  users: UserActions.users,
  subscriptions: UserActions.subscriptions,
  user_subscriptions: UserActions.user_subscriptions,
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
class subscription extends Component {
  static componentName = 'subscription';
  constructor(props) {
    super(props);
    this.callInvoked = 0;
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
    this.state = {
      loading: false,
      nodata: 0,
      userLang: 'en',
      user: props.user ? props.user : '',
      plans: '',
      user_subscriptions: '',
      close_banner: 0,
    };
  }
  async componentDidMount() {
    this.site_currency = await AsyncStorage.getItem('CURRENCY_SYMBOL');
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
    AsyncStorage.getItem('close_banner').then(value => {
      this.setState({close_banner: value});
    });
    this.props
      .subscriptions()
      .then(resp => {
        if (resp.error.code == 0 && resp.data.length) {
          this.setState({plans: resp.data});
        }
      })
      .catch(() => {
        this.setState({loading: false});
        console.log('error');
      });
    this.func_user_subscriptions();
  }
  func_user_subscriptions() {
    this.props
      .user_subscriptions({filter: '{"where":{"subscription_status_id":2}}'})
      .then(resp => {
        if (resp.error.code == 0 && resp.data.length) {
          this.setState({user_subscriptions: resp.data});
        }
      })
      .catch(error => {
        console.log('error r ' + JSON.stringify(error));
      });
  }
  cancel = id => {
    Alert.alert(
      '',
      Strings.areyousurewanttocancelsubscription,
      [
        {
          text: 'Ok',
          onPress: () => {
            this.props
              .user_subscriptions({
                post_type: 'PUT',
                id: id,
                subscription_status_id: 3,
              })
              .then(resp => {
                console.log('error resp' + JSON.stringify(resp));
                if (resp.error.code == 0) {
                  this.setState({user_subscriptions: ''});
                }
              })
              .catch(error => {
                console.log('error' + JSON.stringify(error));
              });
          },
        },
        {text: 'Cancel', onPress: () => {}},
      ],
      {cancelable: false},
    );
  };

  reload = () => {
    this.func_user_subscriptions();
  };

  closeBanner = () => {
    this.setState({close_banner: 1});
    AsyncStorage.setItem('close_banner', '1');
    Actions.pop();
  };

  componentWillUnmount() {
    if (this.props.reloadBanner) this.props.reloadBanner();
  }

  render = () => {
    let subscriptionBlock = [];
    let subscribedText = '';
    console.log('data=== rrr' + JSON.stringify(this.state.user_subscriptions));
    if (this.state.plans !== '') {
      for (let j = 0; j < this.state.plans.length; j++) {
        let planData = JSON.stringify(this.state.plans[j]);
        if (
          this.state.user_subscriptions &&
          this.state.user_subscriptions[0] &&
          this.state.plans[j].id ==
            this.state.user_subscriptions[0].subscription_id
        ) {
          var that = this;
          subscriptionBlock.push(
            <View
              style={{
                flex: 1,
                margin: 5,
                padding: 10,
                borderWidth: 1,
                borderColor: AppColors.brand.navbar,
                borderRadius: 10,
              }}
              key={j}>
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={[AppStyles.boldedFontText, {fontSize: 14, flex: 0.5}]}>
                  {this.state.plans[j].name}
                </Text>
                <Text
                  style={[
                    AppStyles.regularFontText,
                    {fontSize: 13, flex: 0.5, textAlign: 'right'},
                  ]}>
                  <Text style={[AppStyles.boldedFontText, {fontSize: 12}]}>
                    {this.site_currency}
                    {this.state.plans[j].price}
                  </Text>{' '}
                  / {this.state.plans[j].interval_unit}
                </Text>
              </View>
              <Text
                style={[AppStyles.lightFontText, {fontSize: 12, flex: 0.5}]}>
                {this.state.plans[j].description}
              </Text>
              <Button
                style={{
                  height: 30,
                  padding: 5,
                  paddingTop: 10,
                  backgroundColor: AppColors.brand.btnColor,
                }}
                title={Strings.cancel}
                onPress={that.cancel.bind(
                  that,
                  this.state.user_subscriptions[0].id,
                )}
                backgroundColor={AppColors.brand.red}
                fontSize={14}
              />
            </View>,
          );
        } else {
          subscriptionBlock.push(
            <View
              style={{
                flex: 1,
                margin: 5,
                padding: 10,
                borderWidth: 1,
                borderColor: AppColors.brand.navbar,
                borderRadius: 10,
              }}
              key={j}>
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={[AppStyles.boldedFontText, {fontSize: 14, flex: 0.5}]}>
                  {this.state.plans[j].name}
                </Text>
                <Text
                  style={[
                    AppStyles.regularFontText,
                    {fontSize: 13, flex: 0.5, textAlign: 'right'},
                  ]}>
                  <Text style={[AppStyles.boldedFontText, {fontSize: 12}]}>
                    {this.site_currency}
                    {this.state.plans[j].price}
                  </Text>{' '}
                  / {this.state.plans[j].interval_unit}
                </Text>
              </View>
              <Text
                style={[AppStyles.lightFontText, {fontSize: 12, flex: 0.5}]}>
                {this.state.plans[j].description}
              </Text>
              <Button
                style={{
                  height: 30,
                  padding: 5,
                  paddingTop: 10,
                  backgroundColor: AppColors.brand.btnColor,
                }}
                title={Strings.select}
                onPress={() => {
                  Actions.confirmsubscription({
                    plan: planData,
                    reload: this.reload,
                  });
                }}
                backgroundColor={AppColors.brand.btnColor}
                fontSize={14}
              />
            </View>,
          );
        }
      }
    }
    if (
      this.state.user_subscriptions !== '' &&
      this.state.user_subscriptions[0]
    ) {
      subscribedText = Strings.alreadysubscribed;
      subscribedText = subscribedText.replace(
        '##PLAN##',
        this.state.user_subscriptions[0].subscription.name,
      );
    } else {
      subscribedText = Strings.noplanssubscribed;
    }
    return (
      <View style={[styles.background]}>
        <NavComponent backArrow={true} title={Strings.subscriptionplans} />
        <ScrollView style={{flex: 1}}>
          {subscribedText !== '' ? (
            <View
              style={{
                padding: 20,
                borderColor: AppColors.brand.alertborder,
                backgroundColor: AppColors.brand.alertbg,
              }}>
              <Text
                style={[
                  AppStyles.regularFontText,
                  {fontSize: 12, color: AppColors.brand.alerttext},
                ]}>
                {subscribedText}{' '}
                <Text
                  onPress={this.closeBanner}
                  style={[
                    AppStyles.regularFontText,
                    {
                      marginLeft: 15,
                      fontSize: 12,
                      color: AppColors.brand.navbar,
                      textDecorationLine: 'underline',
                      fontStyle: 'italic',
                    },
                  ]}>
                  {this.state.close_banner == 0 ? Strings.iwillpaylater : null}
                </Text>
              </Text>
            </View>
          ) : null}
          {subscriptionBlock.length ? subscriptionBlock : null}
        </ScrollView>
        {this.state.loading ? (
          <View style={AppStyles.LoaderStyle}>
            <Loading color={AppColors.brand.primary} />
          </View>
        ) : null}
      </View>
    );
  };
}

/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps)(subscription);
