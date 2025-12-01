import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Platform,
  StyleSheet,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { addActivity, getSingleUser } from '@/lib/db';
import { useFocusEffect } from '@react-navigation/native';

const intensityOptions = ['leve', 'moderada', 'intensa'] as const;

export default function RegistrarAtividadeScreen() {
  const [type, setType] = useState('');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] =
    useState<(typeof intensityOptions)[number]>('leve');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hasUser, setHasUser] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const user = getSingleUser();
      setHasUser(!!user);
    }, []),
  );

  function handleChangeDate(_: any, selectedDate?: Date) {
    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  }

  function handleSubmit() {
    const user = getSingleUser();
    if (!user) {
      Alert.alert(
        'Cadastre seu perfil',
        'Antes de registrar atividades, preencha seus dados na aba Perfil.',
      );
      return;
    }

    if (!type.trim() || !duration.trim()) {
      Alert.alert('Campos obrigatórios', 'Informe o tipo e a duração da atividade.');
      return;
    }

    const durationNumber = Number(duration);
    if (Number.isNaN(durationNumber) || durationNumber <= 0) {
      Alert.alert('Duração inválida', 'Informe um valor de minutos maior que zero.');
      return;
    }

    const activityDate = date.toISOString().slice(0, 10);

    addActivity({
      user_id: user.id,
      type: type.trim(),
      duration_minutes: durationNumber,
      intensity,
      activity_date: activityDate,
    });

    setType('');
    setDuration('');
    setIntensity('leve');

    Alert.alert('Sucesso', 'Atividade registrada com sucesso!');
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>
          Registrar atividade
        </ThemedText>

        {!hasUser && (
          <ThemedText style={styles.warning}>
            Dica: cadastre seu perfil na aba Perfil para um acompanhamento mais completo.
          </ThemedText>
        )}

        <ThemedText style={styles.label}>Tipo de atividade</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Caminhada, alongamento, bicicleta..."
          value={type}
          onChangeText={setType}
        />

        <ThemedText style={styles.label}>Duração (minutos)</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Ex.: 30"
          keyboardType="numeric"
          value={duration}
          onChangeText={setDuration}
        />

        <ThemedText style={styles.label}>Data</ThemedText>
        <View style={styles.dateRow}>
          <ThemedText style={styles.dateText}>
            {date.toLocaleDateString('pt-BR')}
          </ThemedText>
          <Button
            title="Escolher data"
            onPress={() => setShowDatePicker(true)}
            color="#1E88E5"
          />
        </View>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleChangeDate}
          />
        )}

        <ThemedText style={styles.label}>Intensidade</ThemedText>
        <View style={styles.intensityRow}>
          {intensityOptions.map((option) => (
            <View key={option} style={styles.intensityButton}>
              <Button
                title={option.toUpperCase()}
                color={intensity === option ? '#1565C0' : '#90CAF9'}
                onPress={() => setIntensity(option)}
              />
            </View>
          ))}
        </View>

        <View style={styles.submitButton}>
          <Button title="Salvar atividade" onPress={handleSubmit} color="#1E88E5" />
        </View>

        <ThemedText style={styles.hint}>
          Para visualizar os registros salvos no banco de dados (SQLite), acesse a aba
          {' '}Relatórios.
        </ThemedText>
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
  warning: {
    fontSize: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 20,
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#B0BEC5',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    backgroundColor: '#FFFFFF',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 18,
  },
  intensityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  intensityButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  submitButton: {
    marginTop: 24,
  },
  hint: {
    fontSize: 16,
    marginTop: 24,
  },
});


