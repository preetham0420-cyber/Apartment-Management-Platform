import React from "react";
import { Platform } from "react-native";
import Svg, {
  Path as SvgPath,
  Circle as SvgCircle,
  Polyline as SvgPolyline,
  Line as SvgLine,
  Rect as SvgRect
} from "react-native-svg";

export interface MobileIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

function renderNativeChild(
  child: React.ReactElement,
  index: number,
  defaultColor: string,
  defaultStrokeWidth: number
): React.ReactElement | null {
  if (!child || !React.isValidElement(child)) return null;

  const type = typeof child.type === "string" ? child.type.toLowerCase() : "";
  const childProps: any = child.props || {};

  const commonProps = {
    key: child.key || String(index),
    stroke: childProps.stroke || defaultColor,
    strokeWidth: childProps.strokeWidth !== undefined ? childProps.strokeWidth : defaultStrokeWidth,
    strokeLinecap: childProps.strokeLinecap || ("round" as const),
    strokeLinejoin: childProps.strokeLinejoin || ("round" as const),
    fill: childProps.fill || "none"
  };

  switch (type) {
    case "path":
      return <SvgPath {...commonProps} d={childProps.d} />;
    case "circle":
      return (
        <SvgCircle
          {...commonProps}
          cx={childProps.cx}
          cy={childProps.cy}
          r={childProps.r}
        />
      );
    case "polyline":
      return <SvgPolyline {...commonProps} points={childProps.points} />;
    case "line":
      return (
        <SvgLine
          {...commonProps}
          x1={childProps.x1}
          y1={childProps.y1}
          x2={childProps.x2}
          y2={childProps.y2}
        />
      );
    case "rect":
      return (
        <SvgRect
          {...commonProps}
          x={childProps.x}
          y={childProps.y}
          width={childProps.width}
          height={childProps.height}
          rx={childProps.rx}
          ry={childProps.ry}
        />
      );
    default:
      return null;
  }
}

function svg(
  size: number,
  color: string,
  strokeWidth: number,
  ...elements: React.ReactElement[]
) {
  if (Platform.OS === "web") {
    return React.createElement(
      "svg",
      {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: color,
        strokeWidth,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        style: { display: "inline-block", verticalAlign: "middle" }
      },
      ...elements
    );
  }

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {elements.map((el, i) => renderNativeChild(el, i, color, strokeWidth))}
    </Svg>
  );
}

export function HomeIcon({ size = 20, color = "currentColor", strokeWidth = 2 }: MobileIconProps) {
  return svg(
    size,
    color,
    strokeWidth,
    React.createElement("path", { key: "1", d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }),
    React.createElement("polyline", { key: "2", points: "9 22 9 12 15 12 15 22" })
  );
}

export function WrenchIcon({ size = 20, color = "currentColor", strokeWidth = 2 }: MobileIconProps) {
  return svg(
    size,
    color,
    strokeWidth,
    React.createElement("path", {
      key: "1",
      d: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
    })
  );
}

export function MessageIcon({ size = 20, color = "currentColor", strokeWidth = 2 }: MobileIconProps) {
  return svg(
    size,
    color,
    strokeWidth,
    React.createElement("path", {
      key: "1",
      d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
    })
  );
}

export function ShieldIcon({ size = 20, color = "currentColor", strokeWidth = 2 }: MobileIconProps) {
  return svg(
    size,
    color,
    strokeWidth,
    React.createElement("path", { key: "1", d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" })
  );
}

export function MenuIcon({ size = 20, color = "currentColor", strokeWidth = 2 }: MobileIconProps) {
  return svg(
    size,
    color,
    strokeWidth,
    React.createElement("line", { key: "1", x1: "3", y1: "12", x2: "21", y2: "12" }),
    React.createElement("line", { key: "2", x1: "3", y1: "6", x2: "21", y2: "6" }),
    React.createElement("line", { key: "3", x1: "3", y1: "18", x2: "21", y2: "18" })
  );
}

export function BellIcon({ size = 20, color = "currentColor", strokeWidth = 2 }: MobileIconProps) {
  return svg(
    size,
    color,
    strokeWidth,
    React.createElement("path", { key: "1", d: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" }),
    React.createElement("path", { key: "2", d: "M13.73 21a2 2 0 0 1-3.46 0" })
  );
}

export function PlusIcon({ size = 20, color = "currentColor", strokeWidth = 2 }: MobileIconProps) {
  return svg(
    size,
    color,
    strokeWidth,
    React.createElement("line", { key: "1", x1: "12", y1: "5", x2: "12", y2: "19" }),
    React.createElement("line", { key: "2", x1: "5", y1: "12", x2: "19", y2: "12" })
  );
}

export function CreditCardIcon({ size = 20, color = "currentColor", strokeWidth = 2 }: MobileIconProps) {
  return svg(
    size,
    color,
    strokeWidth,
    React.createElement("rect", { key: "1", x: "1", y: "4", width: "22", height: "16", rx: "2", ry: "2" }),
    React.createElement("line", { key: "2", x1: "1", y1: "10", x2: "23", y2: "10" })
  );
}

export function CalendarIcon({ size = 20, color = "currentColor", strokeWidth = 2 }: MobileIconProps) {
  return svg(
    size,
    color,
    strokeWidth,
    React.createElement("rect", { key: "1", x: "3", y: "4", width: "18", height: "18", rx: "2", ry: "2" }),
    React.createElement("line", { key: "2", x1: "16", y1: "2", x2: "16", y2: "6" }),
    React.createElement("line", { key: "3", x1: "8", y1: "2", x2: "8", y2: "6" }),
    React.createElement("line", { key: "4", x1: "3", y1: "10", x2: "21", y2: "10" })
  );
}

export function UsersIcon({ size = 20, color = "currentColor", strokeWidth = 2 }: MobileIconProps) {
  return svg(
    size,
    color,
    strokeWidth,
    React.createElement("path", { key: "1", d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" }),
    React.createElement("circle", { key: "2", cx: "9", cy: "7", r: "4" }),
    React.createElement("path", { key: "3", d: "M23 21v-2a4 4 0 0 0-3-3.87" }),
    React.createElement("path", { key: "4", d: "M16 3.13a4 4 0 0 1 0 7.75" })
  );
}

export function CarIcon({ size = 20, color = "currentColor", strokeWidth = 2 }: MobileIconProps) {
  return svg(
    size,
    color,
    strokeWidth,
    React.createElement("path", {
      key: "1",
      d: "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9L2 12v4c0 .6.4 1 1 1h2"
    }),
    React.createElement("circle", { key: "2", cx: "7", cy: "17", r: "2" }),
    React.createElement("path", { key: "3", d: "M9 17h6" }),
    React.createElement("circle", { key: "4", cx: "17", cy: "17", r: "2" })
  );
}

export function FileTextIcon({ size = 20, color = "currentColor", strokeWidth = 2 }: MobileIconProps) {
  return svg(
    size,
    color,
    strokeWidth,
    React.createElement("path", { key: "1", d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
    React.createElement("polyline", { key: "2", points: "14 2 14 8 20 8" }),
    React.createElement("line", { key: "3", x1: "16", y1: "13", x2: "8", y2: "13" }),
    React.createElement("line", { key: "4", x1: "16", y1: "17", x2: "8", y2: "17" }),
    React.createElement("polyline", { key: "5", points: "10 9 9 9 8 9" })
  );
}

export function AlertCircleIcon({ size = 20, color = "currentColor", strokeWidth = 2 }: MobileIconProps) {
  return svg(
    size,
    color,
    strokeWidth,
    React.createElement("circle", { key: "1", cx: "12", cy: "12", r: "10" }),
    React.createElement("line", { key: "2", x1: "12", y1: "8", x2: "12", y2: "12" }),
    React.createElement("line", { key: "3", x1: "12", y1: "16", x2: "12.01", y2: "16" })
  );
}

export function CheckCircleIcon({ size = 20, color = "currentColor", strokeWidth = 2 }: MobileIconProps) {
  return svg(
    size,
    color,
    strokeWidth,
    React.createElement("path", { key: "1", d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }),
    React.createElement("polyline", { key: "2", points: "22 4 12 14.01 9 11.01" })
  );
}

export function ClockIcon({ size = 20, color = "currentColor", strokeWidth = 2 }: MobileIconProps) {
  return svg(
    size,
    color,
    strokeWidth,
    React.createElement("circle", { key: "1", cx: "12", cy: "12", r: "10" }),
    React.createElement("polyline", { key: "2", points: "12 6 12 12 16 14" })
  );
}

export function DropletIcon({ size = 20, color = "currentColor", strokeWidth = 2 }: MobileIconProps) {
  return svg(
    size,
    color,
    strokeWidth,
    React.createElement("path", { key: "1", d: "M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" })
  );
}

export function PackageIcon({ size = 20, color = "currentColor", strokeWidth = 2 }: MobileIconProps) {
  return svg(
    size,
    color,
    strokeWidth,
    React.createElement("line", { key: "1", x1: "16.5", y1: "9.4", x2: "7.5", y2: "4.21" }),
    React.createElement("path", {
      key: "2",
      d: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
    }),
    React.createElement("polyline", { key: "3", points: "3.27 6.96 12 12.01 20.73 6.96" }),
    React.createElement("line", { key: "4", x1: "12", y1: "22.08", x2: "12", y2: "12" })
  );
}

export function BuildingIcon({ size = 20, color = "currentColor", strokeWidth = 2 }: MobileIconProps) {
  return svg(
    size,
    color,
    strokeWidth,
    React.createElement("line", { key: "1", x1: "4", y1: "21", x2: "20", y2: "21" }),
    React.createElement("path", { key: "2", d: "M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" }),
    React.createElement("line", { key: "3", x1: "9", y1: "8", x2: "10", y2: "8" }),
    React.createElement("line", { key: "4", x1: "14", y1: "8", x2: "15", y2: "8" }),
    React.createElement("line", { key: "5", x1: "9", y1: "12", x2: "10", y2: "12" }),
    React.createElement("line", { key: "6", x1: "14", y1: "12", x2: "15", y2: "12" }),
    React.createElement("line", { key: "7", x1: "9", y1: "16", x2: "10", y2: "16" }),
    React.createElement("line", { key: "8", x1: "14", y1: "16", x2: "15", y2: "16" })
  );
}

export function LogOutIcon({ size = 20, color = "currentColor", strokeWidth = 2 }: MobileIconProps) {
  return svg(
    size,
    color,
    strokeWidth,
    React.createElement("path", { key: "1", d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }),
    React.createElement("polyline", { key: "2", points: "16 17 21 12 16 7" }),
    React.createElement("line", { key: "3", x1: "21", y1: "12", x2: "9", y2: "12" })
  );
}

export function EditIcon({ size = 20, color = "currentColor", strokeWidth = 2 }: MobileIconProps) {
  return svg(
    size,
    color,
    strokeWidth,
    React.createElement("path", { key: "1", d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" }),
    React.createElement("path", { key: "2", d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" })
  );
}

export function LockIcon({ size = 20, color = "currentColor", strokeWidth = 2 }: MobileIconProps) {
  return svg(
    size,
    color,
    strokeWidth,
    React.createElement("rect", { key: "1", x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" }),
    React.createElement("path", { key: "2", d: "M7 11V7a5 5 0 0 1 10 0v4" })
  );
}

export function ChevronRightIcon({ size = 20, color = "currentColor", strokeWidth = 2 }: MobileIconProps) {
  return svg(
    size,
    color,
    strokeWidth,
    React.createElement("polyline", { key: "1", points: "9 18 15 12 9 6" })
  );
}

export function SearchIcon({ size = 20, color = "currentColor", strokeWidth = 2 }: MobileIconProps) {
  return svg(
    size,
    color,
    strokeWidth,
    React.createElement("circle", { key: "1", cx: "11", cy: "11", r: "8" }),
    React.createElement("line", { key: "2", x1: "21", y1: "21", x2: "16.65", y2: "16.65" })
  );
}

export function RefreshCwIcon({ size = 20, color = "currentColor", strokeWidth = 2 }: MobileIconProps) {
  return svg(
    size,
    color,
    strokeWidth,
    React.createElement("polyline", { key: "1", points: "23 4 23 10 17 10" }),
    React.createElement("polyline", { key: "2", points: "1 20 1 14 7 14" }),
    React.createElement("path", { key: "3", d: "M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" })
  );
}

export function CloseIcon({ size = 20, color = "currentColor", strokeWidth = 2 }: MobileIconProps) {
  return svg(
    size,
    color,
    strokeWidth,
    React.createElement("line", { key: "1", x1: "18", y1: "6", x2: "6", y2: "18" }),
    React.createElement("line", { key: "2", x1: "6", y1: "6", x2: "18", y2: "18" })
  );
}
