/**
 * User Actions
 *
 * React Native Starter App
 * https://github.com/mcnamee/react-native-starter-app
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ErrorMessages, Firebase, FirebaseRef } from "@constants/";
import * as RecipeActions from "../recipes/actions";
import { AppConfig } from "@constants/";
import { func } from "prop-types";

/**
 * Get Login Credentials from AsyncStorage
 */
async function getCredentialsFromStorage() {
  const values = await AsyncStorage.getItem("api/credentials");
  const jsonValues = JSON.parse(values);

  // Return credentials from storage, or an empty object
  if (jsonValues.email || jsonValues.password) return jsonValues;
  return {};
}

async function getTokenFromStorage() {
  const values = await AsyncStorage.getItem("userToken");
  // Return credentials from storage, or an empty object
  if (values) return values;
  return {};
}

async function getSiteURL() {
  const values = await AsyncStorage.getItem("SITE_URL");
  // Return credentials from storage, or an empty object
  if (values) return values;
  return {};
}

/**
 * Save Login Credentials to AsyncStorage
 */
async function saveCredentialsToStorage(email = "", password = "") {
  await AsyncStorage.setItem(
    "api/credentials",
    JSON.stringify({ email, password })
  );
}

/**
 * Remove Login Credentials from AsyncStorage
 */
async function removeCredentialsFromStorage() {
  await AsyncStorage.removeItem("api/credentials");
}

/**
 * Get this User's Details
 */
function getUserData(dispatch) {
  if (Firebase === null) {
    return () =>
      new Promise((resolve, reject) =>
        reject({ message: ErrorMessages.invalidFirebase })
      );
  }

  const UID = Firebase.auth().currentUser.uid;
  if (!UID) return false;

  const ref = FirebaseRef.child(`users/${UID}`);

  return ref.on("value", (snapshot) => {
    const userData = snapshot.val() || [];

    return dispatch({
      type: "USER_DETAILS_UPDATE",
      data: userData,
    });
  });
}

/**
 * Login to Firebase with Email/Password
 */
export function login(formData = {}, verifyEmail = false) {
  if (Firebase === null) {
    return () =>
      new Promise((resolve, reject) =>
        reject({ message: ErrorMessages.invalidFirebase })
      );
  }

  // Reassign variables for eslint ;)
  let email = formData.Email || "";
  let password = formData.Password || "";

  return async (dispatch) => {
    // When no credentials passed in, check AsyncStorage for existing details
    if (!email || !password) {
      const credsFromStorage = await getCredentialsFromStorage();
      if (!email) email = credsFromStorage.email;
      if (!password) password = credsFromStorage.password;
    }

    // Update Login Creds in AsyncStorage
    if (email && password) saveCredentialsToStorage(email, password);

    // We're ready - let's try logging them in
    return Firebase.auth()
      .signInWithEmailAndPassword(email, password)
      .then((res) => {
        if (res && res.uid) {
          // Update last logged in data
          FirebaseRef.child(`users/${res.uid}`).update({
            lastLoggedIn: Firebase.database.ServerValue.TIMESTAMP,
          });

          // Send verification Email - usually used on first login
          if (verifyEmail) {
            Firebase.auth()
              .currentUser.sendEmailVerification()
              .catch(() => console.log("Verification email failed to send"));
          }

          // Get Favourites
          RecipeActions.getFavourites(dispatch);

          // Get User Data
          getUserData(dispatch);
        }

        // Send to Redux
        return dispatch({
          type: "USER_LOGIN",
          data: res,
        });
      })
      .catch((err) => {
        throw err;
      });
  };
}

/**
 * Sign Up to Firebase
 */
export function signUp(formData = {}) {
  if (Firebase === null) {
    return () =>
      new Promise((resolve, reject) =>
        reject({ message: ErrorMessages.invalidFirebase })
      );
  }

  const email = formData.Email || "";
  const password = formData.Password || "";
  const firstName = formData.FirstName || "";
  const lastName = formData.LastName || "";

  return () =>
    Firebase.auth()
      .createUserWithEmailAndPassword(email, password)
      .then((res) => {
        // Setup/Send Details to Firebase database
        if (res && res.uid) {
          FirebaseRef.child(`users/${res.uid}`).set({
            firstName,
            lastName,
            signedUp: Firebase.database.ServerValue.TIMESTAMP,
            lastLoggedIn: Firebase.database.ServerValue.TIMESTAMP,
          });
        }
      });
}

/**
 * Reset Password
 */
export function resetPassword(formData = {}) {
  if (Firebase === null) {
    return () =>
      new Promise((resolve, reject) =>
        reject({ message: ErrorMessages.invalidFirebase })
      );
  }

  const email = formData.Email || "";
  return () => Firebase.auth().sendPasswordResetEmail(email);
}

/**
 * Update Profile
 */
export function updateProfile(formData = {}) {
  if (Firebase === null) {
    return () =>
      new Promise((resolve, reject) =>
        reject({ message: ErrorMessages.invalidFirebase })
      );
  }

  const UID = Firebase.auth().currentUser.uid;
  if (!UID) return false;

  const email = formData.Email || "";
  const firstName = formData.FirstName || "";
  const lastName = formData.LastName || "";

  // Set the email against user account
  return () =>
    Firebase.auth()
      .currentUser.updateEmail(email)
      .then(() => {
        // Then update user in DB
        FirebaseRef.child(`users/${UID}`).update({
          firstName,
          lastName,
        });
      });
}

/**
 * Logout
 */
export function logout() {
  return {
    type: "USER_LOGOUT",
  };
}

export function logoutApp() {
  return {
    type: "USER_LOGOUT",
  };
}
//settings
export function settings(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      var siteURL = await getSiteURL();
      if (payload.site_url) {
        siteURL = payload.site_url;
      }

      var header = AppConfig.header;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;

      //check get or post based on payload param
      var url =
        siteURL + AppConfig.endpoints.settings + "?filter=" + payload.filter;
      var type = "GET";
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: null,
      });
      console.log("getSettings " + JSON.stringify(header));
      const responseJson = await response.json();
      console.log("getSettings ==  " + JSON.stringify(responseJson.data));
      return dispatch({
        type: "SETTINGS",
        data: responseJson.data,
      });
    } catch (error) {
      console.log(error);
    }
  };
}

//social login
export function social_login(payload) {
  return async (dispatch) => {
    try {
      const siteURL = await getSiteURL();
      var url = siteURL + AppConfig.endpoints.social_logins;
      if (payload.provider) url = url + "/" + payload.provider;

      const response = await fetch(url, {
        method: "POST",
        headers: AppConfig.headers,
        body: JSON.stringify(payload),
      });
      const responseJson = await response.json();
      console.log("dddd record payload" + url + JSON.stringify(payload));
      console.log(
        "dddd record payload res" + url + JSON.stringify(responseJson)
      );
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}
//twitter register
export function twitter_register(payload) {
  return async (dispatch) => {
    try {
      const siteURL = await getSiteURL();
      var url = siteURL + AppConfig.endpoints.twitter_register;
      const response = await fetch(url, {
        method: "POST",
        headers: AppConfig.headers,
        body: JSON.stringify(payload),
      });
      const responseJson = await response.json();
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}

//transactions
export function transactions(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;

      //check get or post based on payload param
      var url =
        siteURL +
        AppConfig.endpoints.users +
        "/" +
        payload.user_id +
        "/transactions" +
        "?filter=" +
        payload.filter +
        "&type=" +
        payload.type +
        "&from_date=" +
        payload.from_date +
        "&to_date=" +
        payload.to_date;
      console.log("respppp responseJson" + JSON.stringify(url));
      var type = "GET";
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: null,
      });
      const responseJson = await response.json();
      console.log("respppp responseJson" + JSON.stringify(responseJson));
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}
//bookings
export function bookings(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;

      //check get or post based on payload param
      var url =
        siteURL +
        AppConfig.endpoints.vehicle_rentals +
        "?item_user_status_id=" +
        payload.filter +
        "&page=" +
        payload.page;
      var type = "GET";
      var body_content = null;
      if (payload.filter == "all")
        url =
          siteURL +
          AppConfig.endpoints.vehicle_rentals +
          "?page=" +
          payload.page;
      if (payload.call_from == "calendar")
        url = siteURL + AppConfig.endpoints.vehicle_rentals + "?limit=all";
      else if (payload.call_from == "booknow") {
        url = siteURL + AppConfig.endpoints.vehicle_rentals;
        type = "POST";
        body_content = JSON.stringify(payload);
      } else if (payload.call_from == "order") {
        url = siteURL + AppConfig.endpoints.vehicle_rentals + "/" + payload.id;
        type = "PUT";
        body_content = JSON.stringify(payload);
      } else if (payload.call_from == "activity") {
        url =
          siteURL +
          AppConfig.endpoints.vehicle_rentals +
          "/" +
          payload.booking_id;
        type = "GET";
      } else if (payload.call_from == "orderpaylisting") {
        url =
          siteURL +
          AppConfig.endpoints.vehicle_rentals +
          "/" +
          payload.vehicle_rental_id +
          "/paynow";
        type = "POST";
        body_content = JSON.stringify(payload);
      } else if (payload.call_from == "activity_status_update") {
        if (payload.type == "checkout") {
          type = "POST";
          body_content = JSON.stringify(payload);
        }
        url =
          siteURL +
          AppConfig.endpoints.vehicle_rentals +
          "/" +
          payload.id +
          "/" +
          payload.type;
      }
      console.log("respppp responseJson" + JSON.stringify(url));
      console.log("respppp responseJson" + JSON.stringify(body_content));
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: body_content,
      });
      const responseJson = await response.json();
      console.log("respppp responseJson" + JSON.stringify(responseJson));
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}

//item_user_messages
export function item_user_messages(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;

      //check get or post based on payload param
      var url =
        siteURL +
        AppConfig.endpoints.item_user_messages +
        "/" +
        payload.filter +
        "?page=" +
        payload.page;
      var type = "GET";
      console.log("respppp url" + JSON.stringify(url));
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: null,
      });
      const responseJson = await response.json();
      console.log("respppp responseJson" + JSON.stringify(responseJson));
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}
//item_orders
export function item_orders(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;

      //check get or post based on payload param
      var url =
        siteURL +
        AppConfig.endpoints.item_orders +
        "?item_user_status_id=" +
        payload.filter +
        "?page=" +
        payload.page;
      if (payload.filter == "all")
        url =
          siteURL + AppConfig.endpoints.item_orders + "?page=" + payload.page;
      var type = "GET";
      console.log("respppp url" + JSON.stringify(url));
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: null,
      });
      const responseJson = await response.json();
      console.log("respppp responseJson" + JSON.stringify(responseJson));
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}

//get gateways
export function get_gateways(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;

      //check get or post based on payload param
      var url =
        siteURL + AppConfig.endpoints.get_gateways + "?page=" + payload.page;
      var type = "GET";
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: null,
      });
      const responseJson = await response.json();
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}
//get countries
export function countries(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;

      //check get or post based on payload param
      var url =
        siteURL + AppConfig.endpoints.countries + "?sort=name&sortby=asc";
      var type = "GET";
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: null,
      });
      const responseJson = await response.json();
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}
//user cash withdrawals
export function user_cash_withdrawals(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;

      //check get or post based on payload param
      //var url = siteURL+AppConfig.endpoints.users+"/"+payload.user_id+"/"+user_cash_withdrawals+'?page='+payload.page+"&filter=%7B%22include%22:%7B%220%22:%22money_transfer_account%22,%221%22:%22withdrawal_status%22%7D%7D";
      var url =
        siteURL +
        AppConfig.endpoints.users +
        "/" +
        payload.user_id +
        "/user_cash_withdrawals?page=" +
        payload.page +
        "&filter=%7B%22include%22:%7B%220%22:%22money_transfer_account%22,%221%22:%22withdrawal_status%22%7D%7D";
      var type = "GET";
      var body_data = null;
      if (payload.type == "post") {
        url =
          siteURL +
          AppConfig.endpoints.users +
          "/" +
          payload.user_id +
          "/user_cash_withdrawals";
        type = "POST";
        body_data = JSON.stringify({
          user_id: payload.user_id,
          amount: payload.amount,
          money_transfer_account_id: payload.money_transfer_account_id,
          remark: "",
        });
      }
      console.log(url);
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: body_data,
      });
      const responseJson = await response.json();
      console.log("responseJson" + JSON.stringify(responseJson));
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}
//user details
export function user_me(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;

      var url = siteURL + AppConfig.endpoints.me;
      if (payload.filter) {
        url = url + "?filter=" + JSON.stringify(payload.filter);
      }
      console.log(url);
      var type = "GET";
      var body_data = null;

      const response = await fetch(url, {
        method: type,
        headers: header,
        body: body_data,
      });
      const responseJson = await response.json();
      console.log("responseJson" + JSON.stringify(responseJson));
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}
//proof details
export function proof_types(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;

      var url = siteURL + AppConfig.endpoints.proof_types;
      if (payload.filter) {
        url = url + "?filter=" + JSON.stringify(payload.filter);
      }
      console.log(url);
      var type = "GET";
      var body_data = null;

      const response = await fetch(url, {
        method: type,
        headers: header,
        body: body_data,
      });
      const responseJson = await response.json();
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}
//get messages
export function messages(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;

      //check get or post based on payload param
      var url =
        siteURL + AppConfig.endpoints.messages + "?page=" + payload.page;
      var type = "GET";
      var body_content = null;
      if (payload.type == "starmessages")
        url =
          siteURL + AppConfig.endpoints.star_messages + "?page=" + payload.page;
      else if (payload.type == "sentmessages")
        url =
          siteURL + AppConfig.endpoints.sent_messages + "?page=" + payload.page;
      else if (payload.type == "put") {
        url = siteURL + AppConfig.endpoints.messages + "/" + payload.id;
        type = "PUT";
        body_content = JSON.stringify(payload);
      }

      console.log("messages " + url);
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: body_content,
      });
      const responseJson = await response.json();
      console.log("messages " + JSON.stringify(responseJson));
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}
//wallet
export function wallets(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;

      //check get or post based on payload param
      var url = siteURL + AppConfig.endpoints.wallets;
      var type = "GET";
      var body_content = null;
      if (payload.type == "wallets")
        url = siteURL + AppConfig.endpoints.wallets;
      else if (payload.type == "post") {
        url = siteURL + AppConfig.endpoints.wallets;
        type = "POST";
        body_content = JSON.stringify(payload);
      }

      console.log("messages " + url);
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: body_content,
      });
      const responseJson = await response.json();
      console.log("messages " + JSON.stringify(responseJson));
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}
//private note
export function private_notes(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;

      var url = siteURL + AppConfig.endpoints.private_notes;
      var type = "GET";
      var body_content = null;
      if (payload.type == "post_private_note") {
        type = "POST";
        body_content = JSON.stringify(payload);
      }
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: body_content,
      });
      const responseJson = await response.json();
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}
//host
export function host(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;

      var url = siteURL + AppConfig.endpoints.host;
      var type = "GET";
      var body_content = null;
      if (payload.type == "post_host_review") {
        url = siteURL + AppConfig.endpoints.host + "/review";
        type = "POST";
        body_content = JSON.stringify(payload);
      }
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: body_content,
      });
      const responseJson = await response.json();
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}
//booker
export function booker(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;

      var url = siteURL + AppConfig.endpoints.booker;
      var type = "GET";
      var body_content = null;
      if (payload.type == "post_booker_review") {
        url = siteURL + AppConfig.endpoints.booker + "/review";
        type = "POST";
        body_content = JSON.stringify(payload);
      }
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: body_content,
      });
      const responseJson = await response.json();
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}
export function vehicle_coupons(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;

      var url =
        siteURL + AppConfig.endpoints.vehicle_coupons + "/" + payload.id;
      var type = "POST";
      var body_content = JSON.stringify(payload);
      console.log(url);
      console.log(body_content);
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: body_content,
      });
      const responseJson = await response.json();
      console.log(JSON.stringify(responseJson));
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}

/**** NEED FOR THIS ABS PROJECT*****/
//forgot password
export function forgot_password(payload) {
  return async (dispatch) => {
    try {
      const siteURL = await getSiteURL();
      const response = await fetch(
        siteURL + AppConfig.endpoints.forgot_password,
        {
          method: "POST",
          headers: AppConfig.headers,
          body: JSON.stringify(payload),
        }
      );
      console.log(
        "respppp url" + siteURL + AppConfig.endpoints.forgot_password
      );
      console.log("respppp payload" + JSON.stringify(payload));
      const responseJson = await response.json();
      console.log("respppp payload" + JSON.stringify(responseJson));
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}
//otp_verify
export function otp_verify(payload) {
  return async (dispatch) => {
    try {
      const siteURL = await getSiteURL();
      const response = await fetch(
        siteURL +
          AppConfig.endpoints.users +
          "/" +
          payload.user_id +
          "/otp_verify",
        {
          method: "POST",
          headers: AppConfig.header,
          body: JSON.stringify(payload),
        }
      );
      const responseJson = await response.json();
      console.log(
        "record ss" +
          JSON.stringify(
            siteURL +
              AppConfig.endpoints.users +
              "/" +
              payload.user_id +
              "/otp_verify"
          )
      );
      console.log("record ss" + JSON.stringify(AppConfig.header));
      console.log("record ss" + JSON.stringify(responseJson));
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}
//resend_otp
export function resend_otp(payload) {
  return async (dispatch) => {
    try {
      const siteURL = await getSiteURL();
      const response = await fetch(
        siteURL + AppConfig.endpoints.resend_otp + "/" + payload.user_id,
        {
          method: "GET",
          headers: AppConfig.header,
          body: null,
        }
      );
      const responseJson = await response.json();
      console.log(
        "record ss" +
          JSON.stringify(
            siteURL + AppConfig.endpoints.resend_otp + "/" + payload.user_id
          )
      );
      console.log("record ss" + JSON.stringify(AppConfig.header));
      console.log("record ss" + JSON.stringify(responseJson));
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}
//change_password
export function change_password(payload) {
  return async (dispatch) => {
    try {
      const siteURL = await getSiteURL();
      const credsFromStorage = await getTokenFromStorage();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;

      //check get or post based on payload param
      var url =
        siteURL +
        AppConfig.endpoints.users +
        "/" +
        payload.user_id +
        "/change_password";
      console.log("respppp url" + JSON.stringify(url));
      console.log("respppp payload" + JSON.stringify(payload));
      var type = "PUT";
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: JSON.stringify(payload),
      });
      const responseJson = await response.json();
      console.log("respppp responseJson" + JSON.stringify(responseJson));
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}
//user_profiles
export function user_profiles(payload) {
  return async (dispatch) => {
    try {
      const siteURL = await getSiteURL();
      const credsFromStorage = await getTokenFromStorage();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;

      //check get or post based on payload param
      var url = siteURL + AppConfig.endpoints.user_profiles;
      console.log("respppp url" + JSON.stringify(url));
      console.log("respppp payload" + JSON.stringify(payload));
      var type = "PUT";
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: JSON.stringify(payload),
      });
      const responseJson = await response.json();
      console.log("respppp responseJson" + JSON.stringify(responseJson));
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}
//signup
export function signup(payload) {
  return async (dispatch) => {
    try {
      const siteURL = await getSiteURL();
      const response = await fetch(
        siteURL + AppConfig.endpoints.users_register,
        {
          method: "POST",
          headers: AppConfig.header,
          body: JSON.stringify(payload),
        }
      );
      const responseJson = await response.json();
      return dispatch({
        type: "USER_DETAILS_UPDATE",
        data: responseJson,
      });
    } catch (error) {
      console.log(error);
    }
  };
}
//login
export function userlogin(payload) {
  return async (dispatch) => {
    try {
      const siteURL = await getSiteURL();
      console.log("getitemdata == " + JSON.stringify(AppConfig.header));
      const response = await fetch(siteURL + AppConfig.endpoints.users_login, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "x-ag-app-id": AppConfig.xagappid,
          "x-ag-app-secret": AppConfig.xagappsecret,
        },
        body: JSON.stringify(payload),
      });
      console.log(
        "getitemdata == " +
          JSON.stringify(siteURL + AppConfig.endpoints.users_login)
      );

      console.log("getitemdata == " + JSON.stringify(payload));
      const responseJson = await response.json();
      responseJson["userToken"] = responseJson.token;
      console.log("getitemdata == tttkk " + JSON.stringify(responseJson.token));
      return dispatch({
        type: "USER_DETAILS_UPDATE",
        data: responseJson,
      });
    } catch (error) {
      console.log(error);
    }
  };
}
//get specialities
export function getSpecialities(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;
      //check get or post based on payload param
      var url =
        siteURL + AppConfig.endpoints.specialties + "?filter=" + payload.filter;
      var type = "GET";
      console.log("getSpecialities " + url);
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: null,
      });
      console.log(
        "mapStateToProps == getSpecialities " + JSON.stringify(header)
      );
      const responseJson = await response.json();
      console.log(
        "mapStateToProps == getSpecialities " +
          JSON.stringify(responseJson.data)
      );
      return dispatch({
        type: "SPECIALITIES",
        data: responseJson.data,
      });
    } catch (error) {
      console.log(error);
    }
  };
}
//get Languages
export function getLanguages(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;
      //check get or post based on payload param
      var url =
        siteURL + AppConfig.endpoints.languages + "?filter=" + payload.filter;
      var type = "GET";
      console.log("getLanguages " + url);
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: null,
      });
      console.log("getLanguages " + JSON.stringify(header));
      const responseJson = await response.json();
      console.log("getLanguages " + JSON.stringify(responseJson.data));
      return dispatch({
        type: "LANGUAGES",
        data: responseJson.data,
      });
    } catch (error) {
      console.log(error);
    }
  };
}
//get Countries
export function getCountries(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.header;
      //if(credsFromStorage && typeof(credsFromStorage) !== 'object')
      // header['Authorization']='Bearer '+credsFromStorage;
      //check get or post based on payload param
      var url =
        siteURL + AppConfig.endpoints.countries + "?filter=" + payload.filter;
      var type = "GET";
      console.log("getCountries " + url);
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: null,
      });
      console.log("getCountries ddd " + JSON.stringify(header));
      const responseJson = await response.json();
      console.log("getCountries dd " + JSON.stringify(responseJson.data));
      return dispatch({
        type: "COUNTRIES",
        data: responseJson.data,
      });
    } catch (error) {
      console.log(error);
    }
  };
}
//get Cities
export function getCities(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;
      //check get or post based on payload param
      var url =
        siteURL + AppConfig.endpoints.cities + "?filter=" + payload.filter;
      var type = "GET";
      console.log("getCities " + url);
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: null,
      });
      console.log("getCities " + JSON.stringify(header));
      const responseJson = await response.json();
      console.log("getCities " + JSON.stringify(responseJson.data));
      return dispatch({
        type: "CITIES",
        data: responseJson.data,
      });
    } catch (error) {
      console.log(error);
    }
  };
}

//get States
export function getStates(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;
      //check get or post based on payload param
      var url =
        siteURL + AppConfig.endpoints.states + "?filter=" + payload.filter;
      var type = "GET";
      console.log("UserActions_getStates_url====> " + url);
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: null,
      });
      console.log(
        "UserActions_getStates_header====> " + JSON.stringify(header)
      );
      const responseJson = await response.json();
      console.log(
        "UserActions_getStates_resp====> " + JSON.stringify(responseJson.data)
      );
      return dispatch({
        type: "STATES",
        data: responseJson.data,
      });
    } catch (error) {
      console.log(error);
    }
  };
}

//get States
export function getmedicines(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;
      //check get or post based on payload param
      var url =
        siteURL +
        AppConfig.endpoints.medicines +
        "?filter=" +
        encodeURI(payload.filter);
      var type = "GET";
      console.log("UserActions_getmedicines_url====> " + url);
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: null,
      });
      console.log(
        "UserActions_getmedicines_header====> " + JSON.stringify(header)
      );
      const responseJson = await response.json();
      console.log(
        "UserActions_getmedicines_resp====> " + JSON.stringify(responseJson)
      );
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}

//get Insurances
export function getInsurances(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;
      //check get or post based on payload param
      var url =
        siteURL + AppConfig.endpoints.insurances + "?filter=" + payload.filter;
      var type = "GET";
      console.log("getInsurances " + url);
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: null,
      });
      console.log("getInsurances " + JSON.stringify(header));
      const responseJson = await response.json();
      console.log("getInsurances " + JSON.stringify(responseJson.data));
      return dispatch({
        type: "INSURANCES",
        data: responseJson.data,
      });
    } catch (error) {
      console.log(error);
    }
  };
}
//get Insurances
export function getPages(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;
      //check get or post based on payload param
      var url =
        siteURL + AppConfig.endpoints.pages + "?filter=" + payload.filter;
      var type = "GET";
      console.log("getPages === " + url);
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: null,
      });
      console.log("getPages " + JSON.stringify(header));
      const responseJson = await response.json();
      console.log("getPages ==  " + JSON.stringify(responseJson.data));
      return dispatch({
        type: "PAGES",
        data: responseJson.data,
      });
    } catch (error) {
      console.log(error);
    }
  };
}
//get appointments
export function appointments(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;
      //check get or post based on payload param
      var url = siteURL + AppConfig.endpoints.appointments;
      var type = "GET";
      var bdy = null;
      if (payload.is_post && payload.is_post == 1) {
        type = "POST";
        url = siteURL + AppConfig.endpoints.appointments;
        bdy = JSON.stringify(payload);
      } else if (payload.is_put && payload.is_put == 1) {
        type = "PUT";
        if (payload.reschedule && payload.reschedule == 1) {
          url = siteURL + AppConfig.endpoints.appointments + "/" + payload.id;
          bdy = JSON.stringify(payload);
        } else if (
          payload.appointment_booking &&
          payload.appointment_booking == 1
        ) {
          url =
            siteURL +
            AppConfig.endpoints.appointments +
            "/rave_payment_success/" +
            payload.appointment_id;
          bdy = JSON.stringify({
            id: payload.appointment_id,
            txRef: payload.txRef,
            flwRef: payload.flwRef,
            response: JSON.stringify(payload.data),
          });
        } else {
          url =
            siteURL +
            AppConfig.endpoints.appointments +
            "/" +
            payload.id +
            "/change_status";
          bdy = JSON.stringify(payload);
        }
      } else {
        url =
          siteURL +
          AppConfig.endpoints.appointments +
          "?filter=" +
          encodeURI(payload.filter) +
          "&type=" +
          payload.type;
        console.log(
          "UserActions_appointments_token======> " + JSON.stringify(payload)
        );
        if (payload.appointment_id) {
          url =
            siteURL +
            AppConfig.endpoints.appointments +
            "/" +
            payload.appointment_id +
            "?filter=" +
            encodeURI(payload.filter);
        }
      }

      console.log(
        "UserActions_appointments_token======> " +
          JSON.stringify(payload.token) +
          "\n"
      );
      console.log(
        "UserActions_appointments_url======> " + JSON.stringify(url) + "\n"
      );
      console.log(
        "UserActions_appointments_payload======> " +
          JSON.stringify(payload) +
          "\n"
      );
      console.log(
        "UserActions_appointments_type======> " + JSON.stringify(type) + "\n"
      );
      console.log(
        "UserActions_appointments_header======> " +
          JSON.stringify(header) +
          "\n"
      );
      console.log(
        "UserActions_appointments_body======> " + JSON.stringify(bdy) + "\n"
      );
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: bdy,
      });
      const responseJson = await response.json();
      console.log(
        "UserActions_appointments_resp======> " + JSON.stringify(responseJson)
      );
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}

//Create Medicine

export function createmedicine(payload) {
  return async (dispatch) => {
    try {
      var header = AppConfig.headers;
      const siteURL = await getSiteURL();
      if (payload.token) header["Authorization"] = "Bearer " + payload.token;
      //check get or post based on payload param
      var url = "";
      var type = "";
      var bdy = null;

      if (payload.body.is_post && payload.body.is_post == 1) {
        type = "POST";
        url = siteURL + AppConfig.endpoints.medicines;
        bdy = JSON.stringify(payload.body);
      } else if (payload.body.is_put && payload.body.is_put == 1) {
        type = "PUT";
        url = siteURL + AppConfig.endpoints.medicines + "/" + payload.body.id;
        bdy = JSON.stringify(payload.body);
      } else if (payload.body.is_delete && payload.body.is_delete == 1) {
        type = "DELETE";
        url = siteURL + AppConfig.endpoints.medicines + "/" + payload.body.id;
      }

      console.log(
        "UserActions_medicines_token======> " +
          JSON.stringify(payload.token) +
          "\n"
      );
      console.log(
        "UserActions_medicines_url======> " + JSON.stringify(url) + "\n"
      );
      console.log(
        "UserActions_medicines_payload======> " + JSON.stringify(payload) + "\n"
      );
      console.log(
        "UserActions_medicines_type======> " + JSON.stringify(type) + "\n"
      );
      console.log(
        "UserActions_medicines_header======> " + JSON.stringify(header) + "\n"
      );
      console.log(
        "UserActions_medicines_body======> " + JSON.stringify(bdy) + "\n"
      );
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: bdy,
      });
      const responseJson = await response.json();
      console.log(
        "UserActions_medicines_resp======> " + JSON.stringify(responseJson)
      );
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}

//user_favorites
export function user_favorites(payload) {
  return async (dispatch) => {
    try {
      var header = AppConfig.headers;
      const siteURL = await getSiteURL();
      if (payload.token) header["Authorization"] = "Bearer " + payload.token;

      //check get or post based on payload param
      var url =
        siteURL +
        AppConfig.endpoints.user_favorites +
        "?filter=" +
        JSON.stringify(payload.filter);
      var type = "GET";
      var bdy = null;
      if (payload.post_type && payload.post_type == "POST") {
        type = "POST";
        url = siteURL + AppConfig.endpoints.user_favorites;
        bdy = JSON.stringify(payload.filter);
      } else if (payload.post_type && payload.post_type == "DELETE") {
        type = "DELETE";
        url = siteURL + AppConfig.endpoints.user_favorites + "/" + payload.id;
        bdy = JSON.stringify(payload.filter);
      }
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: bdy,
      });
      const responseJson = await response.json();

      console.log("user_favorites data===" + JSON.stringify(url));
      console.log("user_favorites data===" + JSON.stringify(header));
      console.log("user_favorites data===" + JSON.stringify(bdy));
      console.log("user_favorites data===" + JSON.stringify(responseJson));

      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}
//prescriptions
export function prescriptions(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (payload.token) header["Authorization"] = "Bearer " + payload.token;
      //check get or post based on payload param
      var url = "";
      url =
        siteURL +
        AppConfig.endpoints.prescriptions +
        "?filter=" +
        encodeURI(payload.filter);
      if (payload && payload.q != "") {
        url =
          siteURL +
          AppConfig.endpoints.prescriptions +
          "?filter=" +
          encodeURI(payload.filter) +
          "&q=" +
          payload.q;
      }
      if (payload && payload.id) {
        url =
          siteURL +
          AppConfig.endpoints.prescriptions +
          "/" +
          payload.id +
          "?filter=" +
          encodeURI(payload.filter);
      }
      var type = "GET";
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: null,
      });
      const responseJson = await response.json();

      console.log(
        "UserActions_prescriptions_url= dd ====> " + JSON.stringify(url)
      );
      console.log(
        "UserActions_prescriptions_header=====> " + JSON.stringify(header)
      );
      console.log(
        "UserActions_prescriptions_resp=====> " + JSON.stringify(responseJson)
      );

      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}
// medicine_delivery_logs
export function medicine_delivery_logs(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (payload.token) header["Authorization"] = "Bearer " + payload.token;
      //check get or post based on payload param
      var url = siteURL + AppConfig.endpoints.medicine_delivery_logs;
      var type = "POST";
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: JSON.stringify(payload.body),
      });
      const responseJson = await response.json();

      console.log("medicine_delivery_logs=====> " + JSON.stringify(url) + "\n");
      console.log(
        "medicine_delivery_logs=====>" + JSON.stringify(header) + "\n"
      );
      console.log(
        "medicine_delivery_logs=====>" + JSON.stringify(payload.body) + "\n"
      );
      console.log(
        "UserActions_create_prescriptions_resp=====>" +
          JSON.stringify(responseJson) +
          "\n"
      );

      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}

//create prescriptions
export function create_prescriptions(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (payload.token) header["Authorization"] = "Bearer " + payload.token;
      //check get or post based on payload param
      var url = siteURL + AppConfig.endpoints.prescriptions;
      var type = "POST";
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: JSON.stringify(payload.body),
      });
      const responseJson = await response.json();

      console.log(
        "UserActions_create_prescriptions_url=====> " +
          JSON.stringify(url) +
          "\n"
      );
      console.log(
        "UserActions_create_prescriptions_header=====>" +
          JSON.stringify(header) +
          "\n"
      );
      console.log(
        "UserActions_create_prescriptions_boys=====>" +
          JSON.stringify(payload.body) +
          "\n"
      );
      console.log(
        "UserActions_create_prescriptions_resp=====>" +
          JSON.stringify(responseJson) +
          "\n"
      );

      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}

//auth
export function auth(payload) {
  return async (dispatch) => {
    try {
      var header = AppConfig.headers;
      header["Authorization"] = "Bearer " + payload.token;
      console.log("authuserdata = " + JSON.stringify(payload));
      const siteURL = await getSiteURL();

      const response = await fetch(
        siteURL +
          AppConfig.endpoints.users +
          '?filter={"include":{"0":"user_profile","1":"user_profile.city","2":"user_profile.state","3":"user_profile.country","4":"attachment"},"where":{"id":' +
          payload.user_id +
          "}}",
        {
          method: "GET",
          headers: header,
        }
      );
      var responseJson = await response.json();
      responseJson = responseJson.data[0];
      console.log("authuserdata auth= " + JSON.stringify(responseJson));
      responseJson["userToken"] = payload.token;
      console.log("authuserdata = " + JSON.stringify(responseJson));
      AsyncStorage.setItem("user_data", JSON.stringify(responseJson));
      //return responseJson;
      return dispatch({
        type: "USER_DETAILS_UPDATE",
        data: responseJson,
      });
    } catch (error) {
      console.log(error);
    }
  };
}
//user profile
export function user_profile(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;

      console.log(
        "record ss payload" +
          siteURL +
          AppConfig.endpoints.user_profiles +
          JSON.stringify(payload)
      );
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;

      header["Content-Type"] = "application/json,multipart/form-data;";
      console.log("record ss header" + JSON.stringify(header));
      var post_type = "POST";
      var url = siteURL + AppConfig.endpoints.user_profiles;
      var bdy = JSON.stringify(payload);
      if (payload.post_type == "PUT") {
        post_type = "PUT";
        delete payload["post_type"];
        bdy = JSON.stringify(payload);
      }
      const response = await fetch(url, {
        method: post_type,
        headers: header,
        body: bdy,
      });
      const responseJson = await response.json();
      console.log("record ss responseJson" + JSON.stringify(responseJson));
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}
//get Users
export function users(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.header;
      console.log("getUsersdddd " + JSON.stringify(credsFromStorage));
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;

      //check get or post based on payload param
      var url =
        siteURL +
        AppConfig.endpoints.users +
        "?filter=" +
        encodeURI(payload.filter);
      if (payload.user_id)
        url =
          siteURL +
          AppConfig.endpoints.users +
          "/" +
          payload.user_id +
          "?filter=" +
          encodeURI(payload.filter);
      if (payload.is_slot_need)
        url = url + "&is_slot_need=" + payload.is_slot_need;
      if (payload.view_slot_week)
        url = url + "&view_slot_week=" + payload.view_slot_week;
      var type = "GET";
      console.log("getUsers " + url);
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: null,
      });
      console.log("getUsersdddd " + JSON.stringify(header));
      const responseJson = await response.json();
      console.log("getUsers " + JSON.stringify(responseJson));
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}

//get appointment_settings
export function get_appointment_settings(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.header;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;

      //check get or post based on payload param
      var url =
        siteURL +
        AppConfig.endpoints.appointment_settings +
        "?filter=" +
        encodeURI(payload.filter);
      var type = "GET";
      console.log("appointment_settings " + url);
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: null,
      });
      console.log("appointment_settings " + JSON.stringify(header));
      const responseJson = await response.json();
      console.log("appointment_settings " + JSON.stringify(responseJson));
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}

//get appointment_settings
export function appointment_settings(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.header;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;

      //check get or post based on payload param
      var url =
        siteURL +
        AppConfig.endpoints.appointment_settings +
        "/" +
        payload.id +
        "/slot" +
        "?filter=" +
        encodeURI(payload.filter);
      if (payload.is_slot_need)
        url = url + "&is_slot_need=" + payload.is_slot_need;
      if (payload.view_slot_week)
        url = url + "&view_slot_week=" + payload.view_slot_week;
      var type = "GET";
      console.log("appointment_settings " + url);
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: null,
      });
      console.log("appointment_settings " + JSON.stringify(header));
      const responseJson = await response.json();
      console.log("appointment_settings " + JSON.stringify(responseJson));
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}
//get reviews
export function reviews(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.header;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;
      var f = payload.filter;
      //check get or post based on payload param
      var url =
        siteURL + AppConfig.endpoints.reviews + "?filter=" + encodeURI(f);
      var type = "GET";
      var bdy = null;
      if (payload.filter.post_type == "POST") {
        if (credsFromStorage && typeof credsFromStorage !== "object") {
          header["Authorization"] = "Bearer " + credsFromStorage;
        }
        url = siteURL + AppConfig.endpoints.reviews;
        type = "POST";
        var f = payload.filter;
        delete f["post_type"];
        bdy = JSON.stringify(f);
      }
      console.log("appointment_settings reviews " + url);
      console.log("appointment_settings reviews " + JSON.stringify(header));
      console.log("appointment_settings reviews " + bdy);
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: bdy,
      });

      const responseJson = await response.json();
      console.log(
        "appointment_settings reviews " + JSON.stringify(responseJson)
      );
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}
//user educations
export function user_educations(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;
      //check get or post based on payload param
      var url =
        siteURL +
        AppConfig.endpoints.user_educations +
        "?filter=" +
        encodeURI(payload.filter);
      var type = "GET";
      var bdy_cnt = null;
      if (payload.filter.post_type == "DELETE") {
        url =
          siteURL +
          AppConfig.endpoints.user_educations +
          "/" +
          payload.filter.id;
        type = "DELETE";
      } else if (payload.filter.post_type == "POST") {
        url = siteURL + AppConfig.endpoints.user_educations;
        type = "POST";
        var bdy = payload.filter;
        delete bdy["post_type"];
        bdy_cnt = JSON.stringify(bdy);
      } else if (payload.filter.post_type == "PUT") {
        url =
          siteURL +
          AppConfig.endpoints.user_educations +
          "/" +
          payload.filter.id;
        type = "PUT";
        var bdy = payload.filter;
        delete bdy["post_type"];
        bdy_cnt = JSON.stringify(bdy);
      }
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: bdy_cnt,
      });
      console.log("user_educations reviews " + url);
      console.log("user_educations reviews " + JSON.stringify(header));
      const responseJson = await response.json();
      console.log("user_educations reviews " + JSON.stringify(responseJson));
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}
//get user specialities
export function getUserSpecialities(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;
      //check get or post based on payload param
      var url =
        siteURL +
        AppConfig.endpoints.specialties_users +
        "?filter=" +
        payload.filter;
      var type = "GET";
      console.log("getSpecialities " + url);
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: null,
      });
      console.log(
        "mapStateToProps == getSpecialities " + JSON.stringify(header)
      );
      const responseJson = await response.json();
      console.log(
        "mapStateToProps == getSpecialities " +
          JSON.stringify(responseJson.data)
      );
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}

//get user languages
export function getUserLanguages(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;
      //check get or post based on payload param
      var url =
        siteURL +
        AppConfig.endpoints.languages_users +
        "?filter=" +
        payload.filter;
      var type = "GET";
      console.log("languages_users " + url);
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: null,
      });
      console.log(
        "mapStateToProps == languages_users " + JSON.stringify(header)
      );
      const responseJson = await response.json();
      console.log(
        "mapStateToProps == languages_users " +
          JSON.stringify(responseJson.data)
      );
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}
//get user insurances
export function getUserInsurances(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;
      //check get or post based on payload param
      var url =
        siteURL +
        AppConfig.endpoints.insurance_companies_users +
        "?filter=" +
        payload.filter;
      var type = "GET";
      console.log("insurance_companies_users " + url);
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: null,
      });
      console.log(
        "mapStateToProps == insurance_companies_users " + JSON.stringify(header)
      );
      const responseJson = await response.json();
      console.log(
        "mapStateToProps == insurance_companies_users " +
          JSON.stringify(responseJson.data)
      );
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}

//get medicine type
export function getmedicine_type(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;
      //check get or post based on payload param
      var url = siteURL + AppConfig.endpoints.medicine_types;
      if (payload && payload.filter)
        url =
          siteURL +
          AppConfig.endpoints.medicine_types +
          "?filter=" +
          payload.filter;
      var type = "GET";
      console.log("UserActions_medicine_type _url=====> " + url);
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: null,
      });
      console.log(
        "UserActions_medicine_type _header=====> " + JSON.stringify(header)
      );
      const responseJson = await response.json();
      console.log(
        "UserActions_medicine_type _resp=====> " +
          JSON.stringify(responseJson.data)
      );
      return responseJson;
    } catch (error) {
      console.log("UserActions_medicine_type _error=====>" + error);
    }
  };
}

//get medicine categories
export function getmedicine_categories(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;
      //check get or post based on payload param
      var url =
        siteURL +
        AppConfig.endpoints.medicine_categories +
        "?filter=" +
        encodeURI(payload.filter);
      var type = "GET";
      console.log("UserActions_medicine_categories_url=====> " + url);
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: null,
      });
      console.log(
        "UserActions_medicine_categories_header=====> " + JSON.stringify(header)
      );
      const responseJson = await response.json();
      console.log(
        "UserActions_medicine_categories_resp=====> " +
          JSON.stringify(responseJson.data)
      );
      return responseJson;
    } catch (error) {
      console.log("UserActions_medicine_categories_error=====>" + error);
    }
  };
}

//get medicine categories
export function getmedicine_manufacturer(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;
      //check get or post based on payload param
      var url =
        siteURL +
        AppConfig.endpoints.medicine_manufacturer +
        "?filter=" +
        encodeURI(payload.filter);
      var type = "GET";
      console.log("UserActions_medicine_manufacturer_url=====> " + url);
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: null,
      });
      console.log(
        "UserActions_medicine_manufacturer_header=====> " +
          JSON.stringify(header)
      );
      const responseJson = await response.json();
      console.log(
        "UserActions_medicine_manufacturer_resp=====> " +
          JSON.stringify(responseJson.data)
      );
      return responseJson;
    } catch (error) {
      console.log("UserActions_medicine_manufacturer_error=====>" + error);
    }
  };
}

//get medicine unit
export function getmedicine_unit(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;
      //check get or post based on payload param
      var url =
        siteURL +
        AppConfig.endpoints.medicine_units +
        "?filter=" +
        encodeURI(payload.filter);
      var type = "GET";
      console.log("UserActions_getmedicine_unit_url=====> " + url);
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: null,
      });
      console.log(
        "UserActions_getmedicine_unit_header=====> " + JSON.stringify(header)
      );
      const responseJson = await response.json();
      console.log(
        "UserActions_getmedicine_unit_resp=====> " +
          JSON.stringify(responseJson.data)
      );
      return responseJson;
    } catch (error) {
      console.log("UserActions_getmedicine_unit_error=====>" + error);
    }
  };
}

//branches
export function branches(payload) {
  return async (dispatch) => {
    try {
      var header = AppConfig.header;
      const siteURL = await getSiteURL();
      //check get or post based on payload param
      console.log("branches ===== " + JSON.stringify(payload));
      var url =
        siteURL +
        AppConfig.endpoints.branches +
        "?filter=" +
        encodeURI(payload.filter);
      if (payload.branch_id)
        url =
          siteURL +
          AppConfig.endpoints.branches +
          "/" +
          payload.branch_id +
          "?filter=" +
          encodeURI(payload.filter);
      if (payload.timeslot) {
        url =
          siteURL +
          AppConfig.endpoints.branches +
          "/" +
          payload.branch_id +
          "/timeslot?filter=" +
          encodeURI(payload.filter);
        console.log("branches ===== ");
      }
      if (payload.is_slot_need)
        url = url + "&is_slot_need=" + payload.is_slot_need;
      if (payload.view_slot_week)
        url = url + "&view_slot_week=" + payload.view_slot_week;

      var type = "GET";
      var bdy_cnt = null;
      if (payload.filter.post_type == "DELETE") {
        url = siteURL + AppConfig.endpoints.branches + "/" + payload.filter.id;
        type = "DELETE";
      } else if (payload.filter.post_type == "POST") {
        url = siteURL + AppConfig.endpoints.branches;
        type = "POST";
        var bdy = payload.filter;
        delete bdy["post_type"];
        bdy_cnt = JSON.stringify(bdy);
      } else if (payload.filter.post_type == "PUT") {
        url = siteURL + AppConfig.endpoints.branches + "/" + payload.filter.id;
        type = "PUT";
        var bdy = payload.filter;
        delete bdy["post_type"];
        bdy_cnt = JSON.stringify(bdy);
      }
      console.log("branches reviews " + url);
      console.log("branches reviews " + JSON.stringify(header));
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: bdy_cnt,
      });
      const responseJson = await response.json();
      console.log("branches reviews " + JSON.stringify(responseJson));
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}
//diagnostic center tests
export function diagnostic_center_tests(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      console.log("fffff == " + JSON.stringify(credsFromStorage));
      var header = AppConfig.header;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;
      //check get or post based on payload param
      var url =
        siteURL +
        AppConfig.endpoints.diagnostic_center_tests +
        "?filter=" +
        encodeURI(payload.filter);
      if (payload.branch_id)
        url =
          siteURL +
          AppConfig.endpoints.diagnostic_center_tests +
          "/" +
          payload.branch_id +
          "?filter=" +
          encodeURI(payload.filter);
      var type = "GET";
      var bdy_cnt = null;
      if (payload.filter.post_type == "DELETE") {
        url =
          siteURL +
          AppConfig.endpoints.diagnostic_center_tests +
          "/" +
          payload.filter.id;
        type = "DELETE";
      } else if (payload.filter.post_type == "POST") {
        url = siteURL + AppConfig.endpoints.diagnostic_center_tests;
        type = "POST";
        var bdy = payload.filter;
        delete bdy["post_type"];
        bdy_cnt = JSON.stringify(bdy);
      } else if (payload.filter.post_type == "PUT") {
        url =
          siteURL +
          AppConfig.endpoints.diagnostic_center_tests +
          "/" +
          payload.filter.id;
        type = "PUT";
        var bdy = payload.filter;
        delete bdy["post_type"];
        bdy_cnt = JSON.stringify(bdy);
      }
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: bdy_cnt,
      });
      console.log("diagnostic_center_tests reviews " + url);
      console.log("diagnostic_center_tests reviews " + JSON.stringify(header));
      console.log("diagnostic_center_tests reviews dd " + bdy_cnt);
      const responseJson = await response.json();
      console.log(
        "diagnostic_center_tests reviews " + JSON.stringify(responseJson)
      );
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}
//lab tests
export function lab_tests(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.header;
      if (credsFromStorage)
        header["Authorization"] = "Bearer " + credsFromStorage;
      //check get or post based on payload param
      var url =
        siteURL +
        AppConfig.endpoints.lab_tests +
        "?filter=" +
        encodeURI(payload.filter);
      if (payload.branch_id)
        url =
          siteURL +
          AppConfig.endpoints.lab_tests +
          "/" +
          payload.branch_id +
          "?filter=" +
          encodeURI(payload.filter);
      var type = "GET";
      var bdy_cnt = null;
      if (payload.filter.post_type == "DELETE") {
        url = siteURL + AppConfig.endpoints.lab_tests + "/" + payload.filter.id;
        type = "DELETE";
      } else if (payload.filter.post_type == "POST") {
        url = siteURL + AppConfig.endpoints.lab_tests;
        type = "POST";
        var bdy = payload.filter;
        delete bdy["post_type"];
        bdy_cnt = JSON.stringify(bdy);
      } else if (payload.filter.post_type == "PUT") {
        url = siteURL + AppConfig.endpoints.lab_tests + "/" + payload.filter.id;
        type = "PUT";
        var bdy = payload.filter;
        delete bdy["post_type"];
        bdy_cnt = JSON.stringify(bdy);
      }
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: bdy_cnt,
      });
      console.log("lab_tests reviews yy" + url);
      console.log("lab_tests reviews rr" + JSON.stringify(header));
      console.log("lab_tests reviews dd " + bdy_cnt);
      const responseJson = await response.json();
      console.log("lab_tests reviews ff" + JSON.stringify(responseJson));
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}
//patient diagnostic tests
export function patient_diagnostic_tests(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage)
        header["Authorization"] = "Bearer " + credsFromStorage;

      //check get or post based on payload param
      var url =
        siteURL +
        AppConfig.endpoints.patient_diagnostic_tests +
        "?filter=" +
        encodeURI(payload);
      var mtype = "GET";
      var mbody = null;
      if (payload.filter) {
        if (payload.id)
          url =
            siteURL +
            AppConfig.endpoints.patient_diagnostic_tests +
            "/" +
            payload.id +
            "?filter=" +
            encodeURI(payload.filter);
        else
          url =
            siteURL +
            AppConfig.endpoints.patient_diagnostic_tests +
            "?filter=" +
            encodeURI(payload.filter);
      }
      if (payload.post_type && payload.post_type == "POST") {
        url = siteURL + AppConfig.endpoints.patient_diagnostic_tests;
        mtype = "POST";
        mbody = payload.filter;
      }
      const response = await fetch(url, {
        method: mtype,
        headers: header,
        body: mbody,
      });
      console.log("patient_diagnostic_tests reviews " + url);
      console.log("patient_diagnostic_tests reviews " + JSON.stringify(header));
      const responseJson = await response.json();
      console.log(
        "patient_diagnostic_tests reviews " + JSON.stringify(responseJson)
      );
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}
//Diagnostics upload report
export function diagnostic_center_tests_patient_diagnostic_tests(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage)
        header["Authorization"] = "Bearer " + credsFromStorage;

      //check get or post based on payload param
      var url =
        siteURL +
        AppConfig.endpoints.diagnostic_center_tests_patient_diagnostic_tests +
        "?filter=" +
        encodeURI(payload.filter) +
        "&type=" +
        payload.type;
      var type = "GET";
      var bdy_cnt = null;
      if (payload.post_type == "PUT") {
        url =
          siteURL +
          AppConfig.endpoints.diagnostic_center_tests_patient_diagnostic_tests +
          "/" +
          payload.filter.id;
        type = "PUT";
        var bdy = payload.filter;
        bdy_cnt = JSON.stringify(bdy);
      }
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: bdy_cnt,
      });
      console.log("patient_diagnostic_tests reviews " + url);
      console.log("patient_diagnostic_tests reviews " + JSON.stringify(header));
      console.log("patient_diagnostic_tests reviews " + bdy_cnt);
      const responseJson = await response.json();
      console.log(
        "patient_diagnostic_tests reviews " + JSON.stringify(responseJson)
      );
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}

// payment_gateways
export function payment_gateways(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage)
        header["Authorization"] = "Bearer " + credsFromStorage;

      //check get or post based on payload param
      var url = siteURL + AppConfig.endpoints.payment_gateways;
      var type = "GET";
      var bdy_cnt = null;

      const response = await fetch(url, {
        method: type,
        headers: header,
        body: bdy_cnt,
      });
      const responseJson = await response.json();
      console.log("dddd 222  " + JSON.stringify(responseJson));
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}

// subscriptions
export function subscriptions(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage)
        header["Authorization"] = "Bearer " + credsFromStorage;

      //check get or post based on payload param
      var url = siteURL + AppConfig.endpoints.subscriptions;
      var type = "GET";
      var bdy_cnt = null;

      const response = await fetch(url, {
        method: type,
        headers: header,
        body: bdy_cnt,
      });
      const responseJson = await response.json();
      console.log("dddd 222  " + JSON.stringify(responseJson));
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}

// user_subscriptions
export function user_subscriptions(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage)
        header["Authorization"] = "Bearer " + credsFromStorage;

      //check get or post based on payload param
      var url = "";
      var type = "GET";
      var bdy_cnt = null;
      if (payload.post_type && payload.post_type === "POST") {
        type = "POST";
        bdy_cnt = JSON.stringify({
          subscription_id: payload.subscription_id,
          subscription_status_id: payload.subscription_status_id,
        });
        url = siteURL + AppConfig.endpoints.user_subscriptions;
      } else if (payload.post_type && payload.post_type === "PUT") {
        type = "PUT";
        bdy_cnt = JSON.stringify({
          id: payload.id,
          subscription_status_id: payload.subscription_status_id,
        });
        url =
          siteURL +
          AppConfig.endpoints.user_subscriptions +
          "/" +
          payload.id +
          "/update_status";
      } else {
        url =
          siteURL +
          AppConfig.endpoints.me +
          "/user_subscriptions?filter=" +
          payload.filter;
      }

      const response = await fetch(url, {
        method: type,
        headers: header,
        body: bdy_cnt,
      });
      const responseJson = await response.json();
      return responseJson;
    } catch (error) {
      console.log("error  " + JSON.stringify(error));
    }
  };
}

//medical_history
export function medical_history(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage)
        header["Authorization"] = "Bearer " + credsFromStorage;

      //check get or post based on payload param
      var url = "";
      var type = "GET";
      var bdy_cnt = null;
      if (payload.post_type == "DELETE") {
        var type = "DELETE";
        url = siteURL + AppConfig.endpoints.medical_history + "/" + payload.id;
      } else if (payload.post_type == "POST") {
        var type = "POST";
        url = siteURL + AppConfig.endpoints.medical_history;
        bdy_cnt = JSON.stringify({
          description: payload.description,
          years: payload.years,
          medical_history_image: payload.medical_history_image,
        });
      } else {
        url =
          siteURL +
          AppConfig.endpoints.medical_history +
          "?filter=" +
          payload.filter;
      }
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: bdy_cnt,
      });
      const responseJson = await response.json();
      console.log("dddd 111  " + JSON.stringify(url));
      console.log("dddd 111  " + JSON.stringify(type));
      console.log("dddd 111  " + JSON.stringify(header));
      console.log("dddd 111  " + bdy_cnt);
      console.log("dddd 111  " + JSON.stringify(responseJson));
      return responseJson;
    } catch (error) {
      console.log("error  " + JSON.stringify(error));
    }
  };
}

//questions
export function questions(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      console.log(JSON.stringify(credsFromStorage));
      if (credsFromStorage)
        header["Authorization"] = "Bearer " + credsFromStorage;

      //check get or post based on payload param
      var url =
        siteURL +
        AppConfig.endpoints.questions +
        "?filter=" +
        encodeURI(payload.filter);
      var type = "GET";
      var bdy_cnt = null;
      if (payload.post_type == "PUT") {
        url = siteURL + AppConfig.endpoints.questions + "/" + payload.filter.id;
        type = "PUT";
        var bdy = payload.filter;
        bdy_cnt = JSON.stringify(bdy);
      }
      if (payload.post_type == "POST") {
        url = siteURL + AppConfig.endpoints.questions;
        type = "POST";
        var bdy = payload.filter;
        bdy_cnt = JSON.stringify(bdy);
      }
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: bdy_cnt,
      });
      console.log("questions reviews " + url);
      console.log("questions reviews " + JSON.stringify(header));
      console.log("questions reviews " + bdy_cnt);
      const responseJson = await response.json();
      console.log("questions reviews " + JSON.stringify(responseJson));
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}

//money transfer accounts
export function money_transfer_accounts(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage)
        header["Authorization"] = "Bearer " + credsFromStorage;

      //check get or post based on payload param
      var url = "";
      var type = "GET";
      var body_data = null;

      if (payload.delete == 1) {
        url =
          siteURL +
          AppConfig.endpoints.users +
          "/" +
          payload.user_id +
          "/money_transfer_accounts" +
          "/" +
          payload.money_transfer_id;
        type = "Delete";
      } else if (payload.add == 1) {
        url =
          siteURL +
          AppConfig.endpoints.users +
          "/" +
          payload.user_id +
          "/money_transfer_accounts";
        type = "POST";
        body_data = JSON.stringify({ account: payload.account });
      } else
        url =
          siteURL +
          AppConfig.endpoints.users +
          "/" +
          payload.user_id +
          "/money_transfer_accounts";

      console.log(
        "respppp url" + JSON.stringify(url) + JSON.stringify(body_data)
      );
      console.log("respppp url" + JSON.stringify(header));
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: body_data,
      });
      const responseJson = await response.json();
      console.log("respppp responseJson" + JSON.stringify(responseJson));
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}

//answers
export function answers(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;
      if (credsFromStorage)
        header["Authorization"] = "Bearer " + credsFromStorage;

      //check get or post based on payload param
      var url =
        siteURL +
        AppConfig.endpoints.answers +
        "?filter=" +
        encodeURI(payload.filter);
      var type = "GET";
      var bdy_cnt = null;
      if (payload.post_type == "PUT") {
        url = siteURL + AppConfig.endpoints.answers + "/" + payload.filter.id;
        type = "PUT";
        var bdy = payload.filter;
        bdy_cnt = JSON.stringify(bdy);
      }
      if (payload.post_type == "POST") {
        url = siteURL + AppConfig.endpoints.answers;
        type = "POST";
        var bdy = payload.filter;
        bdy_cnt = JSON.stringify(bdy);
      }
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: bdy_cnt,
      });
      console.log("answers reviews " + url);
      console.log("answers reviews " + JSON.stringify(header));
      console.log("answers reviews " + bdy_cnt);
      const responseJson = await response.json();
      console.log("answers reviews " + JSON.stringify(responseJson));
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}

//get localet from site
export function localeSettings(lang) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;

      //check get or post based on payload param
      var url = siteURL + "/scripts/l10n/en.json";
      if (lang == "fr") url = siteURL + "/scripts/l10n/fr.json";
      var type = "GET";
      var bdy_cnt = null;

      const response = await fetch(url, {
        method: type,
        headers: header,
        body: bdy_cnt,
      });
      console.log("getlocale reviews " + url);
      console.log("getlocale reviews " + JSON.stringify(header));
      console.log("getlocale reviews " + bdy_cnt);
      const responseJson = await response.json();
      console.log("getlocale reviews " + JSON.stringify(responseJson));
      if (lang == "fr") {
        return dispatch({
          type: "LOCALE_FR",
          data: responseJson,
        });
      } else {
        return dispatch({
          type: "LOCALE_EN",
          data: responseJson,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
}

export function country_urls(payload) {
  return async (dispatch) => {
    try {
      const credsFromStorage = await getTokenFromStorage();
      const siteURL = await getSiteURL();
      var header = AppConfig.headers;

      //check get or post based on payload param
      var url =
        AppConfig.urls.site +
        AppConfig.endpoints.country_urls +
        "?filter=" +
        encodeURI(JSON.stringify(payload.filter));
      var type = "GET";
      var bdy_cnt = null;
      console.log("answers reviews " + url);
      console.log("answers reviews " + JSON.stringify(header));
      console.log("answers reviews " + bdy_cnt);

      const response = await fetch(url, {
        method: type,
        headers: header,
        body: bdy_cnt,
      });
      const responseJson = await response.json();
      console.log("answers reviews " + JSON.stringify(responseJson));
      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}

//Delete Account
// export function delete_account(payload) {
//   return async (dispatch) => {
//     try {
//       var header = AppConfig.headers;

//       //check get or post based on payload param
//       var url =
//         AppConfig.urls.site + AppConfig.endpoints.deleteaccount + payload?.id;
//       var type = "DELETE";

//       const response = await fetch(url, {
//         method: type,
//         headers: header,
//       });
//       const responseJson = await response.json();

//       return responseJson;
//     } catch (error) {
//       console.log(error);
//     }
//   };
// }

export function delete_account(payload) {
  return async (dispatch) => {
    try {
      const siteURL = await getSiteURL();
      const credsFromStorage = await getTokenFromStorage();

      var header = AppConfig.headers;
      if (credsFromStorage && typeof credsFromStorage !== "object")
        header["Authorization"] = "Bearer " + credsFromStorage;

      console.log(credsFromStorage, siteURL);
      //check get or post based on payload param
      var url = siteURL + AppConfig.endpoints.deleteaccount;
      var type = "PUT";
      const response = await fetch(url, {
        method: type,
        headers: header,
        body: JSON.stringify(payload),
      });
      const responseJson = await response.json();

      console.log(responseJson);

      return responseJson;
    } catch (error) {
      console.log(error);
    }
  };
}
