import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Header = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userId');
    setShowLogout(false);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Image source={require('../assets/menu.png')} style={styles.menu} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
        </TouchableOpacity>
        <View style={styles.userWrapper}>
          <TouchableOpacity onPress={() => setShowLogout((prev) => !prev)}>
            <Image source={require('../assets/user.png')} style={styles.user} />
          </TouchableOpacity>
          {showLogout ? (
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    backgroundColor: '#082512',
  },
  header: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 30,
  },
  menu: {
    width: 50,
    height: 50,
  },
  user: {
    width: 40,
    height: 40,
  },
  userWrapper: {
    position: 'relative',
    alignItems: 'flex-end',
  },
  logoutButton: {
    position: 'absolute',
    top: 44,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#082512',
    minWidth: 110,
    zIndex: 20,
  },
  logoutText: {
    color: '#082512',
    fontWeight: '600',
    textAlign: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
});

export default Header;