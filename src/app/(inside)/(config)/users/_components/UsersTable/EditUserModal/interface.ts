import { User } from "../../../interface";

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: string;
}


export interface UpdateUserResponse {
  updateUser: {
    status: boolean;
    code: number;
    message: string;
    data: {
      id: string;
    } | null;
  };
}

export interface EditUserModalProps {
  user: User;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUpdateOptimistic: (id: string, updates: Partial<User>) => void;
  onRollback: () => void;
  onCommit: () => void;
}
