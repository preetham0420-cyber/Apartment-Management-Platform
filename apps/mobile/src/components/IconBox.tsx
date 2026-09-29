import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { getToneColor, ThemeTone } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

interface IconBoxProps {
  symbol: string;
  tone?: ThemeTone;
  size?: number;
}

export function IconBox({ symbol, tone = "blue", size = 36 }: IconBoxProps) {
  const { main, light } = getToneColor(tone);

  return (
    <View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: light
        }
      ]}
    >
      <Text style={[styles.symbolText, { color: main }]}>{symbol}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    justifyContent: "center"
  },
  symbolText: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.bold
  }
});
