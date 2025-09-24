import React from "react";
import { ThemeProvider } from "styled-components";
import theme, { Global } from "./theme"; // default export = theme, named export = Global
import MovieRecommendationsUI from "@/components/MovieRecommendationsUI";

export default function StyledTmdbRecsApp() {
  return (
    <ThemeProvider theme={theme}>
      <Global />
      <MovieRecommendationsUI />
    </ThemeProvider>
  );
}
