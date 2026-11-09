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
      /** O email já trabalha em outro escritório: o cadastro virou convite. */
      isInvitationPending: boolean;
      createdAt: string;
    } | null;
  };
}
