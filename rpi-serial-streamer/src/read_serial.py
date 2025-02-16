import serial

try:
    with serial.Serial('/dev/ttyUSB0', 9600, timeout=1) as ser:  # Change to ttyACM0 if needed
        ser.flush()

        while True:
            try:
                if ser.in_waiting > 0:
                    line = ser.readline().decode('utf-8').rstrip()
                    values = line.split(',')
                    data_map = {key: int(value) for key, value in (item.split(':') for item in values)}
                    print(data_map)
            except Exception as e:
                print(f"Error reading serial data: {e}")

except serial.SerialException as e:
    print(f"Could not open serial port: {e}")
except KeyboardInterrupt:
    print("\nExiting program...")

