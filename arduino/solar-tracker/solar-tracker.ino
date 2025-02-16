#include <Servo.h>

Servo horizontalServo;
Servo verticalServo;

const int HORIZONTAL_LIMIT_HIGH = 180;
const int HORIZONTAL_LIMIT_LOW = 0;
const int VERTICAL_LIMIT_HIGH = 140;
const int VERTICAL_LIMIT_LOW = 40;

int horizontalPos = 0;
int verticalPos = 60;

const int LDR_BOTTOM_LEFT = A1;
const int LDR_BOTTOM_RIGHT = A2;
const int LDR_TOP_LEFT = A0;
const int LDR_TOP_RIGHT = A3;

const int TIME_DELAY = 1000;
const int TOLERANCE = 30;
const float SCALING_FACTOR_Y = 0.05;
const float SCALING_FACTOR_X = 0.1;

void setup() {
  Serial.begin(9600);

  horizontalServo.attach(8);
  verticalServo.attach(9);
  horizontalServo.write(horizontalPos);
  verticalServo.write(verticalPos);

  Serial.print("horiz:"); Serial.println(horizontalPos);
  Serial.print("vertz:"); Serial.println(verticalPos);

  delay(2500);
}

void loop() {
  int lt = analogRead(LDR_TOP_LEFT);
  int rt = analogRead(LDR_TOP_RIGHT);
  int ld = analogRead(LDR_BOTTOM_LEFT);
  int rd = analogRead(LDR_BOTTOM_RIGHT);

  Serial.print("topLeft:"); Serial.println(lt);
  Serial.print("topRight:"); Serial.println(rt);
  Serial.print("bottomLeft:"); Serial.println(ld);
  Serial.print("bottomRight:"); Serial.println(rd);

  int avgTop = calculateAverage(lt, rt);
  int avgBottom = calculateAverage(ld, rd);
  int avgLeft = calculateAverage(lt, ld);
  int avgRight = calculateAverage(rt, rd);

  int x_error = avgLeft - avgRight;
  int y_error = avgTop - avgBottom;
  if (verticalPos < 90) {
    x_error *= -1;
  }

  Serial.print("dx:"); Serial.println(x_error);
  Serial.print("dy:"); Serial.println(y_error);

  float error_magnitude = sqrt(x_error * x_error + y_error * y_error);

  if (error_magnitude > TOLERANCE) {
    adjustServos(x_error, y_error);
  }

  delay(TIME_DELAY);
}

int calculateAverage(int value1, int value2) {
  return (value1 + value2) / 2;
}

void adjustServos(int x_error, int y_error) {
  int horizontalAdjustment = x_error * SCALING_FACTOR_X;
  int verticalAdjustment = y_error * SCALING_FACTOR_Y;

  horizontalPos += horizontalAdjustment;
  verticalPos += verticalAdjustment;

  horizontalPos = constrain(horizontalPos, HORIZONTAL_LIMIT_LOW, HORIZONTAL_LIMIT_HIGH);
  verticalPos = constrain(verticalPos, VERTICAL_LIMIT_LOW, VERTICAL_LIMIT_HIGH);

  horizontalServo.write(horizontalPos);
  verticalServo.write(verticalPos);

  Serial.print("horiz:"); Serial.println(horizontalPos);
  Serial.print("vertz:"); Serial.println(verticalPos);
}
