/**
 * Money Transfer Account Screen
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
  TouchableOpacity,
  FlatList,
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
};
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
class MoneyTransferAccount extends Component {
  static componentName = 'MoneyTransferAccount';
  static propTypes = {
    money_transfer_accounts: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.callInvoked = 0;
    this.state = {
      page: 1,
      dataList: [],
      nodata: 0,
      account_detail: '',
      userLang: 'en',
      user: props.user ? props.user : '',
    };
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
  }

  componentDidMount() {
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
    this.get_money_transfer_accounts();
  }
  get_money_transfer_accounts() {
    if (this.callInvoked == 0) {
      var page = page ? page : this.state.page;
      payload = {page: page, user_id: this.state.user.id};
      this.callInvoked = 1;
      this.props
        .money_transfer_accounts(payload)
        .then(resp => {
          var datares = this.state.dataList.concat(resp.data);
          var cpage = page + 1;
          this.callInvoked = 0;
          if (this.state.page == 1 && resp.data.length == 0)
            this.setState({nodata: 1, page: cpage, dataList: datares});
          else this.setState({page: cpage, dataList: datares});
        })
        .catch(() => {
          console.log('error');
        });
    }
  }
  delete_maintainence = id => {
    Alert.alert(
      AppConfig.appName,
      Strings.areyousurewanttodelete,
      [
        {
          text: 'OK',
          onPress: () => {
            var payload = {money_transfer_id: id, delete: 1};
            this.props
              .money_transfer_accounts(payload)
              .then(resp => {
                this.setState({page: 1, dataList: []});
                this.get_money_transfer_accounts(1);
              })
              .catch(() => {
                console.log('error');
              });
          },
        },
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  };
  addAccount = () => {
    var acdetail = this.state.account_detail;
    if (acdetail.trim() == '') {
      Alert.alert(
        AppConfig.appName,
        Strings.enteraccountdetails,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else {
      if (this.callInvoked == 0) {
        this.callInvoked = 1;
        var payload = {
          account: acdetail,
          add: 1,
          user_id: this.state.user.id,
          refresh_token: this.state.user.refresh_token,
        };
        this.props
          .money_transfer_accounts(payload)
          .then(resp => {
            this.callInvoked = 0;
            this.setState({
              account_detail: '',
              page: 1,
              dataList: [],
              nodata: 0,
            });
            this.get_money_transfer_accounts(1);
          })
          .catch(() => {
            this.callInvoked = 0;
            console.log('error');
          });
      }
    }
  };
  _renderRow = dta => {
    var data = dta.item ? dta.item : '';
    return (
      <View
        style={{
          width: AppSizes.screen.width - 20,
          marginBottom: 5,
          padding: 13,
          borderBottomWidth: 0.5,
          borderBottomColor: AppColors.brand.grey,
        }}>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 0.95}}>
            <Text style={styles.headerTitle}>{data.account}</Text>
          </View>
          <TouchableOpacity
            style={{flex: 0.05, alignItems: 'flex-end'}}
            onPress={this.delete_maintainence.bind(this, data.id)}>
            <Image
              style={{width: 20, height: 20}}
              source={require('@images/close.png')}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  render = () => (
    <View style={[styles.background]}>
      <NavComponent backArrow={true} title={Strings.moneytransferaccount} />
      <View
        style={{
          margin: 10,
          width: AppSizes.screen.width - 20,
          backgroundColor: 'transparent',
        }}>
        <LblFormInput
          background={1}
          height={100}
          textAlignVertical={'top'}
          placeholderTxt={Strings.enteraccountdetails}
          numberOfLines={5}
          multiline={true}
          lblTxt={Strings.accountdetails}
          value={this.state.account_detail}
          onChangeText={account_detail => this.setState({account_detail})}
        />
      </View>
      <View style={{height: 10}} />
      <Button
        style={{padding: 5, backgroundColor: '#34d777'}}
        title={Strings.save}
        onPress={this.addAccount}
        backgroundColor={'#34d777'}
        fontSize={18}
      />
      <View style={{margin: 10}}>
        <Spacer size={5} />
        <ScrollView showsVerticalScrollIndicator={false}>
          {this.state.nodata == 0 ? (
            <View>
              {this.state.dataList && this.state.dataList.length > 0 ? (
                <FlatList
                  data={this.state.dataList}
                  renderItem={this._renderRow}
                  onEndReached={this.onEndReached}
                />
              ) : (
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                  <Text style={[AppStyles.regularFontText]}>
                    {Strings.loading}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <Text style={[AppStyles.regularFontText]}>{Strings.nodata}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

/* Export Component ==================================================================== */
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MoneyTransferAccount);
