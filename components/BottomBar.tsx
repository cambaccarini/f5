import React, { useCallback, useState } from 'react';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { View, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Match {
  id: string;
  requiredPlayers: number;
  players: string[];
  organizerId?: string;
}

const buildNotificationIds = (matches: Match[], userId: string) => {
  const ids: string[] = [];

  for (const match of matches) {
    const playersJoined = (match.players || []).filter(playerId => playerId !== userId);
    const remainingPlayers = Math.max(match.requiredPlayers || 0, 0);

    for (const playerId of playersJoined) {
      ids.push(`${match.id}-${playerId}`);
    }

    if (remainingPlayers === 0 && playersJoined.length > 0) {
      ids.push(`${match.id}-completed`);
    }
  }

  return ids;
};

const BottomBar = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
    const isNotificationsScreen = route.name === 'Notifications';

    const refreshUnreadState = useCallback(async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          setHasUnreadNotifications(false);
          return;
        }

        const querySnapshot = await getDocs(collection(db, 'matches'));
        const allMatches: Match[] = querySnapshot.docs.map(matchDoc => ({
          id: matchDoc.id,
          ...matchDoc.data(),
        })) as Match[];

        const ownMatches = allMatches.filter(match => match.organizerId === userId);
        const currentNotificationIds = buildNotificationIds(ownMatches, userId);

        const readNotificationsKey = `readNotificationIds:${userId}`;
        const readNotificationsRaw = await AsyncStorage.getItem(readNotificationsKey);
        const readNotificationIds: string[] = readNotificationsRaw ? JSON.parse(readNotificationsRaw) : [];

        const hasUnread = currentNotificationIds.some(id => !readNotificationIds.includes(id));
        setHasUnreadNotifications(hasUnread);
      } catch (error) {
        console.error('Error al cargar estado de notificaciones:', error);
        setHasUnreadNotifications(false);
      }
    }, []);

    useFocusEffect(
      useCallback(() => {
        refreshUnreadState();
      }, [refreshUnreadState])
    );

    return(
  <View style={styles.bar}>
    <View style={styles.iconContainer}>
      <TouchableOpacity onPress={() => navigation.navigate('MyMatches')}>
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
      <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
        <View style={styles.bellWrapper}>
          <Image source={require('../assets/bell.png')} style={styles.bell} />
          {hasUnreadNotifications && !isNotificationsScreen ? <View style={styles.unreadDot} /> : null}
        </View>
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
  bellWrapper: {
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#d62828',
    borderWidth: 1,
    borderColor: '#fff',
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