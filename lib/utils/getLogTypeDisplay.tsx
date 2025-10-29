import {
  Activity,
  CheckCircle,
  FileEdit,
  Trash2,
  Eye,
  User,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CommunicationLog } from "../types";

export const ENTITY_TYPE_CONFIG = {
  BATCH: { icon: Activity, label: "Batch" },
  STUDENT: { icon: User, label: "Student" },
  PAYMENT: { icon: CheckCircle, label: "Payment" },
  FEE: { icon: FileEdit, label: "Fee" },
  OTHER: { icon: Activity, label: "Other" },
};

export function getLogDisplay(log: CommunicationLog) {
  const type = log?.type?.toUpperCase() || "";

  const entity =
    Object.keys(ENTITY_TYPE_CONFIG).find((ent) => type.includes(ent)) ||
    "OTHER";

  const { icon: EntityIcon, label } =
    ENTITY_TYPE_CONFIG[entity as keyof typeof ENTITY_TYPE_CONFIG];

  let action = "Action";
  let ActionIcon = Activity;

  if (type.includes("CREATE") || type.includes("ADD")) {
    action = "Added";
    ActionIcon = CheckCircle;
  } else if (type.includes("UPDATE") || type.includes("EDIT")) {
    action = "Updated";
    ActionIcon = FileEdit;
  } else if (type.includes("DELETE") || type.includes("REMOVE")) {
    action = "Deleted";
    ActionIcon = Trash2;
  } else if (type.includes("VIEW")) {
    action = "Viewed";
    ActionIcon = Eye;
  } else if (type.includes("LOGIN")) {
    action = "Logged In";
    ActionIcon = User;
  } else if (type.includes("LOGOUT")) {
    action = "Logged Out";
    ActionIcon = UserPlus;
  }

  const actionColor =
    action === "Added"
      ? "text-green-400"
      : action === "Updated"
      ? "text-yellow-400"
      : action === "Deleted"
      ? "text-red-400"
      : "text-blue-300";

  return (
    <div className="flex items-center gap-2">
      <Badge className="bg-blue-500/20 text-blue-300 border-0 text-xs flex items-center gap-1">
        <EntityIcon className="w-3.5 h-3.5 text-blue-300" />
        {label}
      </Badge>
      <span className={`flex items-center gap-1 text-xs ${actionColor}`}>
        <ActionIcon className={`w-3.5 h-3.5 ${actionColor}`} />
        {action}
      </span>
    </div>
  );
}
