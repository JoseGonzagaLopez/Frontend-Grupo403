export type BookingStatus = "pending" | "confirmed" | "paid";

export interface Booking {
  id: number;
  date: string;
  time: string;
  status: BookingStatus;
  customerId: number;
  businessId: number;
  serviceName: string;
}

export interface CreateBookingDto {
  date: string;
  time: string;
  status: BookingStatus;
  customerId: number;
  businessId: number;
  serviceName: string;
}

export interface UpdateBookingDto {
  date?: string;
  time?: string;
  status?: BookingStatus;
  customerId?: number;
  businessId?: number;
  serviceName?: string;
}

export type PagoStatus = 'pending' | 'paid' | 'Por cobrar' | 'Pagado' | string;

export interface Pago {
  ID: number;
  customerId: number;
  businessId: number;
  Importe: number;
  Metodo: string;
  Fecha: string;
  Estado: string;
  Cliente?: string;
  Comercio?: string;
}

export type CreatePagoDto = {
  customerId: number;
  businessId: number;
  Importe: number;
  Metodo: string;
  Fecha: string;
  Estado: string;
};

export type UpdatePagoDto = Partial<CreatePagoDto>;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function getAppointments(): Promise<Booking[]> {
  const res = await fetch(`${API_URL}/appointments`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Error al obtener las reservas");
  }

  return res.json();
}

export async function getPagos(): Promise<Pago[]> {
  const res = await fetch(`${API_URL}/pagos`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Error al obtener los pagos");
  }

  return res.json();
}

export async function createAppointment(data: CreateBookingDto): Promise<Booking> {
  const res = await fetch(`${API_URL}/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Error al crear la reserva");
  }

  return res.json();
}

export async function updateAppointment(
  id: number,
  data: UpdateBookingDto
): Promise<Booking> {
  const res = await fetch(`${API_URL}/appointments/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Error al editar la reserva");
  }

  return res.json();
}

export async function deleteAppointment(
  id: number
): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/appointments/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Error al eliminar la reserva");
  }

  return res.json();
}

export type Customer = {
  id: number;
  Nombre: string;
  Telefono: string;
  Correo: string;
  appointments?: {
    businessId: number;
    negocio?: { Nombre: string };
  }[];
};

export type Business = {
  id: number;
  Nombre: string;
};

export type CreateCustomerDto = {
  Nombre: string;
  Telefono: string;
  Correo: string;
};

export type UpdateCustomerDto = Partial<CreateCustomerDto>;

// Funciones API (ajusta la URL a tu backend)
export async function getCustomers(): Promise<Customer[]> {
  const res = await fetch(`${API_URL}/clientes`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Error al obtener los clientes");
  }

  return res.json();
}

export async function getBusinesses(): Promise<Business[]> {
  const res = await fetch(`${API_URL}/negocios`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Error al obtener los negocios");
  }

  return res.json();
}

export async function createCustomer(data: CreateCustomerDto): Promise<Customer> {
  const res = await fetch(`${API_URL}/clientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear el cliente");
  return res.json();
}

export async function updateCustomer(id: number, data: UpdateCustomerDto): Promise<Customer> {
  const res = await fetch(`${API_URL}/clientes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar el cliente");
  return res.json();
}

export async function deleteCustomer(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/clientes/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar el cliente");
}

export async function createPago(data: CreatePagoDto): Promise<Pago> {
  const res = await fetch(`${API_URL}/pagos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear el pago");
  return res.json();
}

export async function updatePago(id: number, data: UpdatePagoDto): Promise<Pago> {
  const res = await fetch(`${API_URL}/pagos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar el pago");
  return res.json();
}

export async function deletePago(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/pagos/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar el pago");
}