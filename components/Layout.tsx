import React, { PropsWithChildren } from 'react';
import { View, StyleSheet } from 'react-native';
import Header from './Header';
import BottomBar from './BottomBar';

const Layout: React.FC<PropsWithChildren<{}>> = ({ children }) => (
  <View style={styles.container}>
    <Header />
    <View style={styles.content}>{children}</View>
    <BottomBar />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C7CD7A',
  },
  content: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 60, 
  },
});

export default Layout;