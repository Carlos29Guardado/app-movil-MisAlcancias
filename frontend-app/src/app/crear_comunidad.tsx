import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CrearComunidadScreen() {
  const router = useRouter();
  
  // Estados originales y los nuevos para los rangos
  const [nombreSector, setNombreSector] = useState('');
  const [rangoInicio, setRangoInicio] = useState('');
  const [cantidadAlcancias, setCantidadAlcancias] = useState('');

  const manejarCreacion = async () => {
    if (!nombreSector.trim() || !rangoInicio.trim() || !cantidadAlcancias.trim()) {
      Alert.alert('Datos incompletos', 'Por favor completa todos los campos.');
      return;
    }

    // 1. Calculamos los límites matemáticamente
    const inicio = parseInt(rangoInicio);
    const cantidad = parseInt(cantidadAlcancias);

    if (isNaN(inicio) || isNaN(cantidad) || cantidad <= 0) {
      Alert.alert('Error', 'Ingresa números válidos para las alcancías.');
      return;
    }

    const fin = inicio + cantidad - 1;

    try {
      // 2. Obtener los datos del usuario logueado
      const usuarioString = await AsyncStorage.getItem('userData');
      if (!usuarioString) {
        Alert.alert('Error', 'No se encontró la sesión del usuario.');
        return;
      }
      const usuario = JSON.parse(usuarioString);

      // 3. Hacer la petición al backend para crear el grupo
      // Ojo: mantengo la URL exacta que tú tenías
      const respuesta = await fetch('http://192.168.10.225:3000/api/comunidad/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nombreSector,
          emailUsuario: usuario.email, 
          rango_inicio: inicio, // <- Nuevo dato enviado al backend
          rango_fin: fin        // <- Nuevo dato enviado al backend
        }),
      });

      const data = await respuesta.json();

      if (respuesta.ok) {
        // 4. Actualizar la sesión local (ahora tiene comunidad y es admin)
        usuario.comunidad_id = data.comunidad_id;
        usuario.rol = 'admin';
        usuario.comunidad_nombre = nombreSector;
        await AsyncStorage.setItem('userData', JSON.stringify(usuario));

        // 5. Mostrar el código generado con la info de los rangos
        Alert.alert(
          '¡Comunidad Fundada!',
          `Alcancías permitidas: #${inicio} al #${fin}\n\nTu código de invitación es: ${data.codigo_invitacion}\n\nCompártelo con los voluntarios de tu sector para que se unan.`,
          [{ text: 'Entendido', onPress: () => router.replace('/explore') }] // <- Te regresa tras leerlo
        );

      } else {
        Alert.alert('Error', data.mensaje);
      }
    } catch (error) {
      console.error('Error en la petición:', error);
      Alert.alert('Error de conexión', 'No se pudo conectar con el servidor.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

        <View style={styles.container}>
          {/* Encabezado */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Crear Comunidad</Text>
            <Text style={styles.subtitle}>Arma tu grupo y asigna alcancías</Text>
          </View>

          {/* Formulario */}
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nombre del sector"
              placeholderTextColor="#9DB4C0"
              value={nombreSector}
              onChangeText={setNombreSector}
              autoCapitalize="words"
            />

            {/* NUEVA SECCIÓN: Fila con los dos inputs de números */}
            <View style={styles.filaInputs}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                placeholder="N° Inicial"
                placeholderTextColor="#9DB4C0"
                keyboardType="number-pad"
                value={rangoInicio}
                onChangeText={setRangoInicio}
              />
              <TextInput
                style={[styles.input, { flex: 1, marginLeft: 8 }]}
                placeholder="Cantidad"
                placeholderTextColor="#9DB4C0"
                keyboardType="number-pad"
                value={cantidadAlcancias}
                onChangeText={setCantidadAlcancias}
              />
            </View>

            <Text style={styles.helperText}>
              Automáticamente serás el administrador de este sector.
            </Text>

            <TouchableOpacity style={styles.primaryButton} onPress={manejarCreacion}>
              <Text style={styles.primaryButtonText}>Fundar Comunidad</Text>
            </TouchableOpacity>
          </View>

          {/* Enlace inferior */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              ¿Quieres unirte a una?{' '}
              <Text style={styles.footerLink} onPress={() => router.back()}>
                Regresa al menú
              </Text>
            </Text>
          </View>

        </View>

      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#253237', 
    paddingHorizontal: 40,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E0FBFC',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0FBFC',
  },
  formContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#5C6B73',
    borderRadius: 8,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  filaInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  helperText: {
    color: '#E0FBFC',
    fontSize: 12,
    marginBottom: 30,
    marginTop: 5,
    textAlign: 'left',
  },
  primaryButton: {
    backgroundColor: '#C2DFE3',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#253237',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    color: '#E0FBFC',
    fontSize: 13,
  },
  footerLink: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});