import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthLoadingScreen from './screens/AuthLoadingScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterUser from './screens/RegisterUser';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen'; 
import CreateMatchScreen from './screens/CreateMatchScreen';
import MatchDetailScreen from './screens/MatchDetailScreen';

export type RootStackParamList = {
  AuthLoading: undefined;
  Login: undefined;
  RegisterUser: undefined;
  Home: undefined;
  CreateMatch: undefined;
  MatchDetail: { matchId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const Navigation = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="AuthLoading">
      <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="RegisterUser" component={RegisterUser} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="CreateMatch" component={CreateMatchScreen} />
      <Stack.Screen name="MatchDetail" component={MatchDetailScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default Navigation;