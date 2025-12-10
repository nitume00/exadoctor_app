import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  View,
  Alert,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  KeyboardAvoidingView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Actions } from "react-native-router-flux";
import { connect } from "react-redux";
import * as UserActions from "@reduxx/user/actions";
import { AppConfig } from "@constants/";
import NavComponent from "@components/NavComponent.js";
import Strings from "@lib/string.js";
import ImagePicker from "react-native-image-picker";
import DatePicker from "react-native-datepicker";
import Permissions from "react-native-permissions";
import Icon from "react-native-vector-icons/Ionicons";
import { CheckBox } from "@rneui/themed";
// import ModalPicker from 'react-native-modal-picker';
import AppUtil from "@lib/util";
import Loading from "@components/general/Loading";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
const mapkey = "12345678";
// Consts and Libs
import { AppStyles, AppSizes, AppColors, AppFonts } from "@theme/";
import CustomCountryPicker from "../../components/general/CustomCountryPicker";
var moment = require("moment");
navigator.geolocation = require("@react-native-community/geolocation");
// Components
import { Spacer, Text, Button, LblFormInput } from "@ui/";
const mapStateToProps = (state) => {
  console.log(
    "props_country_details dd == " + JSON.stringify(state.user.user_data)
  );
  return {
    user: state.user.user_data,
    country_code_list: state.user.countries,
    city_list: state.user.cities,
    state_list: state.user.states,
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};

// Any actions to map to the component?
const mapDispatchToProps = {
  getCountries: UserActions.getCountries,
  user_profiles: UserActions.user_profiles,
  auth: UserActions.auth,
};
/* Styles ==================================================================== */
const styles = StyleSheet.create({
  background: {
    backgroundColor: AppColors.brand.navbar, //AppColors.brand.primary,
    flex: 1,
  },
  headertitle: {
    flex: 1,
    fontSize: 14,
    paddingTop: 10,
    paddingLeft: 5,
    color: "#A9A9A9",
  },
  view_divider_horizontal: {
    height: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ccc",
    marginTop: 10,
  },
});

/* Component ==================================================================== */
class ProfileView extends Component {
  static propTypes = {
    countries: PropTypes.func.isRequired,
    user_profiles: PropTypes.func.isRequired,
    auth: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.localee = "EN";
    this.locale_fr = props.locale_fr ? props.locale_fr : "";
    this.locale_en = props.locale_en ? props.locale_en : "";
    this.state = {
      loading: false,
      editing: false,
      role_id: props.user ? props.user.role_id : "",
      prefered_language:
        props.user && props.user.prefered_language
          ? props.user.prefered_language
          : "English",
      gender_id:
        props.user && props.user.user_profile
          ? props.user.user_profile.gender_id
          : "",
      bloodgroup:
        props.user && props.user.user_profile
          ? props.user.user_profile.blood_group
          : "",
      otherdetails:
        props.user && props.user.user_profile
          ? AppUtil.stripTags(props.user.user_profile.about_me)
          : "",
      photopermission: "",
      camerapermission: "",
      countries: "",
      storagepermission: (Platform.OS: "ios") ? "1" : "",
      locationpermission: "",
      cvrprofileImage: AppConfig.noimage,
      cvrUploadStatus: false,
      email: props.user ? props.user.email : "",
      phone: props.user ? props.user.mobile : "",
      phonecode: props.user ? props.user.mobile_code : "",
      user: props.user ? props.user : "",
      first_name:
        props.user && props.user.user_profile
          ? props.user.user_profile.first_name
          : "",
      last_name:
        props.user && props.user.user_profile
          ? props.user.user_profile.last_name
          : "",
      mindate: moment(new Date("January 01, 1901 00:00:00")).format(
        "MM-DD-YYYY"
      ),
      maxdate: moment(new Date()).add(-18, "years").format("MM-DD-YYYY"),
      dob:
        props.user && props.user.user_profile && props.user.user_profile.dob
          ? moment(props.user.user_profile.dob).format("MM-DD-YYYY")
          : "",
      nationality_id: props.user ? props.user.nationality_id : "",
      nationality_lbl: "",
      about_me:
        props.user && props.user.user_profile
          ? AppUtil.stripTags(props.user.user_profile.about_me)
          : "",
      awards:
        props.user && props.user.user_profile
          ? AppUtil.stripTags(props.user.user_profile.awards)
          : "",
      board_certifications:
        props.user && props.user.user_profile
          ? AppUtil.stripTags(props.user.user_profile.board_certifications)
          : "",
      experience:
        props.user && props.user.user_profile
          ? AppUtil.stripTags(props.user.user_profile.experience)
          : "",
      latitude: props.user && props.user.latitude ? props.user.latitude : 0.0,
      longitude:
        props.user && props.user.longitude ? props.user.longitude : 0.0,
      attachment:
        props.user && props.user.attachment ? props.user.attachment : "",
      emergency_contact_name:
        props.user && props.user.user_profile
          ? props.user.user_profile.emergency_contact_name
          : "",
      emergency_contact_number:
        props.user && props.user.user_profile
          ? props.user.user_profile.emergency_contact_number
          : "",

      country_code: [],
      selected_country_code:
        props.user &&
        props.user.user_profile &&
        props.user.user_profile.mobile_code
          ? props.user.user_profile.mobile_code
          : "",
      is_selected: 0,
      //Pharmacy
      company_name:
        props.user &&
        props.user.user_profile &&
        props.user.user_profile.display_name
          ? props.user.user_profile.display_name
          : "",
      webiste_url:
        props.user && props.user.user_profile && props.user.user_profile.website
          ? props.user.user_profile.website
          : "",
      work_number:
        props.user &&
        props.user.user_profile &&
        props.user.user_profile.work_number
          ? props.user.user_profile.work_number
          : "",
      home_number:
        props.user &&
        props.user.user_profile &&
        props.user.user_profile.home_number
          ? props.user.user_profile.home_number
          : "",
      address:
        props.user && props.user.user_profile && props.user.user_profile.address
          ? props.user.user_profile.address
          : "",
      address1: "",
      city_id:
        props.user && props.user.user_profile && props.user.user_profile.city_id
          ? props.user.user_profile.city_id
          : "",
      city:
        props.user &&
        props.user.user_profile &&
        props.user.user_profile.city &&
        props.user.user_profile.city.name
          ? props.user.user_profile.city.name
          : "",
      selected_city: {},
      state_id:
        props.user &&
        props.user.user_profile &&
        props.user.user_profile.state_id
          ? props.user.user_profile.state_id
          : "",
      state:
        props.user &&
        props.user.user_profile &&
        props.user.user_profile.state &&
        props.user.user_profile.state.name
          ? props.user.user_profile.state.name
          : "",
      selected_state: {},
      country_list: [],
      country_id:
        props.user &&
        props.user.user_profile &&
        props.user.user_profile.country_id
          ? props.user.user_profile.country_id
          : "",
      country: "",
      country_iso2: "",
      selected_country: {},
      latitude: "",
      longitude: "",
      country_code_list: props.country_code_list ? props.country_code_list : "",
      postal_code:
        props.user &&
        props.user.user_profile &&
        props.user.user_profile.postal_code
          ? props.user.user_profile.postal_code
          : "",
      postData: {
        service_id: "",
        address: "",
        address1: "",
        zip_code: "",
        city_name: "",
        state_name: "",
        country_iso2: "",
        country_iso: "",
        latitude: "",
        longitude: "",
      },
    };
    AsyncStorage.getItem("language").then((value) => {
      this.localee = value;
    });
    this.site_url = "";
  }
  componentWillReceiveProps(props) {
    if (props.user && props.user.user_profile) {
      this.setState({
        first_name:
          props.user && props.user.user_profile
            ? props.user.user_profile.first_name
            : "",
        last_name:
          props.user && props.user.user_profile
            ? props.user.user_profile.last_name
            : "",
        gender_id:
          props.user && props.user.user_profile
            ? props.user.user_profile.gender_id
            : "",
      });
      AsyncStorage.setItem("user_id", props.user.id);
      AsyncStorage.setItem("userToken", props.user.userToken);
    }
  }
  async componentDidMount() {
    this.site_url = await AsyncStorage.getItem("SITE_URL");
    if (this.state.country_code_list) {
      var tttt = [];
      var ttt = [];
      for (var i = 0; i < this.state.country_code_list.length; i++) {
        var temp = this.state.country_code_list[i];
        var tem = this.state.country_code_list[i];
        temp["key"] = this.state.country_code_list[i].id;
        tem["key"] = this.state.country_code_list[i].id;
        temp["label"] =
          this.state.country_code_list[i].name +
          " " +
          this.state.country_code_list[i].phone_code;
        tem["label"] = this.state.country_code_list[i].name;
        tttt.push(temp);
        ttt.push(temp);
        console.log(
          "props_country_details====> " +
            this.state.country_id +
            "==" +
            this.state.country_code_list[i].id +
            "==" +
            this.state.country_code_list[i].name
        );
        if (this.state.country_id == this.state.country_code_list[i].id) {
          this.setState({
            country_iso2: this.state.country_code_list[i].iso2,
            country: this.state.country_code_list[i].name,
            selected_country: this.state.country_code_list[i],
          });
        }
      }
      this.setState({ country_code: tttt, country_list: ttt }, () => {
        console.log("this.state.country_code======> " + JSON.stringify(ttt));
      });
    }

    console.log(
      "updateImagetoServer 111" + JSON.stringify(this.state.attachment)
    );
    if (this.state.attachment && this.state.attachment.filename) {
      var md5string = "UserProfile" + this.state.attachment.id + "pngbig_thumb";
      var imagetemp = AppUtil.MD5(md5string);
      imageurl =
        this.site_url +
        "/images/big_thumb/UserProfile/" +
        this.state.attachment.id +
        "." +
        imagetemp +
        ".png";
      console.log("updateImagetoServer 111" + JSON.stringify(imageurl));
      this.setState({ cvrprofileImage: imageurl });
    }
    if (this.state.locationpermission === "") {
      console.log("updateImagetoServer 222");
      Permissions.check("location").then((response) => {
        //response is an object mapping type to permission
        if (response.location == "authorized") {
          console.log("updateImagetoServer 333");
          this.setState({ locationpermission: "1" });
        } else {
          console.log("updateImagetoServer 444");
          Permissions.request("location").then((response) => {
            if (response == "authorized") {
              this.setState({ locationpermission: "1" });
              this.getLocation();
            }
          });
        }
      });
    }
    //this.getCountries();
    if (this.state.role_id == 6) {
      this.getstate();
      this.getcity();
    }
  }
  getLocation() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
        });
        console.log(
          "updateImagetoServer dsfsdf" +
            position.coords.latitude +
            "==" +
            position.coords.longitude
        );
      },
      (error) => console.log("dsfsdf"),
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 }
    );
  }
  getCountries() {
    var payload = '{"where":{"is_show_in_frontend":1}}';
    this.callInvoked = 1;
    this.props
      .getCountries({ filter: payload })
      .then((resp) => {
        if (resp.data) {
          this.setState({ countries: resp.data });
          var ctry = resp.data;
          if (ctry) {
            Object.keys(ctry).forEach(function (key) {
              if (ctry[key].id == this.state.nationality_id) {
                this.setState({ nationality_lbl: ctry[key].name });
              }
            });
          }
        }
      })
      .catch(() => {
        console.log("error");
      });
  }

  getcity() {
    var ttt = [];
    this.setState({ loading: true });
    for (var i = 0; i < this.props.city_list.length; i++) {
      var tem = this.props.city_list[i];
      tem["key"] = this.props.city_list[i].id;
      tem["label"] = this.props.city_list[i].name;
      ttt.push(tem);
      if (this.state.city_id == this.props.city_list[i].id) {
        this.setState({
          city: this.props.city_list[i].name,
          selected_city: this.props.city_list[i],
          loading: false,
        });
      }
    }
    this.setState({ loading: false, modal_city_list: ttt });
  }

  getstate() {
    var ttt = [];
    this.setState({ loading: true });
    for (var i = 0; i < this.props.state_list.length; i++) {
      var tem = this.props.state_list[i];
      tem["key"] = this.props.state_list[i].id;
      tem["label"] = this.props.state_list[i].name;
      ttt.push(tem);
      if (this.state.state_id == this.props.state_list[i].id) {
        this.setState({
          state: this.props.state_list[i].name,
          selected_state: this.props.state_list[i],
          loading: false,
        });
      }
    }
    this.setState({ loading: false, modal_state_list: ttt });
  }

  pickerImagePressed = (imgtype) => {
    if (this.state.camerapermission === "") {
      Permissions.request("camera").then((response) => {
        if (response == "authorized") {
          this.setState(
            { camerapermission: "1" },
            this.pickerImagePressed(imgtype)
          );
        }
      });
    } else if (this.state.photopermission === "") {
      Permissions.request("photo").then((response) => {
        if (response == "authorized") {
          this.setState(
            { photopermission: "1" },
            this.pickerImagePressed(imgtype)
          );
        }
      });
    } else if (this.state.storagepermission === "") {
      Permissions.request("storage").then((response) => {
        if (response == "authorized") {
          this.setState(
            { storagepermission: "1" },
            this.pickerImagePressed(imgtype)
          );
        }
      });
    } else {
      Actions.Camera({
        imgtype: imgtype,
        reloadView: this.getCatpturedImage.bind(this, imgtype),
      });
    }
  };
  getCatpturedImage = (imgtype, image) => {
    if (image.image) {
      this.setState({
        cvrUploadStatus: true,
        cvrprofileImage: "data:image/png;base64," + image.image,
        video_post_url: "",
      });
    }
  };

  editProfile = () => {
    var first_name = this.state.first_name;
    var last_name = this.state.last_name;

    var emergency_contact_number = this.state.emergency_contact_number;
    console.log(
      "updateImagetoServer user_profiles gender_id" + this.state.gender_id
    );
    if (AppUtil.validateEmpty(first_name) == false) {
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
    } else if (AppUtil.validateEmpty(last_name) == "") {
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
    } else if (
      this.state.role_id != 6 &&
      (this.state.gender_id == 0 || this.state.gender_id == "")
    ) {
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
      this.state.role_id != 6 &&
      (this.state.dob == "" ||
        this.state.dob == null ||
        this.state.dob == undefined)
    ) {
      Alert.alert(
        AppConfig.appName,
        Strings.enteryourdob,
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
    } else if (this.state.role_id == 6 && this.state.company_name == "") {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseentercompanyname,
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
      (this.state.role_id == 6 || this.state.role_id == 2) &&
      this.state.address == ""
    ) {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseenteraddress,
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
      (this.state.role_id == 6 || this.state.role_id == 2) &&
      this.state.city.trim() == ""
    ) {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseentercity,
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
      (this.state.role_id == 6 || this.state.role_id == 2) &&
      this.state.state.trim() == ""
    ) {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseenterstate,
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
    } else if (this.state.role_id == 2 && !this.state.emergency_contact_name) {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseenterecontactname,
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
      !emergency_contact_number ||
      (emergency_contact_number != "" &&
        !AppUtil.validateInt(emergency_contact_number))
    ) {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseentervalidephonenumber,
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
      var dateofbirth = moment(this.state.dob, "MM-DD-YYYY").format(
        "YYYY-MM-DD"
      );
      var payload = {
        first_name: this.state.first_name,
        last_name: this.state.last_name,
        practice_name: "",
        dr_title: null,
        gender_id: this.state.gender_id,
        dob: dateofbirth,
        blood_group: this.state.bloodgroup,
        about_me: this.state.about_me,
        awards: this.state.awards,
        experience: this.state.experience,
        board_certifications: this.state.board_certifications,
        emergency_contact_name: this.state.emergency_contact_name,
        emergency_contact_number: this.state.emergency_contact_number,
        address: this.state.address,
        city: { name: this.state.city_id },
        state: { name: this.state.state_id },
        country: { iso2: this.state.country_iso2, name: this.state.country },
        postal_code: this.state.postal_code,
        latitude: this.state.latitude,
        longitude: this.state.longitude,
        prefered_language: this.state.prefered_language,
      };

      if (this.state.cvrUploadStatus == true) {
        payload = {
          first_name: this.state.first_name,
          last_name: this.state.last_name,
          practice_name: "",
          dr_title: null,
          gender_id: this.state.gender_id,
          dob: dateofbirth,
          blood_group: this.state.bloodgroup,
          about_me: this.state.about_me,
          image_data: this.state.cvrprofileImage,
          awards: this.state.awards,
          experience: this.state.experience,
          board_certifications: this.state.board_certifications,
          emergency_contact_name: this.state.emergency_contact_name,
          emergency_contact_number: this.state.emergency_contact_number,
          address: this.state.address,
          city: { name: this.state.city_id },
          state: { name: this.state.state_id },
          country: { iso2: this.state.country_iso2, name: this.state.country },
          postal_code: this.state.postal_code,
          latitude: this.state.latitude,
          longitude: this.state.longitude,
          prefered_language: this.state.prefered_language,
        };
      }
      if (this.state.role_id == 6) {
        if (this.state.is_selected == 1) {
          payload = {
            first_name: this.state.first_name,
            last_name: this.state.last_name,
            display_name: this.state.company_name,
            mobile_code: this.state.selected_country_code,
            work_number: this.state.work_number,
            home_number: this.state.home_number,
            website: this.state.webiste_url,
            address: this.state.address,
            address1: null,
            city: { name: this.state.city_id },
            state: { name: this.state.state_id },
            country: { iso2: this.state.country_iso2 },
            postal_code: this.state.postal_code,
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            full_address: this.state.address,
            about_me: this.state.about_me,
            prefered_language: this.state.prefered_language,
          };
          if (this.state.cvrUploadStatus == true)
            payload = {
              first_name: this.state.first_name,
              last_name: this.state.last_name,
              display_name: this.state.company_name,
              mobile_code: this.state.selected_country_code,
              work_number: this.state.work_number,
              home_number: this.state.home_number,
              website: this.state.webiste_url,
              address: this.state.address,
              address1: null,
              city: { name: this.state.city_id },
              state: { name: this.state.state_id },
              country: { iso2: this.state.country_iso2 },
              postal_code: this.state.postal_code,
              latitude: this.state.latitude,
              longitude: this.state.longitude,
              full_address: this.state.address,
              about_me: this.state.about_me,
              image_data: this.state.cvrprofileImage,
              prefered_language: this.state.prefered_language,
            };
        } else {
          payload = {
            first_name: this.state.first_name,
            last_name: this.state.last_name,
            display_name: this.state.company_name,
            mobile_code: this.state.selected_country_code,
            work_number: this.state.work_number,
            home_number: this.state.home_number,
            website: this.state.webiste_url,
            about_me: this.state.about_me,
            prefered_language: this.state.prefered_language,
          };
          if (this.state.cvrUploadStatus == true)
            payload = {
              first_name: this.state.first_name,
              last_name: this.state.last_name,
              display_name: this.state.company_name,
              mobile_code: this.state.selected_country_code,
              work_number: this.state.work_number,
              home_number: this.state.home_number,
              website: this.state.webiste_url,
              about_me: this.state.about_me,
              image_data: this.state.cvrprofileImage,
              prefered_language: this.state.prefered_language,
            };
        }
      }
      console.log("user_profiles == " + JSON.stringify(payload));
      this.setState({ loading: true });
      this.props
        .user_profiles(payload)
        .then((resp) => {
          console.log("user_profiles " + JSON.stringify(resp));
          if (resp.error && resp.error.code == 0) {
            Alert.alert(
              AppConfig.appName,
              Strings.userprofileupdated,
              [
                {
                  text: "OK",
                  onPress: () => {
                    this.setState({ loading: false });
                    var payload = {
                      user_id: this.state.user.id,
                      token: this.state.user.userToken,
                    };
                    this.props
                      .auth(payload)
                      .then((resp) => {
                        if (resp.data) {
                          Actions.pop();
                        }
                      })
                      .catch(() => {});
                  },
                },
              ],
              { cancelable: false }
            );
          } else {
            this.setState({ loading: false });
            Alert.alert(
              AppConfig.appName,
              resp.error.message,
              [{ text: "OK", onPress: () => console.log("OK Pressed") }],
              { cancelable: false }
            );
          }
        })
        .catch(() => {
          this.setState({ loading: false });
          console.log("error");
        });
    }
  };
  render = () => {
    var imageurl = this.state.cvrprofileImage;
    console.log("stateuser == " + JSON.stringify(this.state.user));
    var vmnationalityinfo = [
      { key: 0, section: true, label: Strings.nationalityinfo },
    ];

    if (this.state.countries) {
      var carraynationalityinfo = this.state.countries;
      Object.keys(carraynationalityinfo).forEach(function (key) {
        var lbl = carraynationalityinfo[key].name;
        vmnationalityinfo.push({
          key: carraynationalityinfo[key].id,
          label: lbl,
        });
      });
    }
    var vmbg = [{ key: 0, section: true, label: Strings.bloodgroup }];
    var cbg = AppConfig.blood_group;
    var p = 0;
    Object.keys(cbg).forEach(function (key) {
      var lbl = cbg[key];
      vmbg.push({ key: p, label: lbl });
      p++;
    });

    console.log("updateImagetoServer blgppp == " + JSON.stringify(vmbg));
    var phone = this.state.phonecode + " " + this.state.phone;
    console.log(
      "updateImagetoServer stateuser == " + JSON.stringify(this.state.dob)
    );

    return (
      <View style={[styles.background]}>
        <NavComponent backArrow={true} title={Strings.editprofile} />
        <ScrollView
          style={{ flex: 1, backgroundColor: AppColors.brand.primary }}
          keyboardShouldPersistTaps="always"
        >
          <View style={{ flex: 1, marginBottom: 200 }}>
            <TouchableOpacity
              onPress={this.pickerImagePressed.bind(this, "home")}
              style={{
                flex: 1,
                height: 200,
                backgroundColor: AppColors.brand.navbar,
              }}
            >
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  style={{ height: 150, width: 150, borderRadius: 75 }}
                  source={{ uri: imageurl }}
                />
              </View>
            </TouchableOpacity>
            <View
              style={{
                flex: 1,
                backgroundColor: AppColors.brand.grey,
                justifyContent: "center",
              }}
            >
              <Text style={{ flex: 1, fontSize: 14, padding: 5 }}>
                {Strings.personalinfo}
              </Text>
            </View>
            <LblFormInput
              lblText={false}
              height={60}
              placeholderTxt={Strings.firstname}
              lblTxt={Strings.firstname}
              select_opt={false}
              value={this.state.first_name}
              onChangeText={(text) => {
                this.setState({ first_name: text });
              }}
            />
            <LblFormInput
              lblText={false}
              height={60}
              placeholderTxt={Strings.lastname}
              lblTxt={Strings.lastname}
              select_opt={false}
              value={this.state.last_name}
              onChangeText={(text) => {
                this.setState({ last_name: text });
              }}
            />
            <LblFormInput
              lblText={false}
              height={60}
              editable={false}
              placeholderTxt={Strings.email}
              lblTxt={Strings.email}
              select_opt={false}
              value={this.state.email}
              onChangeText={(text) => {
                this.setState({ email: text });
              }}
            />
            <LblFormInput
              lblText={false}
              height={60}
              editable={false}
              placeholderTxt={Strings.phone}
              lblTxt={Strings.phone}
              select_opt={false}
              value={phone}
              onChangeText={(text) => {
                this.setState({ phone: text });
              }}
            />

            <View
              style={{
                flex: 1,
                backgroundColor: AppColors.brand.white,
                justifyContent: "center",
                marginTop: 5,
              }}
            >
              {this.state.role_id != 6 && this.state.role_id != 7 ? (
                <View>
                  <Text style={[styles.headertitle]}>{Strings.gender}</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      flex: 1,
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
                    {/*<CheckBox
                                            left
                                            title={Strings.other}
                                            checkedIcon='dot-circle-o'
                                            uncheckedIcon='circle-o'
                                            containerStyle={{ padding: 0, margin: 10, backgroundColor: 'transparent', borderWidth: 0,width:75 }}
                                            checked={this.state.gender_id == 3}
                                            textStyle={{ fontFamily: AppFonts.base.family, fontSize: 12, color: AppColors.brand.black, fontWeight: '400' }}
                                            onPress={() => {
                                                this.setState({
                                                    gender_id: 3
                                                })
                                            }}
                                        />*/}
                  </View>

                  <Text style={[styles.headertitle]}>
                    {Strings.prefered_language}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "space-around",
                    }}
                  >
                    <CheckBox
                      left
                      title={
                        this.localee && this.localee == "en"
                          ? "English"
                          : "Anglais"
                      }
                      checkedIcon="dot-circle-o"
                      uncheckedIcon="circle-o"
                      containerStyle={{
                        padding: 0,
                        margin: 10,
                        backgroundColor: "transparent",
                        borderWidth: 0,
                        width: 75,
                      }}
                      checked={this.state.prefered_language == "English"}
                      textStyle={{
                        fontFamily: AppFonts.base.family,
                        fontSize: 12,
                        color: AppColors.brand.black,
                        fontWeight: "400",
                      }}
                      onPress={() => {
                        this.setState({
                          prefered_language: "English",
                        });
                      }}
                    />
                    <CheckBox
                      left
                      title={
                        this.localee && this.localee == "en"
                          ? "French"
                          : "Français"
                      }
                      checkedIcon="dot-circle-o"
                      uncheckedIcon="circle-o"
                      containerStyle={{
                        padding: 0,
                        margin: 10,
                        backgroundColor: "transparent",
                        borderWidth: 0,
                        width: 75,
                      }}
                      checked={this.state.prefered_language == "French"}
                      textStyle={{
                        fontFamily: AppFonts.base.family,
                        fontSize: 12,
                        color: AppColors.brand.black,
                        fontWeight: "400",
                      }}
                      onPress={() => {
                        this.setState({
                          prefered_language: "French",
                        });
                      }}
                    />
                  </View>

                  <View
                    style={{
                      flex: 1,
                      backgroundColor: AppColors.brand.grey,
                      justifyContent: "center",
                      marginTop: 10,
                    }}
                  >
                    <Text style={{ flex: 1, fontSize: 14, padding: 5 }}>
                      {Strings.generalinfo}
                    </Text>
                  </View>
                  <View style={styles.view_divider_horizontal}></View>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: AppColors.brand.white,
                      justifyContent: "center",
                      marginTop: 7,
                    }}
                  >
                    <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                      {Strings.birthdate}
                    </Text>
                    <DatePicker
                      date={this.state.dob}
                      mode="date"
                      placeholder={Strings.lbldob}
                      format="MM-DD-YYYY"
                      minDate={this.state.mindate}
                      maxDate={this.state.maxdate}
                      confirmBtnText="Confirm"
                      cancelBtnText="Cancel"
                      showIcon={false}
                      customStyles={{
                        dateInput: {
                          borderWidth: 0,
                          paddingLeft: 5,
                          alignItems: "flex-start",
                        },
                        placeholderText: {
                          fontSize: 15,
                          fontFamily: AppFonts.base.family,
                          color: AppColors.brand.txtplaceholder,
                          paddingLeft: 5,
                        },
                        dateText: {
                          fontSize: 15,
                          fontFamily: AppFonts.base.family,
                          color: AppColors.brand.txtplaceholder,
                          paddingLeft: 5,
                        },
                      }}
                      onDateChange={(date) => {
                        console.log("updateImagetoServer dobb " + date);
                        this.setState({ dob: date });
                      }}
                    />
                  </View>
                  <View style={[styles.view_divider_horizontal]}></View>
                  {this.state.role_id != 2 ? (
                    <View>
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: AppColors.brand.grey,
                          justifyContent: "center",
                          marginTop: 10,
                        }}
                      >
                        <Text style={{ flex: 1, fontSize: 14, padding: 5 }}>
                          {Strings.professionalinfo}
                        </Text>
                      </View>
                      <View
                        style={{
                          borderBottomWidth: 0.5,
                          borderColor: AppColors.brand.color,
                        }}
                      >
                        <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                          {Strings.aboutme}
                        </Text>
                        <LblFormInput
                          textAlignVertical={"top"}
                          lblText={false}
                          height={60}
                          placeholderTxt={Strings.aboutme}
                          lblTxt={Strings.aboutme}
                          select_opt={false}
                          numberOfLines={2}
                          multiline={true}
                          value={this.state.about_me}
                          onChangeText={(text) => {
                            this.setState({ about_me: text });
                          }}
                        />
                      </View>
                      <View
                        style={{
                          marginTop: 5,
                          borderBottomWidth: 0.5,
                          borderColor: AppColors.brand.color,
                        }}
                      >
                        <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                          {Strings.boardcertification}
                        </Text>
                        <LblFormInput
                          textAlignVertical={"top"}
                          lblText={false}
                          height={60}
                          placeholderTxt={Strings.boardcertification}
                          lblTxt={Strings.boardcertification}
                          select_opt={false}
                          numberOfLines={2}
                          multiline={true}
                          value={this.state.board_certifications}
                          onChangeText={(text) => {
                            this.setState({ board_certifications: text });
                          }}
                        />
                      </View>
                      <View
                        style={{
                          marginTop: 5,
                          borderBottomWidth: 0.5,
                          borderColor: AppColors.brand.color,
                        }}
                      >
                        <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                          {Strings.awardsandrecognition}
                        </Text>
                        <LblFormInput
                          textAlignVertical={"top"}
                          lblText={false}
                          height={60}
                          placeholderTxt={Strings.awardsandrecognition}
                          lblTxt={Strings.awardsandrecognition}
                          select_opt={false}
                          numberOfLines={2}
                          multiline={true}
                          value={this.state.awards}
                          onChangeText={(text) => {
                            this.setState({ awards: text });
                          }}
                        />
                      </View>
                      <View
                        style={{
                          marginTop: 5,
                          borderBottomWidth: 0.5,
                          borderColor: AppColors.brand.color,
                        }}
                      >
                        <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                          {Strings.experience}
                        </Text>
                        <LblFormInput
                          lblText={false}
                          height={60}
                          placeholderTxt={Strings.experience}
                          lblTxt={Strings.experience}
                          select_opt={false}
                          textAlignVertical={"top"}
                          numberOfLines={2}
                          multiline={true}
                          value={this.state.experience}
                          onChangeText={(text) => {
                            this.setState({ experience: text });
                          }}
                        />
                      </View>
                    </View>
                  ) : (
                    <View>
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: AppColors.brand.grey,
                          justifyContent: "center",
                          marginTop: 10,
                        }}
                      >
                        <Text style={{ flex: 1, fontSize: 14, padding: 5 }}>
                          {Strings.medicalinfo}
                        </Text>
                      </View>
                      <View
                        style={{
                          borderBottomWidth: 0.3,
                          borderColor: AppColors.brand.black,
                        }}
                      >
                        {/* <ModalPicker
                          data={vmbg}
                          initValue={Strings.bloodgroup}
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
                          cancelTextStyle={{fontSize: 20, fontWeight: 'normal'}}
                          overlayStyle={{backgroundColor: 'rgba(0,0,0,0.9)'}}
                          onChange={option => {
                            this.setState({bloodgroup: option.label});
                          }}>
                          <View style={{marginLeft: 5}}>
                            <LblFormInput
                              lblText={false}
                              height={60}
                              placeholderTxt={Strings.bloodgroup}
                              lblTxt={Strings.bloodgroup}
                              select_opt={true}
                              value={this.state.bloodgroup}
                              editable={false}
                            />
                          </View>
                        </ModalPicker> */}
                      </View>

                      <View style={{ marginTop: 10 }}>
                        <View style={{ flexDirection: "row" }}>
                          <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                            {Strings.emergencycontactname}
                          </Text>
                          <Text
                            style={{
                              paddingLeft: 5,
                              paddingTop: 5,
                              color: "red",
                            }}
                          >
                            *
                          </Text>
                        </View>
                        <LblFormInput
                          lblText={false}
                          height={60}
                          editable={true}
                          placeholderTxt={Strings.emergencycontactname}
                          lblTxt={Strings.emergencycontactname}
                          select_opt={false}
                          value={this.state.emergency_contact_name}
                          onChangeText={(text) => {
                            this.setState({ emergency_contact_name: text });
                          }}
                        />
                      </View>

                      <View style={{ marginTop: 10 }}>
                        <View style={{ flexDirection: "row" }}>
                          <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                            {Strings.emergencycontactnumber}
                          </Text>
                          <Text
                            style={{
                              paddingLeft: 5,
                              paddingTop: 5,
                              color: "red",
                            }}
                          >
                            *
                          </Text>
                        </View>
                        <LblFormInput
                          lblText={false}
                          height={60}
                          editable={true}
                          placeholderTxt={Strings.emergencycontactnumber}
                          lblTxt={Strings.emergencycontactnumber}
                          select_opt={false}
                          value={this.state.emergency_contact_number}
                          onChangeText={(text) => {
                            this.setState({ emergency_contact_number: text });
                          }}
                        />
                      </View>

                      <View>
                        <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                          {Strings.otherdetails}
                        </Text>
                        <LblFormInput
                          lblText={false}
                          height={60}
                          placeholderTxt={Strings.otherdetails}
                          lblTxt={Strings.otherdetails}
                          select_opt={false}
                          numberOfLines={1}
                          multiline={false}
                          value={this.state.otherdetails}
                          onChangeText={(text) => {
                            this.setState({ otherdetails: text });
                          }}
                        />
                      </View>
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: AppColors.brand.grey,
                          justifyContent: "center",
                          marginTop: 10,
                        }}
                      >
                        <Text style={{ flex: 1, fontSize: 14, padding: 5 }}>
                          {Strings.addressandcontactinformation}
                        </Text>
                      </View>
                      <View style={{ marginTop: 10 }}>
                        <View style={{ flexDirection: "row" }}>
                          <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                            {Strings.residentof}
                          </Text>
                          <Text
                            style={{
                              paddingLeft: 5,
                              paddingTop: 5,
                              color: "red",
                            }}
                          >
                            *
                          </Text>
                        </View>
                        <GooglePlacesAutocomplete
                          placeholder={this.state.address}
                          placeholderTextColor="#9E9E9E"
                          minLength={4} // minimum length of text to search
                          autoFocus={false}
                          listViewDisplayed={true} // true/false/undefined
                          fetchDetails={true}
                          renderDescription={(row) => row.description} // custom description render
                          onPress={(data, details = null) => {
                            // 'details' is provided when fetchDetails = true
                            console.log(
                              "GooglePlacesAutocomplete_details=====> " +
                                JSON.stringify(details)
                            );
                            var itemDetail = {};
                            var postData = Object.assign(
                              {},
                              this.state.postData
                            );
                            itemDetail["adr_address"] =
                              details.formatted_address;
                            postData.address = itemDetail.adr_address;
                            postData.address1 = itemDetail.adr_address;

                            this.setState({
                              is_selected: 1,
                              address: details.formatted_address,
                              latitude: details.geometry.location.lat,
                              longitude: details.geometry.location.lng,
                            });

                            var postaltown = 0;
                            for (
                              var i = 0;
                              i < details.address_components.length;
                              i++
                            ) {
                              if (
                                details.address_components[i].types[0] ==
                                "country"
                              ) {
                                itemDetail["country"] =
                                  details.address_components[i].long_name;
                                this.setState({
                                  country:
                                    details.address_components[i].long_name,
                                  country_iso2:
                                    details.address_components[i].short_name,
                                });
                                itemDetail["country_iso"] =
                                  details.address_components[i].short_name;
                                postData.country_iso2 = itemDetail.country;
                                postData.country_iso = itemDetail.country_iso;
                              } else if (
                                details.address_components[i].types[0] ==
                                "locality"
                              ) {
                                itemDetail["administrative_area_level_2"] =
                                  details.address_components[i].short_name;
                                postData.city_name =
                                  itemDetail.administrative_area_level_2;
                                this.setState({
                                  city: itemDetail.administrative_area_level_2,
                                  city_id:
                                    itemDetail.administrative_area_level_2,
                                });
                              } else if (
                                details.address_components[i].types[0] ==
                                "postal_town"
                              ) {
                                postaltown = 1;
                                itemDetail["administrative_area_level_2"] =
                                  details.address_components[i].short_name;
                                postData.city_name =
                                  itemDetail.administrative_area_level_2;
                                this.setState({
                                  city: itemDetail.administrative_area_level_2,
                                  city_id:
                                    itemDetail.administrative_area_level_2,
                                });
                              } else if (
                                details.address_components[i].types[0] ==
                                "administrative_area_level_2"
                              ) {
                                postaltown = 1;
                                itemDetail["administrative_area_level_2"] =
                                  details.address_components[i].short_name;
                                postData.state_name =
                                  itemDetail.administrative_area_level_2;
                                this.setState({
                                  state: itemDetail.administrative_area_level_2,
                                  state_id:
                                    itemDetail.administrative_area_level_2,
                                });
                              } else if (
                                details.address_components[i].types[0] ==
                                  "administrative_area_level_1" &&
                                postaltown == 0
                              ) {
                                itemDetail["administrative_area_level_1"] =
                                  details.address_components[i].long_name;
                                postData.state_name =
                                  itemDetail.administrative_area_level_1;
                                this.setState({
                                  state: itemDetail.administrative_area_level_1,
                                  state_id:
                                    itemDetail.administrative_area_level_1,
                                });
                              } else if (
                                details.address_components[i].types[0] ==
                                "postal_code"
                              ) {
                                itemDetail["postal_code"] =
                                  details.address_components[i].short_name;
                                postData.zip_code = itemDetail.postal_code;
                                this.setState({
                                  postal_code:
                                    details.address_components[i].short_name,
                                });
                              }
                            }
                            this.setState({ postData: postData });
                          }}
                          getDefaultValue={() => {
                            return ""; // text input default value
                          }}
                          query={{
                            key: mapkey,
                            language: "en", // language of the results
                            types: "", // default: 'geocode'
                          }}
                          styles={{
                            textInput: {
                              color: "#9E9E9E",
                              fontSize: 14,
                              textAlign: "center",
                              marginLeft: 20,
                            },
                            description: {
                              fontSize: 14,
                              color: "#9E9E9E",
                            },
                            predefinedPlacesDescription: {
                              color: "#9E9E9E",
                            },
                          }}
                          nearbyPlacesAPI="GooglePlacesSearch" // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
                          debounce={0} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
                        />
                        <View style={{ marginTop: 10 }}>
                          <View style={{ flexDirection: "row" }}>
                            <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                              {Strings.area}
                            </Text>
                            <Text
                              style={{
                                paddingLeft: 5,
                                paddingTop: 5,
                                color: "red",
                              }}
                            >
                              *
                            </Text>
                          </View>
                          <LblFormInput
                            textAlignVertical={"top"}
                            lblText={false}
                            height={50}
                            placeholderTxt={Strings.area}
                            lblTxt={Strings.area}
                            select_opt={false}
                            numberOfLines={1}
                            multiline={false}
                            value={this.state.city}
                            onChangeText={(text) => {
                              this.setState({ city: text, city_id: text });
                            }}
                          />
                        </View>
                        <View style={{ marginTop: 10 }}>
                          <View style={{ flexDirection: "row" }}>
                            <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                              {Strings.region}
                            </Text>
                            <Text
                              style={{
                                paddingLeft: 5,
                                paddingTop: 5,
                                color: "red",
                              }}
                            >
                              *
                            </Text>
                          </View>
                          <LblFormInput
                            textAlignVertical={"top"}
                            lblText={false}
                            height={50}
                            placeholderTxt={Strings.region}
                            lblTxt={Strings.region}
                            select_opt={false}
                            numberOfLines={1}
                            multiline={false}
                            value={this.state.state}
                            onChangeText={(text) => {
                              this.setState({ state: text });
                            }}
                          />
                        </View>
                        <View style={{ marginTop: 10 }}>
                          <View style={{ flexDirection: "row" }}>
                            <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                              {Strings.country}
                            </Text>
                            <Text
                              style={{
                                paddingLeft: 5,
                                paddingTop: 5,
                                color: "red",
                              }}
                            >
                              *
                            </Text>
                          </View>
                          <LblFormInput
                            textAlignVertical={"top"}
                            lblText={false}
                            height={50}
                            placeholderTxt={Strings.country}
                            lblTxt={Strings.country}
                            select_opt={false}
                            numberOfLines={1}
                            multiline={false}
                            value={this.state.country}
                            onChangeText={(text) => {
                              this.setState({ country: text });
                            }}
                          />
                        </View>
                        <View style={{ marginTop: 10 }}>
                          <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                            {Strings.postalcode}
                          </Text>
                          <LblFormInput
                            textAlignVertical={"top"}
                            lblText={false}
                            height={50}
                            placeholderTxt={Strings.postalcode}
                            lblTxt={Strings.postalcode}
                            select_opt={false}
                            numberOfLines={1}
                            multiline={false}
                            value={this.state.postal_code}
                            onChangeText={(text) => {
                              this.setState({ postal_code: text });
                            }}
                          />
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              ) : (
                <View style={{ marginBottom: 10 }}>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: AppColors.brand.grey,
                      justifyContent: "center",
                      marginTop: 10,
                    }}
                  >
                    <Text style={{ flex: 1, fontSize: 14, padding: 5 }}>
                      {Strings.pharmacyinfo}
                    </Text>
                  </View>
                  <View>
                    <View style={{ flexDirection: "row" }}>
                      <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                        {Strings.companyfullname}
                      </Text>
                      <Text
                        style={{ paddingLeft: 5, paddingTop: 5, color: "red" }}
                      >
                        *
                      </Text>
                    </View>
                    <LblFormInput
                      textAlignVertical={"top"}
                      lblText={false}
                      height={50}
                      placeholderTxt={Strings.companyfullname}
                      lblTxt={Strings.companyfullname}
                      select_opt={false}
                      numberOfLines={1}
                      multiline={false}
                      value={this.state.company_name}
                      onChangeText={(text) => {
                        this.setState({ company_name: text });
                      }}
                    />
                  </View>
                  <View style={{ marginTop: 10 }}>
                    <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                      {Strings.websiteurl}
                    </Text>
                    <LblFormInput
                      textAlignVertical={"top"}
                      lblText={false}
                      height={50}
                      placeholderTxt={Strings.websiteurl}
                      lblTxt={Strings.websiteurl}
                      select_opt={false}
                      numberOfLines={1}
                      multiline={false}
                      value={this.state.webiste_url}
                      onChangeText={(text) => {
                        this.setState({ webiste_url: text });
                      }}
                    />
                  </View>
                  <View style={{ marginTop: 10 }}>
                    <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                      {Strings.worknumber}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        flex: 1,
                        alignItems: "center",
                      }}
                    >
                      <View style={{ flex: 0.2 }}>
                        {/* <CustomCountryPicker
                          onSelect={(country) => {
                            this.setState({
                              selected_country_code: country?.callingCode[0],
                            });
                            // this.setState({
                            //   textInputValue: country?.name,
                            //   country_id: vmcountry_data.find(
                            //     (item) => item.label === country.name
                            //   )?.key,
                            //   CountryText: country?.name,
                            //   country: country?.cca2,
                            //   phoneCode: country?.callingCode[0],
                            //   phone: "",
                            // });
                          }}
                          placeholder={
                            this.state.selected_country_code
                              ? this.state.selected_country_code
                              : Strings.countrycode
                          }
                          textStyle={[
                            {
                              marginLeft: 10,
                              fontSize: 14,
                              onBackgroundTextColor: AppColors.brand.white,
                            },
                          ]}
                          defaultCountryCode={this?.state?.country_code}
                        /> */}
                        {/* <ModalPicker
                          data={this.state.country_code}
                          initValue={Strings.countrycode}
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
                            color: '#000',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 50 / 2,
                          }}
                          cancelTextStyle={{fontSize: 20, fontWeight: 'normal'}}
                          overlayStyle={{backgroundColor: 'rgba(0,0,0,0.9)'}}
                          onChange={option => {
                            this.setState({
                              selected_country_code: option.phone_code,
                            });
                          }}>
                          <View style={{marginLeft: 5}}>
                            <LblFormInput
                              lblText={false}
                              height={50}
                              placeholderTxt={'91'}
                              lblTxt={'91'}
                              select_opt={true}
                              value={this.state.selected_country_code}
                              editable={false}
                            />
                          </View>
                        </ModalPicker> */}
                      </View>
                      <View style={{ flex: 0.8 }}>
                        <LblFormInput
                          textAlignVertical={"top"}
                          lblText={false}
                          height={50}
                          placeholderTxt={Strings.worknumber}
                          lblTxt={Strings.worknumber}
                          select_opt={false}
                          numberOfLines={4}
                          multiline={true}
                          value={this.state.work_number}
                          onChangeText={(text) => {
                            this.setState({ work_number: text });
                          }}
                        />
                      </View>
                    </View>
                  </View>
                  <View style={{ marginTop: 10 }}>
                    <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                      {Strings.homenumber}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        flex: 1,
                        alignItems: "center",
                      }}
                    >
                      <View style={{ flex: 0.2 }}>
                        {/* <ModalPicker
                          data={this.state.country_code}
                          initValue={Strings.countrycode}
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
                            color: '#000',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 50 / 2,
                          }}
                          cancelTextStyle={{fontSize: 20, fontWeight: 'normal'}}
                          overlayStyle={{backgroundColor: 'rgba(0,0,0,0.9)'}}
                          onChange={option => {
                            this.setState({
                              selected_country_code: option.phone_code,
                            });
                          }}>
                          <View style={{marginLeft: 5}}>
                            <LblFormInput
                              lblText={false}
                              height={50}
                              placeholderTxt={'91'}
                              lblTxt={'91'}
                              select_opt={true}
                              value={this.state.selected_country_code}
                              editable={false}
                            />
                          </View>
                        </ModalPicker> */}
                      </View>
                      <View style={{ flex: 0.8 }}>
                        <LblFormInput
                          textAlignVertical={"top"}
                          lblText={false}
                          height={50}
                          placeholderTxt={Strings.homenumber}
                          lblTxt={Strings.homenumber}
                          select_opt={false}
                          numberOfLines={4}
                          multiline={true}
                          value={this.state.home_number}
                          onChangeText={(text) => {
                            this.setState({ home_number: text });
                          }}
                        />
                      </View>
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: AppColors.brand.grey,
                      justifyContent: "center",
                      marginTop: 10,
                    }}
                  >
                    <Text style={{ flex: 1, fontSize: 14, padding: 5 }}>
                      {Strings.addressandcontactinformation}
                    </Text>
                  </View>
                  <View style={{ marginTop: 10 }}>
                    <View style={{ flexDirection: "row" }}>
                      <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                        {Strings.addressline1}
                      </Text>
                      <Text
                        style={{ paddingLeft: 5, paddingTop: 5, color: "red" }}
                      >
                        *
                      </Text>
                    </View>
                    <GooglePlacesAutocomplete
                      placeholder={this.state.address}
                      placeholderTextColor="#9E9E9E"
                      minLength={4} // minimum length of text to search
                      autoFocus={false}
                      listViewDisplayed="false" // true/false/undefined
                      fetchDetails={true}
                      renderDescription={(row) => row.description} // custom description render
                      onPress={(data, details = null) => {
                        // 'details' is provided when fetchDetails = true
                        console.log(
                          "GooglePlacesAutocomplete_details=====> " +
                            JSON.stringify(details)
                        );
                        var itemDetail = {};
                        var postData = Object.assign({}, this.state.postData);
                        itemDetail["adr_address"] = details.formatted_address;
                        postData.address = itemDetail.adr_address;
                        postData.address1 = itemDetail.adr_address;

                        // itemDetail['lat'] = details.geometry.location.lat;
                        // itemDetail['longi'] = details.geometry.location.lng;
                        // postData.latitude = itemDetail.lat;
                        // postData.longitude = itemDetail.longi;

                        this.setState({
                          is_selected: 1,
                          address: details.formatted_address,
                          latitude: details.geometry.location.lat,
                          longitude: details.geometry.location.lng,
                        });
                        var postaltown = 0;
                        var postaltown = 0;
                        for (
                          var i = 0;
                          i < details.address_components.length;
                          i++
                        ) {
                          if (
                            details.address_components[i].types[0] == "country"
                          ) {
                            itemDetail["country"] =
                              details.address_components[i].long_name;
                            this.setState({
                              country: details.address_components[i].long_name,
                              country_iso2:
                                details.address_components[i].short_name,
                            });
                            itemDetail["country_iso"] =
                              details.address_components[i].short_name;
                            postData.country_iso2 = itemDetail.country;
                            postData.country_iso = itemDetail.country_iso;
                          } else if (
                            details.address_components[i].types[0] == "locality"
                          ) {
                            itemDetail["administrative_area_level_2"] =
                              details.address_components[i].short_name;
                            postData.city_name =
                              itemDetail.administrative_area_level_2;
                            this.setState({
                              city: itemDetail.administrative_area_level_2,
                              city_id: itemDetail.administrative_area_level_2,
                            });
                          } else if (
                            details.address_components[i].types[0] ==
                            "postal_town"
                          ) {
                            postaltown = 1;
                            itemDetail["administrative_area_level_2"] =
                              details.address_components[i].short_name;
                            postData.city_name =
                              itemDetail.administrative_area_level_2;
                            this.setState({
                              city: itemDetail.administrative_area_level_2,
                              city_id: itemDetail.administrative_area_level_2,
                            });
                          } else if (
                            details.address_components[i].types[0] ==
                            "administrative_area_level_2"
                          ) {
                            postaltown = 1;
                            itemDetail["administrative_area_level_2"] =
                              details.address_components[i].short_name;
                            postData.state_name =
                              itemDetail.administrative_area_level_2;
                            this.setState({
                              state: itemDetail.administrative_area_level_2,
                              state_id: itemDetail.administrative_area_level_2,
                            });
                          } else if (
                            details.address_components[i].types[0] ==
                              "administrative_area_level_1" &&
                            postaltown == 0
                          ) {
                            itemDetail["administrative_area_level_1"] =
                              details.address_components[i].long_name;
                            postData.state_name =
                              itemDetail.administrative_area_level_1;
                            this.setState({
                              state: itemDetail.administrative_area_level_1,
                              state_id: itemDetail.administrative_area_level_1,
                            });
                          } else if (
                            details.address_components[i].types[0] ==
                            "postal_code"
                          ) {
                            itemDetail["postal_code"] =
                              details.address_components[i].short_name;
                            postData.zip_code = itemDetail.postal_code;
                            this.setState({
                              postal_code:
                                details.address_components[i].short_name,
                            });
                          }
                        }
                        this.setState({ postData: postData });
                      }}
                      getDefaultValue={() => {
                        return ""; // text input default value
                      }}
                      query={{
                        key: mapkey,
                        language: "en", // language of the results
                        types: "", // default: 'geocode'
                      }}
                      styles={{
                        textInput: {
                          color: "#9E9E9E",
                          fontSize: 14,
                          textAlign: "center",
                          marginLeft: 20,
                        },
                        description: {
                          fontSize: 14,
                          color: "#9E9E9E",
                        },
                        predefinedPlacesDescription: {
                          color: "#9E9E9E",
                        },
                      }}
                      nearbyPlacesAPI="GooglePlacesSearch" // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
                      debounce={0} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
                    />
                    <View style={{ marginTop: 10 }}>
                      <View style={{ flexDirection: "row" }}>
                        <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                          {Strings.city}
                        </Text>
                        <Text
                          style={{
                            paddingLeft: 5,
                            paddingTop: 5,
                            color: "red",
                          }}
                        >
                          *
                        </Text>
                      </View>
                      <LblFormInput
                        textAlignVertical={"top"}
                        lblText={false}
                        height={50}
                        placeholderTxt={Strings.city}
                        lblTxt={Strings.city}
                        select_opt={false}
                        numberOfLines={1}
                        multiline={false}
                        value={this.state.city}
                        onChangeText={(text) => {
                          this.setState({ city: text, city_id: text });
                        }}
                      />
                    </View>
                    <View style={{ marginTop: 10 }}>
                      <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                        {Strings.state}
                      </Text>
                      <LblFormInput
                        textAlignVertical={"top"}
                        lblText={false}
                        height={50}
                        placeholderTxt={Strings.state}
                        lblTxt={Strings.state}
                        select_opt={false}
                        numberOfLines={1}
                        multiline={false}
                        value={this.state.state}
                        onChangeText={(text) => {
                          this.setState({ state: text });
                        }}
                      />
                    </View>
                    <View style={{ marginTop: 10 }}>
                      <View style={{ flexDirection: "row" }}>
                        <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                          {Strings.country}
                        </Text>
                        <Text
                          style={{
                            paddingLeft: 5,
                            paddingTop: 5,
                            color: "red",
                          }}
                        >
                          *
                        </Text>
                      </View>
                      <LblFormInput
                        textAlignVertical={"top"}
                        lblText={false}
                        editable={false}
                        height={50}
                        placeholderTxt={Strings.country}
                        lblTxt={Strings.country}
                        select_opt={false}
                        numberOfLines={1}
                        multiline={false}
                        value={this.state.country}
                        onChangeText={(text) => {
                          this.setState({ country: text });
                        }}
                      />
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: AppColors.brand.grey,
                      justifyContent: "center",
                      marginTop: 10,
                    }}
                  >
                    <Text style={{ flex: 1, fontSize: 14, padding: 5 }}>
                      {Strings.otherdetail}
                    </Text>
                  </View>
                  <View style={{ marginTop: 10 }}>
                    <LblFormInput
                      textAlignVertical={"top"}
                      lblText={false}
                      height={50}
                      placeholderTxt={Strings.aboutme}
                      lblTxt={Strings.aboutme}
                      select_opt={false}
                      numberOfLines={4}
                      multiline={true}
                      value={this.state.about_me}
                      onChangeText={(text) => {
                        this.setState({ about_me: text });
                      }}
                    />
                  </View>
                </View>
              )}
            </View>
            <Button
              onPress={this.editProfile}
              title={Strings.submit}
              backgroundColor={AppColors.brand.buttonclick}
              fontSize={15}
            />
          </View>
        </ScrollView>
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
export default connect(mapStateToProps, mapDispatchToProps)(ProfileView);
