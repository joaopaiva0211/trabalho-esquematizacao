import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getSingleUser, getWeeklySummary } from '@/lib/db';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const [userName, setUserName] = useState<string | null>(null);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [daysCount, setDaysCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const user = getSingleUser();
      setUserName(user?.name ?? null);

      const todayISO = new Date().toISOString().slice(0, 10);
      const summary = getWeeklySummary(todayISO);
      setTotalMinutes(summary.totalMinutes);
      setDaysCount(summary.daysCount);
    }, []),
  );

  const motivationalMessage = getMotivationalMessage(totalMinutes, daysCount);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>
          {userName ? `Olá, ${userName}!` : 'Bem-vindo ao Bem Viver'}
        </ThemedText>

        <View style={styles.card}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Resumo da semana
          </ThemedText>
          <ThemedText style={styles.metricText}>
            Minutos ativos: {totalMinutes} min
          </ThemedText>
          <ThemedText style={styles.metricText}>
            Dias com atividade: {daysCount} dia(s)
          </ThemedText>
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Mensagem de bem-estar
          </ThemedText>
          <ThemedText style={styles.motivation}>{motivationalMessage}</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function getMotivationalMessage(totalMinutes: number, daysCount: number) {
  if (totalMinutes === 0) {
    return 'Comece com passos leves. Uma pequena caminhada hoje já é um ótimo começo!';
  }
  if (totalMinutes < 60) {
    return 'Muito bem! Continue se movimentando alguns minutos por dia para cuidar da sua saúde.';
  }
  if (totalMinutes < 150) {
    return 'Ótimo trabalho! Você está se aproximando da meta semanal recomendada de atividade física.';
  }
  return 'Parabéns! Você alcançou uma excelente rotina de movimento. Continue assim com cuidado e equilíbrio.';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 32,
    flexGrow: 1,
    backgroundColor: '#F5FAFF',
  },
  title: {
    fontSize: 26,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0F2F1',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 22,
    marginBottom: 12,
  },
  metricText: {
    fontSize: 20,
    marginBottom: 4,
  },
  motivation: {
    fontSize: 18,
    lineHeight: 24,
  },
});

