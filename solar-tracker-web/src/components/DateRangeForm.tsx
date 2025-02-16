import { Button, Select, Group } from "@mantine/core";
import { DateInput, DateTimePicker } from "@mantine/dates";
import { useForm, zodResolver } from "@mantine/form";
import dayjs from "dayjs";
import { z } from "zod";

const schema = z
  .object({
    duration: z.enum(
      ["5m", "15m", "30m", "1h", "3h", "6h", "12h", "1d", "custom"],
      {
        required_error: "Duration is required",
      },
    ),
    startTime: z.coerce.date().optional(),
    endTime: z.coerce.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.duration === "custom") {
      if (!data.startTime) {
        ctx.addIssue({
          code: "custom",
          path: ["startTime"],
          message: "Start time is required",
        });
      }
      if (!data.endTime) {
        ctx.addIssue({
          code: "custom",
          path: ["endTime"],
          message: "End time is required",
        });
      }
      if (data.startTime && data.endTime && data.startTime >= data.endTime) {
        ctx.addIssue({
          code: "custom",
          path: ["endTime"],
          message: "End time must be after start time",
        });
      }
    }
  });

export type DateFilterValues = z.infer<typeof schema>;

const durationOptions = [
  { value: "5m", label: "5 Minutes" },
  { value: "15m", label: "15 Minutes" },
  { value: "30m", label: "30 Minutes" },
  { value: "1h", label: "1 Hour" },
  { value: "3h", label: "3 Hours" },
  { value: "6h", label: "6 Hours" },
  { value: "12h", label: "12 Hours" },
  { value: "1d", label: "1 Day" },
  { value: "custom", label: "Custom" },
];

export function DateRangeForm({
  onUpdate,
}: {
  onUpdate: (values: DateFilterValues) => void;
}) {
  const form = useForm({
    validate: zodResolver(schema),
    initialValues: {
      duration: "5m",
      startTime: dayjs().subtract(1, "hour").toDate(),
      endTime: dayjs().toDate(),
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        onUpdate(values as DateFilterValues);
      })}
    >
      <Group justify="flex-end" align="flex-end" mt="md">
        <Select
          key={form.key("duration")}
          label="Duration"
          placeholder="Select duration"
          data={durationOptions}
          {...form.getInputProps("duration")}
        />

        {form.values.duration === "custom" && (
          <>
            <DateTimePicker
              key={form.key("startTime")}
              label="Start Time"
              placeholder="Pick start time"
              {...form.getInputProps("startTime")}
              error={form.errors.startTime}
            />
            <DateTimePicker
              key={form.key("endTime")}
              label="End Time"
              placeholder="Pick end time"
              {...form.getInputProps("endTime")}
              error={form.errors.endTime}
            />
          </>
        )}

        <Button type="submit">Submit</Button>
      </Group>
    </form>
  );
}
