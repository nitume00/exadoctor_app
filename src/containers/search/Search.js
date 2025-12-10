/**
 * Authenticate Screen
 *  - Entry screen for all authentication
 *  - User can tap to login, forget password, signup...
 *
 * React Native Starter App
 * https://github.com/mcnamee/react-native-starter-app
 */
import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  View,
  Image,
  StatusBar,
  BackHandler,
  StyleSheet,
  ScrollView,
  Keyboard,
  Alert,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNExitApp from "react-native-exit-app";
import * as UserActions from "@reduxx/user/actions";
import { Actions } from "react-native-router-flux";
import { connect } from "react-redux";
import { AppConfig } from "@constants/";
import InternetConnection from "@components/InternetConnection.js";
var moment = require("moment");
import Strings from "@lib/string.js";
import { CheckBox } from "@rneui/themed";

import SideMenu from "react-native-side-menu-updated";
import Menu from "@containers/ui/Menu/MenuContainer";
import Icon from "react-native-vector-icons/Ionicons";

// Consts and Libs
import { AppStyles, AppSizes, AppColors } from "@theme/";
import NavComponent from "@components/NavComponent.js";
// Components
import { Spacer, Text, Button, Card, FormInput, LblFormInput } from "@ui/";
import CustomDropdown from "../../components/general/CustomDropDown";
const mapStateToProps = (state) => {
  console.log("specialities == " + JSON.stringify(state.user.specialities));
  return {
    user: state.user.user_data,
    specialities: state.user.specialities,
    cities: state.user.cities,
    states: state.user.states,
    insurances: state.user.insurances,
    languages: state.user.languages,
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};
// import ModalPicker from 'react-native-modal-picker';
// Any actions to map to the component?
const mapDispatchToProps = {
  getSpecialities: UserActions.getSpecialities,
  getLanguages: UserActions.getLanguages,
  getCountries: UserActions.getCountries,
  getCities: UserActions.getCities,
  getStates: UserActions.getStates,
  getInsurances: UserActions.getInsurances,
  user_subscriptions: UserActions.user_subscriptions,
};
/* Styles ==================================================================== */
const styles = StyleSheet.create({
  background: {
    backgroundColor: AppColors.brand.primary,
    flex: 1,
  },
  selected: {
    backgroundColor: "#364469",
    height: 30,
    minWidth: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  nselected: {
    backgroundColor: AppColors.brand.navbar,
    height: 30,
    minWidth: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  wtxtStyle: {
    color: AppColors.brand.white,
    lineHeight: 26,
    fontSize: 11,
  },
  ntxtStyle: {
    color: AppColors.brand.white,
    lineHeight: 26,
    fontSize: 11,
  },
});

/* Component ==================================================================== */
class Search extends Component {
  static componentName = "Search";
  constructor(props) {
    super(props);
    this.state = {
      is_search: 1,
      user: props.user ? props.user : "",
      cities: props.cities ? props.cities : "",
      states: props.states ? props.states : "",
      specialities: props.specialities ? props.specialities : "",
      insurances: props.insurances ? props.insurances : "",
      languages: props.languages ? props.languages : "",
      language_id: "",
      city_id: "",
      speciality_id: "",
      insurance_id: "",
      labkeyword: "",
      doctorkeyword: "",
      clinickeyword: "",
      gender_id: 0,
      user_subscription: "",
      close_banner: 0,
      isOpen: false,
      selectedItem: "About",
    };
    this.localee = "EN";
    (this.locale_fr = props.locale_fr ? props.locale_fr : ""),
      (this.locale_en = props.locale_en ? props.locale_en : ""),
      (this.toggle = this.toggle.bind(this));
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);

    console.log("jsonssss == " + JSON.stringify(props.user));
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }

  updateMenuState(isOpen) {
    this.setState({ isOpen });
  }

  onMenuItemSelected = (item) => {
    this.setState({
      isOpen: false,
      selectedItem: item,
    });
  };

  componentWillReceiveProps(nextProps) {
    AsyncStorage.getItem("language").then((value) => {
      this.localee = value;
    });
  }

  componentDidMount() {
    if (this.props.profile_redirect) {
      Actions.profileView({ fill_profile: 1 });
    }
    if (
      this.state.user &&
      this.state.user.role_id == 2 &&
      this.state.user.user_profile &&
      !this.state.user.user_profile.address
    ) {
      Actions.profileView({ fill_profile: 1 });
    }

    AsyncStorage.getItem("language").then((value) => {
      this.localee = value;
    });

    AsyncStorage.getItem("close_banner").then((value) => {
      this.setState({ close_banner: value });
      if (
        value &&
        value == 0 &&
        this.state.user &&
        this.state.user.role_id == 5 &&
        this.state.user.is_plan_subscribed == 0
      ) {
        //Actions.subscription({ reloadBanner: this.reloadBanner });
      }
    });
    if (this.state.user && this.state.user.role_id == 5) {
      this.props
        .user_subscriptions({
          filter: '{"where":{"subscription_status_id":2},"order":"id desc"}',
        })
        .then((resp) => {
          if (resp.error.code == 0 && resp.data.length) {
            this.setState({ user_subscription: resp.data });
          }
        })
        .catch(() => {
          this.setState({ loading: false });
          console.log("error");
        });
    }

    if (this.state.specialities == "") {
      this.props
        .getSpecialities({
          filter: '{"skip":0,"limit":1000,"order":"name+asc"}',
        })
        .then((resp) => {
          console.log("ggggggg " + JSON.stringify(resp));
          if (resp.data && resp.data.length) {
            this.setState({ specialities: resp.data });
          }
        })
        .catch((error) => {});

      this.props
        .getInsurances({
          filter: '{"order":"name+asc","limit":500,"skip":0,"country_id":null}',
        })
        .then((resp) => {
          if (resp.data && resp.data.length) {
            this.setState({ insurances: resp.data });
          }
        })
        .catch((error) => {});

      this.props
        .getStates({
          filter: '{"order":"name+asc","limit":1000,"skip":0}',
        })
        .then((resp) => {
          if (resp.data && resp.data.length) {
            this.setState({ states: resp.data });
          }
        })
        .catch((error) => {});

      this.props
        .getCountries({ filter: '{"skip":0,"limit":1000}' })
        .then((resp) => {
          if (resp.data && resp.data.length) {
            this.setState({ countries: resp.data });
          }
        })
        .catch((error) => {});

      this.props
        .getCities({
          filter: '{"order":"name+asc","limit":500,"skip":0,"country_id":null}',
        })
        .then((resp) => {
          if (resp.data && resp.data.length) {
            this.setState({ cities: resp.data });
          }
        })
        .catch((error) => {});

      this.props
        .getLanguages({ filter: '{"skip":0,"limit":1000}' })
        .then((resp) => {
          if (resp.data && resp.data.length) {
            this.setState({ languages: resp.data });
          }
        })
        .catch((error) => {});
    }
  }
  getCities = () => {
    this.props
      .getCities({
        filter:
          '{"order":"name+asc","limit":500,"skip":0,"where":{"state_id":' +
          this.state.state_id +
          "}}",
      })
      .then((resp) => {
        console.log(resp?.data, "CHECK KRW CITITES");
        if (resp.data && resp.data.length) {
          this.setState({ cities: resp.data });
        }
      })
      .catch((error) => {});
  };

  reloadBanner = () => {
    AsyncStorage.getItem("close_banner").then((value) => {
      this.setState({ close_banner: value });
    });
  };

  closeBanner = () => {
    this.setState({ close_banner: 1 });
    AsyncStorage.setItem("close_banner", "1");
  };

  componentWillMount() {
    BackHandler.addEventListener(
      "hardwareBackPress",
      this.handleBackButtonClick
    );
  }
  componentWillUnmount() {
    BackHandler.removeEventListener(
      "hardwareBackPress",
      this.handleBackButtonClick
    );
  }
  handleBackButtonClick() {
    RNExitApp.exitApp();
  }
  handleValueChange = (value, vmspecialities) => {
    let option = vmspecialities.find((item) => item.key === value());

    this.setState({
      SpecialityText: option.label,
      speciality_id: `${option.key}`,
    });
  };
  handleRegionChange = (value, vmstates) => {
    let option = vmstates.find((item) => item.key === value());

    this.setState(
      {
        state_lbl: option.label,
        state_id: `${option.key}`,
        cities: [],
      },
      this.getCities
    );
  };
  handleCityChange = (value, vmcities) => {
    let option = vmcities.find((item) => item.key === value());

    this.setState({
      city_lbl: option.label,
      city_id: `${option.key}`,
    });
  };
  handleInsuranceChange = (value, vminsurances) => {
    let option = vminsurances.find((item) => item.key === value());

    this.setState({
      insurance_lbl: option.label,
      insurance_id: `${option.key}`,
    });
  };
  handleLanguageChange = (value, vmlanguages) => {
    let option = vmlanguages.find((item) => item.key === value());

    this.setState({
      language_lbl: option.label,
      language_id: `${option.key}`,
    });
  };

  render = () => {
    var doctorStyle = "";
    var clinicStyle = "";
    var labStyle = "";
    var dtxtStyle = "";
    var ctxtStyle = "";
    var ltxtStyle = "";

    if (this.state.is_search == 1) {
      doctorStyle = styles.nselected;
      clinicStyle = styles.selected;
      labStyle = styles.selected;

      dtxtStyle = styles.ntxtStyle;
      ctxtStyle = styles.wtxtStyle;
      ltxtStyle = styles.wtxtStyle;
    } else if (this.state.is_search == 2) {
      doctorStyle = styles.selected;
      clinicStyle = styles.nselected;
      labStyle = styles.selected;

      dtxtStyle = styles.wtxtStyle;
      ctxtStyle = styles.ntxtStyle;
      ltxtStyle = styles.wtxtStyle;
    } else if (this.state.is_search == 3) {
      doctorStyle = styles.selected;
      clinicStyle = styles.selected;
      labStyle = styles.nselected;

      dtxtStyle = styles.wtxtStyle;
      ctxtStyle = styles.wtxtStyle;
      ltxtStyle = styles.ntxtStyle;
    }

    var vmspecialities = [];
    if (this.state.specialities) {
      var carrayspecialities = this.state.specialities;
      Object.keys(carrayspecialities).forEach(function (key) {
        var lbl = carrayspecialities[key].name;
        vmspecialities.push({
          key: carrayspecialities[key].id,
          label: Strings.lblspecialities[carrayspecialities[key].id],
        });
      });

      vmspecialities.sort((a, b) => {
        return a?.label?.localeCompare(b?.label);
      });
      vmspecialities.unshift({
        key: 0,
        section: true,
        label: Strings.choosespeciality,
      });
    }

    var vmcities = [];
    if (this.state.cities) {
      var carraycities = this.state.cities;
      var lang = this.locale_en;
      if (this.localee != "EN") {
        lang = this.locale_fr;
      }
      Object.keys(carraycities).forEach(function (key) {
        var lbl = carraycities[key].name;
        if (lbl) {
          vmcities.push({
            key: carraycities[key].id,
            label: lang[lbl] ? lang[lbl] : lbl,
          });
        }
      });
      vmcities.sort((a, b) => {
        return a.label.localeCompare(b.label);
      });
      vmcities.unshift({ key: 0, section: true, label: Strings.city });
    }

    var vmstates = [];
    if (this.state.states) {
      var carraystates = this.state.states;

      var that = this;
      Object.keys(carraystates).forEach(function (key) {
        var lbl = carraystates[key].name;
        if (that.localee == "EN") {
          lbl = lbl.trim();
          if (lbl)
            vmstates.push({
              key: carraystates[key].id,
              label:
                that.locale_en && that.locale_en[lbl]
                  ? that.locale_en[lbl]
                  : lbl,
            });
        } else if (that.localee != "EN") {
          lbl = lbl.trim();
          if (lbl) {
            vmstates.push({
              key: carraystates[key].id,
              label:
                that.locale_fr && that.locale_fr[lbl]
                  ? that.locale_fr[lbl]
                  : lbl,
            });
          }
        }
      });

      vmstates.sort((a, b) => {
        return a.label.localeCompare(b.label);
      });
      vmstates.unshift({ key: 0, section: true, label: Strings.region });
    }

    var vminsurances = [];
    if (this.state.insurances) {
      var carrayinsurances = this.state.insurances;
      Object.keys(carrayinsurances).forEach(function (key) {
        var lbl = Strings.lblinsurances[carrayinsurances[key].id];
        vminsurances.push({
          key: carrayinsurances[key].id,
          label: Strings.lblinsurances[carrayinsurances[key].id],
        });
      });

      vminsurances.sort((a, b) => {
        return a.label.localeCompare(b.label);
      });
      vminsurances.unshift({ key: 0, section: true, label: Strings.insurance });
    }

    var vmlanguages = [];
    if (this.state.languages) {
      var carraylanguages = this.state.languages;
      Object.keys(carraylanguages).forEach(function (key) {
        var lbl = carraylanguages[key].name;
        vmlanguages.push({ key: carraylanguages[key].id, label: lbl });
      });

      vmlanguages.sort((a, b) => {
        return a.label.localeCompare(b.label);
      });
      vmlanguages.unshift({ key: 0, section: true, label: Strings.language });
    }

    var welcomeTxt = Strings.welcomeplansubscriptiontext;
    if (
      this.state.user &&
      this.state.user.role_id == 5 &&
      this.state.user.is_plan_subscribed != 0 &&
      this.state.user_subscription != "" &&
      this.state.user_subscription[0].subscription &&
      this.state.user_subscription[0].subscription.id == 1
    ) {
      welcomeTxt = welcomeTxt.replace(
        "######",
        moment(this.state.user_subscription[0].expiry_date).format(
          "MMM DD, YYYY"
        )
      );
    }

    var paddingXTop = 20;
    var heightXTop = 55;
    if (Platform.OS == "ios" && AppSizes.screen.height >= 812) {
      paddingXTop = 45;
      heightXTop = 80;
    }

    const menu = <Menu onItemSelected={this.onMenuItemSelected} />;
    return (
      <SideMenu
        menu={menu}
        isOpen={this.state.isOpen}
        onChange={(isOpen) => this.updateMenuState(isOpen)}
      >
        <StatusBar
          backgroundColor={AppColors.brand.navbar}
          barStyle="light-content"
        />
        <View style={[styles.background]}>
          <View
            style={{
              height: heightXTop,
              paddingTop: paddingXTop,
              flexDirection: "row",
              backgroundColor: AppColors.brand.navbar,
            }}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16, color: "#fff" }}>EXADOCTOR</Text>
            </View>
            <TouchableOpacity
              onPress={this.toggle}
              style={{
                width: 35,
                paddingTop: paddingXTop,
                justifyContent: "center",
                alignItems: "center",
                position: "absolute",
              }}
            >
              <Icon name={"menu"} size={30} color={"#FFF"} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {this.state.user &&
            this.state.user.role_id == 5 &&
            this.state.user.is_plan_subscribed != 0 &&
            this.state.user_subscription != "" &&
            this.state.user_subscription[0].subscription &&
            this.state.user_subscription[0].subscription.id == 1 ? (
              <View
                style={{
                  padding: 20,
                  borderColor: AppColors.brand.alertborder,
                  backgroundColor: AppColors.brand.alertbg,
                }}
              >
                <Text
                  style={[
                    AppStyles.regularFontText,
                    {
                      fontSize: 12,
                      color: AppColors.brand.alerttext,
                    },
                  ]}
                >
                  {welcomeTxt}
                </Text>
              </View>
            ) : null}
            {this.state.user &&
            this.state.user.role_id == 5 &&
            this.state.user.is_plan_subscribed == 0 &&
            this.state.close_banner == 0 ? (
              <View
                style={{
                  padding: 20,
                  borderColor: AppColors.brand.alertborder,
                  backgroundColor: AppColors.brand.alertbg,
                }}
              >
                <Text
                  style={[
                    AppStyles.regularFontText,
                    {
                      fontSize: 12,
                      color: AppColors.brand.alerttext,
                    },
                  ]}
                >
                  {Strings.noplanssubscribed}{" "}
                  <Text
                    onPress={this.closeBanner}
                    style={[
                      AppStyles.regularFontText,
                      {
                        marginLeft: 15,
                        fontSize: 12,
                        color: AppColors.brand.navbar,
                        textDecorationLine: "underline",
                        fontStyle: "italic",
                      },
                    ]}
                  >
                    {this.state.close_banner == 0
                      ? Strings.iwillpaylater
                      : null}
                  </Text>
                </Text>
              </View>
            ) : null}
            <View
              style={{
                flex: 1,
                justifyContent: "flex-start",
                alignItems: "center",
              }}
            >
              <Spacer size={15} />
              <Text style={{ textAlign: "center", fontSize: 12 }}>
                {Strings.findyourperfect}
              </Text>
              <Spacer size={10} />
              <Text
                style={[
                  AppStyles.boldedFontText,
                  {
                    textAlign: "center",
                    fontSize: 15,
                    lineHeight: 24,
                    color: "#66F445",
                  },
                ]}
              >
                {Strings.homelabel}
              </Text>
              <Spacer size={5} />
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  color: AppColors.brand.navbar,
                }}
              >
                {Strings.homesublabel}
              </Text>
              <Spacer size={15} />
              <View
                style={{
                  flexDirection: "row",
                  borderRadius: 5,
                  padding: 1,
                  backgroundColor: AppColors.brand.grey,
                  borderWidth: 0.3,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    this.setState({ is_search: 1 });
                  }}
                  style={[
                    doctorStyle,
                    {
                      borderBottomLeftRadius: 5,
                      borderTopLeftRadius: 5,
                    },
                  ]}
                >
                  <Text style={[AppStyles.lightFontText1, dtxtStyle]}>
                    {Strings.doctor}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({ is_search: 2 });
                  }}
                  style={[clinicStyle, { borderColor: AppColors.brand.grey }]}
                >
                  <Text style={[AppStyles.lightFontText1, ctxtStyle]}>
                    {Strings.hospitalorclinic}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({ is_search: 3 });
                  }}
                  style={[
                    labStyle,
                    {
                      borderBottomRightRadius: 5,
                      borderTopRightRadius: 5,
                    },
                  ]}
                >
                  <Text style={[AppStyles.lightFontText1, ltxtStyle]}>
                    {Strings.diagnosticcenter}
                  </Text>
                </TouchableOpacity>
              </View>
              <Spacer size={15} />
              <View style={{ minWidth: AppSizes.screen.width }}>
                {this.state.is_search == 1 ? (
                  <LblFormInput
                    select_opt={false}
                    lblText={false}
                    height={60}
                    placeholderTxt={Strings.doctor}
                    lblTxt={Strings.doctor}
                    value={this.state.doctorkeyword}
                    onChangeText={(text) => {
                      this.setState({
                        doctorkeyword: text,
                      });
                    }}
                  />
                ) : null}
                {this.state.is_search == 2 ? (
                  <LblFormInput
                    select_opt={false}
                    lblText={false}
                    height={60}
                    placeholderTxt={Strings.clinics}
                    lblTxt={Strings.clinics}
                    value={this.state.clinickeyword}
                    onChangeText={(text) => {
                      this.setState({
                        clinickeyword: text,
                      });
                    }}
                  />
                ) : null}
                {this.state.is_search == 3 ? (
                  <LblFormInput
                    select_opt={false}
                    lblText={false}
                    height={60}
                    placeholderTxt={Strings.diagnosticcenter}
                    lblTxt={Strings.diagnosticcenter}
                    value={this.state.labkeyword}
                    onChangeText={(text) => {
                      this.setState({ labkeyword: text });
                    }}
                  />
                ) : null}
                {this.state.is_search != 3 ? (
                  <View
                    style={{
                      borderBottomWidth: 0.3,
                      borderColor: AppColors.brand.black,
                    }}
                  >
                    {/* <ModalPicker
                      cancelText={Strings.cancel}
                      data={vmspecialities}
                      initValue={Strings.speciality}
                      sectionTextStyle={{
                        textAlign: 'left',
                        color: '#000',
                        fontSize: 16,
                        fontWeight: 'bold',
                      }}
                      optionTextStyle={{
                        textAlign: 'left',
                        color: '#000',
                        fontSize: 16,
                        fontWeight: 'normal',
                      }}
                      cancelStyle={{
                        backgroundColor: '#F75174',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 50 / 2,
                      }}
                      cancelTextStyle={{
                        fontSize: 20,
                        fontWeight: 'normal',
                      }}
                      overlayStyle={{
                        backgroundColor: 'rgba(0,0,0,0.9)',
                      }}
                      onChange={option => {
                        this.setState({
                          speciality_lbl: option.label,
                          speciality_id: `${option.key}`,
                        });
                      }}>
                      <LblFormInput
                        lblText={false}
                        height={60}
                        placeholderTxt={Strings.speciality}
                        lblTxt={Strings.speciality}
                        select_opt={true}
                        value={this.state.speciality_lbl}
                        editable={false}
                      />
                    </ModalPicker> */}
                    <CustomDropdown
                      options={vmspecialities}
                      placeholder={Strings.hospitalorclinictype}
                      onChangeValue={(value) =>
                        this.handleValueChange(value, vmspecialities)
                      }
                      schema={{
                        label: "label",
                        value: "key",
                      }}
                      defaultValue={
                        this?.state?.speciality_id != "" &&
                        this.state?.speciality_id.toString()
                      }
                    />
                  </View>
                ) : null}
                <View
                  style={{
                    borderBottomWidth: 0.3,
                    borderColor: AppColors.brand.black,
                  }}
                >
                  {/* <ModalPicker
                    cancelText={Strings.cancel}
                    data={vmstates}
                    initValue={Strings.region}
                    sectionTextStyle={{
                      textAlign: 'left',
                      color: '#000',
                      fontSize: 16,
                      fontWeight: 'bold',
                    }}
                    optionTextStyle={{
                      textAlign: 'left',
                      color: '#000',
                      fontSize: 16,
                      fontWeight: 'normal',
                    }}
                    cancelStyle={{
                      backgroundColor: '#F75174',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 50 / 2,
                    }}
                    cancelTextStyle={{
                      fontSize: 20,
                      fontWeight: 'normal',
                    }}
                    overlayStyle={{
                      backgroundColor: 'rgba(0,0,0,0.9)',
                    }}
                    onChange={option => {
                      this.setState(
                        {
                          state_lbl: option.label,
                          state_id: `${option.key}`,
                        },
                        this.getCities,
                      );
                    }}>
                    <LblFormInput
                      lblText={false}
                      height={60}
                      placeholderTxt={Strings.region}
                      lblTxt={Strings.region}
                      select_opt={true}
                      value={this.state.state_lbl}
                      editable={false}
                    />
                  </ModalPicker> */}
                  <CustomDropdown
                    options={vmstates}
                    placeholder={Strings.region}
                    onChangeValue={(value) =>
                      this.handleRegionChange(value, vmstates)
                    }
                    schema={{
                      label: "label",
                      value: "key",
                    }}
                    defaultValue={
                      this?.state?.state_id != "" &&
                      this.state?.state_id?.toString()
                    }
                    // defaultValue={
                    //   this?.state?.hospitalorclinictypeid != "" &&
                    //   this.state?.hospitalorclinictypeid.toString()
                    // }
                  />
                </View>
                <View
                  style={{
                    borderBottomWidth: 0.3,
                    borderColor: AppColors.brand.black,
                  }}
                >
                  {this.state.state_id && this.state.state_id != "" ? (
                    <></>
                  ) : (
                    // <ModalPicker
                    //   cancelText={Strings.cancel}
                    //   data={vmcities}
                    //   initValue={Strings.area}
                    //   sectionTextStyle={{
                    //     textAlign: 'left',
                    //     color: '#000',
                    //     fontSize: 16,
                    //     fontWeight: 'bold',
                    //   }}
                    //   optionTextStyle={{
                    //     textAlign: 'left',
                    //     color: '#000',
                    //     fontSize: 16,
                    //     fontWeight: 'normal',
                    //   }}
                    //   cancelStyle={{
                    //     backgroundColor: '#F75174',
                    //     justifyContent: 'center',
                    //     alignItems: 'center',
                    //     borderRadius: 50 / 2,
                    //   }}
                    //   cancelTextStyle={{
                    //     fontSize: 20,
                    //     fontWeight: 'normal',
                    //   }}
                    //   overlayStyle={{
                    //     backgroundColor: 'rgba(0,0,0,0.9)',
                    //   }}
                    //   onChange={option => {
                    //     this.setState({
                    //       city_lbl: option.label,
                    //       city_id: `${option.key}`,
                    //     });
                    //   }}>
                    //   <LblFormInput
                    //     lblText={false}
                    //     height={60}
                    //     placeholderTxt={Strings.area}
                    //     lblTxt={Strings.area}
                    //     select_opt={true}
                    //     value={this.state.city_lbl}
                    //     editable={false}
                    //   />
                    // </ModalPicker>
                    // <LblFormInput
                    //   lblText={false}
                    //   height={60}
                    //   placeholderTxt={Strings.area}
                    //   lblTxt={Strings.area}
                    //   select_opt={true}
                    //   value={this.state.city_lbl}
                    //   editable={false}
                    // />

                    // <CustomDropdown
                    //   options={vmcities}
                    //   placeholder={Strings.area}
                    //   onChangeValue={(value) =>
                    //     this.handleCityChange(value, vmcities)
                    //   }
                    //   schema={{
                    //     label: "label",
                    //     value: "key",
                    //   }}
                    // />
                    <></>
                  )}
                  {this.state.cities.length > 0 && this.state.state_id && (
                    <CustomDropdown
                      options={vmcities}
                      placeholder={Strings.area}
                      onChangeValue={(value) =>
                        this.handleCityChange(value, vmcities)
                      }
                      schema={{
                        label: "label",
                        value: "key",
                      }}
                      defaultValue={
                        this?.state?.city_id != "" &&
                        this.state?.city_id.toString()
                      }
                    />
                  )}
                </View>
                {this.state.is_search == 1 || this.state.is_search == 2 ? (
                  <View
                    style={{
                      borderBottomWidth: 0.3,
                      borderColor: AppColors.brand.black,
                    }}
                  >
                    <></>
                    {/* <ModalPicker
                      cancelText={Strings.cancel}
                      data={vminsurances}
                      initValue={Strings.insurance}
                      sectionTextStyle={{
                        textAlign: 'left',
                        color: '#000',
                        fontSize: 16,
                        fontWeight: 'bold',
                      }}
                      optionTextStyle={{
                        textAlign: 'left',
                        color: '#000',
                        fontSize: 16,
                        fontWeight: 'normal',
                      }}
                      cancelStyle={{
                        backgroundColor: '#F75174',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 50 / 2,
                      }}
                      cancelTextStyle={{
                        fontSize: 20,
                        fontWeight: 'normal',
                      }}
                      overlayStyle={{
                        backgroundColor: 'rgba(0,0,0,0.9)',
                      }}
                      onChange={option => {
                        this.setState({
                          insurance_lbl: option.label,
                          insurance_id: `${option.key}`,
                        });
                      }}>
                      <LblFormInput
                        lblText={false}
                        height={60}
                        placeholderTxt={Strings.insurance}
                        lblTxt={Strings.insurance}
                        select_opt={true}
                        value={this.state.insurance_lbl}
                        editable={false}
                      />
                    </ModalPicker> */}
                    <CustomDropdown
                      options={vminsurances}
                      placeholder={Strings.insurance}
                      onChangeValue={(value) =>
                        this.handleInsuranceChange(value, vminsurances)
                      }
                      schema={{
                        label: "label",
                        value: "key",
                      }}
                      defaultValue={
                        this?.state?.insurance_id != "" &&
                        this.state?.insurance_id.toString()
                      }
                    />
                  </View>
                ) : null}
                {this.state.is_search == 1 || this.state.is_search == 2 ? (
                  <View
                    style={{
                      borderBottomWidth: 0.3,
                      borderColor: AppColors.brand.black,
                    }}
                  >
                    <></>
                    {/* <ModalPicker
                      cancelText={Strings.cancel}
                      data={vmlanguages}
                      initValue={Strings.language}
                      sectionTextStyle={{
                        textAlign: 'left',
                        color: '#000',
                        fontSize: 16,
                        fontWeight: 'bold',
                      }}
                      optionTextStyle={{
                        textAlign: 'left',
                        color: '#000',
                        fontSize: 16,
                        fontWeight: 'normal',
                      }}
                      cancelStyle={{
                        backgroundColor: '#F75174',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 50 / 2,
                      }}
                      cancelTextStyle={{
                        fontSize: 20,
                        fontWeight: 'normal',
                      }}
                      overlayStyle={{
                        backgroundColor: 'rgba(0,0,0,0.9)',
                      }}
                      onChange={option => {
                        this.setState({
                          language_lbl: option.label,
                          language_id: `${option.key}`,
                        });
                      }}>
                      <LblFormInput
                        lblText={false}
                        height={60}
                        placeholderTxt={Strings.language}
                        lblTxt={Strings.language}
                        select_opt={true}
                        value={this.state.language_lbl}
                        editable={false}
                      />
                    </ModalPicker> */}
                    <CustomDropdown
                      options={vmlanguages}
                      placeholder={Strings.language}
                      onChangeValue={(value) =>
                        this.handleLanguageChange(value, vmlanguages)
                      }
                      schema={{
                        label: "label",
                        value: "key",
                      }}
                      defaultValue={
                        this?.state?.language_id != "" &&
                        this.state?.language_id.toString()
                      }
                    />
                  </View>
                ) : null}
                {this.state.is_search == 1 || this.state.is_search == 2 ? (
                  <View
                    style={{
                      borderBottomWidth: 0.3,
                      padding: 10,
                      paddingTop: 15,
                      paddingBottom: 15,
                      alignItems: "center",
                      borderColor: AppColors.brand.black,
                      flexDirection: "row",
                    }}
                  >
                    <Text
                      style={{
                        flex: 0.24,
                        color: AppColors.brand.txtplaceholder,
                      }}
                    >
                      {Strings.gender}
                    </Text>
                    <CheckBox
                      title={Strings.any}
                      checkedIcon="dot-circle-o"
                      uncheckedIcon="circle-o"
                      checked={this.state.gender_id == 0 ? true : false}
                      containerStyle={{
                        margin: 0,
                        padding: 0,
                        borderWidth: 0,
                        flex: 0.23,
                      }}
                      textStyle={[AppStyles.regularFontText, { fontSize: 14 }]}
                      onPress={() => this.setState({ gender_id: 0 })}
                    />
                    <CheckBox
                      title={Strings.male}
                      checkedIcon="dot-circle-o"
                      uncheckedIcon="circle-o"
                      checked={this.state.gender_id == 1 ? true : false}
                      containerStyle={{
                        margin: 0,
                        padding: 0,
                        borderWidth: 0,
                        flex: 0.27,
                      }}
                      textStyle={[AppStyles.regularFontText, { fontSize: 14 }]}
                      onPress={() => this.setState({ gender_id: 1 })}
                    />
                    <CheckBox
                      title={Strings.female}
                      checkedIcon="dot-circle-o"
                      uncheckedIcon="circle-o"
                      checked={this.state.gender_id == 2 ? true : false}
                      containerStyle={{
                        margin: 0,
                        padding: 0,
                        borderWidth: 0,
                        flex: 0.3,
                      }}
                      textStyle={[AppStyles.regularFontText, { fontSize: 14 }]}
                      onPress={() => this.setState({ gender_id: 2 })}
                    />
                  </View>
                ) : null}
                <Spacer size={15} />
                <TouchableOpacity
                  onPress={() => {
                    this.setState({
                      SpecialityText: "",
                      speciality_id: "",
                      insurance_id: "",
                      city_id: "",
                      language_id: "",
                      doctorkeyword: "",
                      clinickeyword: "",
                      labkeyword: "",
                      city_lbl: "",
                      speciality_lbl: "",
                      insurance_lbl: "",
                      language_lbl: "",
                      state_lbl: "",
                      state_id: "",
                    });
                  }}
                >
                  <Text
                    style={[
                      AppStyles.boldedFontText,
                      {
                        marginLeft: 10,
                        textDecorationLine: "underline",
                        fontSize: 11,
                      },
                    ]}
                  >
                    {Strings.clearfilters}
                  </Text>
                </TouchableOpacity>
                <Spacer size={15} />
                <Button
                  title={Strings.search}
                  backgroundColor={"#b41aea"}
                  fontSize={15}
                  onPress={() => {
                    Actions.Listing({
                      is_search: this.state.is_search,
                      speciality_id: this.state.speciality_id,
                      insurance_id: this.state.insurance_id,
                      state_id: this.state.state_id,
                      city_id: this.state.city_id,
                      language_id: this.state.language_id,
                      gender_id: this.state.gender_id,
                      doctorkeyword: this.state.doctorkeyword.trim(),
                      clinickeyword: this.state.clinickeyword.trim(),
                      labkeyword: this.state.labkeyword.trim(),
                    });
                  }}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </SideMenu>
    );
  };
}

/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps)(Search);
