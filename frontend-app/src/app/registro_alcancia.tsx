import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/config';

export default function RegistrarAlcanciaScreen() {
  const router = useRouter();

  const [numeroAlcancia, setNumeroAlcancia] = useState('');
  const [rangoFin, setRangoFin] = useState(null);
  const [cargandoInicial, setCargandoInicial] = useState(true);

  const [nombrePersona, setNombrePersona] = useState('');
  const [monto, setMonto] = useState('');
  const [estado, setEstado] = useState('Colocada');
  const [guardando, setGuardando] = useState(false)

  const opcionesEstado = ['Colocada', 'Devuelta', 'Faltante'];

  useEffect(() => {
    const obtenerDatosSector = async () => {
      try {
        const usuarioString = await AsyncStorage.getItem('userData');
        if (!usuarioString) return;

        const usuario = JSON.parse(usuarioString);

        const respuesta = await fetch(`${API_URL}/alcancias/siguiente/${usuario.comunidad_id}`);
        const data = await respuesta.json();

        if (respuesta.ok) {
          console.log("Datos recibidos del backend:", data);
          setNumeroAlcancia(data.siguiente_codigo.toString());
          setRangoFin(data.rango_fin);
        } else {
          Alert.alert('Error', 'No se pudo obtener el rango de la comunidad.');
        }
      } catch (error) {
        console.error('Error al cargar los rangos:', error);
      } finally {
        setCargandoInicial(false);
      }
    };
    obtenerDatosSector();
  }, []);

  const manejarRegistro = async () => {
    if (!nombrePersona || !numeroAlcancia) {
      Alert.alert('Error', 'Debes ingresar el nombre de la persona.');
      return;
    }
    //Validamos que no se pase del límite de alcancías del sector
    if (rangoFin && parseInt(numeroAlcancia, 10) > rangoFin) {
      Alert.alert('Límite alcanzado', `Has llegado al límite de este sector. La última alcancía permitida es la #${rangoFin}.`);
      return;
    }
    setGuardando(true);
    try {
      //obtener los datos del usuario activo desde el telefono
      const usuarioString = await AsyncStorage.getItem('userData');
      if (!usuarioString) {
        Alert.alert('Error de Sesión', 'No se encontraron datos del usuario');
        setGuardando(false);
        return;
      }

      const usuario = JSON.parse(usuarioString);

      //Preparar el paquete de datos para enviar al backend
      const payload = {
        codigo_alcancia: parseInt(numeroAlcancia, 10),
        nombre_persona: nombrePersona,
        comunidad_id: usuario.comunidad_id,
        usuario_id: usuario.id,
        colocada: estado === 'Colocada',
        devuelta: estado === 'Devuelta',
        faltante: estado === 'Faltante',
        monto_entregado: monto ? parseFloat(monto) : null,
      };

      const respuesta = await fetch(`${API_URL}/alcancias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        Alert.alert(
          'Éxito',
          `Alcancía #${numeroAlcancia} registrada correctamente.`,
          [{
            text: 'Siguiente',
            onPress: () => {
              // En lugar de salir, limpiamos los campos
              setNombrePersona('');
              setMonto('');
              setEstado('Colocada');
              // Verificamos antes de sumar para el siguiente registro
              const siguienteNumero = parseInt(numeroAlcancia, 10) + 1;
              if (rangoFin && siguienteNumero > rangoFin) {
                Alert.alert('Completado', 'Yas registraste la última alcancia de este sector');
                setNumeroAlcancia('');
              } else {
                setNumeroAlcancia(siguienteNumero.toString());
              }
            }
          }]
        );
      } else {
        Alert.alert('Error', datos.error || 'No se pudo guardar el registro.');
      }
    } catch (error) {
      console.error('Error al guardad:', error);
      Alert.alert('Error de conexión', 'No se pudo comunicar con el servidor.');
    } finally {
      setGuardando(false);
    }
  }
  if (cargandoInicial) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.botonRegresar}>
          <Ionicons name="arrow-back" size={28} color="#C2DFE3" />
        </TouchableOpacity>
        <Text style={styles.tituloHeader}>Registrar Ingreso</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Cambiamos a ScrollView por si el teclado tapa los campos */}
      <ScrollView style={styles.formContainer}>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Número de Alcancía (Automático)</Text>
          <TextInput
            style={[styles.input, styles.inputBloqueado]}
            value={numeroAlcancia}
            editable={false} // Bloquea la edición
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre de quien recibe</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. María Pérez"
            placeholderTextColor="#9AA8AC"
            value={nombrePersona}
            onChangeText={setNombrePersona}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Estado de la Alcancía</Text>
          <View style={styles.radioContainer}>
            {opcionesEstado.map((opcion) => (
              <TouchableOpacity
                key={opcion}
                style={[
                  styles.radioBoton,
                  estado === opcion && styles.radioBotonSeleccionado
                ]}
                onPress={() => {
                  setEstado(opcion);
                  // Si está faltante, limpiamos el monto
                  if (opcion === 'Faltante') setMonto('');
                }}
              >
                <Text style={[
                  styles.radioTexto,
                  estado === opcion && styles.radioTextoSeleccionado
                ]}>
                  {opcion}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Monto Recaudado ($)</Text>
          <TextInput
            style={[styles.input, estado === 'Faltante' && styles.inputBloqueado]}
            placeholder={estado === 'Faltante' ? "No aplica" : "0.00"}
            placeholderTextColor="#9AA8AC"
            keyboardType="decimal-pad"
            value={monto}
            onChangeText={setMonto}
            editable={estado !== 'Faltante'} // Se bloquea si está faltante
          />
        </View>

        <TouchableOpacity style={styles.botonGuardar} onPress={manejarRegistro}>
          <Text style={styles.textoBotonGuardar}>Guardar Registro</Text>
          <Ionicons name="save-outline" size={20} color="#1E292D" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        {/* Espacio extra al final para que el teclado no tape el botón */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#253237',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1E292D',
  },
  botonRegresar: {
    padding: 5,
  },
  tituloHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  formContainer: {
    padding: 24,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#C2DFE3',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#1E292D',
    color: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#3A4A50',
  },
  inputBloqueado: {
    backgroundColor: '#182024', // Más oscuro para indicar que no se puede tocar
    color: '#7A8C91', // Texto atenuado
    borderColor: '#182024',
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  radioBoton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#1E292D',
    borderWidth: 1,
    borderColor: '#3A4A50',
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  radioBotonSeleccionado: {
    backgroundColor: '#C2DFE3',
    borderColor: '#C2DFE3',
  },
  radioTexto: {
    color: '#9AA8AC',
    fontWeight: 'bold',
    fontSize: 14,
  },
  radioTextoSeleccionado: {
    color: '#1E292D',
  },
  botonGuardar: {
    backgroundColor: '#C2DFE3',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  textoBotonGuardar: {
    color: '#1E292D',
    fontSize: 16,
    fontWeight: 'bold',
  },
});