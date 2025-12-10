/**
 * App Theme - Colors
 *
 * React Native Starter App
 * https://github.com/mcnamee/react-native-starter-app
 */

const app = {
  background: '#EDEDED',
  cardBackground: '#EDEDED',
  listItemBackground: '#FFFFFF',
};

const brand = {
  brand: {
    primary: '#ffffff',
    secondary: '#CBCBCB',
    cardbg: '#EEE',
    backupnavbar:'#16c4ff',
    navbar: '#16c4ff',
    black: '#000',
    txtinputcolor: '#938d8d',
    txtplaceholder: '#938d8d',
    btnColor: '#364469',
    white: '#fff',
    red:'#db3232',
    grey: '#eee',
    darkblue:'#321C8B',
    success: '#3fd67b',
    warning:'#f0ad4e',
    green: '#b41aea',
    buttonclick: '#364469',
    alertbg:'#16c4ff',
    alertborder:'#16c4ff',
    alerttext:'#16c4ff',
    closed:'#aa7106',
    cancelled:'#d9534f',
    pendingapproval:'#f0ad4e',
  },
};
const social_login_bg = {
  social_login_bg: {
    google_login: '#DC503B',
    facebook_login: '#425796',
  },
};
const text = {
  textPrimary: '#222222',
  textSecondary: '#777777',
  headingPrimary: brand.brand.primary,
  headingSecondary: brand.brand.primary,
};

const borders = {
  border: '#D0D1D5',
};

const tabbar = {
  tabbar: {
    background: '#ffffff',
    iconDefault: '#ffffff',
    iconSelected: brand.brand.primary,
  },
};

export default {
  ...app,
  ...brand,
  ...text,
  ...borders,
  ...tabbar,
  ...social_login_bg,
};
