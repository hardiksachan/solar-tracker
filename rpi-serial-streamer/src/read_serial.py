import serial
import time
from influxdb_client import InfluxDBClient, Point, WriteOptions

# InfluxDB Configuration
INFLUX_URL = "http://192.168.164.243:8086"
INFLUX_TOKEN = "my-secret-token"
INFLUX_ORG = "my-org"
INFLUX_BUCKET = "sensor_data"

# Initialize InfluxDB Client
client = InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG)
write_api = client.write_api(write_options=WriteOptions(batch_size=1))

try:
    with serial.Serial('/dev/ttyUSB0', 9600, timeout=1) as ser:  # Change to ttyACM0 if needed
        ser.flush()

        while True:
            try:
                if ser.in_waiting > 0:
                    line = ser.readline().decode('utf-8').rstrip()
                    values = line.split(",")

                    point = Point("sensor_readings")

                    for entry in values:
                        key, value = entry.split(":")
                        try:
                            value = float(value)
                        except ValueError:
                            pass

                        point.field(key, value)

                    write_api.write(bucket=INFLUX_BUCKET, org=INFLUX_ORG, record=point)

            except Exception as e:
                print(f"Error reading serial data: {e}")

except serial.SerialException as e:
    print(f"Could not open serial port: {e}")
except KeyboardInterrupt:
    print("\nExiting program...")

client.close()

