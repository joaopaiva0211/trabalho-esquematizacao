import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  Activity,
  getSingleUser,
  listActivitiesBetween,
} from '@/lib/db';
import { exportActivitiesToExcel } from '@/lib/exportExcel';
import { exportActivitiesToPdf } from '@/lib/exportPdf';
import { useFocusEffect } from '@react-navigation/native';

export default function RelatoriosScreen() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showList, setShowList] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadActivities();
    }, [startDate, endDate]),
  );

  function handleChangeStart(_: any, selectedDate?: Date) {
    if (Platform.OS !== 'ios') setShowStartPicker(false);
    if (selectedDate) setStartDate(selectedDate);
  }

  function handleChangeEnd(_: any, selectedDate?: Date) {
    if (Platform.OS !== 'ios') setShowEndPicker(false);
    if (selectedDate) setEndDate(selectedDate);
  }

  function loadActivities() {
    const start = startDate.toISOString().slice(0, 10);
    const end = endDate.toISOString().slice(0, 10);
    const result = listActivitiesBetween(start, end);
    setActivities(result);
  }

  async function handleExportExcel() {
    try {
      if (!activities.length) {
        Alert.alert('Sem dados', 'Não há atividades no período selecionado.');
        return;
      }
      await exportActivitiesToExcel(activities);
    } catch (error: any) {
      Alert.alert('Erro ao exportar', error.message ?? 'Tente novamente.');
    }
  }

  async function handleExportPdf() {
    try {
      if (!activities.length) {
        Alert.alert('Sem dados', 'Não há atividades no período selecionado.');
        return;
      }
      const user = getSingleUser();
      const start = startDate.toISOString().slice(0, 10);
      const end = endDate.toISOString().slice(0, 10);
      await exportActivitiesToPdf({
        user,
        activities,
        periodStart: start,
        periodEnd: end,
      });
    } catch (error: any) {
      Alert.alert('Erro ao gerar PDF', error.message ?? 'Tente novamente.');
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>
          Relatórios
        </ThemedText>

        <ThemedText style={styles.label}>Período</ThemedText>

        <View style={styles.dateRow}>
          <View style={styles.dateColumn}>
            <Text style={styles.dateLabel}>Início</Text>
            <Text style={styles.dateText}>
              {startDate.toLocaleDateString('pt-BR')}
            </Text>
            <Button
              title="Escolher"
              onPress={() => setShowStartPicker(true)}
              color="#1E88E5"
            />
          </View>
          <View style={styles.dateColumn}>
            <Text style={styles.dateLabel}>Fim</Text>
            <Text style={styles.dateText}>
              {endDate.toLocaleDateString('pt-BR')}
            </Text>
            <Button
              title="Escolher"
              onPress={() => setShowEndPicker(true)}
              color="#1E88E5"
            />
          </View>
        </View>

        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={handleChangeStart}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={handleChangeEnd}
          />
        )}

        <View style={styles.buttonsRow}>
          <View style={styles.button}>
            <Button
              title="Exportar Excel"
              onPress={handleExportExcel}
              color="#1E88E5"
            />
          </View>
          <View style={styles.button}>
            <Button
              title="Gerar PDF"
              onPress={handleExportPdf}
              color="#1E88E5"
            />
          </View>
        </View>

        <ThemedText style={styles.summary}>
          Atividades encontradas no período: {activities.length}
        </ThemedText>

        <View style={styles.toggleRow}>
          <Button
            title={showList ? 'Esconder atividades' : 'Ver atividades do período'}
            onPress={() => setShowList((prev) => !prev)}
            color="#1E88E5"
          />
        </View>

        {showList && (
          <View style={styles.listContainer}>
            {activities.length === 0 ? (
              <ThemedText style={styles.emptyText}>
                Nenhuma atividade encontrada no período selecionado.
              </ThemedText>
            ) : (
              activities.map((activity) => (
                <View key={activity.id} style={styles.activityCard}>
                  <ThemedText style={styles.activityTitle}>
                    {activity.activity_date} • {activity.type}
                  </ThemedText>
                  <ThemedText style={styles.activityText}>
                    Duração: {activity.duration_minutes} min
                  </ThemedText>
                  <ThemedText style={styles.activityText}>
                    Intensidade: {activity.intensity}
                  </ThemedText>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 32,
    backgroundColor: '#F5FAFF',
  },
  title: {
    fontSize: 26,
    marginBottom: 16,
  },
  label: {
    fontSize: 20,
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  dateLabel: {
    fontSize: 18,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 18,
    marginBottom: 4,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  summary: {
    fontSize: 18,
    marginTop: 24,
  },
  toggleRow: {
    marginTop: 16,
  },
  listContainer: {
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0F2F1',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  activityTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  activityText: {
    fontSize: 16,
  },
});


