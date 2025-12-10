import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Image,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {connect} from 'react-redux';
import {Rating} from '@rneui/themed';
import NavComponent from '@components/NavComponent.js';
import * as UserActions from '@reduxx/user/actions';
import Strings from '@lib/string.js';
import AppUtil from '@lib/util';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import {AppConfig} from '@constants/';
import DatePicker from 'react-native-datepicker';
// Consts and Libs
import {AppStyles, AppSizes, AppColors, AppFonts} from '@theme/';
var moment = require('moment');
// Components
import {Spacer, Text, Button, LblFormInput} from '@ui/';

const mapStateToProps = state => {
  return {
    user: state.user.user_data,
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};

// Any actions to map to the component?
const mapDispatchToProps = {
  transactions: UserActions.transactions,
};

/* Styles ==================================================================== */
const styles = StyleSheet.create({
  background: {
    backgroundColor: AppColors.brand.primary,
    flex: 1,
  },
  view_divider_horizontal: {
    height: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ccc',
  },
  Listcontainer: {
    backgroundColor: 'white',
    flex: 1,
  },
  tab: {
    padding: 15,
    minWidth: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selected_tab: {
    padding: 15,
    minWidth: 70,
    borderBottomWidth: 4,
    borderColor: AppColors.brand.navbar,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontStyle: {
    fontSize: 12,
    lineHeight: 15,
    color: AppColors.brand.white,
  },
});

/* Component ==================================================================== */
class MyAppointments extends Component {
  static propTypes = {
    transactions: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.callInvoked = 0;
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
    this.state = {
      page: 1,
      dataList: [],
      nodata: 0,
      cfilter: 'all',
      userLang: 'en',
      cnt: 0,
      user: props.user ? props.user : '',
      mindate: moment(new Date('January 01, 1901 00:00:00')).format(
        'YYYY-MM-DD',
      ),
      maxdate: moment(new Date()).format('YYYY-MM-DD'),
      from_date: null,
      to_date: null,
    };
    this.customDate.bind(this);
  }
  async componentDidMount() {
    this.site_currency = await AsyncStorage.getItem('CURRENCY_SYMBOL');
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
    this.get_transactions('all', 1);
  }

  get_transactions(q, p) {
    if (this.callInvoked == 0) {
      var cf = q;
      var page = p ? p : this.state.page;
      var skip = 0;
      if (page == 1) {
        skip = 0;
      } else {
        skip = (page - 1) * 10;
      }
      var from_date =
        this.state.from_date && q == 'custom' ? this.state.from_date : '';
      var to_date =
        this.state.to_date && q == 'custom' ? this.state.to_date : '';

      var payload =
        '{"include":{"0":"user","1":"other_user","2":"foreign_transaction","3":"provider_user","4":"branch"},"skip":' +
        skip +
        ',"limit":10,"order":"id+desc"}';

      this.callInvoked = 1;
      this.props
        .transactions({
          filter: payload,
          user_id: this.state.user.id,
          from_date: from_date,
          to_date: to_date,
          type: q,
          token: this.state.user.userToken,
        })
        .then(resp => {
          console.log('res booking data data=== == ' + JSON.stringify(resp));
          var datares = this.state.dataList.concat(resp.data);
          var cpage = page + 1;
          this.callInvoked = 0;
          if (page == 1 && resp.data.length == 0)
            this.setState({nodata: 1, page: cpage, dataList: datares});
          else this.setState({page: cpage, dataList: datares});
        })
        .catch(() => {
          console.log('error');
        });
    }
  }
  onEndReached = () => {
    this.get_transactions(this.state.cfilter, 0);
  };
  filter = id => {
    var cf = '';
    if (id == 'all') {
      cf = 'all';
    } else if (id == 'today') {
      cf = 'today';
    } else if (id == 'this_week') {
      cf = 'this_week';
    } else if (id == 'this_month') {
      cf = 'this_month';
    } else if (id == 'custom') {
      cf = 'custom';
    }

    this.setState(
      {cfilter: id, page: 1, dataList: [], nodata: 0},
      this.get_transactions(cf, 1),
    );
  };
  reload = () => {
    this.setState({cnt: this.state.cnt + 1, dataList: []});
    this.get_transactions(this.state.cfilter, 1);
  };

  customDate = () => {
    if (this.state.from_date == '') {
      Alert.alert(
        '',
        Strings.pleaseselectfromdate,
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('OK Pressed');
            },
          },
        ],
        {cancelable: false},
      );
    } else if (this.state.to_date == '') {
      Alert.alert(
        '',
        Strings.pleaseselecttodate,
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('OK Pressed');
            },
          },
        ],
        {cancelable: false},
      );
    } else {
      this.setState(
        {page: 1, dataList: [], nodata: 0},
        this.get_transactions('custom', 1),
      );
    }
  };
  _renderRow = dta => {
    var data = dta.item ? dta.item : '';
    console.log('data===' + JSON.stringify(data));
    var credit = '--';
    var debit = '--';
    if (data.user.id == this.state.user.id) {
      if (data.class == 'Wallet') {
        credit = data.amount;
      } else if (data.class == 'UserCashWithdrawal') {
        if (data.transaction_type !== 6) {
          debit = data.amount;
        } else {
          credit = data.amount;
        }
      } else if (data.class == 'UserSubscription') {
        debit = data.amount;
      } else {
        debit = data.amount;
      }
    } else {
      credit = data.amount;
    }
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          borderBottomWidth: 0.2,
          borderColor: AppColors.brand.black,
        }}>
        <View style={{flex: 0.7}}>
          {data.transaction_type ==
          AppConfig.ConstTransactionTypes.SubscriptionPayment ? null : (
            <Text
              style={[
                AppStyles.regularFontText,
                {padding: 5, paddingBottom: 0, fontSize: 12},
              ]}>
              {Strings.appointmentid}: #
              {data.foreign_transaction && data.foreign_transaction.id
                ? data.foreign_transaction.id
                : ''}
            </Text>
          )}
          {/* Appointment booked and amount in escrow */}
          {data.transaction_type ==
            AppConfig.ConstTransactionTypes.AppointmentFeePaidToEscrow &&
          data.user_id == this.state.user.id ? (
            <Text
              style={[
                AppStyles.lightFontText,
                {padding: 5, paddingBottom: 0, fontSize: 12},
              ]}>
              {Strings.youbookedanappointment}
            </Text>
          ) : null}

          {data.transaction_type ==
            AppConfig.ConstTransactionTypes.AppointmentFeePaidToEscrow &&
          data.user_id != this.state.user.id ? (
            <Text
              style={[
                AppStyles.lightFontText,
                {padding: 5, paddingBottom: 0, fontSize: 12},
              ]}>
              {data.user.user_profile.first_name}{' '}
              {data.user.user_profile.last_name}{' '}
              {Strings.bookedappointmentandamountinescrow}
            </Text>
          ) : null}
          {/* Appointment booked and amount in escrow */}

          {/* Appointment cancelled */}
          {data.transaction_type ==
            AppConfig.ConstTransactionTypes.AppointmentFeeRefundedToUser &&
          data.to_user_id == this.state.user.id ? (
            <Text
              style={[
                AppStyles.lightFontText,
                {padding: 5, paddingBottom: 0, fontSize: 12},
              ]}>
              {Strings.appointmentcancelledandrefundedappointmentfee}
            </Text>
          ) : null}
          {data.transaction_type ==
            AppConfig.ConstTransactionTypes.AppointmentFeeRefundedToUser &&
          data.to_user_id != this.state.user.id ? (
            <Text
              style={[
                AppStyles.lightFontText,
                {padding: 5, paddingBottom: 0, fontSize: 12},
              ]}>
              {Strings.appointmentcancelledandrefundedfromescrow}
            </Text>
          ) : null}
          {/* Appointment cancelled */}

          {/* Escrow to wallet for doctor */}
          {data.transaction_type ==
            AppConfig.ConstTransactionTypes
              .AppointmentFeeReleasedToFreelancerWallet &&
          this.state.user.role_id == 3 ? (
            <Text
              style={[
                AppStyles.lightFontText,
                {padding: 5, paddingBottom: 0, fontSize: 12},
              ]}>
              {Strings.appointmentcompletedandfeecreditedtowallet}
            </Text>
          ) : null}
          {/* Escrow to wallet for doctor */}

          {/* Diagnostic payment for patient */}
          {data.transaction_type ==
            AppConfig.ConstTransactionTypes.DiagnosticPayment &&
          data.user_id == this.state.user.id ? (
            <Text
              style={[
                AppStyles.lightFontText,
                {padding: 5, paddingBottom: 0, fontSize: 12},
              ]}>
              {Strings.paidfordiagnostictest}
            </Text>
          ) : null}
          {/* Diagnostic payment for patient */}

          {/* Diagnostic payment for hospital side */}
          {data.transaction_type ==
            AppConfig.ConstTransactionTypes.DiagnosticPayment &&
          data.user_id != this.state.user.id ? (
            <Text
              style={[
                AppStyles.lightFontText,
                {padding: 5, paddingBottom: 0, fontSize: 12},
              ]}>
              {Strings.bookedfordiagnostictest}
            </Text>
          ) : null}
          {/* Diagnostic payment for hospital side */}

          {/* Subscription payment */}
          {data.transaction_type ==
            AppConfig.ConstTransactionTypes.SubscriptionPayment &&
          data.user_id == this.state.user.id ? (
            <View>
              <Text
                style={[
                  AppStyles.lightFontText,
                  {padding: 5, paddingBottom: 0, fontSize: 12},
                ]}>
                {Strings.youpaidsubscriptionfee}
              </Text>
              {data.foreign_transaction &&
              data.foreign_transaction.subscription ? (
                <Text
                  style={[
                    AppStyles.lightFontText,
                    {padding: 5, paddingBottom: 0, fontSize: 12},
                  ]}>
                  {Strings.plan}: {data.foreign_transaction.subscription.name}
                </Text>
              ) : null}
            </View>
          ) : null}
          {/* Subscription payment */}

          {/* withdraw request */}
          {data.transaction_type ==
            AppConfig.ConstTransactionTypes.WithdrawRequested &&
          data.user_id == this.state.user.id ? (
            <Text
              style={[
                AppStyles.lightFontText,
                {padding: 5, paddingBottom: 0, fontSize: 12},
              ]}>
              {Strings.yourequestedwithdrawamount}
            </Text>
          ) : null}
          {/* withdraw request */}

          {/* withdraw request success */}
          {data.transaction_type ==
            AppConfig.ConstTransactionTypes.WithdrawRequestApproved &&
          data.user_id == this.state.user.id ? (
            <Text
              style={[
                AppStyles.lightFontText,
                {padding: 5, paddingBottom: 0, fontSize: 12},
              ]}>
              {Strings.requestedamtcreditedtoaccanddebitfromwallet}
            </Text>
          ) : null}
          {/* withdraw request success */}

          {/* withdraw request rejected */}
          {data.transaction_type ==
            AppConfig.ConstTransactionTypes.WithdrawRequestRejected &&
          data.user_id == this.state.user.id ? (
            <Text
              style={[
                AppStyles.lightFontText,
                {padding: 5, paddingBottom: 0, fontSize: 12},
              ]}>
              {Strings.withdrawrequestrejected}
            </Text>
          ) : null}
          {/* withdraw request rejected */}

          {this.state.user &&
          this.state.user.role_id == 2 &&
          data.provider_user ? (
            <View>
              {data.transaction_type ==
                AppConfig.ConstTransactionTypes.DiagnosticPayment &&
              data.user_id == this.state.user.id &&
              data.branch ? (
                <Text
                  style={[
                    AppStyles.regularFontText,
                    {padding: 5, paddingBottom: 0, fontSize: 12},
                  ]}>
                  {Strings.location}: {data.branch.full_address}
                </Text>
              ) : (
                <Text
                  style={[
                    AppStyles.regularFontText,
                    {padding: 5, paddingBottom: 0, fontSize: 12},
                  ]}>
                  {Strings.doctor}: {data.provider_user.user_profile.first_name}{' '}
                  {data.provider_user.user_profile.last_name}
                </Text>
              )}
            </View>
          ) : null}
          <Text
            style={[
              AppStyles.regularFontText,
              {padding: 5, paddingBottom: 0, fontSize: 12},
            ]}>
            {Strings.created}: {moment(data.created_at).format('MMM DD, YYYY')}
          </Text>
          {data.site_revenue_from_freelancer ||
          data.class == 'UserCashWithdrawal' ? (
            <Text
              style={[AppStyles.regularFontText, {padding: 5, fontSize: 12}]}>
              {Strings.deductedsitecommission}: {this.site_currency}
              {data.site_revenue_from_freelancer}
            </Text>
          ) : (
            <View>
              {data.foreign_transaction &&
              data.foreign_transaction.appointment_date ? (
                <Text
                  style={[
                    AppStyles.regularFontText,
                    {padding: 5, fontSize: 12},
                  ]}>
                  {Strings.scheduled}:{' '}
                  {data.foreign_transaction.appointment_date}{' '}
                  {data.foreign_transaction.appointment_time}
                </Text>
              ) : (
                <View Style={{height: 5}} />
              )}
            </View>
          )}
        </View>
        <Text
          style={[
            AppStyles.regularFontText,
            {flex: 0.15, fontSize: 10, padding: 5, textAlign: 'center'},
          ]}>
          {credit}
        </Text>
        <Text
          style={[
            AppStyles.regularFontText,
            {flex: 0.15, fontSize: 10, padding: 5, textAlign: 'center'},
          ]}>
          {debit}
        </Text>
      </View>
    );
  };
  render = () => {
    var fall = this.state.cfilter == 'all' ? styles.selected_tab : styles.tab;
    var ftoday =
      this.state.cfilter == 'today' ? styles.selected_tab : styles.tab;
    var fthis_week =
      this.state.cfilter == 'this_week' ? styles.selected_tab : styles.tab;
    var fthis_month =
      this.state.cfilter == 'this_month' ? styles.selected_tab : styles.tab;
    var fcustom =
      this.state.cfilter == 'custom' ? styles.selected_tab : styles.tab;

    var fallt =
      this.state.cfilter == 'all'
        ? [AppStyles.regularFontText, styles.fontStyle]
        : [AppStyles.regularFontText, styles.fontStyle];
    var ftodayt =
      this.state.cfilter == 'today'
        ? [AppStyles.regularFontText, styles.fontStyle]
        : [AppStyles.regularFontText, styles.fontStyle];
    var fthis_weekt =
      this.state.cfilter == 'week'
        ? [AppStyles.regularFontText, styles.fontStyle]
        : [AppStyles.regularFontText, styles.fontStyle];
    var fthis_montht =
      this.state.cfilter == 'month'
        ? [AppStyles.regularFontText, styles.fontStyle]
        : [AppStyles.regularFontText, styles.fontStyle];
    var fcustomt =
      this.state.cfilter == 'custom'
        ? [AppStyles.regularFontText, styles.fontStyle]
        : [AppStyles.regularFontText, styles.fontStyle];

    var disabled = false;
    if (this.callInvoked) disabled = true;
    return (
      <View style={[styles.background]}>
        <NavComponent backArrow={true} title={Strings.transactions} />
        <View
          style={{
            flex: 0.1,
            backgroundColor: '#303030',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            horizontal={true}
            style={{width: AppSizes.screen.width}}>
            <TouchableOpacity
              disabled={disabled}
              onPress={this.filter.bind(this, 'all')}
              style={fall}>
              <Text style={fallt}>{Strings.all}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={disabled}
              onPress={this.filter.bind(this, 'today')}
              style={ftoday}>
              <Text style={ftodayt}>{Strings.today}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={disabled}
              onPress={this.filter.bind(this, 'this_week')}
              style={fthis_week}>
              <Text style={fthis_weekt}>{Strings.thisweek}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={disabled}
              onPress={this.filter.bind(this, 'this_month')}
              style={fthis_month}>
              <Text style={fthis_montht}>{Strings.thismonth}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={disabled}
              onPress={this.filter.bind(this, 'custom')}
              style={fcustom}>
              <Text style={fcustomt}>{Strings.customdate}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        {this.state.cfilter == 'custom' ? (
          <View style={{flexDirection: 'row'}}>
            <View style={{flex: 0.39, marginLeft: 5}}>
              <DatePicker
                date={this.state.from_date}
                mode="date"
                placeholder={Strings.fromdate}
                format="YYYY-MM-DD"
                minDate={this.state.mindate}
                maxDate={this.state.maxdate}
                confirmBtnText={Strings.confirm}
                cancelBtnText={Strings.cancel}
                showIcon={false}
                customStyles={{
                  dateInput: {
                    borderWidth: 0,
                    paddingLeft: 5,
                    alignItems: 'center',
                    borderBottomWidth: 1,
                    marginBottom: 5,
                  },
                  placeholderText: {
                    fontSize: 12,
                    fontFamily: AppFonts.base.family,
                    color: AppColors.brand.txtplaceholder,
                    paddingLeft: 5,
                  },
                  dateText: {
                    fontSize: 12,
                    fontFamily: AppFonts.base.family,
                    color: AppColors.brand.txtplaceholder,
                    paddingLeft: 5,
                  },
                }}
                onDateChange={date => {
                  this.setState({from_date: date});
                }}
              />
            </View>
            <View style={{flex: 0.02}} />
            <View style={{flex: 0.39, marginLeft: 5}}>
              <DatePicker
                date={this.state.to_date}
                mode="date"
                placeholder={Strings.todate}
                format="YYYY-MM-DD"
                minDate={this.state.mindate}
                maxDate={this.state.maxdate}
                confirmBtnText={Strings.confirm}
                cancelBtnText={Strings.cancel}
                showIcon={false}
                customStyles={{
                  dateInput: {
                    borderWidth: 0,
                    paddingLeft: 5,
                    alignItems: 'center',
                    borderBottomWidth: 1,
                    marginBottom: 5,
                  },
                  placeholderText: {
                    fontSize: 12,
                    fontFamily: AppFonts.base.family,
                    color: AppColors.brand.txtplaceholder,
                    paddingLeft: 5,
                  },
                  dateText: {
                    fontSize: 12,
                    fontFamily: AppFonts.base.family,
                    color: AppColors.brand.txtplaceholder,
                    paddingLeft: 5,
                  },
                }}
                onDateChange={date => {
                  this.setState({to_date: date});
                }}
              />
            </View>
            <View
              style={{
                flex: 0.2,
                justifyContent: 'center',
                alignItems: 'flex-end',
                padding: 5,
              }}>
              <TouchableOpacity
                onPress={this.customDate}
                style={{backgroundColor: AppColors.brand.btnColor}}>
                <Text
                  style={{
                    color: AppColors.brand.white,
                    fontSize: 12,
                    padding: 5,
                    paddingLeft: 15,
                    paddingRight: 15,
                  }}>
                  {Strings.filter}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {this.state.nodata == 0 ? (
          <View style={{padding: 0, margin: 0, flex: 1}}>
            {this.state.dataList && this.state.dataList.length > 0 ? (
              <View style={{flex: 1}}>
                <View
                  style={{
                    flexDirection: 'row',
                    backgroundColor: AppColors.brand.black,
                  }}>
                  <View
                    style={{
                      flex: 0.7,
                      padding: 5,
                      paddingTop: 10,
                      paddingBottom: 10,
                      justifyContent: 'center',
                      alignItems: 'flex-start',
                    }}>
                    <Text
                      style={[
                        AppStyles.regularFontText,
                        {color: AppColors.brand.white, fontSize: 12},
                      ]}>
                      {Strings.description}
                    </Text>
                  </View>
                  <Text
                    style={[
                      AppStyles.regularFontText,
                      {
                        flex: 0.15,
                        padding: 5,
                        paddingTop: 10,
                        paddingBottom: 10,
                        color: AppColors.brand.white,
                        textAlign: 'center',
                        fontSize: 12,
                      },
                    ]}>
                    {Strings.credit} (GH¢)
                  </Text>
                  <Text
                    style={[
                      AppStyles.regularFontText,
                      {
                        flex: 0.15,
                        padding: 5,
                        paddingTop: 10,
                        paddingBottom: 10,
                        color: AppColors.brand.white,
                        textAlign: 'center',
                        fontSize: 12,
                      },
                    ]}>
                    {Strings.debit} (GH¢)
                  </Text>
                </View>
                <FlatList
                  style={{flex: 1}}
                  data={this.state.dataList}
                  renderItem={this._renderRow}
                  onEndReached={this.onEndReached}
                />
              </View>
            ) : (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={[AppStyles.regularFontText]}>
                  {Strings.loading}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={[AppStyles.regularFontText]}>{Strings.nodata}</Text>
          </View>
        )}
      </View>
    );
  };
}

/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps)(MyAppointments);
