/**
 * Launch Screen Container
 *
 * React Native Starter App
 * https://github.com/mcnamee/react-native-starter-app
 */
import {connect} from 'react-redux';

// Actions
import UserActions from '@reduxx/index';

// The component we're mapping to
import AppLaunchRender from './LaunchView';

// What data from the store shall we send to the component?
const mapStateToProps = () => ({});

// Any actions to map to the component?
const mapDispatchToProps = {
  login: UserActions.login,
  getSpecialities: UserActions.getSpecialities,
  getLanguages: UserActions.getLanguages,
  getCountries: UserActions.getCountries,
  getCities: UserActions.getCities,
  getStates: UserActions.getStates,
  getInsurances: UserActions.getInsurances,
  settings: UserActions.settings,
  localeSettings: UserActions.localeSettings,
};

export default connect(mapStateToProps, mapDispatchToProps)(AppLaunchRender);
