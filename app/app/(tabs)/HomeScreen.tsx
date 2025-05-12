import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, TextInput } from 'react-native'; // Add TextInput here
import { getDatabase, ref, onValue, set } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome for icons

// Firebase config
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

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const HomeScreen = () => {
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    soilMoisture: 0,
    lightIntensity: 0,
  });
  
  const [deviceState, setDeviceState] = useState({
    pump: false,
    light: false,
    spray: false,
    fan: false,
  });

  const [thresholds, setThresholds] = useState({
    temperature: 0,
    humidity: 0,
    soilMoisture: 0,
    lightIntensity: 0,
  });

  // Lấy dữ liệu cảm biến từ Firebase
  useEffect(() => {
    const espRef = ref(database, 'esp_guilen');
    const pcRef = ref(database, 'pc_guilen');
    const thresholdsRef = ref(database, 'thresholds');

    // Lắng nghe sự thay đổi dữ liệu cảm biến
    onValue(espRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSensorData({
          temperature: data.nhietdo,
          humidity: data.doam,
          soilMoisture: data.doamdat,
          lightIntensity: data.anhsang,
        });
      }
    });

    // Lắng nghe trạng thái thiết bị
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

    // Lắng nghe ngưỡng cài đặt
    onValue(thresholdsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setThresholds({
          temperature: data.temperature || 0,
          humidity: data.humidity || 0,
          soilMoisture: data.soilMoisture || 0,
          lightIntensity: data.lightIntensity || 0,
        });
      }
    });
  }, []);

  // Hàm cập nhật trạng thái thiết bị
  const handleDeviceToggle = (device: string, value: boolean) => {
    const deviceRef = ref(database, `pc_guilen/${device}`);
    set(deviceRef, value ? 1 : 0);
  };

  // Hàm cập nhật ngưỡng cài đặt
  const handleThresholdChange = (threshold: string, value: number) => {
    const thresholdRef = ref(database, `thresholds/${threshold}`);
    set(thresholdRef, value);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.introContainer}>
        <Text style={styles.title}>TRƯỜNG ĐẠI HỌC SƯ PHẠM KỸ THUẬT THÀNH PHỐ HỒ CHÍ MINH</Text>
        <Text style={styles.subtitle}>ĐỒ ÁN TỐT NGHIỆP</Text>
        <Text style={styles.subtitle}>SỬ DỤNG NĂNG LƯỢNG MẶT TRỜI KẾT HỢP IOT ĐỂ TƯỚI CÂY</Text>
        <Text>GVHD: Lê Thanh Lâm</Text>
        <Text>SVTH: Đỗ Thành Đạt - 21142513</Text>
        <Text>SVTH: Đỗ Công Hoàng Anh - 21142565</Text>
      </View>

      {/* Dữ liệu cảm biến */}
      <Text style={styles.header}>Dữ Liệu Cảm Biến</Text>
      <View style={styles.sensorDataContainer}>
        <Text>Nhiệt độ: {sensorData.temperature} °C</Text>
        <Text>Độ ẩm: {sensorData.humidity} %</Text>
        <Text>Độ ẩm đất: {sensorData.soilMoisture} %</Text>
        <Text>Ánh sáng: {sensorData.lightIntensity} lux</Text>
      </View>

      {/* Điều khiển thiết bị */}
      <Text style={styles.header}>Điều khiển thiết bị</Text>
      <View style={styles.deviceControlContainer}>
        <View style={styles.deviceControl}>
          <Icon name="tint" size={30} color="#4CAF50" />
          <Text>Bơm</Text>
          <Switch
            value={deviceState.pump}
            onValueChange={(value) => handleDeviceToggle('bom', value)}
          />
        </View>
        <View style={styles.deviceControl}>
          <Icon name="lightbulb-o" size={30} color="#FFEB3B" />
          <Text>Đèn</Text>
          <Switch
            value={deviceState.light}
            onValueChange={(value) => handleDeviceToggle('den', value)}
          />
        </View>
        <View style={styles.deviceControl}>
          <Icon name="cloud" size={30} color="#2196F3" />
          <Text>Phun sương</Text>
          <Switch
            value={deviceState.spray}
            onValueChange={(value) => handleDeviceToggle('phunsuong', value)}
          />
        </View>
        <View style={styles.deviceControl}>
          <Icon name="fan" size={30} color="#F44336" />
          <Text>Quạt</Text>
          <Switch
            value={deviceState.fan}
            onValueChange={(value) => handleDeviceToggle('quat', value)}
          />
        </View>
      </View>

      {/* Ngưỡng cài đặt */}
      <Text style={styles.header}>Ngưỡng Cài Đặt</Text>
      <View style={styles.thresholdContainer}>
        <Text>Ngưỡng Nhiệt độ: {thresholds.temperature} °C</Text>
        <Text>Ngưỡng Độ ẩm: {thresholds.humidity} %</Text>
        <Text>Ngưỡng Độ ẩm đất: {thresholds.soilMoisture} %</Text>
        <Text>Ngưỡng Ánh sáng: {thresholds.lightIntensity} lux</Text>
      </View>

      <View style={styles.thresholdControlContainer}>
        <Text>Điều chỉnh Ngưỡng Nhiệt độ</Text>
        <TextInput
          style={styles.input}
          value={String(thresholds.temperature)}
          keyboardType="numeric"
          onChangeText={(text) => handleThresholdChange('temperature', parseFloat(text))}
        />
        <Text>Điều chỉnh Ngưỡng Độ ẩm</Text>
        <TextInput
          style={styles.input}
          value={String(thresholds.humidity)}
          keyboardType="numeric"
          onChangeText={(text) => handleThresholdChange('humidity', parseFloat(text))}
        />
        <Text>Điều chỉnh Ngưỡng Độ ẩm đất</Text>
        <TextInput
          style={styles.input}
          value={String(thresholds.soilMoisture)}
          keyboardType="numeric"
          onChangeText={(text) => handleThresholdChange('soilMoisture', parseFloat(text))}
        />
        <Text>Điều chỉnh Ngưỡng Ánh sáng</Text>
        <TextInput
          style={styles.input}
          value={String(thresholds.lightIntensity)}
          keyboardType="numeric"
          onChangeText={(text) => handleThresholdChange('lightIntensity', parseFloat(text))}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  introContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sensorDataContainer: {
    marginBottom: 20,
  },
  deviceControlContainer: {
    marginBottom: 20,
  },
  deviceControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
  },
  thresholdContainer: {
    marginBottom: 20,
  },
  thresholdControlContainer: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});

export default HomeScreen;
