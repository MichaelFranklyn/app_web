import { CompanyClientLink } from "../../interface";

export interface UpdateCompanyClientResponse {
  updateCompanyClient: {
    status: boolean;
    message: string;
    data: CompanyClientLink | null;
  };
}
