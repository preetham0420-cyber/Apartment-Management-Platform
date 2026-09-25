/**
 * Backend-ready service boundary.
 * Replace MockApartmentService with HttpApartmentService when the API is ready.
 */
export type CreateRequestInput = {
  category: string;
  location: string;
  description: string;
  priority: string;
};

export type CreateResidentInput = {
  name: string;
  flat: string;
  role: string;
  phone: string;
};

export type SendMessageInput = {
  conversationId: string;
  message: string;
  visibility: "private" | "group" | "service";
};

export interface ApartmentService {
  createMaintenanceRequest(input: CreateRequestInput): Promise<{ id: string }>;
  createResident(input: CreateResidentInput): Promise<{ id: string }>;
  approveVisitor(visitorId: string): Promise<void>;
  recordPayment(invoiceId: string): Promise<void>;
  sendMessage(input: SendMessageInput): Promise<{ id: string; sentAt: string }>;
}

class MockApartmentService implements ApartmentService {
  async createMaintenanceRequest() {
    await new Promise((resolve) => setTimeout(resolve, 450));
    return { id: `MR-${Math.floor(1050 + Math.random() * 400)}` };
  }

  async createResident() {
    await new Promise((resolve) => setTimeout(resolve, 450));
    return { id: `RES-${Math.floor(3000 + Math.random() * 900)}` };
  }

  async approveVisitor() {
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  async recordPayment() {
    await new Promise((resolve) => setTimeout(resolve, 450));
  }

  async sendMessage() {
    await new Promise((resolve) => setTimeout(resolve, 260));
    return { id: `MSG-${Date.now()}`, sentAt: new Date().toISOString() };
  }
}

export const apartmentService: ApartmentService = new MockApartmentService();

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
  timeoutMs: 12_000,
};
