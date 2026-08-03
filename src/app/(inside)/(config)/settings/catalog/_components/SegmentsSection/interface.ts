export interface SegmentNode {
  id: string;
  name: string;
}

export interface CreateClientSegmentResponse {
  createClientSegment: { status: boolean; message: string };
}

export interface UpdateClientSegmentResponse {
  updateClientSegment: { status: boolean; message: string };
}

export interface DeleteClientSegmentResponse {
  deleteClientSegment: { status: boolean; message: string };
}
