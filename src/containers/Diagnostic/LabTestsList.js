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
import {connect} from 'react-redux';
import {AppConfig} from '@constants/';
// Consts and Libs
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  return {user: state.user.user_data};
};
const mapDispatchToProps = {
  users: UserActions.users,
  diagnostic_center_tests: UserActions.diagnostic_center_tests,
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
    diagnostic_center_tests: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.callInvoked = 0;
    this.site_url = '';
    this.state = {
      loading: false,
      page: 1,
      dataList: [],
      nodata: 0,
      userLang: 'en',
      user: props.user ? props.user : '',
      lab_data: props.lab_data ? props.lab_data : '',
    };
  }

  async componentDidMount() {
    this.site_url = await AsyncStorage.getItem('SITE_URL');
    this.get_lab_tests(1);
  }
  get_lab_tests(p) {
    if (this.callInvoked == 0) {
      var payload =
        '{"where":{"diagnostic_center_user_id":' +
        this.state.lab_data.clinic_user_id +
        ', "branch_id":' +
        this.state.lab_data.id +
        '},"include":{"0":"lab_test", "1":"diagonostic_test_image"}}';
      this.callInvoked = 1;
      this.setState({loading: true});
      this.props
        .diagnostic_center_tests({filter: payload})
        .then(resp => {
          if (resp._metadata && resp._metadata.total == 0) {
            this.setState({nodata: 1, loading: false});
          } else if (resp.data) {
            var datares = resp.data;
            this.callInvoked = 0;
            console.log('data=== == 1 ' + JSON.stringify(resp.data.length));
            if (resp.data.length == 0)
              this.setState({nodata: 1, loading: false, dataList: datares});
            else this.setState({dataList: datares, loading: false});
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
    console.log('data=== data ' + JSON.stringify(data));
    var imageurl = AppConfig.noimage;
    if (data.diagonostic_test_image && data.diagonostic_test_image.id) {
      var md5string =
        'DiagonosticTest' + data.diagonostic_test_image.id + 'pngbig_thumb';
      var imagetemp = AppUtil.MD5(md5string);
      imageurl =
        this.site_url +
        '/images/big_thumb/DiagonosticTest/' +
        data.diagonostic_test_image.id +
        '.' +
        imagetemp +
        '.png';
    }
    return (
      <View
        style={{
          flexDirection: 'row',
          padding: 15,
          borderBottomColor: '#dfdfdf',
          borderBottomWidth: 0.5,
        }}>
        <View>
          <Image
            style={{height: 75, width: 75, marginRight: 10}}
            source={{uri: imageurl}}
          />
        </View>
        <View style={{flexDirection: 'column', flex: 0.8}}>
          <Text style={[AppStyles.regularFontText, {fontSize: 14}]}>
            {data.lab_test.name}{' '}
          </Text>
          <Text style={styles.textBlue}>${data.price}</Text>
        </View>
        <TouchableOpacity onPress={this.editLab.bind(this, data, imageurl)}>
          <Image
            source={require('@images/edit.png')}
            style={{width: 20, height: 20}}
          />
        </TouchableOpacity>
        <View style={{width: 20}} />
        <TouchableOpacity onPress={this.deleteLab.bind(this, data.id)}>
          <Image
            source={require('@images/delete.png')}
            style={{width: 20, height: 20}}
          />
        </TouchableOpacity>
      </View>
    );
  };
  editLab = (data, imageurl) => {
    Actions.LabTest({lab_data: data, reload: this.reload, imageurl: imageurl});
  };
  add = () => {
    Actions.LabTest({reload: this.reload, branch_id: this.state.lab_data.id});
  };

  reload = () => {
    this.get_lab_tests(1);
  };
  deleteLab = id => {
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
              .diagnostic_center_tests({filter: payload})
              .then(resp => {
                if (resp.error && resp.error.code == 0) {
                  this.setState({dataList: [], loading: false});
                  this.get_lab_tests(1);
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
          title={Strings.labtests}
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
