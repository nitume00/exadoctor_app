import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Dimensions,
  ListView,
  KeyboardAvoidingView,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {connect} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Rating} from '@rneui/themed';
import * as UserActions from '@reduxx/user/actions';
import Strings from '@lib/string.js';
import AppUtil from '@lib/util';
import Icon from 'react-native-vector-icons/FontAwesome';
import StarRating from 'react-native-star-rating';
import {AppConfig} from '@constants/';
import Loading from '@components/general/Loading';
// Consts and Libs
import {AppStyles, AppSizes, AppColors, AppFonts} from '@theme/';
import NavComponent from '@components/NavComponent.js';
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
  reviews: UserActions.reviews,
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
    minWidth: AppSizes.screen.width / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selected_tab: {
    padding: 15,
    minWidth: AppSizes.screen.width / 2,
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
class Reviews extends Component {
  static propTypes = {
    reviews: PropTypes.func.isRequired,
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
      cfilter: 'doctor',
      userLang: 'en',
      cnt: 0,
      bedside_manner: 0,
      wait_time: 0,
      cbedside_manner: 0,
      cwait_time: 0,
      doctor_review: '',
      branch_review: '',
      user: props.user ? props.user : '',
      review_data: props.review_data ? props.review_data : '',
      doctor_review_msg: '',
      branch_review_msg: '',
      is_doctor_already_reviewed: 0,
      is_branch_already_reviewed: 0,
    };
    this.filter.bind(this);
  }
  componentDidMount() {
    AsyncStorage.getItem('language').then(value => {
      this.localee = value;
    });
    this.getRatings();

    console.log('review_data == ' + JSON.stringify(this.state.review_data));
  }
  getRatings() {
    this.setState({loading: true});
    var payload =
      '{"where":{"user_id":' +
      this.state.user.id +
      ',"to_user_id":' +
      this.state.review_data.provider_user_id +
      ', "foreign_type":"Appointment"}}';
    this.callInvoked = 1;
    this.props
      .reviews({filter: payload})
      .then(resp => {
        if (resp.error && resp.error.code == 0) {
          console.log('review_data =1= ' + JSON.stringify(resp.data));
          this.setState({
            loading: false,
            is_doctor_already_reviewed: 1,
            doctor_review_msg: resp.data[0].message,
            bedside_manner: resp.data[0].bedside_rate,
            wait_time: resp.data[0].waittime_rate,
          });
          var that = this;
          setTimeout(function () {
            that.setState({
              doctor_review_msg: resp.data[0].message,
              bedside_manner: resp.data[0].bedside_rate,
              wait_time: resp.data[0].waittime_rate,
            });
          }, 3000);
        } else this.setState({loading: false});
      })
      .catch(() => {
        this.setState({loading: false});
      });

    this.setState({loading: true});
    var payload =
      '{"where":{"user_id":' +
      this.state.user.id +
      ', "clinic_user_id":' +
      this.state.review_data.clinic_user_id +
      ', "foreign_type":"Branch"}}';
    this.callInvoked = 1;
    this.props
      .reviews({filter: payload})
      .then(resp => {
        if (resp.error && resp.error.code == 0) {
          console.log('review_data =2= ' + JSON.stringify(resp.data));
          this.setState({
            loading: false,
            is_branch_already_reviewed: 1,
            branch_review_msg: resp.data[0].message,
            cbedside_manner: resp.data[0].bedside_rate,
            cwait_time: resp.data[0].waittime_rate,
          });
        } else this.setState({loading: false});
      })
      .catch(() => {
        this.setState({loading: false});
      });
  }
  filter = id => {
    console.log('id=== ' + JSON.stringify(id));
    var cf = '';
    if (id == 'clinic') {
      cf = 'clinic';
    } else if (id == 'doctor') {
      cf = 'doctor';
    }
    this.setState({cfilter: id});
  };

  submit = () => {
    if (this.state.cfilter == 'doctor') {
      if (
        this.state.bedside_manner == 0 ||
        this.state.wait_time == 0 ||
        this.state.doctor_review_msg.trim() == ''
      ) {
        Alert.alert(
          '',
          Strings.allfieldsarerequired,
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
        //http://eprescription.nginxpg.develag.com/api/v1/reviews
        //post
        //{"foreign_id":"36","user_id":65,"to_user_id":"4","branch_id":"1","clinic_user_id":"6","foreign_type":"Appointment","bedside_rate":3,"waittime_rate":3,"message":"Good"}
        //{"foreign_id":"1","user_id":65,"branch_id":"1","clinic_user_id":"6","to_user_id":"4","foreign_type":"Branch","bedside_rate":4,"waittime_rate":2,"message":"ok"}
        this.callInvoked = 1;
        var payload = {
          post_type: 'POST',
          foreign_id: this.state.review_data.id,
          user_id: this.state.user.id,
          to_user_id: this.state.review_data.provider_user_id,
          branch_id: this.state.review_data.branch_id,
          clinic_user_id: this.state.review_data.clinic_user_id,
          foreign_type: 'Appointment',
          bedside_rate: this.state.bedside_manner,
          waittime_rate: this.state.wait_time,
          message: this.state.doctor_review_msg,
        };
        this.props
          .reviews({filter: payload})
          .then(resp => {
            if (resp.error && resp.error.code == 0) {
              console.log('review_data =2= ' + JSON.stringify(resp.data));
              Actions.pop();
              this.setState({
                is_doctor_already_reviewed: 1,
                loading: false,
                branch_review: resp.data,
                cbedside_manner: resp.data[0].bedside_rate,
                cwait_time: resp.data[0].waittime_rate,
              });
            } else {
              this.setState({loading: false});
              if (resp.error && resp.error.message) {
                Alert.alert(
                  '',
                  resp.error.message,
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
              }
            }
          })
          .catch(() => {
            this.setState({loading: false});
          });
      }
    } else {
      if (
        this.state.bedside_manner == 0 ||
        this.state.wait_time == 0 ||
        this.state.branch_review_msg.trim() == ''
      ) {
        Alert.alert(
          '',
          Strings.allfieldsarerequired,
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
        //http://eprescription.nginxpg.develag.com/api/v1/reviews
        //post
        //{"foreign_id":"36","user_id":65,"to_user_id":"4","branch_id":"1","clinic_user_id":"6","foreign_type":"Appointment","bedside_rate":3,"waittime_rate":3,"message":"Good"}
        //{"foreign_id":"1","user_id":65,"branch_id":"1","clinic_user_id":"6","to_user_id":"4","foreign_type":"Branch","bedside_rate":4,"waittime_rate":2,"message":"ok"}
        this.callInvoked = 1;
        var payload = {
          post_type: 'POST',
          foreign_id: this.state.review_data.branch_id,
          user_id: this.state.user.id,
          to_user_id: this.state.review_data.provider_user_id,
          branch_id: this.state.review_data.branch_id,
          clinic_user_id: this.state.review_data.clinic_user_id,
          foreign_type: 'Branch',
          bedside_rate: this.state.bedside_manner,
          waittime_rate: this.state.wait_time,
          message: this.state.branch_review_msg,
        };
        this.props
          .reviews({filter: payload})
          .then(resp => {
            if (resp.error && resp.error.code == 0) {
              console.log('review_data =2= ' + JSON.stringify(resp.data));
              Actions.pop();
              this.setState({
                is_branch_already_reviewed: 1,
                loading: false,
                branch_review: resp.data,
                cbedside_manner: resp.data[0].bedside_rate,
                cwait_time: resp.data[0].waittime_rate,
              });
            } else {
              this.setState({loading: false});
              if (resp.error && resp.error.message) {
                Alert.alert(
                  '',
                  resp.error.message,
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
              }
            }
          })
          .catch(() => {
            this.setState({loading: false});
          });
      }
    }
  };
  render = () => {
    var fclinic =
      this.state.cfilter == 'clinic' ? styles.selected_tab : styles.tab;
    var fdoctor =
      this.state.cfilter == 'doctor' ? styles.selected_tab : styles.tab;

    var fclinict =
      this.state.cfilter == 'clinic'
        ? [AppStyles.regularFontText, styles.fontStyle]
        : [AppStyles.regularFontText, styles.fontStyle];
    var fdoctort =
      this.state.cfilter == 'doctor'
        ? [AppStyles.regularFontText, styles.fontStyle]
        : [AppStyles.regularFontText, styles.fontStyle];

    var disabled = false;
    if (this.callInvoked) disabled = true;

    console.log('bedsiemannerrr == ' + this.state.bedside_manner);
    console.log('bedsiemannerrr wait_time == ' + this.state.wait_time);
    return (
      <View style={[styles.background]}>
        <NavComponent backArrow={true} title={Strings.ratingandreviews} />
        {this.state.review_data &&
        this.state.review_data.provider_user &&
        this.state.review_data.provider_user.is_individual == 1 ? null : (
          <View
            style={{
              backgroundColor: '#303030',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: AppSizes.screen.width,
            }}>
            <TouchableOpacity
              onPress={() => {
                this.setState({cfilter: 'doctor'});
              }}
              style={fdoctor}>
              <Text style={fdoctort}>{Strings.fordoctors}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                this.setState({cfilter: 'clinic'});
              }}
              style={fclinic}>
              <Text style={fclinict}>{Strings.forbranch}</Text>
            </TouchableOpacity>
          </View>
        )}
        {this.state.cfilter == 'doctor' ? (
          <ScrollView style={{flex: 1}}>
            <View style={{flexDirection: 'row', padding: 10, paddingTop: 20}}>
              <View style={{flex: 0.7}}>
                <Text>{Strings.bedsidemanner}</Text>
              </View>
              {/*rating wont change so condition added and code duplicated*/}
              {this.state.is_doctor_already_reviewed == 0 ? (
                <StarRating
                  disabled={false}
                  maxStars={5}
                  starSize={15}
                  rating={this.state.bedside_manner}
                  selectedStar={rating => {
                    this.setState({bedside_manner: rating});
                  }}
                />
              ) : (
                <StarRating
                  disabled={true}
                  maxStars={5}
                  starSize={15}
                  rating={this.state.bedside_manner}
                  selectedStar={rating => {
                    this.setState({bedside_manner: rating});
                  }}
                />
              )}
            </View>
            <View style={{flexDirection: 'row', padding: 10}}>
              <View style={{flex: 0.7}}>
                <Text>{Strings.waittimemanner}</Text>
              </View>
              {/*rating wont change so condition added and code duplicated*/}
              {this.state.is_doctor_already_reviewed == 0 ? (
                <StarRating
                  disabled={false}
                  maxStars={5}
                  starSize={15}
                  rating={this.state.wait_time}
                  selectedStar={rating => {
                    this.setState({wait_time: rating});
                  }}
                />
              ) : (
                <StarRating
                  disabled={true}
                  maxStars={5}
                  starSize={15}
                  rating={this.state.wait_time}
                  selectedStar={rating => {
                    this.setState({wait_time: rating});
                  }}
                />
              )}
            </View>
            <View style={{flex: 1, flexDirection: 'row', padding: 10}}>
              {this.state.is_doctor_already_reviewed == 0 ? (
                <TextInput
                  style={[
                    AppStyles.regularFontText,
                    {
                      padding: 3,
                      flex: 1,
                      textAlignVertical: 'top',
                      height: 100,
                      borderColor: AppColors.brand.black,
                      borderWidth: 0.5,
                      borderRadius: 5,
                    },
                  ]}
                  onChangeText={doctor_review_msg =>
                    this.setState({doctor_review_msg})
                  }
                  underlineColorAndroid={'transparent'}
                  numberOfLines={5}
                  multiline={true}
                  value={this.state.doctor_review_msg}
                  autoCapitalize={'sentences'}
                  placeholder={Strings.review}
                />
              ) : (
                <View style={{flex: 1}}>
                  <Text
                    style={[
                      AppStyles.regularFontText,
                      {
                        color: AppColors.brand.navbar,
                        fontSize: 14,
                        paddingBottom: 5,
                      },
                    ]}>
                    {Strings.review}:
                  </Text>
                  <Text
                    style={[
                      AppStyles.regularFontText,
                      {color: AppColors.brand.black},
                    ]}>
                    {this.state.doctor_review_msg}
                  </Text>
                </View>
              )}
            </View>
            <View style={{flex: 1}}>
              {this.state.is_doctor_already_reviewed == 0 ? (
                <Button
                  onPress={this.submit}
                  title={Strings.submit}
                  backgroundColor={AppColors.brand.buttonclick}
                  fontSize={15}
                />
              ) : null}
            </View>
            <View style={{height: 150}} />
          </ScrollView>
        ) : null}
        {this.state.cfilter == 'clinic' ? (
          <ScrollView style={{flex: 1}}>
            <View style={{flexDirection: 'row', padding: 10, paddingTop: 20}}>
              <View style={{flex: 0.7}}>
                <Text>{Strings.bedsidemanner}</Text>
              </View>
              <StarRating
                disabled={
                  this.state.is_branch_already_reviewed == 0 ? false : true
                }
                maxStars={5}
                starSize={15}
                rating={this.state.cbedside_manner}
                selectedStar={rating => {
                  this.setState({cbedside_manner: rating});
                }}
              />
            </View>
            <View style={{flexDirection: 'row', padding: 10}}>
              <View style={{flex: 0.7}}>
                <Text>{Strings.waittimemanner}</Text>
              </View>
              <StarRating
                disabled={
                  this.state.is_branch_already_reviewed == 0 ? false : true
                }
                maxStars={5}
                starSize={15}
                rating={this.state.cwait_time}
                selectedStar={rating => {
                  this.setState({cwait_time: rating});
                }}
              />
            </View>
            <View style={{flex: 1, flexDirection: 'row', padding: 10}}>
              {this.state.is_branch_already_reviewed == 0 ? (
                <TextInput
                  style={[
                    AppStyles.regularFontText,
                    {
                      padding: 3,
                      flex: 1,
                      textAlignVertical: 'top',
                      height: 100,
                      borderColor: AppColors.brand.black,
                      borderWidth: 0.5,
                      borderRadius: 5,
                    },
                  ]}
                  onChangeText={branch_review_msg =>
                    this.setState({branch_review_msg})
                  }
                  underlineColorAndroid={'transparent'}
                  numberOfLines={5}
                  multiline={true}
                  value={this.state.branch_review_msg}
                  autoCapitalize={'sentences'}
                  placeholder={Strings.review}
                />
              ) : (
                <View style={{flex: 1}}>
                  <Text
                    style={[
                      AppStyles.regularFontText,
                      {
                        color: AppColors.brand.navbar,
                        fontSize: 14,
                        paddingBottom: 5,
                      },
                    ]}>
                    {Strings.review}:
                  </Text>
                  <Text
                    style={[
                      AppStyles.regularFontText,
                      {color: AppColors.brand.black},
                    ]}>
                    {this.state.branch_review_msg}
                  </Text>
                </View>
              )}
            </View>
            <View style={{flex: 1}}>
              {this.state.is_branch_already_reviewed == 0 ? (
                <Button
                  onPress={this.submit}
                  title={Strings.submit}
                  backgroundColor={AppColors.brand.buttonclick}
                  fontSize={15}
                />
              ) : null}
            </View>
            <View style={{height: 150}} />
          </ScrollView>
        ) : null}
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
export default connect(mapStateToProps, mapDispatchToProps)(Reviews);
