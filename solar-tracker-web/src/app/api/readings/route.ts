import { NextRequest, NextResponse } from "next/server";
import { InfluxDB, QueryApi } from "@influxdata/influxdb-client";

// Load environment variables
const { INFLUX_URL, INFLUX_TOKEN, INFLUX_ORG, INFLUX_BUCKET } = process.env;

if (!INFLUX_URL || !INFLUX_TOKEN || !INFLUX_ORG || !INFLUX_BUCKET) {
  throw new Error("Missing InfluxDB environment variables");
}

// Initialize InfluxDB Client
const influxDB = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });
const queryApi: QueryApi = influxDB.getQueryApi(INFLUX_ORG);

// Define TypeScript types
interface SensorReading {
  timestamp: string;
  reading: number;
}

type SensorData = Record<string, SensorReading[]>;

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Parse query parameters
    const { searchParams } = new URL(req.url);
    let startTime = searchParams.get("startTime") || "-1h"; // Default: Last 1 hour
    let endTime = searchParams.get("endTime") || "now()"; // Default: Until now
    const fields = searchParams.get("fields"); // Example: "dx,dy,horiz"

    console.log({
      startTime,
      endTime,
      fields,
    });

    if (!fields) {
      return NextResponse.json(
        { error: "Missing 'fields' parameter" },
        { status: 400 },
      );
    }

    const fieldFilters = fields
      .split(",")
      .map((field) => `r._field == "${field}"`)
      .join(" or ");

    // Determine if startTime and endTime are durations or timestamps
    const isTimestamp = (time: string) => !isNaN(Date.parse(time));
    if (!isTimestamp(startTime)) {
      startTime = `duration(v: "${startTime}")`;
    } else {
      startTime = `time(v: "${startTime}")`;
    }
    if (!isTimestamp(endTime)) {
      endTime = "now()";
    } else {
      endTime = `time(v: "${endTime}")`;
    }

    // Construct InfluxDB Flux Query with corrected range syntax
    const fluxQuery = `
      from(bucket: "${INFLUX_BUCKET}")
        |> range(start: ${startTime}, stop: ${endTime})
        |> filter(fn: (r) => r._measurement == "sensor_readings")
        |> filter(fn: (r) => ${fieldFilters})
        |> yield(name: "filtered")
    `;

    console.log("Executing Flux Query:", fluxQuery);

    // Query InfluxDB and collect results
    const rawData = await queryApi.collectRows(fluxQuery);

    // Transform data into structured response
    const data = rawData.reduce((acc: SensorData, row: any) => {
      const field = row._field as string;
      const timestamp = row._time as string;
      const reading = row._value as number;

      if (!acc[field]) {
        acc[field] = [];
      }
      acc[field].push({ timestamp, reading });

      return acc;
    }, {} as SensorData);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching data from InfluxDB:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

