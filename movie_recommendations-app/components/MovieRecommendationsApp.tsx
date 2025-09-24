import React from "react";
import { ThemeProvider } from "styled-components";
import theme, { Global } from "@/components/theme"; // default export = theme, named export = Global
import MovieRecommendationsUI from "@/components/MovieRecommendationsUI";

export default function MovieRecommendationsApp() {
  return (
    <ThemeProvider theme={theme}>
      <Global />
      <MovieRecommendationsUI />
    </ThemeProvider>
  );
}
