import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Layout from '../components/Layout';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Match {
  id: string;
  title: string;
  date?: string;
  time?: string;
  location?: string;
  requiredPlayers: number;
  players: string[];
  organizerId?: string;
}

const formatDateToDDMMYYYY = (value?: string) => {
  if (!value) {
    return '';
  }

  const ddmmyyyy = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  if (ddmmyyyy.test(value)) {
    return value;
  }

  const yyyymmdd = /^(\d{4})-(\d{2})-(\d{2})$/;
  const parsed = value.match(yyyymmdd);
  if (parsed) {
    return `${parsed[3]}/${parsed[2]}/${parsed[1]}`;
  }

  return value;
};

const MyMatchesScreen = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchData = async () => {
      const userId = await AsyncStorage.getItem('userId');
      setCurrentUserId(userId);

      const querySnapshot = await getDocs(collection(db, 'matches'));
      const allMatches: Match[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Match[];

      const myMatches = allMatches.filter(match => {
        if (!userId) {
          return false;
        }

        const isOwnMatch = match.organizerId === userId;
        const isJoinedMatch = (match.players || []).includes(userId);
        return isOwnMatch || isJoinedMatch;
      });

      setMatches(myMatches);
    };

    fetchData();
  }, []);

  const renderMatch = ({ item }: { item: Match }) => {
    const formattedDate = formatDateToDDMMYYYY(item.date);
    const dateLabel = formattedDate && item.time
      ? `${formattedDate} ${item.time}`
      : formattedDate || item.time || 'Sin fecha';

    const remainingPlayers = Math.max(item.requiredPlayers - (item.players?.length || 0), 0);
    const isFull = remainingPlayers === 0;
    const isOwnMatch = !!currentUserId && item.organizerId === currentUserId;

    return (
      <TouchableOpacity
        style={[styles.matchBar, isOwnMatch && styles.ownMatchBar]}
        onPress={() => navigation.navigate('MatchDetail', { matchId: item.id })}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={styles.matchTitle}>{item.title}</Text>
            <Text style={styles.matchSub}>{dateLabel}</Text>
            <Text style={styles.matchSub}>{item.location}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            {isFull ? (
              <Text style={[styles.matchBig, { fontSize: 16 }]}>Partido completo</Text>
            ) : (
              <>
                <Text style={styles.matchSmall}>{remainingPlayers === 1 ? 'Falta' : 'Faltan'}</Text>
                <Text style={styles.matchBig}>{remainingPlayers}</Text>
                <Text style={[styles.matchSmall, { color: '#082512', fontWeight: 'bold' }]}></Text>
              </>
                  //aca puedo poner tu partido o algo asi
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Layout>
      <View style={styles.container}>
        <Text style={styles.title}>Mis partidos</Text>
        {currentUserId && matches.length === 0 ? (
          <Text style={styles.emptyText}>Aun no tenes partidos.</Text>
        ) : (
          <FlatList
            data={matches}
            keyExtractor={item => item.id}
            renderItem={renderMatch}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#082512',
  },
  listContent: {
    paddingBottom: 120,
  },
  matchBar: {
    backgroundColor: '#e9eac7',
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
    minHeight: 70,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ownMatchBar: {
    backgroundColor: '#c9f37a',
    borderWidth: 1,
    borderColor: '#82a04d',
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
  emptyText: {
    marginTop: 20,
    fontSize: 16,
    color: '#082512',
  },
});

export default MyMatchesScreen;
