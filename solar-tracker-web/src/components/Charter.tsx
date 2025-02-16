import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DateFilterValues, DateRangeForm } from "./DateRangeForm";
import { Card, LoadingOverlay, Text } from "@mantine/core";
import { LineChart } from "@mantine/charts";

async function fetchData(values: DateFilterValues, fields: string[]) {
  const queryParams = new URLSearchParams();

  if (values.duration === "custom") {
    queryParams.append("startTime", values.startTime!.toISOString());
    queryParams.append("endTime", values.endTime!.toISOString());
  } else {
    queryParams.append("startTime", `-${values.duration}`);
  }

  if (fields) {
    queryParams.append("fields", fields.join(","));
  }

  const response = await fetch(`/api/readings?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  return response.json();
}

export function Charter({
  fields,
}: {
  fields: {
    displayName: string;
    queryKey: string;
    color: string;
  }[];
}) {
  const [filterValues, setFilterValues] = useState<DateFilterValues>({
    duration: "1h",
  });

  const { data, error, isFetching } = useQuery({
    queryKey: ["sensorData", filterValues],
    queryFn: () =>
      fetchData(
        filterValues,
        fields.map((field) => field.queryKey),
      ),
    enabled: !!filterValues,
    refetchInterval: 5000,
  });

  return (
    <Card shadow="sm" padding="lg">
      <DateRangeForm onUpdate={setFilterValues} />
      {isFetching && <LoadingOverlay />}
      {error && <Text className="text-red-300">Error: {error.message}</Text>}
      {data ? (
        <LineChart
          h={300}
          data={data}
          dataKey="timestamp"
          withLegend
          series={fields.map((field) => ({
            name: field.queryKey,
            displayName: field.displayName,
            color: field.color,
          }))}
          curveType="linear"
          withDots={false}
          withXAxis={false}
        />
      ) : (
        <Text>No data yet.</Text>
      )}
    </Card>
  );
}
