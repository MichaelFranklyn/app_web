export interface CreateUserInput {
  name: string;
  email: string;
  role: string;
}

export interface CreateUserResponse {
  createUser: {
    status: boolean;
    code: number;
    message: string;
    data: {
      id: string;
      name: string;
      email: string;
      role: string;
      createdAt: string;
    } | null;
  };
}
