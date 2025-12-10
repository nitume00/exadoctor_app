/**
 * Whole App Container
 *
 * React Native Starter App
 * https://github.com/mcnamee/react-native-starter-app
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {connect} from 'react-redux';
import SideMenu from 'react-native-side-menu-updated';
import {DefaultRenderer} from 'react-native-router-flux';

// Consts and Libs
import {AppSizes} from '@theme/';

// Containers
import Menu from '@containers/ui/Menu/MenuContainer';

/* Redux ==================================================================== */
// Actions
import * as SideMenuActions from '@reduxx/sidemenu/actions';

// What data from the store shall we send to the component?
const mapStateToProps = state => ({
  sideMenuIsOpen: state.sideMenu.isOpen,
  user: state.user.user_data,
});

// Any actions to map to the component?
const mapDispatchToProps = {
  toggleSideMenu: SideMenuActions.toggle,
  closeSideMenu: SideMenuActions.close,
};

/* Component ==================================================================== */
class Drawer extends Component {
  static componentName = 'Drawer';
  constructor(props) {
    super(props);
    this.state = {
      user: props.user ? props.user : '',
    };
  }
  static propTypes = {
    navigationState: PropTypes.shape({}),
    onNavigate: PropTypes.func,
    sideMenuIsOpen: PropTypes.bool,
    closeSideMenu: PropTypes.func.isRequired,
    toggleSideMenu: PropTypes.func.isRequired,
  };

  static defaultProps = {
    navigationState: null,
    onNavigate: null,
    sideMenuIsOpen: null,
  };

  componentWillReceiveProps(props) {
    console.log('cmpreceiveprops == 11 = ');
    console.log('cmpreceiveprops == 11 = d ' + JSON.stringify(props));
    if (props && props.user) {
      console.log('cmpreceiveprops == 11 = b ' + JSON.stringify(props.user));
      this.setState({user: props.user});
    }
  }
  /**
   * Toggle Side Menu
   */
  onSideMenuChange = isOpen => {
    if (isOpen !== this.props.sideMenuIsOpen) {
      this.props.toggleSideMenu();
    }
  };

  render() {
    const state = this.props.navigationState;
    const children = state.children;

    return (
      <SideMenu
        ref={a => {
          this.rootSidebarMenu = a;
        }}
        openMenuOffset={AppSizes.screen.width * 0.75}
        menu={
          <Menu
            user={this.state.user}
            closeSideMenu={this.props.closeSideMenu}
            ref={b => {
              this.rootSidebarMenuMenu = b;
            }}
          />
        }
        isOpen={this.props.sideMenuIsOpen}
        onChange={this.onSideMenuChange}
        disableGestures>
        <View style={{backgroundColor: '#000', flex: 1}}>
          <DefaultRenderer
            navigationState={children[0]}
            onNavigate={this.props.onNavigate}
          />
        </View>
      </SideMenu>
    );
  }
}

/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps)(Drawer);
