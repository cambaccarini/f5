import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Layout from '../components/Layout';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation';


interface Match {
  id: string;
  title: string;
  dateTime?: string;
  location?: string;
  requiredPlayers: number;
  players: string[];
}

const HomeScreen = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  useEffect(() => {
    const fetchMatches = async () => {
      const querySnapshot = await getDocs(collection(db, 'matches'));
      const data: Match[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Match[];
      setMatches(data);
    };
    fetchMatches();
  }, []);
 const renderMatch = ({ item }: { item: Match }) => (
    <TouchableOpacity
      style={styles.matchBar}
      onPress={() => navigation.navigate('MatchDetail', { matchId: item.id })}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <Text style={styles.matchTitle}>{item.title}</Text>
          <Text style={styles.matchSub}>{item.dateTime}</Text>
          <Text style={styles.matchSub}>{item.location}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.matchSmall}>Faltan</Text>
          <Text style={styles.matchBig}>{item.requiredPlayers - (item.players?.length || 0)}</Text>
          <Text style={[styles.matchSmall, { color: '#082512', fontWeight: 'bold' }]}>Sumarse</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  return ( 
  <Layout>
      <FlatList
        data={matches}
        keyExtractor={item => item.id}
        renderItem={renderMatch}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
  </Layout>
);
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 120, // espacio para la bottom bar
  },
  matchBar: {
    backgroundColor: '#e9eac7',
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
    minHeight: 70,
    justifyContent: 'center',
    // Sombra opcional:
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  matchTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#082512',
  },
    matchSub: {
    fontSize: 13,
    color: '#333',
  },
  matchSmall: {
    fontSize: 13,
    color: '#666',
    textAlign: 'right',
  },
  matchBig: {
    fontSize: 20,
    color: '#082512',
    fontWeight: 'bold',
    textAlign: 'right',
  },
});

export default HomeScreen;