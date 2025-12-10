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
import {AppStyles, AppSizes, AppColors} from '@theme/';
import Strings from '@lib/string.js';
import AppUtil from '@lib/util';
// Components
import {Spacer, Text, Button} from '@ui/';
import {Icon} from '@rneui/themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  questions: UserActions.questions,
  answers: UserActions.answers,
  getUserSpecialities: UserActions.getUserSpecialities,
  branches: UserActions.branches,
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
    questions: PropTypes.func.isRequired,
    answers: PropTypes.func.isRequired,
    getUserSpecialities: PropTypes.func.isRequired,
    branches: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.callInvoked = 0;
    this.speciality_ids = '';
    this.question_answered = [];
    this.answers = [];
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
      selQuestion: '',
      selAnswer: '',
      showPop: 0,
      user_specialities: '',
      cnt: 0,
    };
  }

  componentDidMount() {
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
    if (this.state.user.role_id == 2) this.get_questions(1);
    else {
      var payload = '{"where":{"user_id":' + this.state.user.id + '}}';
      this.props
        .getUserSpecialities({filter: payload})
        .then(resp => {
          if (resp.error && resp.error.code == 0) {
            console.log('get_questions ' + JSON.stringify(resp.data));
            this.setState({user_specialities: resp.data});
            this.speciality_ids = '{';
            for (var i = 0; i < resp.data.length; i++) {
              if (i == 0)
                this.speciality_ids =
                  this.speciality_ids +
                  '"' +
                  i +
                  '":' +
                  resp.data[i].specialty_id;
              else
                this.speciality_ids =
                  this.speciality_ids +
                  ',"' +
                  i +
                  '":' +
                  resp.data[i].specialty_id;
            }
            this.speciality_ids = this.speciality_ids + '}';
            this.getAnswers();
          }
        })
        .catch(() => {
          console.log('error');
        });
    }
  }
  get_questions(p) {
    console.log('callbackcame 33 ' + this.callInvoked);
    if (this.callInvoked == 0) {
      var payload =
        '{"where":{"user_id":' +
        this.state.user.id +
        '},"limit":1000,"skip":0,"include":{"0":"specialty"}}';
      if (this.state.user.role_id == 3) {
        payload =
          '{"where":{"specialty_id":{"inq":' +
          this.speciality_ids +
          '}},"include":{"0":"specialty"},"limit":1000,"skip":0}';
      }
      this.callInvoked = 1;
      this.setState({loading: true});
      this.props
        .questions({filter: payload})
        .then(resp => {
          if (resp._metadata && resp._metadata.total == 0) {
            this.setState({nodata: 1, loading: false});
          } else if (resp.data) {
            var datares = resp.data;
            this.callInvoked = 0;
            console.log('data=== == 1 ' + JSON.stringify(resp.data));
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
    console.log('data=== data ' + JSON.stringify(data));
    var qid = this.question_answered;
    var is_answered = 0;
    var ans_data = '';
    if (qid.length && qid.includes(data.id)) {
      is_answered = 1;
      ans_data = this.answers[data.id];
      console.log('ans_data == ' + JSON.stringify(ans_data));
    }
    return (
      <View
        style={{
          flexDirection: 'row',
          padding: 15,
          borderBottomColor: '#dfdfdf',
          borderBottomWidth: 0.5,
        }}>
        <View style={{flexDirection: 'column', flex: 0.8}}>
          <Text style={[AppStyles.regularFontText, {fontSize: 14}]}>
            <Text style={{fontWeight: 'bold'}}>{Strings.q}: </Text>
            {data.question}
          </Text>
          <Text style={styles.textBlue}>
            {data.organization} {Strings.lblspecialities[data.specialty.id]}
          </Text>
        </View>
        {this.state.user.role_id == 2 ? (
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: 35,
              width: 35,
            }}
            onPress={this.editQuestion.bind(this, data)}>
            <Image
              source={require('@images/edit.png')}
              style={{width: 20, height: 20}}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: 35,
              width: 30,
            }}
            onPress={this.fanswer.bind(this, data, is_answered, ans_data)}>
            {is_answered ? (
              <Text style={{textDecorationLine: 'underline'}}>
                {Strings.edit}
              </Text>
            ) : (
              <Text style={{textDecorationLine: 'underline'}}>
                {Strings.add}
              </Text>
            )}
          </TouchableOpacity>
        )}

        <View style={{width: 20}} />
        {this.state.user.role_id == 2 ? (
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: 35,
              width: 35,
            }}
            onPress={this.viewQuestion.bind(this, data.id, data.question)}>
            <Image
              source={require('@images/view.png')}
              style={{width: 20, height: 20}}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: 35,
              width: 40,
            }}
            onPress={this.viewQuestion.bind(this, data.id, data.question)}>
            <Text style={{textDecorationLine: 'underline'}}>
              {Strings.view}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  fanswer = (data, is_answered, ans_data) => {
    Actions.Answer({
      question_data: data,
      answer_data: ans_data,
      reload: this.reload,
    });
  };
  editQuestion = data => {
    Actions.Question({question_data: data, reload: this.reload});
  };
  add = () => {
    Actions.Question({reload: this.reload});
  };
  reload = () => {
    this.setState({dataList: [], nodata: 0});
    this.callInvoked = 0;
    console.log('callbackcame = ' + this.state.user.role_id);
    if (this.state.user.role_id == 2) this.get_questions(1);
    else this.getAnswers();
  };
  viewQuestion = (id, q) => {
    var payload =
      '{"where":{"question_id":' +
      id +
      '},"include":{"0":"question","1":"user.attachment","2":"user.user_profile"}}';
    this.callInvoked = 1;
    this.setState({loading: true});
    this.props
      .answers({filter: payload})
      .then(resp => {
        if (resp.error && resp.error.code == 0 && resp.data.length > 0) {
          console.log('respdata 11 ' + JSON.stringify(resp.data));
          this.setState({
            showPop: 1,
            loading: false,
            selAnswer: resp.data,
            selQuestion: q,
          });
        } else {
          this.setState({loading: false});
          Alert.alert(AppConfig.appName, Strings.noanswer);
        }
      })
      .catch(() => {
        this.setState({loading: false});
        console.log('error');
      });
  };
  getAnswers() {
    var payload =
      '{"where":{"user_id":' +
      this.state.user.id +
      '},"limit":1000,"skip":0,"include":{"0":"question.specialty"}}';
    this.props
      .answers({filter: payload})
      .then(resp => {
        if (resp.error && resp.error.code == 0) {
          for (var i = 0; i < resp.data.length; i++) {
            this.question_answered.push(resp.data[i].question_id);
            this.answers[resp.data[i].question_id] = resp.data[i];
          }
          console.log('ans_data =11= ' + JSON.stringify(resp.data));
          this.setState({cnt: this.state.cnt + 1});
        }
      })
      .catch(() => {
        console.log('error');
      });
    this.get_questions(1);
  }
  Capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  DiagnosticListingDetail = id => {
    if (this.state.user.role_id == 2) {
      var payload =
        '{"include":{"0":"clinic_user","1":"branch_doctor","2":"branches_specialty.specialty","3":"branches_insurance.insurance","4":"attachment","5":"branch_doctor.user.user_profile","6":"branch_doctor.user.attachment"}}';
      console.log('appointment_settings profile_data ' + id);
      this.setState({loading: true});
      this.props
        .branches({filter: payload, branch_id: id})
        .then(resp => {
          this.setState({loading: false});
          if (resp.error && resp.error.code == 0) {
            console.log(
              'appointment_settings profile_data ' + JSON.stringify(resp.data),
            );
            Actions.BranchListingDetail({profile_data: resp.data});
          }
        })
        .catch(() => {
          this.setState({loading: false});
          console.log('error');
        });
    }
  };
  render() {
    console.log(
      'showPop == ' + this.state.showPop + JSON.stringify(this.state.selAnswer),
    );
    var ans = this.state.selAnswer;
    var adminans = [];
    if (ans.length > 0) {
      console.log('showPop == 11 == ' + JSON.stringify(ans));
      var j = 1;
      for (var i = 0; i < ans.length; i++) {
        console.log(JSON.stringify(ans[i]));
        var r = ans[i].answer;
        var u = ans[i].user.username;
        var uid = ans[i].user.id;
        console.log(JSON.stringify(r));
        adminans.push(
          <View style={{marginBottom: 5}}>
            <Text style={{fontSize: 12}}>
              <Text
                onPress={this.DiagnosticListingDetail.bind(this, uid)}
                style={{
                  fontSize: 14,
                  color: AppColors.brand.navbar,
                  textDecorationLine: 'underline',
                }}>
                {this.Capitalize(u)}
              </Text>
              : {r}
            </Text>
          </View>,
        );
        j++;
      }
    }
    return (
      <View style={[styles.background]}>
        {this.state.user && this.state.user.role_id == 3 ? (
          <NavComponent backArrow={true} title={Strings.myquestions} />
        ) : (
          <NavComponent
            backArrow={true}
            title={Strings.myquestions}
            rightBarAdd={true}
            onRightNavPress={this.add}
          />
        )}

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
        {this.state.showPop == 1 ? (
          <View
            style={{
              position: 'absolute',
              flex: 1,
              height: AppSizes.screen.height,
              width: AppSizes.screen.width,
              backgroundColor: 'rgba(52, 52, 52, 0.8)',
            }}>
            <View
              style={{
                marginTop: 100,
                marginBottom: 100,
                marginLeft: 25,
                marginRight: 25,
                backgroundColor: AppColors.brand.white,
                borderRadius: 15,
              }}>
              <View style={{margin: 10}}>
                <Text
                  style={{
                    color: AppColors.brand.navbar,
                    fontSize: 16,
                    lineHeight: 20,
                  }}>
                  <Text style={{fontWeight: 'bold'}}>{Strings.q}: </Text>
                  {this.state.selQuestion}
                </Text>
              </View>
              <View style={{margin: 10, marginTop: 0}}>
                {adminans.length > 0 ? adminans : Strings.noanswer}
              </View>
              <View style={{height: 20}} />
              <View
                style={{
                  borderRadius: 10,
                  marginBottom: 20,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({showPop: 0});
                  }}
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 30,
                    width: 100,
                    backgroundColor: AppColors.brand.navbar,
                  }}>
                  <Text style={{color: AppColors.brand.white, fontSize: 14}}>
                    {Strings.close}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}
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
