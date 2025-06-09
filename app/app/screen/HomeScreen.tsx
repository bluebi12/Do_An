import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyARDVp4S1gCqthn3VYpKTQJv--Sl_xaqD8",
  authDomain: "fir-project-esp32.firebaseapp.com",
  databaseURL: "https://fir-project-esp32-default-rtdb.firebaseio.com",
  projectId: "fir-project-esp32",
  storageBucket: "fir-project-esp32.firebasestorage.app",
  messagingSenderId: "656047656204",
  appId: "1:656047656204:web:0bde420be3a1f5d8dfcd29",
  measurementId: "G-RZR300WEJ2"
};
// Khởi tạo Firebase 
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const HomeScreen = () => {
  // Trạng thái dữ liệu cảm biến từ ESP32
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    soilMoisture: 0,
    lightIntensity: 0,
  });
  // Trạng thái thiết bị (bơm, đèn, phun sương, quạt)
  const [deviceState, setDeviceState] = useState({
    pump: false,
    light: false,
    spray: false,
    fan: false,
  });
  // Ngưỡng điều kiện thiết bị sẽ kích hoạt ở chế độ tự động
  const [thresholds, setThresholds] = useState({
    temperature: 0,
    humidity: 0,
    soilMoisture: 0,
    lightIntensity: 0,
  });
  // Dữ liệu nhập từ người dùng cho các ngưỡng
  const [thresholdInputs, setThresholdInputs] = useState({
    temperature: '0',
    humidity: '0',
    soilMoisture: '0',
    lightIntensity: '0',
  });
  const [mode, setMode] = useState(0); // 0: Auto, 1: Manual
  useEffect(() => {
    // Lấy dữ liệu cảm biến từ esp_guilen
    const espRef = ref(database, 'esp_guilen');
    onValue(espRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSensorData({
          temperature: data.nhietdo ?? 0,
          humidity: data.doam ?? 0,
          soilMoisture: data.doamdat ?? 0,
          lightIntensity: data.anhsang ?? 0,
        });
      }
    });

     // Cập nhật trạng thái thiết bị theo thời gian thực từ pc_guilen
    const pcRef = ref(database, 'pc_guilen');
    onValue(pcRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDeviceState({
          pump: data.bom === 1,
          light: data.den === 1,
          spray: data.phunsuong === 1,
          fan: data.quat === 1,
        });
      }
    });

    // Đồng bộ ngưỡng điều kiện từ Firebase
    const thresholdsRef = ref(database, 'thresholds');
    onValue(thresholdsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setThresholds({
          temperature: data.temperature ?? 0,
          humidity: data.humidity ?? 0,
          soilMoisture: data.soilMoisture ?? 0,
          lightIntensity: data.lightIntensity ?? 0,
        });
        setThresholdInputs({
          temperature: String(data.temperature ?? 0),
          humidity: String(data.humidity ?? 0),
          soilMoisture: String(data.soilMoisture ?? 0),
          lightIntensity: String(data.lightIntensity ?? 0),
        });
      }
    });

    // Theo dõi chế độ hoạt động từ esp_guilen/mode
    const modeRef = ref(database, 'esp_guilen/mode');
    onValue(modeRef, (snapshot) => {
      const value = snapshot.val();
      if (value !== null) setMode(value);
    });
  }, []);

  // Điều khiển thiết bị (chỉ khi mode = 1)
  const handleDeviceToggle = (device: string, value: boolean) => {
    if (mode === 1) {
      const deviceRef = ref(database, `pc_guilen/${device}`);
      set(deviceRef, value ? 1 : 0)
        .catch(err => console.error("Set device error:", err));
    }
  };

  // Cập nhật giá trị threshold lên Firebase
  const handleThresholdChange = (threshold: string, value: string) => {
    let num = parseFloat(value);
    if (value === '' || isNaN(num)) {
      num = 0;
      setThresholdInputs(inputs => ({ ...inputs, [threshold]: '0' }));
    } else {
      setThresholdInputs(inputs => ({ ...inputs, [threshold]: value }));
    }
    const thresholdRef = ref(database, `thresholds/${threshold}`);
    set(thresholdRef, num)
      .catch(err => console.error("Set threshold error:", err));
  };

  // Chuyển đổi chế độ tự động/manual và cập nhật Firebase
  const toggleMode = (value: boolean) => {
    const newMode = value ? 1 : 0;
    const modeRef = ref(database, 'esp_guilen/mode');
    setMode(newMode);
    set(modeRef, newMode)
      .then(() => console.log("Mode updated successfully"))
      .catch(error => console.error("Error updating mode:", error));
  };

  const handleLogout = () => {
    router.replace('/screen/LoginScreen');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Hiển thị thông tin */}
      <View style={styles.headerContainer}>
        <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
        <Text style={styles.schoolName}>TRƯỜNG ĐẠI HỌC SƯ PHẠM KỸ THUẬT THÀNH PHỐ HỒ CHÍ MINH</Text>
        <Text style={styles.projectTitle}>ĐỒ ÁN TỐT NGHIỆP</Text>
        <Text style={styles.projectDesc}>MÔ HÌNH HỆ THỐNG TƯỚI TIÊU THÔNG MINH SỬ DỤNG NĂNG LƯỢNG MẶT TRỜI</Text>
      </View>

      {/* Cảm biến và Giá trị cài đặt */}
      <View style={styles.cardRow}>
        <View style={styles.cardBlock}>
          <Text style={styles.blockTitle}>Display sensor values</Text>
          <View style={styles.cardGrid}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>🌡️ Temperature</Text>
              <Text style={styles.cardValue}>{sensorData.temperature} °C</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>💧 Air Humidity</Text>
              <Text style={styles.cardValue}>{sensorData.humidity} %</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>🌱 Soil Moisture</Text>
              <Text style={styles.cardValue}>{sensorData.soilMoisture} %</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>☀️ Light Intensity</Text>
              <Text style={styles.cardValue}>{sensorData.lightIntensity} lux</Text>
            </View>
          </View>
        </View>
        { /* Cài đặt giá trị */}
        <View style={styles.cardBlock}>
          <Text style={styles.blockTitle}>Setting Values</Text>
          <View style={styles.cardGrid}>
            <View style={styles.cardInput}>
              <Text style={styles.cardLabel}>🌡️ Temperature</Text>  { /* Nhiệt độ */}
              <TextInput
                style={styles.input}
                value={thresholdInputs.temperature}
                keyboardType="numeric"
                onChangeText={text => handleThresholdChange('temperature', text)}
                placeholder="Enter temperature"
              />
            </View>
            <View style={styles.cardInput}>
              <Text style={styles.cardLabel}>💧 Air Humidity</Text>  {/* Độ ẩm không khí */}
              <TextInput
                style={styles.input}
                value={thresholdInputs.humidity}
                keyboardType="numeric"
                onChangeText={text => handleThresholdChange('humidity', text)}
                placeholder="Enter humidity"
              />
            </View>
            <View style={styles.cardInput}>
              <Text style={styles.cardLabel}>🌱 Soil Moisture</Text> {     /* Độ ẩm đất */}
              <TextInput
                style={styles.input}
                value={thresholdInputs.soilMoisture}
                keyboardType="numeric"
                onChangeText={text => handleThresholdChange('soilMoisture', text)}
                placeholder="Enter soil moisture"
              />
            </View>
            <View style={styles.cardInput}>
              <Text style={styles.cardLabel}>☀️ Light Intensity</Text> {/* Cường độ ánh sáng */}
              <TextInput
                style={styles.input}
                value={thresholdInputs.lightIntensity}
                keyboardType="numeric"
                onChangeText={text => handleThresholdChange('lightIntensity', text)}
                placeholder="Enter light intensity"
              />
            </View>
          </View>
        </View>
      </View>

      {/* Điều khiển thiết bị */}
      <Text style={styles.controlTitle}>DEVICE CONTROL</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: '100%' }}>
        <View style={styles.deviceControlRow}>
          <View style={styles.deviceCard}>
            <MaterialCommunityIcons name="water" size={36} color="#2196F3" /> {/* Bơm tưới*/}
            <Text style={styles.deviceLabel}>Irrigation Pump</Text>
            <Switch
              value={
                mode === 0
                  ? sensorData.soilMoisture < thresholds.soilMoisture  
                  : deviceState.pump
              }
              onValueChange={value => handleDeviceToggle('bom', value)}
              disabled={mode === 0}
              trackColor={{ false: "#ccc", true: "#81d4fa" }}
              thumbColor={
                (mode === 0
                  ? sensorData.soilMoisture < thresholds.soilMoisture
                  : deviceState.pump) ? "#2196F3" : "#f4f3f4"
              }
            />
          </View>
          <View style={styles.deviceCard}>
            <MaterialCommunityIcons name="water" size={36} color="#2196F3" /> {/* Bơm phun sương */}
            <Text style={styles.deviceLabel}>Misting Pump</Text>
            <Switch
              value={
                mode === 0
                  ? sensorData.humidity < thresholds.humidity 
                  : deviceState.spray
              }
              onValueChange={value => handleDeviceToggle('phunsuong', value)}
              disabled={mode === 0}
              trackColor={{ false: "#ccc", true: "#2196F3" }}  
              thumbColor={
                (mode === 0
                  ? sensorData.humidity < thresholds.humidity
                  : deviceState.spray)? "#2196F3" : "#f4f3f4"
              }
            />
          </View>
          <View style={styles.deviceCard}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={36} color="#FFEB3B" /> {/* Đèn chiếu sáng */}
            <Text style={styles.deviceLabel}>Light</Text>
            <Switch
              value={
                mode === 0
                  ? sensorData.lightIntensity < thresholds.lightIntensity
                  : deviceState.light
              }
              onValueChange={value => handleDeviceToggle('den', value)}
              disabled={mode === 0}
              trackColor={{ false: "#ccc", true: "#81d4fa" }}  
              thumbColor={
                (mode === 0
                  ? sensorData.lightIntensity < thresholds.lightIntensity
                  : deviceState.light)? "#2196F3"   : "#f4f3f4"   
              }
            />
          </View>
          <View style={styles.deviceCard}>
            <MaterialCommunityIcons name="fan" size={36} color="#F44336" /> {/* Quạt */}
            <Text style={styles.deviceLabel}>Fan</Text>
            <Switch
              value={
                mode === 0
                  ? sensorData.temperature > thresholds.temperature 
                  : deviceState.fan
              }
              onValueChange={value => handleDeviceToggle('quat', value)}
              disabled={mode === 0}
              trackColor={{ false: "#ccc", true: "#81d4fa" }} 
              thumbColor={
                (mode === 0
                  ? sensorData.temperature > thresholds.temperature
                  : deviceState.fan) ? "#2196F3" : "#f4f3f4"
              }
            />
          </View>
          <View style={styles.deviceCard}>
            <MaterialCommunityIcons name="refresh" size={36} color="#2196F3" /> {/* Chế độ tự động/manual */}
            <Text style={styles.deviceLabel}>{mode === 0 ? 'Auto' : 'Manual'}</Text>
            <Switch
              value={mode === 1}
              onValueChange={toggleMode}
            />
          </View>
        </View>
      </ScrollView>

      {/* Logout button */}
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  schoolName: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    color: '#003366',
  },
  projectTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#1a7f37',
    marginTop: 2,
    textAlign: 'center',
  },
  projectDesc: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#1a7f37',
    marginBottom: 2,
    textAlign: 'center',
  },
  teacher: {
    fontSize: 13,
    color: '#333',
    marginBottom: 1,
  },
  student: {
    fontSize: 13,
    color: '#333',
    marginBottom: 1,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  cardBlock: {
    flex: 1,
    backgroundColor: '#e6f7e6',
    borderRadius: 16,
    padding: 10,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  blockTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 8,
    textAlign: 'center',
    color: '#1a7f37',
  },
  cardGrid: {
    flex: 1,
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    backgroundColor: '#f0f4ff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 10,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  cardInput: {
    width: '100%',
    backgroundColor: '#f0f4ff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  cardLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  cardValue: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#1a7f37',
    textAlign: 'center',
    marginTop: 2,
  },
  input: {
    width: '100%',
    height: 44,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 15,
    backgroundColor: '#fff',
    marginTop: 2,
  },
  controlTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginVertical: 10,
    textAlign: 'center',
    color: '#1a7f37',
  },
  deviceControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    width: '100%',
    marginBottom: 10,
  },
  deviceCard: {
    flex: 1,
    minWidth: 90,
    maxWidth: 120,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deviceLabel: {
    fontWeight: 'bold',
    fontSize: 14,
    marginVertical: 6,
    color: '#333',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2f95dc',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
