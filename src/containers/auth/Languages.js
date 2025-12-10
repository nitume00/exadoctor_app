import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  BackHandler,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as UserActions from "@reduxx/user/actions";
import { Actions } from "react-native-router-flux";
import { connect } from "react-redux";
import { AppConfig } from "@constants/";
import Loading from "@components/general/Loading";
import { CheckBox } from "@rneui/themed";

import Strings from "@lib/string.js";
import NavComponent from "@components/NavComponent.js";
// Consts and Libs
import { AppStyles, AppSizes, AppColors } from "@theme/";
// Components
import { Spacer, Text, Button, Card, FormInput, LblFormInput } from "@ui/";
import RNExitApp from "react-native-exit-app";
const mapStateToProps = (state) => {
  return {
    user: state.user.user_data,
    country_code_list: state.user.countries,
    city_list: state.user.cities,
    state_list: state.user.states,
  };
};
const mapDispatchToProps = {
  getSpecialities: UserActions.getSpecialities,
  getLanguages: UserActions.getLanguages,
  getCountries: UserActions.getCountries,
  getCities: UserActions.getCities,
  getStates: UserActions.getStates,
  getInsurances: UserActions.getInsurances,
  settings: UserActions.settings,
  localeSettings: UserActions.localeSettings,
  auth: UserActions.auth,
  getPages: UserActions.getPages,
  country_urls: UserActions.country_urls,
};

/* Styles ====================================================================  */
const styles = StyleSheet.create({
  background: {
    backgroundColor: AppColors.brand.white,
    flex: 1,
    alignItems: "flex-start",
  },
  col: {
    width: AppSizes.screen.width / 2 - 10,
  },
  header: {
    fontWeight: "bold",
    fontSize: 12,
  },

  headerGrey: {
    fontSize: 12,
    color: "#ada8a8",
  },
  normalText11: {
    fontWeight: "normal",
    fontSize: 11,
  },
  logo: {
    width: AppSizes.screen.width * 0.85,
    resizeMode: "contain",
  },
  whiteText: {
    color: "#FFF",
  },
  col: {
    width: AppSizes.screen.width / 2 - 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

var servers = [];

/* Component ==================================================================== */
class Languages extends Component {
  static componentName = "Languages";
  constructor(props) {
    super(props);
    this.state = {
      role_id: props.user ? props.user.role_id : "",
      setURL: false,
      instanceURL: "",
      currency: "",
      loading: false,
      country_urls: [],
      country_furls: [],
    };
    this.lang = "en";
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.setInstanceURL = this.setInstanceURL.bind(this);
  }
  async componentWillMount() {
    var lang = await AsyncStorage.getItem("language");
    var surl = await AsyncStorage.getItem("SITE_URL");
    if (typeof lang == "string" && lang == "en") {
      AsyncStorage.setItem("language", "en");
      Strings.setLanguage("en");
      this.lang = "en";
    } else if (typeof lang == "string" && lang == "fr") {
      AsyncStorage.setItem("language", "fr");
      Strings.setLanguage("fr");
      this.lang = "fr";
    }

    if (typeof lang == "string" && typeof surl == "string") {
      this.redirect();
    } else if (
      typeof lang == "string" &&
      typeof surl != "string" &&
      !this.props.coming_from
    ) {
      this.setState({ setURL: true });
    }

    BackHandler.addEventListener(
      "hardwareBackPress",
      this.handleBackButtonClick
    );

    this.props
      .country_urls({
        filter: {
          where: { is_active: true },
          skip: 0,
          limit: 500,
          order: "comment+asc",
        },
      })
      .then((resp) => {
        if (resp.data && resp.data.length) {
          this.setState({ country_urls: resp.data });
        }
      })
      .catch((error) => {});
    this.props
      .country_urls({
        filter: {
          where: { is_active: true },
          skip: 0,
          limit: 500,
          order: "comment_fr+asc",
        },
      })
      .then((resp) => {
        if (resp.data && resp.data.length) {
          this.setState({ country_furls: resp.data });
        }
      })
      .catch((error) => {});
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      "hardwareBackPress",
      this.handleBackButtonClick
    );
  }

  handleBackButtonClick() {
    if (this.props.screenTo && this.props.screenTo == "authenticate")
      RNExitApp.exitApp();
  }

  redirect = async () => {
    this.setState({ loading: true });
    await this.props.getSpecialities({
      filter: '{"skip":0,"limit":1000,"order":"name+asc"}',
    });
    await this.props.getLanguages({ filter: '{"skip":0,"limit":1000}' });
    await this.props.getCountries({ filter: '{"skip":0,"limit":1000}' });
    await this.props.getCities({
      filter: '{"order":"name+asc","limit":500,"skip":0,"country_id":null}',
    });
    await this.props.getStates({ filter: '{"skip":0,"limit":1000}' });
    await this.props.getInsurances({
      filter: '{"order":"name+asc","limit":500,"skip":0,"country_id":null}',
    });
    await this.props.getPages({ filter: '{"limit":500,"skip":0}' });
    await this.props.localeSettings("en");
    await this.props.localeSettings("fr");

    var site_url = await AsyncStorage.getItem("SITE_URL");
    var lang = await AsyncStorage.getItem("language");
    var site_comment = await AsyncStorage.getItem("SITE_COMMENT_FR");
    if (typeof lang == "string" && lang == "en")
      site_comment = await AsyncStorage.getItem("SITE_COMMENT_EN");

    if (site_url && typeof site_url == "string") {
      this.setState({ loading: false });
      if (this.state.role_id && this.state.role_id == 3)
        Actions.doctorapp({ type: "reset", site_url: site_comment });
      else if (this.state.role_id && this.state.role_id == 6)
        Actions.pharmacyapp({ type: "reset", site_url: site_comment });
      else if (this.state.role_id && this.state.role_id == 7)
        Actions.diagnosticapp({ type: "reset", site_url: site_comment });
      else if (this.state.role_id && this.state.role_id != "")
        Actions.app({ type: "reset", site_url: site_comment });
      else Actions.authenticate({ type: "reset", site_url: site_comment });
    } else {
      this.setState({ setURL: true, loading: false });
    }
  };

  validateSettings = async () => {
    var re =
      /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
    var lang = await AsyncStorage.getItem("language");
    var site_comment = await AsyncStorage.getItem("SITE_COMMENT_FR");
    if (typeof lang == "string" && lang == "en")
      site_comment = await AsyncStorage.getItem("SITE_COMMENT_EN");

    if (this.state.instanceURL == "") {
      Alert.alert(
        "",
        Strings.selectyoursiteurl,
        [
          {
            text: "OK",
            onPress: () => {
              console.log("OK Pressed");
            },
          },
        ],
        { cancelable: false }
      );
    } else if (!re.test(this.state.instanceURL)) {
      Alert.alert(
        "",
        Strings.entervalidsiteurl,
        [
          {
            text: "OK",
            onPress: () => {
              console.log("OK Pressed");
            },
          },
        ],
        { cancelable: false }
      );
    } else {
      this.setState({ loading: true });
      try {
        var settings = await this.props.settings({
          filter: '{"skip":0,"limit":500}',
          site_url: this.state.instanceURL,
        });
        var valid_site = 0;
        if (settings.data) {
          var s = settings.data;
          var siteURL = this.state.instanceURL;
          for (var i = 0; i < s.length; i++) {
            if (s[i]["name"] == "SITE_CURRENCY_CODE") {
              // AsyncStorage.setItem('SITE_CURRENCY_CODE', s[i]['value']);
              AsyncStorage.setItem("SITE_URL", siteURL);
              valid_site = 1;
            }
            if (s[i]["name"] == "CURRENCY_SYMBOL") {
              // AsyncStorage.setItem('CURRENCY_SYMBOL', s[i]['value']);
            }
          }

          if (valid_site) {
            this.setState({ loading: false });
            console.log("jsonee == 11 ");
            Promise.all([
              this.props.getSpecialities({
                filter: '{"skip":0,"limit":1000,"order":"name+asc"}',
              }),
              this.props.getLanguages({ filter: '{"skip":0,"limit":1000}' }),
              this.props.getCountries({ filter: '{"skip":0,"limit":1000}' }),
              this.props.getCities({
                filter:
                  '{"order":"name+asc","limit":500,"skip":0,"country_id":null}',
              }),
              this.props.getStates({ filter: '{"skip":0,"limit":1000}' }),
              this.props.getInsurances({
                filter:
                  '{"order":"name+asc","limit":500,"skip":0,"country_id":null}',
              }),
              this.props.getPages({ filter: '{"limit":500,"skip":0}' }),
              this.props.localeSettings("en"),
              this.props.localeSettings("fr"),
            ])
              .then(() => {
                // Once we've preloaded basic content,
                // - Try to authenticate based on existing token
                AsyncStorage.getItem("user_id").then((value) => {
                  console.log(
                    "authuserdata = user_id = " + JSON.stringify(value)
                  );
                  if (value) {
                    var payload = { user_id: value, token: this.userdata };
                    this.props
                      .auth(payload)
                      .then((resp) => {
                        console.log(
                          "authuserdata = pp = " + JSON.stringify(resp)
                        );
                        if (resp.data && resp.data.role_id == 3)
                          Actions.doctorapp({
                            type: "reset",
                            site_url: site_comment,
                          });
                        else if (resp.data && resp.data.role_id == 6)
                          Actions.pharmacyapp({
                            type: "reset",
                            site_url: site_comment,
                          });
                        else if (resp.data && resp.data.role_id == 7)
                          Actions.diagnosticapp({
                            type: "reset",
                            site_url: site_comment,
                          });
                        else if (resp.data)
                          Actions.app({
                            type: "reset",
                            site_url: site_comment,
                          });
                        else
                          Actions.authenticate({
                            type: "reset",
                            screenTo: "authenticate",
                            site_url: site_comment,
                          });
                      })
                      .catch(() => {
                        Actions.authenticate({
                          type: "reset",
                          screenTo: "authenticate",
                          site_url: site_comment,
                        });
                      });
                  } else {
                    Actions.authenticate({
                      type: "reset",
                      screenTo: "authenticate",
                      site_url: site_comment,
                    });
                  }
                });
              })
              .catch((err) => Alert.alert(err.message));
          } else {
            Alert.alert(
              "",
              Strings.siteurlisnotvalid,
              [
                {
                  text: "OK",
                  onPress: () => {
                    this.setState({ loading: false });
                  },
                },
              ],
              { cancelable: false }
            );
          }
        } else {
          Alert.alert(
            "",
            Strings.siteurlisnotvalid,
            [
              {
                text: "OK",
                onPress: () => {
                  this.setState({ loading: false });
                },
              },
            ],
            { cancelable: false }
          );
        }
      } catch (err) {
        Alert.alert(
          "",
          Strings.siteurlisnotvalid,
          [
            {
              text: "OK",
              onPress: () => {
                this.setState({ loading: false });
              },
            },
          ],
          { cancelable: false }
        );
      }
    }
  };

  setInstanceURL = (obj) => {
    var t = this.lang == "en" ? obj.comment : obj.comment_fr;
    AsyncStorage.setItem("SITE_COMMENT", t);
    AsyncStorage.setItem("SITE_COMMENT_EN", obj.comment);
    AsyncStorage.setItem("SITE_COMMENT_FR", obj.comment_fr);
    this.setState({ instanceURL: obj.url });
  };

  render = () => {
    var paddingXTop = 25;
    if (Platform.OS == "ios" && AppSizes.screen.height >= 812) paddingXTop = 40;

    if (this.state.setURL == false) {
      return (
        <ScrollView>
          <View style={[styles.background]}>
            <StatusBar
              backgroundColor={AppColors.brand.navbar}
              barStyle="light-content"
            />
            <View style={{ flex: 0.85 }}>
              <View
                style={{ backgroundColor: "#3cc3f1", height: paddingXTop }}
              />
              <Image
                style={{
                  width: AppSizes.screen.width,
                  height: AppSizes.screen.width * 0.9555,
                }}
                source={require("../../images/p2-top.jpg")}
              />
              <View
                style={{
                  height: 180,
                  margin: 10,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    AsyncStorage.setItem("language", "en");
                    Strings.setLanguage("en");
                    this.lang = "en";
                    if (
                      this.props.screenTo &&
                      this.props.screenTo == "authenticate"
                    ) {
                      this.setState({ setURL: true });
                    } else {
                      this.redirect();
                    }
                  }}
                  style={{
                    width: 70,
                    height: 70,
                    backgroundColor: AppColors.brand.btnColor,
                    borderRadius: 50,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      padding: 5,
                      color: AppColors.brand.white,
                    }}
                  >
                    English
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    AsyncStorage.setItem("language", "fr");
                    Strings.setLanguage("fr");
                    this.lang = "fr";
                    if (
                      this.props.screenTo &&
                      this.props.screenTo == "authenticate"
                    ) {
                      this.setState({ setURL: true });
                    } else {
                      this.redirect();
                    }
                  }}
                  style={{
                    width: 70,
                    height: 70,
                    marginTop: 20,
                    backgroundColor: AppColors.brand.btnColor,
                    borderRadius: 50,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      padding: 5,
                      color: AppColors.brand.white,
                    }}
                  >
                    Français
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View
              style={{
                flex:
                  Platform.OS == "ios" && AppSizes.screen.height >= 812
                    ? 0.11
                    : 0.15,
              }}
            >
              <Image
                style={{ width: AppSizes.screen.width, resizeMode: "contain" }}
                source={require("../../images/p2-bot.jpg")}
              />
            </View>
            {Platform.OS == "ios" && AppSizes.screen.height >= 812 ? (
              <View
                style={{
                  width: AppSizes.screen.width,
                  flex: 0.05,
                  backgroundColor: "#3cc3f1",
                }}
              />
            ) : null}
            {this.state.loading ? (
              <View style={AppStyles.LoaderStyle}>
                <Loading color={AppColors.brand.primary} />
              </View>
            ) : null}
          </View>
        </ScrollView>
      );
    } else {
      myBoxes = [];
      var lang = this.lang;
      servers =
        lang == "en" ? this.state.country_urls : this.state.country_furls;
      for (var i = 0; i < servers.length; i++) {
        myBoxes.push(
          <CheckBox
            title={lang == "en" ? servers[i].comment : servers[i].comment_fr}
            checkedIcon="dot-circle-o"
            uncheckedIcon="circle-o"
            value={servers[i].url}
            textStyle={[AppStyles.regularFontText]}
            checked={this.state.instanceURL == servers[i].url ? true : false}
            onPress={this.setInstanceURL.bind(this, servers[i])}
          />
        );
      }
      return (
        <View style={{ flex: 1 }}>
          <StatusBar
            backgroundColor={AppColors.brand.navbar}
            barStyle="light-content"
          />
          <View style={{ backgroundColor: "#3cc3f1", height: paddingXTop }} />
          <View style={{ flex: 1, padding: 10, marginTop: 10 }}>
            <View
              style={{
                padding: 10,
                borderRadius: 10,
                backgroundColor: AppColors.brand.btnColor,
              }}
            >
              <Text
                style={[
                  AppStyles.semiBoldedFontText,
                  { color: AppColors.brand.white, fontSize: 14 },
                ]}
              >
                {Strings.configureappdetails}
              </Text>
            </View>
            <Text
              style={[
                AppStyles.semiBoldedFontText,
                { color: AppColors.brand.red, fontSize: 16, marginTop: 20 },
              ]}
            >
              {Strings.selectyoursiteurl}:
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {myBoxes}
            </ScrollView>
            <Spacer size={15} />
            <View style={{ flexDirection: "row", width: "100%" }}>
              <Button
                onPress={() => {
                  this.setState({ setURL: false });
                }}
                title={Strings.back}
                backgroundColor={AppColors.brand.buttonclick}
                fontSize={15}
                containerStyle={{ width: "49%" }}
              />
              <View style={{ width: "2%" }} />
              <Button
                onPress={this.validateSettings}
                title={Strings.submit}
                backgroundColor={AppColors.brand.buttonclick}
                fontSize={15}
                containerStyle={{ width: "49%" }}
              />
            </View>
            {Platform.OS == "ios" && AppSizes.screen.height >= 812 ? (
              <Spacer size={10} />
            ) : null}
          </View>
          {this.state.loading ? (
            <View style={AppStyles.LoaderStyle}>
              <Loading color={AppColors.brand.primary} />
            </View>
          ) : null}
        </View>
      );
    }
  };
}

/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps)(Languages);
