import React, { PureComponent } from 'react';
import { BackHandler, Animated, Easing } from 'react-native';
import {
  StackNavigator,
  TabNavigator,
  TabBarBottom,
  addNavigationHelpers,
  NavigationActions,
  NavigationState,
} from 'react-navigation';
import {
  initializeListeners,
  createReduxBoundAddListener,
  createReactNavigationReduxMiddleware,
} from 'react-navigation-redux-helpers';
import { connect } from 'react-redux';
import * as RouterName from './types/const/router';

import * as ModelsStates from './models/states';

import Login from './containers/Login';
import Home from './containers/Home';
import Home1 from './containers/Home';
import Account from './containers/Account';
import Detail from './containers/Detail';
import Loading from './containers/Loading';

const HomeNavigator = TabNavigator(
  {
    [RouterName.Home]: { screen: Home },
    [RouterName.Home1]: { screen: Home1 },
    [RouterName.Account]: { screen: Account }
  },
  {
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom',
    swipeEnabled: false,
    animationEnabled: false,
    // lazyLoad: false,
  }
);


const AppNavigator = StackNavigator(
  {
    [RouterName.Login]: { screen: Login },
    [RouterName.Main]: { screen: HomeNavigator },
    [RouterName.Detail]: { screen: Detail },
  },
  {
    // headerMode: 'none',
    headerMode: 'float',
    mode: 'modal',
    navigationOptions: {
      gesturesEnabled: false,
    },
    transitionConfig: () => ({
      transitionSpec: {
        duration: 300,
        easing: Easing.out(Easing.poly(4)),
        timing: Animated.timing,
      },
      screenInterpolator: sceneProps => {
        const { layout, position, scene } = sceneProps;
        const { index } = scene;

        const height = layout.initHeight;
        const translateY = position.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [height, 0, 0],
        });

        const opacity = position.interpolate({
          inputRange: [index - 1, index - 0.99, index],
          outputRange: [0, 1, 1],
        });

        return { opacity, transform: [{ translateY }] };
      },
    }),
  }
);

function getCurrentScreen(navigationState: NavigationState): any {
  if (!navigationState) {
    return null;
  }
  const route = navigationState.routes[navigationState.index];
  if (route.routes) {
    return getCurrentScreen(route);
  }
  return route.routeName;
}

export const routerMiddleware = createReactNavigationReduxMiddleware(
  'root',
  (state: any) => state.router
);
const addListener = createReduxBoundAddListener('root');
interface IProps {
  count: ModelsStates.countState;
  app: ModelsStates.AppState;
  router: any;
  dispatch: any;
}

class Router extends PureComponent<IProps> {
  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.backHandle);
  }

  componentDidMount() {
    initializeListeners('root', this.props.router);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backHandle);
  }

  backHandle = () => {
    const currentScreen = getCurrentScreen(this.props.router);
    if (currentScreen === 'Login') {
      return true;
    }
    if (currentScreen !== 'Home') {
      this.props.dispatch(NavigationActions.back());
      return true;
    }
    return false;
  }

  render() {
    const { dispatch, router, app } = this.props;
    if (app.loading) return <Loading />;

    const navigation = addNavigationHelpers({
      dispatch,
      state: router,
      addListener,
    });
    return <AppNavigator navigation={navigation} />;
  }
}

export function routerReducer(state?: any, action: any = {}) {
  return AppNavigator.router.getStateForAction(action, state);
}

// @connect(({ app, router }) => ({ app, router }))
function mapStateToProps(state: any) {
  return {
    count: state.count,
    router: state.router,
    app: state.app
  };
}
export default connect(mapStateToProps)(Router);
// export default Router
