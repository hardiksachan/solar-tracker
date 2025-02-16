import { NextRequest, NextResponse } from "next/server";
import { InfluxDB, QueryApi } from "@influxdata/influxdb-client";
import dayjs from "dayjs";

const { INFLUX_URL, INFLUX_TOKEN, INFLUX_ORG, INFLUX_BUCKET } = process.env;

if (!INFLUX_URL || !INFLUX_TOKEN || !INFLUX_ORG || !INFLUX_BUCKET) {
  throw new Error("Missing InfluxDB environment variables");
}

const influxDB = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });
const queryApi: QueryApi = influxDB.getQueryApi(INFLUX_ORG);

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    let startTime = searchParams.get("startTime") || "-1h";
    let endTime = searchParams.get("endTime") || "now()";
    const fields = searchParams.get("fields");

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

    const fluxQuery = `
      from(bucket: "${INFLUX_BUCKET}")
        |> range(start: ${startTime}, stop: ${endTime})
        |> filter(fn: (r) => r._measurement == "sensor_readings")
        |> filter(fn: (r) => ${fieldFilters})
        |> aggregateWindow(every: 10s, fn: mean, createEmpty: true)
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> yield(name: "filtered")
    `;

    console.log("Executing Flux Query:", fluxQuery);

    const rawData = await queryApi.collectRows(fluxQuery);

    const data = rawData.map((row: any) => {
      const { _time, ...fields } = row;
      return {
        timestamp: dayjs(_time).format("DD:MM:YYYY HH:mm:ss"),
        ...fields,
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching data from InfluxDB:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
