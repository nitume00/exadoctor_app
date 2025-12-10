/**
 * Medical Records List
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import * as UserActions from '@reduxx/user/actions';
import {connect} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppConfig} from '@constants/';
// Consts and Libs
import {AppStyles, AppSizes, AppColors} from '@theme/';
import Strings from '@lib/string.js';
import AppUtil from '@lib/util';
// Components
import {Spacer, Text, Button} from '@ui/';
import {Icon} from '@rneui/themed';
import NavComponent from '@components/NavComponent.js';
var moment = require('moment');
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
  user_educations: UserActions.user_educations,
  medical_history: UserActions.medical_history,
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
  userName: {
    color: 'black',
    //fontWeight: "600",
    fontSize: 16,
    paddingBottom: 5,
  },
  textBlue: {
    color: '#24c9ff',
    fontSize: 13,
    marginTop: 5,
    paddingBottom: 5,
  },
});

/* Component ==================================================================== */
class MedicalRecordList extends Component {
  static componentName = 'MedicalRecordList';
  static propTypes = {
    users: PropTypes.func.isRequired,
    user_educations: PropTypes.func.isRequired,
    medical_history: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.callInvoked = 0;
    this.localee = 'EN';
    this.locale_fr = props.locale_fr ? props.locale_fr : '';
    this.locale_en = props.locale_en ? props.locale_en : '';
    this.state = {
      loading: false,
      page: 1,
      dataList: [],
      nodata: 0,
      userLang: 'en',
      user: props.user ? props.user : '',
    };
    this.site_url = '';
  }

  async componentDidMount() {
    this.site_url = await AsyncStorage.getItem('SITE_URL');
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
    this.get_history(1);
  }
  get_history(p) {
    if (this.callInvoked == 0) {
      var payload =
        '{"where":{"user_id":' +
        this.state.user.id +
        '},"limit":100,"skip":0,"include":{"0":"attachment"}}';
      this.callInvoked = 1;
      this.setState({loading: true});
      this.props
        .medical_history({filter: payload})
        .then(resp => {
          if (resp._metadata && resp._metadata.total == 0) {
            this.setState({nodata: 1, loading: false});
          } else if (resp.data) {
            var datares = resp.data;
            this.callInvoked = 0;
            if (resp.data.length == 0)
              this.setState({nodata: 1, loading: false, dataList: datares});
            else this.setState({nodata: 0, dataList: datares, loading: false});
          } else {
            this.setState({loading: false});
          }
        })
        .catch(() => {
          this.setState({loading: false});
        });
    }
  }
  _renderRow = dta => {
    var data = dta.item ? dta.item : '';
    var imgs = [];
    if (data.attachment && data.attachment.length) {
      for (var i = 0; i < data.attachment.length; i++) {
        var md5string =
          'MedicalHistory' + data.attachment[i].id + 'pngbig_thumb';
        var imagetemp = AppUtil.MD5(md5string);
        imageurl =
          this.site_url +
          '/images/big_thumb/MedicalHistory/' +
          data.attachment[i].id +
          '.' +
          imagetemp +
          '.png';
        imgs.push(
          <Image
            style={{height: 100, width: 100, margin: 3}}
            source={{uri: imageurl}}
          />,
        );
      }
    }
    return (
      <View
        style={{
          flexDirection: 'row',
          padding: 15,
          borderBottomColor: '#dfdfdf',
          borderBottomWidth: 0.5,
        }}>
        <View style={{flexDirection: 'column', flex: 0.95}}>
          <Text style={[AppStyles.regularFontText, {fontSize: 14}]}>
            {data.description} (
            <Text style={styles.textBlue}>{data.years}</Text>)
          </Text>
          {data.attachment && data.attachment.length ? (
            <ScrollView horizontal={true}>{imgs}</ScrollView>
          ) : null}
        </View>
        <TouchableOpacity
          style={{
            height: 30,
            width: 30,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={this.deleteHistory.bind(this, data.id)}>
          <Image
            source={require('@images/delete.png')}
            style={{width: 20, height: 20}}
          />
        </TouchableOpacity>
      </View>
    );
  };
  add = () => {
    Actions.AddMedicalRecord({reload: this.reload});
  };
  reload = () => {
    this.callInvoked = 0;
    this.setState({nodata: 0, dataList: []});
    this.get_history(1);
  };
  deleteHistory = id => {
    var payload = {id: id, post_type: 'DELETE'};
    this.setState({loading: true});
    Alert.alert(
      '',
      Strings.areyousureyouwanttodelete,
      [
        {
          text: Strings.ok,
          onPress: () => {
            this.props
              .medical_history(payload)
              .then(resp => {
                if (resp.error && resp.error.code == 0) {
                  this.setState({dataList: [], loading: false});
                  this.get_history(1);
                } else {
                  this.setState({loading: false});
                }
              })
              .catch(() => {
                this.setState({loading: false});
                console.log('error');
              });
          },
        },
        {text: Strings.cancel, onPress: () => this.setState({loading: false})},
      ],
      {cancelable: false},
    );
  };
  render() {
    return (
      <View style={[styles.background]}>
        <NavComponent
          backArrow={true}
          title={Strings.medicalrecords}
          rightBarAdd={true}
          onRightNavPress={this.add}
        />
        {this.state.nodata == 0 ? (
          <View
            style={{
              padding: 0,
              margin: 0,
              height: AppSizes.screen.height - 65,
            }}>
            {this.state.dataList && this.state.dataList.length > 0 ? (
              <FlatList
                data={this.state.dataList}
                renderItem={this._renderRow}
                onEndReached={this.onEndReached}
              />
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
        {this.state.loading ? (
          <View style={AppStyles.LoaderStyle}>
            <Loading color={AppColors.brand.primary} />
          </View>
        ) : null}
      </View>
    );
  }
}

/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps)(MedicalRecordList);
