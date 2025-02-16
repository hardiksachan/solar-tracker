import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";

import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import { Providers } from "@/components/Providers";

export const metadata = {
  title: "Solar Tracker Dashboard",
  description: "Solar tracker dashboard for monitoring solar panel data",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <Providers>
          <MantineProvider defaultColorScheme="dark">
            {children}
          </MantineProvider>
        </Providers>
      </body>
    </html>
  );
}

