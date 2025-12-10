/**
 * User Reducer
 *
 * React Native Starter App
 * https://github.com/mcnamee/react-native-starter-app
 */

// Set initial state
const initialState = {};

export default function userReducer(state = initialState, action) {
  console.log("getcountries redux == " + JSON.stringify(action.type))
  switch (action.type) {
    case 'USER_LOGIN': {
      if (action.data) {
        const input = action.data;
        return {
          ...state,
          uid: input.uid,
          email: input.email,
          emailVerified: input.emailVerified,
        };
      }
      return {};
    }
    case 'USER_DETAILS_UPDATE': {
      console.log("sssgin == USER_DETAILS_UPDATE " + JSON.stringify(action.data));
      if (action.data) {
        const input = action.data;
        return {
          ...state,
          user_data:input,
        };
      }
      return {};
    }
    case 'SPECIALITIES': {
      var specialities = [];
      if (action.data) {
        console.log("mapStateToProps ==  getSpecialities redux " + JSON.stringify(action.data))
        specialities = action.data;
      }
      return {
          ...state,
          specialities: specialities,
        };
    }
    case 'LANGUAGES': {
      var languages = [];
      if (action.data) {
        console.log("getlanguages redux " + JSON.stringify(action.data))
        languages = action.data;
      }
      return {
          ...state,
          languages: languages,
        };
    }
    case 'LOCALE_EN': {
      var locale_en = [];
      if (action.data) {
        console.log("getlocale en " + JSON.stringify(action.data))
        locale_en = action.data;
      }
      return {
          ...state,
          locale_en: locale_en,
        };
    }
    case 'LOCALE_FR': {
      var locale_fr = [];
      if (action.data) {
        console.log("getlocale fr " + JSON.stringify(action.data))
        locale_fr = action.data;
      }
      return {
          ...state,
          locale_fr: locale_fr,
        };
    }
    case 'COUNTRIES': {
      var countries = [];
      if (action.data) {
        console.log("getlanguages redux " + JSON.stringify(action.data))
        countries = action.data;
      }
      return {
          ...state,
          countries: countries,
        };
    }
    case 'CITIES': {
      var cities = [];
      if (action.data) {
        console.log("getlanguages redux " + JSON.stringify(action.data))
        cities = action.data;
      }
      return {
          ...state,
          cities: cities,
        };
    }
    case 'STATES': {
      var states = [];
      if (action.data) {
        console.log("getlanguages redux " + JSON.stringify(action.data))
        states = action.data;
      }
      return {
          ...state,
          states: states,
        };
    }
    case 'INSURANCES': {
      var insurances = [];
      if (action.data) {
        console.log("getlanguages redux " + JSON.stringify(action.data))
        insurances = action.data;
      }
      return {
          ...state,
          insurances: insurances,
        };
    }
    case 'PAGES': {
      var pages = [];
      if (action.data) {
        console.log("getlanguages redux " + JSON.stringify(action.data))
        pages = action.data;
      }
      return {
          ...state,
          pages: pages,
        };
    }
    case 'SETTINGS': {
      var pages = [];
      if (action.data) {
        console.log("getsettings redux " + JSON.stringify(action.data.length))
        settings = action.data;
      }
      return {
          ...state,
          settings: settings,
        };
    }
    case 'USER_LOGOUT': {
      return {};
    }
    default:
      return state;
  }
}
