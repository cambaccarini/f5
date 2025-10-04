import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation';

const BottomBar = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    return(
  <View style={styles.bar}>
    <View style={styles.iconContainer}>
      <TouchableOpacity>
        <Image source={require('../assets/football.png')} style={styles.ball} />
      </TouchableOpacity>
      <Text style={styles.label}>Mis partidos</Text>
    </View>
    <View style={styles.iconContainer}>
      <TouchableOpacity onPress={() => navigation.navigate('CreateMatch')}>
        <Image source={require('../assets/plus.png')} style={styles.plus} />
      </TouchableOpacity>
      <Text style={styles.label}>Crear partido</Text>
    </View>
    <View style={styles.iconContainer}>
      <TouchableOpacity>
        <Image source={require('../assets/bell.png')} style={styles.bell} />
      </TouchableOpacity>
      <Text style={styles.label}>Notificaciones</Text>
    </View>
  </View>
);
};

const styles = StyleSheet.create({
  bar: {
    height: 100,
    backgroundColor: '#b3b86bff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ball: {
    width: 39,
    height: 39,
  },
  bell: {
    width: 40,
    height: 40,
  },
  plus: {
    width: 40,
    height: 40,
  },
  label: {
    fontSize: 12,
    color: '#082512',
    marginTop: 4,
  },
});

export default BottomBar;