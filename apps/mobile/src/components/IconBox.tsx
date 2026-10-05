import React from "react";
import { StyleSheet, View } from "react-native";
import { getToneColor, ThemeTone } from "../theme/colors";
import {
  HomeIcon,
  WrenchIcon,
  MessageIcon,
  ShieldIcon,
  MenuIcon,
  BellIcon,
  PlusIcon,
  CreditCardIcon,
  CalendarIcon,
  UsersIcon,
  CarIcon,
  FileTextIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  DropletIcon,
  PackageIcon,
  BuildingIcon,
  LogOutIcon,
  EditIcon,
  LockIcon
} from "./MobileIcons";

interface IconBoxProps {
  symbol: string;
  tone?: ThemeTone;
  size?: number;
}

export function IconBox({ symbol, tone = "emerald", size = 36 }: IconBoxProps) {
  const { main, light } = getToneColor(tone);
  const iconSize = Math.max(16, Math.round(size * 0.52));

  const renderIcon = () => {
    const s = symbol.trim();
    switch (s) {
      case "home":
      case "🏠":
        return <HomeIcon size={iconSize} color={main} />;
      case "wrench":
      case "maintenance":
      case "service":
      case "🔧":
      case "🛠️":
        return <WrenchIcon size={iconSize} color={main} />;
      case "chat":
      case "message":
      case "helpdesk":
      case "💬":
        return <MessageIcon size={iconSize} color={main} />;
      case "shield":
      case "security":
      case "visitor":
      case "visitors":
      case "🛡️":
      case "📹":
        return <ShieldIcon size={iconSize} color={main} />;
      case "menu":
      case "more":
      case "☰":
        return <MenuIcon size={iconSize} color={main} />;
      case "bell":
      case "notice":
      case "alert":
      case "📢":
      case "🔔":
        return <BellIcon size={iconSize} color={main} />;
      case "plus":
      case "+":
        return <PlusIcon size={iconSize} color={main} />;
      case "card":
      case "payment":
      case "due":
      case "💳":
        return <CreditCardIcon size={iconSize} color={main} />;
      case "amenity":
      case "calendar":
      case "booking":
      case "pool":
      case "🏊":
      case "📅":
        return <CalendarIcon size={iconSize} color={main} />;
      case "user":
      case "resident":
      case "household":
      case "family":
      case "👨‍👩‍👧‍👦":
      case "👥":
      case "👤":
        return <UsersIcon size={iconSize} color={main} />;
      case "car":
      case "vehicle":
      case "parking":
      case "cab":
      case "🚗":
      case "🚕":
        return <CarIcon size={iconSize} color={main} />;
      case "doc":
      case "document":
      case "file":
      case "rules":
      case "lease":
      case "📁":
      case "📄":
      case "📑":
      case "📋":
        return <FileTextIcon size={iconSize} color={main} />;
      case "water":
      case "leak":
      case "plumbing":
      case "💧":
        return <DropletIcon size={iconSize} color={main} />;
      case "package":
      case "delivery":
      case "box":
      case "📦":
        return <PackageIcon size={iconSize} color={main} />;
      case "building":
      case "estate":
      case "tower":
      case "🏢":
        return <BuildingIcon size={iconSize} color={main} />;
      case "logout":
      case "door":
      case "🚪":
        return <LogOutIcon size={iconSize} color={main} />;
      case "edit":
      case "pencil":
      case "✏️":
        return <EditIcon size={iconSize} color={main} />;
      case "lock":
      case "privacy":
      case "🔒":
        return <LockIcon size={iconSize} color={main} />;
      case "check":
      case "done":
      case "✅":
        return <CheckCircleIcon size={iconSize} color={main} />;
      case "warning":
      case "danger":
      case "⚠️":
        return <AlertCircleIcon size={iconSize} color={main} />;
      case "clock":
      case "time":
        return <ClockIcon size={iconSize} color={main} />;
      default:
        return <ShieldIcon size={iconSize} color={main} />;
    }
  };

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
      {renderIcon()}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)"
  }
});
