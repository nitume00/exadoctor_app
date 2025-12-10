/**
 * Launch Screen
 *  - Shows a nice loading screen whilst:
 *    - Preloading any specified app content
 *    - Checking if user is logged in, and redirects from there
 *
 * React Native Starter App
 * https://github.com/mcnamee/react-native-starter-app
 */
import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  View,
  Image,
  Alert,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Actions } from "react-native-router-flux";
import { connect } from "react-redux";
import * as UserActions from "@reduxx/user/actions";
// Consts and Libs
import { AppStyles, AppSizes, AppColors } from "@theme/";
import Strings from "@lib/string.js";
/* Styles ==================================================================== */
const styles = StyleSheet.create({
  launchImage: {
    width: AppSizes.screen.width,
    height: AppSizes.screen.height,
  },
});
const mapStateToProps = (state) => {
  return {};
};

// Any actions to map to the component?
const mapDispatchToProps = {
  auth: UserActions.auth,
  getPages: UserActions.getPages,
};
/* Component ==================================================================== */
class AppLaunch extends Component {
  static componentName = "AppLaunch";

  static propTypes = {
    login: PropTypes.func.isRequired,
    auth: PropTypes.func.isRequired,
    getSpecialities: PropTypes.func.isRequired,
    getLanguages: PropTypes.func.isRequired,
    getCountries: PropTypes.func.isRequired,
    getCities: PropTypes.func.isRequired,
    getStates: PropTypes.func.isRequired,
    getInsurances: PropTypes.func.isRequired,
    getPages: PropTypes.func.isRequired,
    settings: PropTypes.func.isRequired,
    localeSettings: PropTypes.func.isRequired,
  };
  constructor() {
    super();
    this.userdata = "";
    console.disableYellowBox = true;
    console.ignoredYellowBox = ["Setting a timer"];
    this._refreshData();
  }
  async _refreshData() {
    this.userdata = await AsyncStorage.getItem("userToken");
  }
  componentDidMount = async () => {
    // Show status bar on app launch
    var lang = await AsyncStorage.getItem("language");
    if (typeof lang == "string" && lang != "") {
      Strings.setLanguage(lang);
    }
    var SITE_URL = await AsyncStorage.getItem("SITE_URL");
    console.log({ SITE_URL });
    AsyncStorage.setItem("close_banner", "0");
    // Preload content here
    if (typeof SITE_URL == "string" && SITE_URL != "") {
      console.log("================================");

      // Promise.all([
      //   this.props.getSpecialities({
      //     filter: '{"skip":0,"limit":1000,"order":"name+asc"}',
      //   }),
      //   this.props.getLanguages({ filter: '{"skip":0,"limit":1000}' }),
      //   this.props.getCountries({ filter: '{"skip":0,"limit":1000}' }),
      //   this.props.getCities({
      //     filter: '{"order":"name+asc","limit":500,"skip":0,"country_id":null}',
      //   }),
      //   this.props.getStates({ filter: '{"skip":0,"limit":1000}' }),
      //   this.props.getInsurances({
      //     filter: '{"order":"name+asc","limit":500,"skip":0,"country_id":null}',
      //   }),
      //   this.props.getPages({ filter: '{"limit":500,"skip":0}' }),
      //   this.props.settings({ filter: '{"skip":0,"limit":500}' }),
      //   this.props.localeSettings("en"),
      //   this.props.localeSettings("fr"),
      // ])
      //   .then(() => {
      console.log("================================");
      // Once we've preloaded basic content,
      // - Try to authenticate based on existing token
      AsyncStorage.getItem("user_id").then((value) => {
        console.log({ value });
        console.log("authuserdata = user_id = " + JSON.stringify(value));
        if (value) {
          var payload = { user_id: value, token: this.userdata };
          this.props
            .auth(payload)
            .then((resp) => {
              console.log("authuserdata = pp = " + JSON.stringify(resp));
              if (resp.data && resp.data.role_id == 3) {
                setTimeout(() => {
                  Actions.doctorapp({ type: "reset" });
                }, 2000);
              } else if (resp.data && resp.data.role_id == 6) {
                setTimeout(() => {
                  Actions.pharmacyapp({ type: "reset" });
                }, 2000);
              } else if (resp.data && resp.data.role_id == 7) {
                setTimeout(() => {
                  Actions.diagnosticapp({ type: "reset" });
                }, 2000);
              } else if (resp.data) {
                setTimeout(() => {
                  Actions.app({ type: "reset" });
                }, 2000);
              } else {
                setTimeout(() => {
                  Actions.Languages({
                    type: "reset",
                    screenTo: "authenticate",
                  });
                }, 2000);
              }
            })
            .catch(() => {
              setTimeout(() => {
                Actions.Languages({
                  type: "reset",
                  screenTo: "authenticate",
                });
              }, 2000);
            });
        } else {
          setTimeout(() => {
            Actions.Languages({ type: "reset", screenTo: "authenticate" });
          }, 2000);
        }
      });
      // })
      // .catch((err) => Alert.alert(err.message));
    } else {
      setTimeout(() => {
        Actions.Languages({ type: "reset", screenTo: "authenticate" });
      }, 3000);
    }
  };

  render = () => (
    <View style={[AppStyles.container]}>
      <StatusBar
        backgroundColor={AppColors.brand.navbar}
        barStyle="light-content"
      />
      <Image
        source={require("@images/launch.jpg")}
        style={[styles.launchImage, AppStyles.containerCentered]}
      ></Image>
    </View>
  );
}

/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps)(AppLaunch);
