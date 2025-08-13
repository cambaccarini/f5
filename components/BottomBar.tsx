import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';

const BottomBar = () => (
  <View style={styles.bar}>
    <TouchableOpacity>
      <Image source={require('../assets/football.png')} style={styles.ball} />
    </TouchableOpacity>
    <TouchableOpacity>
      <Image source={require('../assets/plus.png')} style={styles.plus} />
    </TouchableOpacity>
    <TouchableOpacity>
      <Image source={require('../assets/bell.png')} style={styles.bell} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  bar: {
    height: 100,
    backgroundColor: '#C7CD7A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  ball: {
    width: 32,
    height: 32,
  },
  bell: {
    width: 40,
    height: 40,
  },
  plus: {
    width: 40,
    height: 40,
  },
});

export default BottomBar;