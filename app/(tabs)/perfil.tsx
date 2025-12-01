import React, { useCallback, useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getSingleUser, upsertSingleUser, type User } from '@/lib/db';
import { useFocusEffect } from '@react-navigation/native';

export default function PerfilScreen() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState(''); // em metros (ex.: 1.60)
  const [healthNotes, setHealthNotes] = useState('');
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useFocusEffect(
    useCallback(() => {
      const user = getSingleUser();
      setCurrentUser(user ?? null);

      if (user) {
        setUserId(user.id);
        setName(user.name);
        setAge(String(user.age));
        setWeight(String(user.weight));
        // altura é armazenada em centímetros no banco; exibimos em metros
        const heightInMeters = (user.height || 0) / 100;
        setHeight(heightInMeters ? heightInMeters.toFixed(2) : '');
        setHealthNotes(user.health_notes ?? '');
      }
    }, []),
  );

  async function handleSave() {
    if (!name.trim() || !age.trim() || !weight.trim() || !height.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha nome, idade, peso e altura.');
      return;
    }

    const ageNumber = Number(age);
    const weightNumber = Number(weight);
    // permitir vírgula ou ponto na altura
    const parsedHeight = height.replace(',', '.');
    const heightMeters = Number(parsedHeight);
    const heightNumber = Math.round(heightMeters * 100); // salvar em cm

    if (
      Number.isNaN(ageNumber) ||
      Number.isNaN(weightNumber) ||
      Number.isNaN(heightMeters)
    ) {
      Alert.alert('Dados inválidos', 'Idade, peso e altura devem ser numéricos.');
      return;
    }

    const id = await upsertSingleUser({
      id: userId,
      name: name.trim(),
      age: ageNumber,
      weight: weightNumber,
      height: heightNumber,
      health_notes: healthNotes.trim() || undefined,
    });

    setUserId(id);
    const updated = getSingleUser();
    setCurrentUser(updated ?? null);
    Alert.alert('Sucesso', 'Dados de perfil salvos com sucesso!');
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>
          Perfil do usuário
        </ThemedText>

        <ThemedText style={styles.label}>Nome</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Seu nome completo"
          value={name}
          onChangeText={setName}
        />

        <ThemedText style={styles.label}>Idade</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Ex.: 70"
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
        />

        <ThemedText style={styles.label}>Peso (kg)</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Ex.: 70"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />

        <ThemedText style={styles.sectionTitle}>Informações físicas</ThemedText>

        <ThemedText style={styles.label}>Peso (kg)</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Ex.: 70"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />

        <ThemedText style={styles.label}>Altura (m)</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Ex.: 1.60"
          keyboardType="numeric"
          value={height}
          onChangeText={setHeight}
        />

        <ThemedText style={styles.sectionTitle}>Saúde</ThemedText>
        <ThemedText style={styles.label}>Observações de saúde</ThemedText>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Pressão alta, diabetes, orientações do médico..."
          value={healthNotes}
          onChangeText={setHealthNotes}
          multiline
          numberOfLines={4}
        />

        <View style={styles.button}>
          <Button title="Salvar perfil" onPress={handleSave} color="#1E88E5" />
        </View>

        {currentUser && (
          <View style={styles.savedCard}>
            <ThemedText type="subtitle" style={styles.savedTitle}>
              Dados salvos no aplicativo
            </ThemedText>
            <ThemedText style={styles.savedText}>
              Nome: {currentUser.name}
            </ThemedText>
            <ThemedText style={styles.savedText}>
              Idade: {currentUser.age} anos
            </ThemedText>
            <ThemedText style={styles.savedText}>
              Peso: {currentUser.weight} kg
            </ThemedText>
            <ThemedText style={styles.savedText}>
              Altura: {(currentUser.height / 100).toFixed(2)} m
            </ThemedText>
            {currentUser.health_notes ? (
              <ThemedText style={styles.savedText}>
                Observações de saúde: {currentUser.health_notes}
              </ThemedText>
            ) : null}
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
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 22,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#B0BEC5',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    backgroundColor: '#FFFFFF',
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 24,
  },
  savedCard: {
    marginTop: 24,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  savedTitle: {
    fontSize: 22,
    marginBottom: 8,
  },
  savedText: {
    fontSize: 18,
    marginBottom: 4,
  },
});


