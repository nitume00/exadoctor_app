/**
 * Education List
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
  Alert,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import * as UserActions from '@reduxx/user/actions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
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
class EducationList extends Component {
  static componentName = 'EducationList';
  static propTypes = {
    users: PropTypes.func.isRequired,
    user_educations: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.callInvoked = 0;
    this.state = {
      loading: false,
      page: 1,
      dataList: [],
      nodata: 0,
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
    this.get_educations(1);
  }
  get_educations(p) {
    if (this.callInvoked == 0) {
      var payload =
        '{"where":{"user_id":' + this.state.user.id + '},"limit":100,"skip":0}';
      this.callInvoked = 1;
      this.setState({loading: true});
      console.log('payloaddddd = ' + JSON.stringify(payload));
      this.props
        .user_educations({filter: payload})
        .then(resp => {
          console.log('payloaddddd = 1 = ' + JSON.stringify(resp));
          if (resp._metadata && resp._metadata.total == 0) {
            this.setState({nodata: 1, loading: false});
          } else if (resp.data) {
            var datares = resp.data;
            this.callInvoked = 0;
            console.log('data=== == 1 ' + JSON.stringify(resp.data.length));
            if (resp.data.length == 0)
              this.setState({nodata: 1, loading: false, dataList: datares});
            else this.setState({nodata: 0, dataList: datares, loading: false});
          } else {
            this.setState({loading: false});
          }
        })
        .catch(() => {
          this.setState({loading: false});
          console.log('error');
        });
    }
  }
  _renderRow = dta => {
    var data = dta.item ? dta.item : '';
    return (
      <View
        style={{
          flexDirection: 'row',
          padding: 15,
          borderBottomColor: '#dfdfdf',
          borderBottomWidth: 0.5,
        }}>
        <View style={{flexDirection: 'column', flex: 0.92}}>
          <Text style={[AppStyles.regularFontText, {fontSize: 14}]}>
            {data.education}{' '}
            <Text style={[AppStyles.lightFontText1, {fontSize: 12}]}>
              ({' '}
              {moment(data.certification_date, 'YYYY-MM-DD').format('MMM YYYY')}
              )
            </Text>
          </Text>
          <Text style={styles.textBlue}>
            {data.organization} {data.location}
          </Text>
        </View>
        <TouchableOpacity
          style={{
            height: 30,
            width: 30,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={this.editEducation.bind(this, data)}>
          <Image
            source={require('@images/edit.png')}
            style={{width: 20, height: 20}}
          />
        </TouchableOpacity>
        <View style={{width: 20}} />
        <TouchableOpacity
          style={{
            height: 30,
            width: 30,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={this.deleteEducation.bind(this, data.id)}>
          <Image
            source={require('@images/delete.png')}
            style={{width: 20, height: 20}}
          />
        </TouchableOpacity>
      </View>
    );
  };
  editEducation = data => {
    Actions.education({education_data: data, reload: this.reload});
  };
  add = () => {
    Actions.education({reload: this.reload});
  };
  reload = () => {
    this.callInvoked = 0;
    this.setState({nodata: 0, dataList: []});
    this.get_educations(1);
  };
  deleteEducation = id => {
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
              .user_educations({filter: payload})
              .then(resp => {
                if (resp.error && resp.error.code == 0) {
                  this.setState({dataList: [], loading: false});
                  this.get_educations(1);
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
          title={Strings.myeducations}
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
export default connect(mapStateToProps, mapDispatchToProps)(EducationList);
