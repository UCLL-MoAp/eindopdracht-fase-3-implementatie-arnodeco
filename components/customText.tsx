import React from "react";
import { Text as RNText, TextProps, StyleSheet } from "react-native";

interface CustomTextProps extends TextProps {
    weight?: "regular" | "bold";
}

export default function CustomText({ weight = "bold", style, ...props }: CustomTextProps) {
    return (
        <RNText
            {...props}
            style={[
                weight === "bold" ? { fontFamily: "MPLUSRounded-Bold" } : { fontFamily: "MPLUSRounded-Regular" }, // Apply weight-specific font
                style, // Allow inline style overrides
            ]}
        >
            {props.children}
        </RNText>
    );
}
