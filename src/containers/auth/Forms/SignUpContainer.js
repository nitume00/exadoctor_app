import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  View,
  Image,
  StyleSheet,
  Alert,
  Linking,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loading from "@components/general/Loading";
import { Actions } from "react-native-router-flux";
import * as UserActions from "@reduxx/user/actions";
import { connect } from "react-redux";
import { AppConfig } from "@constants/";
import AppUtil from "@lib/util";
import Strings from "@lib/string.js";
import NavComponent from "@components/NavComponent.js";
import { AppStyles, AppSizes, AppColors, AppFonts } from "@theme/";
import { CheckBox } from "@rneui/themed";
import { Spacer, Text, Button, Card, FormInput, LblFormInput } from "@ui/";
import CustomCountryPicker from "../../../components/general/CustomCountryPicker";
import CustomDropdown from "../../../components/general/CustomDropDown";
const mapStateToProps = (state) => {
  console.log("mapStateToProps == " + JSON.stringify(state.user.specialities));
  return {
    countries: state.user.countries,
    specialities: state.user.specialities,
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};
const mapDispatchToProps = {
  signup: UserActions.signup,
  auth: UserActions.auth,
  getCountries: UserActions.getCountries,
  getSpecialities: UserActions.getSpecialities,
  getLanguages: UserActions.getLanguages,
  getCities: UserActions.getCities,
  getStates: UserActions.getStates,
  getInsurances: UserActions.getInsurances,
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: AppColors.brand.navbar,
    flex: 1,
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
    backgroundColor: "transparent",
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

class SignUp extends Component {
  static componentName = "SignUp";
  static propTypes = {
    signup: PropTypes.func.isRequired,
    auth: PropTypes.func.isRequired,
    getCountries: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirm_password: "",
      is_patient: 1,
      loading: false,
      countries: props.countries ? props.countries : [],
      specialities: props.specialities ? props.specialities : [],
      country: "",
      gender_id: "",
      CountryText: "",
      SpecialityText: "",
      is_individual: false,
      speciality_id: "",
      textInputValue: "",
      phone: "",
      phoneCode: "+",
      referencecode: "",
      just_popit: props.just_popit ? props.just_popit : "",
    };
    this.localee = "en";
    this.locale_fr = props.locale_fr ? props.locale_fr : "";
    this.locale_en = props.locale_en ? props.locale_en : "";
    this.confirmpwd = "";
    this.enteremail = "";
    this.enterpwd = "";
    this.enterusername = "";
    //console.log("Strings === " + JSON.stringify(Strings));
    //Strings.setLanguage('qr');
  }
  terms = () => {
    Linking.openURL(AppConfig.terms_url).catch((err) =>
      console.error("An error occurred", err)
    );
  };
  reload = () => {
    if (this.state.just_popit == 1) Actions.pop();
  };
  signup = async () => {
    var email = this.state.email;
    email = email.trim();
    var pwd = this.state.password;
    pwd = pwd.trim();
    var cpwd = this.state.confirm_password;
    var re = /^.+@.+\..+$/i;
    cpwd = cpwd.trim();
    var first_name = this.state.first_name;
    first_name = first_name.trim();
    var last_name = this.state.last_name;
    last_name = last_name.trim();
    var phone = this.state.phone;
    phone = phone.trim();

    //console.log("pickedObject==> " + this.state.country);
    if (first_name == "") {
      Alert.alert(
        AppConfig.appName,
        Strings.enteryourfirstname,
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
    } else if (first_name.length < 3) {
      Alert.alert(
        AppConfig.appName,
        Strings.fminimumlength,
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
    } else if (last_name == "") {
      Alert.alert(
        AppConfig.appName,
        Strings.enteryourlastname,
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
    } else if (last_name.length < 3) {
      Alert.alert(
        AppConfig.appName,
        Strings.lminimumlength,
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
    } else if (email == "") {
      Alert.alert(
        AppConfig.appName,
        Strings.enteryouremail,
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
    } else if (!re.test(email)) {
      Alert.alert(
        AppConfig.appName,
        Strings.entervalidemail,
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );
    } else if (pwd == "") {
      Alert.alert(
        AppConfig.appName,
        Strings.enteryourpassword,
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
    } else if (pwd.length < 6) {
      Alert.alert(
        AppConfig.appName,
        Strings.minlenghtpwd,
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );
    } else if (cpwd == "") {
      Alert.alert(
        AppConfig.appName,
        Strings.confirmyourpassword,
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
    } else if (pwd.length < 6) {
      Alert.alert(
        AppConfig.appName,
        Strings.minlengthpassword,
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );
    } else if (cpwd != pwd) {
      Alert.alert(
        AppConfig.appName,
        Strings.passwordmismatch,
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );
    } else if (this.state.CountryText == "") {
      Alert.alert(
        AppConfig.appName,
        Strings.choosecountry,
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
    } else if (phone == "") {
      Alert.alert(
        AppConfig.appName,
        Strings.entervalidphonenumber,
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
    } else if (!AppUtil.validateInt(phone)) {
      Alert.alert(
        AppConfig.appName,
        Strings.entervalidphonenumber,
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
    } else if (phone.length < 7 || phone.length > 13) {
      Alert.alert(
        AppConfig.appName,
        Strings.entervalidphonenumber,
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
    } else if (this.state.gender_id == "" || this.state.gender_id == 0) {
      Alert.alert(
        AppConfig.appName,
        Strings.selectgender,
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
    } else if (
      this.state.is_patient == 0 &&
      (this.state.speciality_id == 0 || this.state.speciality_id == "")
    ) {
      Alert.alert(
        AppConfig.appName,
        Strings.choosespeciality,
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
      this.localee = await AsyncStorage.getItem("language");
      if (this.localee == "en") this.localee = "English";
      else this.localee = "French";
      this.setState({ loading: true });
      var payload = {
        first_name: this.state.first_name,
        last_name: this.state.last_name,
        email: this.state.email.trim(),
        password: this.state.password,
        confirm_password: this.state.confirm_password,
        mobile: this.state.phone,
        mobile_code: this.state.country,
        gender_id: this.state.gender_id,
        reference_code: this.state.referencecode.trim(),
        prefered_language: this.localee,
        role_id: 2,
      };
      if (this.state.is_patient == 0) {
        payload = {
          first_name: this.state.first_name,
          last_name: this.state.last_name,
          email: this.state.email.trim(),
          password: this.state.password,
          confirm_password: this.state.confirm_password,
          mobile: this.state.phone,
          mobile_code: this.state.country,
          is_individual: this.state.is_individual ? 1 : 0,
          gender_id: this.state.gender_id,
          role_id: 3,
          prefered_language: this.localee,
          primary_speciality_id: this.state.speciality_id,
        };
      }
      this.setState({ loading: true });
      this.props
        .signup(payload)
        .then((resp) => {
          this.setState({ loading: false });
          var p = "";
          if (
            resp.data.error.fields &&
            resp.data.error.fields.mobile &&
            resp.data.error.fields.email
          ) {
            p = Strings.emailandmobilealreadyexist;
            Alert.alert(
              AppConfig.appName,
              p,
              [{ text: "OK", onPress: () => console.log("OK Pressed") }],
              { cancelable: false }
            );
          } else if (resp.data.error.fields && resp.data.error.fields.mobile) {
            p = Strings.mobilealreadyexist;
            Alert.alert(
              AppConfig.appName,
              p,
              [{ text: "OK", onPress: () => console.log("OK Pressed") }],
              { cancelable: false }
            );
          } else if (resp.data.error.fields && resp.data.error.fields.email) {
            p = Strings.emailreadyexist;
            Alert.alert(
              AppConfig.appName,
              p,
              [{ text: "OK", onPress: () => console.log("OK Pressed") }],
              { cancelable: false }
            );
          } else if (resp.data.error && resp.data.error.code == "") {
            p = Strings.registersuccessful;
            Alert.alert(
              AppConfig.appName,
              p,
              [
                {
                  text: "OK",
                  onPress: () => {
                    Actions.otp({
                      user_data: resp.data,
                      email: this.state.email,
                      password: this.state.password,
                      just_popit: this.state.just_popit,
                      reload: this.reload,
                    });
                  },
                },
              ],
              { cancelable: false }
            );
          } else {
            p = Strings.error;
            Alert.alert(
              AppConfig.appName,
              p,
              [{ text: "OK", onPress: () => console.log("OK Pressed") }],
              { cancelable: false }
            );
          }
        })
        .catch(() => {
          console.log("error");
        });
    }
  };
  async componentDidMount() {
    this.localee = await AsyncStorage.getItem("language");
    if (this.state.specialities == "") {
      this.props
        .getCountries({ filter: '{"skip":0,"limit":1000}' })
        .then((resp) => {
          if (resp.data && resp.data.length) {
            this.setState({ countries: resp.data });
          }
        })
        .catch((error) => {});
      this.props
        .getSpecialities({
          filter: '{"skip":0,"limit":1000,"order":"name+asc"}',
        })
        .then((resp) => {
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
        .getStates({ filter: '{"skip":0,"limit":1000}' })
        .then((resp) => {
          if (resp.data && resp.data.length) {
            this.setState({ states: resp.data });
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
  updateText = (t) => {
    console.log("t", t);
    this.setState({ email: t.replace(/\s/g, "") });
  };

  handleValueChange = (value, vmspecialities) => {
    let option = vmspecialities.find((item) => item.key === value());

    this.setState({
      SpecialityText: option.label,
      speciality_id: `${option.key}`,
    });
  };

  render = () => {
    var patientStyle = "";
    var patientTxtStyle = "";
    var doctorStyle = "";
    var doctorTxtStyle = "";
    if (this.state.is_patient) {
      patientStyle = {
        marginLeft: 5,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 30,
        height: 30,
        width: 140,
        borderWidth: 1,
        borderColor: AppColors.brand.white,
        backgroundColor: AppColors.brand.white,
      };
      patientTxtStyle = { color: AppColors.brand.black };
      doctorStyle = {
        marginRight: 5,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 30,
        height: 30,
        width: 140,
        borderWidth: 1,
        borderColor: AppColors.brand.white,
      };
      doctorTxtStyle = { color: AppColors.brand.white };
    } else {
      patientStyle = {
        marginLeft: 5,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 30,
        height: 30,
        width: 140,
        borderWidth: 1,
        borderColor: AppColors.brand.white,
      };
      patientTxtStyle = { color: AppColors.brand.white };
      doctorStyle = {
        marginRight: 5,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 30,
        height: 30,
        width: 140,
        borderWidth: 1,
        borderColor: AppColors.brand.white,
        backgroundColor: AppColors.brand.white,
      };
      doctorTxtStyle = { color: AppColors.brand.black };
    }
    var carray = this.state.countries;
    var vmcountry_data = [];
    var country_isoo = [];
    var vmspecialities = [];
    Object.keys(carray).forEach(function (key) {
      var lbl = Strings.lblCountries[carray[key].name]
        ? Strings.lblCountries[carray[key].name]
        : carray[key].name;
      vmcountry_data.push({ key: carray[key].id, label: lbl.toString() });
    });
    vmcountry_data.sort((a, b) => {
      return a.label.localeCompare(b.label);
    });
    vmcountry_data.unshift({
      key: 0,
      section: true,
      label: Strings.choosecountry,
    });
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
        return a?.label?.localeCompare(b.label);
      });
      vmspecialities.unshift({
        key: 0,
        section: true,
        label: Strings.choosespeciality,
      });
    }

    return (
      <View style={[styles.background]}>
        <NavComponent backArrow={true} title={Strings.register} />
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
          <View
            style={{
              flexDirection: "row",
              backgroundColor: AppColors.brand.navbar,
              width: AppSizes.screen.width,
              justifyContent: "center",
              alignItems: "center",
              paddingBottom: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                this.setState({ is_patient: 1 });
              }}
              style={patientStyle}
            >
              <Text style={patientTxtStyle}>{Strings.lblpatient}</Text>
            </TouchableOpacity>
            <View style={{ width: 20 }} />
            <TouchableOpacity
              onPress={() => {
                this.setState({ is_patient: 0 });
              }}
              style={doctorStyle}
            >
              <Text style={doctorTxtStyle}>{Strings.lbldoctor}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <ScrollView style={{ paddingBottom: 20, flex: 1 }}>
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    backgroundColor: "transparent",
                    padding: 0,
                    borderBottomWidth: 0.3,
                    borderColor: AppColors.brand.black,
                  }}
                >
                  <View style={[AppStyles.centerAligned, { height: 60 }]}>
                    <Image
                      source={require("@images/regname.png")}
                      style={{
                        margin: 0,
                        padding: 0,
                        height: 40,
                        width: 40,
                        resizeMode: "contain",
                      }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <LblFormInput
                      autoCapitalize={"sentences"}
                      lblText={false}
                      height={60}
                      placeholderTxt={Strings.firstname + "*"}
                      lblTxt={Strings.firstname}
                      value={this.state.first_name}
                      onChangeText={(first_name) =>
                        this.setState({ first_name })
                      }
                    />
                    <LblFormInput
                      autoCapitalize={"sentences"}
                      lblText={false}
                      height={60}
                      placeholderTxt={Strings.lastname + "*"}
                      lblTxt={Strings.lastname}
                      value={this.state.last_name}
                      onChangeText={(last_name) => this.setState({ last_name })}
                    />
                  </View>
                </View>
                <View style={{ marginLeft: 5 }}>
                  <LblFormInput
                    reg_image={"regemail"}
                    lblText={false}
                    height={60}
                    placeholderTxt={Strings.email + "*"}
                    lblTxt={Strings.email}
                    value={this.state.email}
                    onChangeText={this.updateText}
                    onEndEditing={(event) => {
                      var txt = event.nativeEvent.text;
                      txt = txt.replace(/\s/g, "");
                      this.setState({ email: txt });
                    }}
                    onSubmitEditing={(event) => {
                      var txt = event.nativeEvent.text;
                      txt = txt.replace(/\s/g, "");
                      this.setState({ email: txt });
                    }}
                  />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    backgroundColor: "transparent",
                    padding: 0,
                    borderBottomWidth: 0.3,
                    borderColor: AppColors.brand.black,
                  }}
                >
                  <View style={[AppStyles.centerAligned, { height: 60 }]}>
                    <Image
                      source={require("@images/regpassword.png")}
                      style={{
                        margin: 0,
                        padding: 0,
                        height: 40,
                        width: 40,
                        resizeMode: "contain",
                      }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <LblFormInput
                      lblText={false}
                      height={60}
                      placeholderTxt={Strings.password + "*"}
                      lblTxt={Strings.password}
                      secureTextEntry={true}
                      value={this.state.password}
                      onChangeText={(password) => this.setState({ password })}
                    />
                    <LblFormInput
                      lblText={false}
                      height={60}
                      placeholderTxt={Strings.confirmpassword + "*"}
                      lblTxt={Strings.confirmpassword}
                      secureTextEntry={true}
                      value={this.state.confirm_password}
                      onChangeText={(confirm_password) =>
                        this.setState({ confirm_password })
                      }
                    />
                  </View>
                </View>
                <View
                  style={{
                    borderBottomWidth: 0.3,
                    borderColor: AppColors.brand.black,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View style={[AppStyles.centerAligned, { height: 60 }]}>
                    <Image
                      source={require("@images/reglanguage.png")}
                      style={{
                        margin: 0,
                        padding: 0,
                        height: 40,
                        width: 40,
                        resizeMode: "contain",
                      }}
                    />
                  </View>
                  <CustomCountryPicker
                    onSelect={(country) => {
                      this.setState({
                        textInputValue: country?.name,
                        country_id: vmcountry_data.find(
                          (item) => item.label === country.name
                        )?.key,
                        CountryText: country?.name,
                        country: country?.cca2,
                        phoneCode: country?.callingCode[0],
                        phone: "",
                      });
                    }}
                    placeholder={
                      this.state.CountryText
                        ? this.state.CountryText
                        : Strings.choosecountry
                    }
                    textStyle={[
                      {
                        marginLeft: 10,
                        fontSize: 14,
                        onBackgroundTextColor: AppColors.brand.white,
                      },
                    ]}
                    defaultCountryCode={this?.state?.country}
                  />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    backgroundColor: "transparent",
                    padding: 0,
                    borderBottomWidth: 0.3,
                    borderColor: AppColors.brand.black,
                  }}
                >
                  <View style={[AppStyles.centerAligned, { height: 60 }]}>
                    <Image
                      source={require("@images/regmobile.png")}
                      style={{
                        margin: 0,
                        padding: 0,
                        height: 40,
                        width: 40,
                        resizeMode: "contain",
                      }}
                    />
                  </View>
                  <View style={[AppStyles.centerAligned, { height: 60 }]}>
                    <Text
                      style={[
                        AppStyles.regularFontText,
                        {
                          paddingTop: 3,
                          color: AppColors.brand.black,
                          marginLeft: 10,
                          fontSize: 14,
                        },
                      ]}
                    >
                      {this.state.phoneCode}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <LblFormInput
                      lblText={false}
                      height={60}
                      placeholderTxt={Strings.phonenumber}
                      lblTxt={Strings.phonenumber}
                      value={this.state.phone}
                      onChangeText={(phone) => this.setState({ phone })}
                    />
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    backgroundColor: "transparent",
                    padding: 0,
                    borderBottomWidth: 0.3,
                    borderColor: AppColors.brand.black,
                  }}
                >
                  <View style={[AppStyles.centerAligned, { height: 60 }]}>
                    <Image
                      source={require("@images/reggender.png")}
                      style={{
                        margin: 0,
                        padding: 0,
                        height: 40,
                        width: 40,
                        resizeMode: "contain",
                      }}
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      flex: 1,
                      height: 60,
                      alignItems: "center",
                      justifyContent: "space-around",
                    }}
                  >
                    <CheckBox
                      left
                      title={Strings.male}
                      checkedIcon="dot-circle-o"
                      uncheckedIcon="circle-o"
                      containerStyle={{
                        padding: 0,
                        margin: 10,
                        backgroundColor: "transparent",
                        borderWidth: 0,
                        width: 75,
                      }}
                      checked={this.state.gender_id == 1}
                      textStyle={{
                        fontFamily: AppFonts.base.family,
                        fontSize: 12,
                        color: AppColors.brand.black,
                        fontWeight: "400",
                      }}
                      onPress={() => {
                        this.setState({
                          gender_id: 1,
                        });
                      }}
                    />
                    <CheckBox
                      left
                      title={Strings.female}
                      checkedIcon="dot-circle-o"
                      uncheckedIcon="circle-o"
                      containerStyle={{
                        padding: 0,
                        margin: 10,
                        backgroundColor: "transparent",
                        borderWidth: 0,
                        width: 75,
                      }}
                      checked={this.state.gender_id == 2}
                      textStyle={{
                        fontFamily: AppFonts.base.family,
                        fontSize: 12,
                        color: AppColors.brand.black,
                        fontWeight: "400",
                      }}
                      onPress={() => {
                        this.setState({
                          gender_id: 2,
                        });
                      }}
                    />
                    <View style={{ width: 120 }} />
                  </View>
                </View>
                {this.state.is_patient == 0 ? (
                  <View
                    style={{
                      borderBottomWidth: 0.3,
                      borderColor: AppColors.brand.black,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View style={[AppStyles.centerAligned, { height: 60 }]}>
                      <Image
                        source={require("@images/speciality.png")}
                        style={{
                          margin: 0,
                          padding: 0,
                          height: 40,
                          width: 40,
                          resizeMode: "contain",
                        }}
                      />
                    </View>

                    <CustomDropdown
                      options={vmspecialities}
                      placeholder={Strings.speciality + " *"}
                      onChangeValue={(value) =>
                        this.handleValueChange(value, vmspecialities)
                      }
                      schema={{
                        label: "label",
                        value: "key",
                      }}
                      dropDownStyle={{
                        width: Dimensions?.get("screen").width - 60,
                        marginLeft: 5,
                      }}
                      //  defaultValue={vmspecialities[1]?.key}
                    />
                  </View>
                ) : null}
                {this.state.is_patient == 0 ? null : (
                  <LblFormInput
                    lblText={false}
                    height={60}
                    placeholderTxt={Strings.referencecode}
                    lblTxt={Strings.referencecode}
                    value={this.state.referencecode}
                    onChangeText={(referencecode) =>
                      this.setState({ referencecode })
                    }
                  />
                )}
                {this.state.is_patient == 0 ? (
                  <CheckBox
                    left
                    containerStyle={{
                      backgroundColor: "transparent",
                      borderWidth: 0,
                    }}
                    textStyle={[AppStyles.regularFontText]}
                    title={Strings.practiceasindividual}
                    checked={this.state.is_individual}
                    onPress={() =>
                      this.setState({
                        is_individual: !this.state.is_individual,
                      })
                    }
                  />
                ) : null}
                <Spacer size={15} />
                <Text
                  style={[
                    styles.normalText11,
                    { marginLeft: 20, marginRight: 20 },
                  ]}
                >
                  <Text style={[styles.normalText11]}>
                    {" "}
                    {Strings.signuptermsofservice}
                  </Text>{" "}
                  <Text
                    onPress={() => {
                      Actions.Pages({ page: "terms-and-conditions-1" });
                    }}
                    style={[
                      styles.normalText11,
                      {
                        color: AppColors.brand.btnColor,
                        textDecorationLine: "underline",
                      },
                    ]}
                  >
                    {Strings.termsofservices}
                  </Text>
                </Text>
                <View style={{ height: 10 }} />
                <Button
                  title={Strings.submit}
                  backgroundColor={AppColors.brand.btnColor}
                  fontSize={15}
                  onPress={this.signup}
                />
              </View>
              {Platform.OS == "ios" ? <View style={{ height: 250 }} /> : null}
            </ScrollView>
          </View>
        </View>
        {this.state.loading ? (
          <View style={AppStyles.LoaderStyle}>
            <Loading color={AppColors.brand.primary} />
          </View>
        ) : null}
      </View>
    );
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);
