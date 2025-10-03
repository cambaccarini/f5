import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Layout from '../components/Layout';

const HomeScreen = () => (
  <Layout>
    <View style={styles.container}>
      <Text style={styles.title}>¡Bienvenido al Home!</Text>
      <Text style={styles.title}>¿Listo para jugar?</Text>
      {/* Aquí puedes agregar más contenido */}
    </View>
  </Layout>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C7CD7A',
    width: '100%',
  },
  title: {
    fontSize: 24,
    color: '#082512',
    fontWeight: 'bold',
  },
});

export default HomeScreen;