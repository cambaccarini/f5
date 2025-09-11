import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import App from './App';
import RegisterUser from './screens/RegisterUser';

const Stack = createNativeStackNavigator();

const Navigation = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RegisterUser" component={RegisterUser} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default Navigation;