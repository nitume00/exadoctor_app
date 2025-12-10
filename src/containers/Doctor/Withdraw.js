/**
 * Wallet
 *
 *
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  Linking,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as UserActions from '@reduxx/user/actions';
import {Actions} from 'react-native-router-flux';
import {connect} from 'react-redux';
import {AppConfig} from '@constants/';

import Strings from '@lib/string.js';
import NavComponent from '@components/NavComponent.js';
// Consts and Libs
import {AppStyles, AppSizes, AppColors} from '@theme/';
import {CheckBox} from '@rneui/themed';
// Components
import {Spacer, Text, Button, Card, FormInput, LblFormInput} from '@ui/';
const mapStateToProps = state => {
  return {
    user: state.user.user_data,
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};
const mapDispatchToProps = {
  money_transfer_accounts: UserActions.money_transfer_accounts,
  user_cash_withdrawals: UserActions.user_cash_withdrawals,
  auth: UserActions.auth,
};
import moment from 'moment';

/* Styles ====================================================================  */
const styles = StyleSheet.create({
  background: {
    backgroundColor: AppColors.brand.primary,
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
class Wallet extends Component {
  static componentName = 'Wallet';
  static propTypes = {
    money_transfer_accounts: PropTypes.func.isRequired,
    user_cash_withdrawals: PropTypes.func.isRequired,
    auth: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.userdata = '';
    this.callInvoked = 0;
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
    this.state = {
      amount: '',
      scrollSpacer: 50,
      userLang: 'en',
      payoption: 0,
      page: 1,
      dataList: [],
      dataLists: [],
      pages: 1,
      nodatal: 0,
      user: props.user ? props.user : '',
    };
    this._refreshData();
    this.get_lists(0);
  }
  async _refreshData() {
    this.userdata = await AsyncStorage.getItem('userToken');
  }
  async componentDidMount() {
    this.site_currency = await AsyncStorage.getItem('CURRENCY_SYMBOL');
    payload = {page: 1, user_id: this.state.user.id};
    this.props
      .money_transfer_accounts(payload)
      .then(resp => {
        var datares = this.state.dataList.concat(resp.data);
        this.setState({dataList: datares});
      })
      .catch(() => {
        console.log('error');
      });
  }
  get_lists(p) {
    if (this.callInvoked == 0) {
      var page = p ? p : this.state.pages;
      payload = {page: page, user_id: this.state.user.id};
      this.callInvoked = 1;
      this.props
        .user_cash_withdrawals(payload)
        .then(resp => {
          var datares = this.state.dataLists.concat(resp.data);
          var cpage = page + 1;
          this.callInvoked = 0;
          if (this.state.pages == 1 && resp.data.length == 0) {
            console.log('================== ');
            this.setState({nodatal: 1, pages: cpage, dataLists: datares});
          } else {
            this.setState({pages: cpage, dataLists: datares});
          }
        })
        .catch(() => {
          console.log('error');
        });
    }
  }
  onEndReached = () => {};
  onEndReachedL = () => {
    this.get_lists(0);
  };
  componentWillMount() {
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._keyboardDidShow.bind(this),
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this._keyboardDidHide.bind(this),
    );
  }
  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }
  payOption = data => {
    console.log(data.id);
    this.setState({payoption: data.id});
  };

  _renderRowL = dta => {
    var data = dta.item ? dta.item : '';
    console.log('data===' + JSON.stringify(data));
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          margin: 5,
          marginLeft: 0,
          marginRight: 0,
          borderBottomWidth: 0.5,
          borderColor: AppColors.brand.secondary,
          paddingBottom: 5,
        }}>
        <View style={{flex: 0.2}}>
          <Text
            style={[AppStyles.lightFontText, {fontSize: 11, paddingTop: 5}]}>
            {moment(data.created_at).format('MMM DD, YYYY')}
          </Text>
        </View>
        <View style={{flex: 0.2, alignItems: 'center'}}>
          <Text
            style={[AppStyles.lightFontText, {fontSize: 11, paddingTop: 5}]}>
            {data.money_transfer_account.account}
          </Text>
        </View>
        <View style={{flex: 0.2, alignItems: 'center'}}>
          <Text
            style={[AppStyles.lightFontText, {fontSize: 11, paddingTop: 5}]}>
            {data.amount}
          </Text>
        </View>
        <View style={{flex: 0.2, alignItems: 'center'}}>
          <Text
            style={[AppStyles.lightFontText, {fontSize: 11, paddingTop: 5}]}>
            {data.withdrawal_status.name}
          </Text>
        </View>
      </View>
    );
  };
  _keyboardDidShow() {
    this.setState({scrollSpacer: 200});
  }

  _keyboardDidHide() {
    this.setState({scrollSpacer: 50});
  }

  static propTypes = {};
  validateAmount = amount => {
    var re = /^-?\d*(\.\d+)?$/;
    return re.test(amount);
  };

  withDraw = () => {
    if (
      this.state.amount < 2 ||
      this.state.amount > 1000 ||
      !this.validateAmount(this.state.amount)
    ) {
      Alert.alert(
        AppConfig.appName,
        Strings.entervalidamount,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (this.state.amount > this.state.user.available_wallet_amount) {
      Alert.alert(
        AppConfig.appName,
        Strings.checkavailablebalanceandentervalidamount,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else if (this.state.payoption == 0) {
      Alert.alert(
        AppConfig.appName,
        Strings.payoption,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else {
      if (this.callInvoked == 0) {
        this.callInvoked = 1;
        var payload = {
          money_transfer_account_id: this.state.payoption,
          amount: this.state.amount,
          type: 'post',
          user_id: this.state.user.id,
        };
        this.props
          .user_cash_withdrawals(payload)
          .then(resp => {
            this.callInvoked = 0;
            Promise.all([this.props.auth(this.userdata)])
              .then(() => {
                this.setState(
                  {amount: '', pages: 1, dataLists: []},
                  this.get_lists(1),
                );
              })
              .catch(err => Alert.alert(err.message));
          })
          .catch(() => {
            this.callInvoked = 0;
            console.log('error');
          });
      }
    }
  };

  render = () => {
    console.log('nodatal ' + this.state.nodatal);
    for (var k = 0; k < this.state.dataList.length; k++) {}
    var opt = [];
    if (this.state.dataList) {
      for (var k = 0; k < this.state.dataList.length; k++) {
        var data = this.state.dataList[k];
        var checked = 0;
        if (this.state.payoption == data.id) {
          checked = 1;
        }
        opt.push(
          <CheckBox
            left
            checked={checked}
            title={data.account}
            checkedIcon="dot-circle-o"
            uncheckedIcon="circle-o"
            onPress={this.payOption.bind(this, data)}
            containerStyle={{
              borderColor: '#fff',
              marginLeft: 0,
              borderRadius: 0,
              backgroundColor: 'transparent',
              marginBottom: 5,
              padding: 0,
            }}
            textStyle={[
              AppStyles.regularFontText,
              {fontWeight: 'normal', fontSize: 13},
            ]}
          />,
        );
      }
    }
    return (
      <View style={[styles.background]}>
        <NavComponent backArrow={true} title={Strings.cashwithdrawrequests} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View>
            <Text
              style={[
                AppStyles.regularFontText,
                {padding: 10, paddingBottom: 0},
              ]}>
              <Text style={AppStyles.boldedFontText}>
                {Strings.availablebalance}:
              </Text>{' '}
              {this.site_currency}
              {this.state.user.available_wallet_amount}
            </Text>
            {this.state.dataList && this.state.dataList.length > 0 ? (
              <View>
                <View
                  style={{
                    flex: 1,
                    width: AppSizes.screen.width - 20,
                    margin: 10,
                  }}>
                  <View>
                    <Text
                      style={
                        ([styles.headerGrey, AppStyles.boldedFontText],
                        {color: AppColors.brand.black})
                      }>
                      {Strings.choosemoneytransferoption}
                    </Text>
                  </View>
                  <Spacer size={10} />
                  <View
                    style={{
                      paddingLeft: 0,
                      paddingRight: 0,
                      backgroundColor: 'transparent',
                    }}>
                    {opt}
                  </View>
                  <Spacer size={15} />
                  <View
                    style={{
                      width: AppSizes.screen.width - 50,
                      backgroundColor: 'transparent',
                    }}>
                    <LblFormInput
                      placeholderTxt={Strings.amount}
                      lblTxt={Strings.amount}
                      value={this.state.amount}
                      onChangeText={text => this.setState({amount: text})}
                    />
                  </View>
                  <View
                    style={{
                      width: AppSizes.screen.width - 50,
                      backgroundColor: 'transparent',
                    }}>
                    <Text style={styles.normalText11}>
                      {Strings.minwwithdrawamount}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: AppSizes.screen.width - 50,
                      backgroundColor: 'transparent',
                    }}>
                    <Text style={styles.normalText11}>
                      {Strings.maxwithdrawamount}
                    </Text>
                  </View>
                  <Spacer size={15} />
                </View>
                <Button
                  style={{padding: 5, backgroundColor: '#34d777'}}
                  title={Strings.submit}
                  onPress={this.withDraw}
                  backgroundColor={'#34d777'}
                  fontSize={18}
                />
              </View>
            ) : null}
          </View>
          <View style={{margin: 10, marginTop: 0}}>
            <Spacer size={15} />
            <View>
              <Text
                style={
                  ([styles.headerGrey, AppStyles.boldedFontText],
                  {color: AppColors.brand.black})
                }>
                {Strings.cashwithdrawrequests}
              </Text>
            </View>
            <Spacer size={10} />
            <View
              style={{
                flexDirection: 'row',
                margin: 5,
                marginLeft: 0,
                marginRight: 0,
                borderBottomWidth: 0.5,
                borderColor: AppColors.brand.secondary,
                padding: 5,
                backgroundColor: AppColors.brand.black,
              }}>
              <View style={{flex: 0.2}}>
                <Text style={styles.whiteText}>{Strings.date}</Text>
              </View>
              <View style={{flex: 0.2, alignItems: 'center'}}>
                <Text style={styles.whiteText}>{Strings.account}</Text>
              </View>
              <View style={{flex: 0.2, alignItems: 'center'}}>
                <Text style={styles.whiteText}>{Strings.amount}</Text>
              </View>
              <View style={{flex: 0.2, alignItems: 'center'}}>
                <Text style={styles.whiteText}>{Strings.status}</Text>
              </View>
            </View>
            {this.state.nodatal == 0 ? (
              <View
                style={{
                  width: AppSizes.screen.width - 20,
                  padding: 0,
                  margin: 0,
                  height: AppSizes.screen.height - 200,
                }}>
                {this.state.dataLists && this.state.dataLists.length > 0 ? (
                  <FlatList
                    data={this.state.dataLists}
                    renderItem={this._renderRowL}
                    onEndReached={this.onEndReachedL}
                  />
                ) : (
                  <View
                    style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={[AppStyles.regularFontText]}>
                      {Strings.loading}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <Text style={[AppStyles.regularFontText]}>
                  {Strings.nodata}
                </Text>
              </View>
            )}
            <Spacer size={this.state.scrollSpacer} />
          </View>
        </ScrollView>
      </View>
    );
  };
}

/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps)(Wallet);
