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

  const [defaultFontSet, setDefaultFontSet] = useState(false);

  useEffect(() => {
    if (fontsLoaded && !defaultFontSet) {
      console.log("Fonts loaded!");
      (Text as any).defaultProps = (Text as any).defaultProps || {};
      (Text as any).defaultProps.style = {
        ...((Text as any).defaultProps.style || {}),
        fontFamily: "MPLUSRounded-Bold", // Set the default font
      };
      setDefaultFontSet(true); // Ensure this runs only once
    }
  }, [fontsLoaded, defaultFontSet]);

  if (!fontsLoaded) {
    return null;
  }


  return (

    <Stack screenOptions={{ headerShown: false }} />

  )


}
