import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Header = () => (
  <SafeAreaView style={styles.safe}>
    <View style={styles.header}>
      <TouchableOpacity>
        <Image source={require('../assets/menu.png')} style={styles.menu} />
      </TouchableOpacity>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <TouchableOpacity>
        <Image source={require('../assets/user.png')} style={styles.user} />
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

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
  logo: {
    width: 120,
    height: 120,
  },
});

export default Header;