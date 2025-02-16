#include <Servo.h> 

Servo horizontalServo;
Servo verticalServo;

const int HORIZONTAL_LIMIT_HIGH = 180;
const int HORIZONTAL_LIMIT_LOW = 0;
const int VERTICAL_LIMIT_HIGH = 130;
const int VERTICAL_LIMIT_LOW = 50;

int horizontalPos = 0;
int verticalPos = 50;

const int D_LIMIT = 4;

const int LDR_BOTTOM_LEFT = A1;
const int LDR_BOTTOM_RIGHT = A2;
const int LDR_TOP_LEFT = A0;
const int LDR_TOP_RIGHT = A3;

const int TIME_DELAY = 50;
const int TIME_DELAY_FLIP = 2000;
const int TOLERANCE = 30;      
const float SCALING_FACTOR_Y = 0.01;
const float SCALING_FACTOR_X = 0.05;

const bool DEBUG = false;
const bool PLOT = true;


void setup() {
  Serial.begin(9600); 
  Serial.println("System Initialized");

  horizontalServo.attach(8);
  verticalServo.attach(9);
  horizontalServo.write(horizontalPos);
  verticalServo.write(verticalPos);

  Serial.println("Initial Servo Positions Set");
  Serial.print("Horizontal Position: ");
  Serial.println(horizontalPos);
  Serial.print("Vertical Position: ");
  Serial.println(verticalPos);

  delay(5000); 
}

void loop() {
  // Read LDR values
  int lt = analogRead(LDR_TOP_LEFT);
  int rt = analogRead(LDR_TOP_RIGHT);
  int ld = analogRead(LDR_BOTTOM_LEFT);
  int rd = analogRead(LDR_BOTTOM_RIGHT);

  if (DEBUG) {
    // Log LDR readings
    Serial.println("\nLDR Readings:");
    Serial.print("Top Left: "); Serial.println(lt);
    Serial.print("Top Right: "); Serial.println(rt);
    Serial.print("Bottom Left: "); Serial.println(ld);
    Serial.print("Bottom Right: "); Serial.println(rd);
  }

  if (PLOT) {
    Serial.print("TopLeft:"); Serial.print(lt);
    Serial.print(",TopRight:"); Serial.print(rt);
    Serial.print(",BottomLeft:"); Serial.print(ld);
    Serial.print(",BottomRight:"); Serial.print(rd);  
  }

  // Calculate average values
  int avgTop = calculateAverage(lt, rt);
  int avgBottom = calculateAverage(ld, rd);
  int avgLeft = calculateAverage(lt, ld);
  int avgRight = calculateAverage(rt, rd);

  // Calculate errors
  int x_error = avgLeft - avgRight; 
  int y_error = avgTop - avgBottom;
  if (verticalPos < 90) {
    x_error *= -1;
  }
  // y_error *= -1;

  if (DEBUG) {
    // Log errors
    Serial.println("\nErrors:");
    Serial.print("Horizontal Error: "); Serial.println(x_error);
    Serial.print("Vertical Error: "); Serial.println(y_error);
  }

  if (PLOT) {
    Serial.print(",dx:"); Serial.print(x_error);
    Serial.print(",dy:"); Serial.print(y_error);  
  }

  // Calculate error magnitude and direction
  float error_magnitude = sqrt(x_error * x_error + y_error * y_error);

  // Adjust servo positions based on the error
  if (error_magnitude > TOLERANCE) {
    adjustServos(x_error, y_error);
  } else {
    if (DEBUG) {
      Serial.println("No significant movement needed");
    }
  }

  Serial.println();
  delay(TIME_DELAY); 
}

int calculateAverage(int value1, int value2) {
  return (value1 + value2) / 2;
}

void adjustServos(int x_error, int y_error) {
  bool flipped = false;
  int horizontalAdjustment = x_error * SCALING_FACTOR_X;
  int verticalAdjustment = y_error * SCALING_FACTOR_Y;

  horizontalAdjustment = constrain(horizontalAdjustment, -D_LIMIT, D_LIMIT);
  verticalAdjustment = constrain(verticalAdjustment, -D_LIMIT, D_LIMIT);

  horizontalPos += horizontalAdjustment;
  verticalPos += verticalAdjustment;

  if (horizontalPos < 0) {
    horizontalPos = 180 + horizontalPos;
    verticalPos = 180 - verticalPos; 
    flipped = true;
  } else if (horizontalPos > 180) {
    horizontalPos = horizontalPos - 180;
    verticalPos = 180 - verticalPos;
    flipped = true;
  }

  horizontalPos = constrain(horizontalPos, HORIZONTAL_LIMIT_LOW, HORIZONTAL_LIMIT_HIGH);
  verticalPos = constrain(verticalPos, VERTICAL_LIMIT_LOW, VERTICAL_LIMIT_HIGH);

  horizontalServo.write(horizontalPos);
  verticalServo.write(verticalPos);

  if (flipped) {
    delay(TIME_DELAY_FLIP);
  }

  if (DEBUG) {
  Serial.println("\nServo Movements:");
  Serial.print("Horizontal Servo Moved to Position: ");
  Serial.println(horizontalPos);
  Serial.print("Vertical Servo Moved to Position: ");
  Serial.println(verticalPos);
  }

  if (PLOT) {
    Serial.print(",horiz:"); Serial.print(horizontalPos);
    Serial.print(",vertz:"); Serial.print(verticalPos);  
  }
}
