import { Stack } from "expo-router";
import "./globals.css"
import { useFonts } from "expo-font";
import { Text } from "react-native"
import { useEffect, useState } from "react";

export default function RootLayout() {

  const [fontsLoaded] = useFonts({
    "MPLUSRounded-Regular": require("../assets/fonts/MPLUSRounded1c-Regular.ttf"),
    "MPLUSRounded-Bold": require("../assets/fonts/MPLUSRounded1c-Bold.ttf"),
  });

  return (

    <Stack screenOptions={{ headerShown: false }} />

  )


}
