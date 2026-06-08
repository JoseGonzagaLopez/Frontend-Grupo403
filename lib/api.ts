export type BookingStatus = "pending" | "confirmed" | "paid" | "completed" | "no_show" | "cancelled";

export interface Booking {
  id: number;
  date: string;
  time: string;
  status: BookingStatus;
  customerId: number;
  businessId: number;
  serviceName: string;
  importe: number;
}

export interface CreateBookingDto {
  date: string;
  time: string;
  status: BookingStatus;
  customerId: number;
  businessId: number;
  serviceName: string;
  importe: number;
}

export interface UpdateBookingDto {
  date?: string;
  time?: string;
  status?: BookingStatus;
  customerId?: number;
  businessId?: number;
  serviceName?: string;
  importe?: number;
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

export type Service = {
  id: number;
  nombre: string;
  precio: number;
  duracion?: number;
  descripcion?: string;
  businessId: number;
};

export type CreateServiceDto = {
  nombre: string;
  precio: number;
  duracion?: number;
  descripcion?: string;
  businessId: number;
};

export type UpdateServiceDto = Partial<Omit<CreateServiceDto, "businessId">>;

export type Resena = {
  id: number;
  businessId: number;
  customerId?: number;
  appointmentId?: number;
  clienteNombre?: string;
  puntuacion: number;
  comentario?: string;
  fecha?: string;
};

export type CreateResenaDto = {
  businessId: number;
  customerId?: number;
  appointmentId?: number;
  clienteNombre?: string;
  puntuacion: number;
  comentario?: string;
};

export type ProfileChangeRequest = {
  id: number;
  businessId: number | null;
  cambios: Record<string, any>;
  estado: "pending" | "approved" | "rejected";
  createdAt?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function getAppointments(): Promise<Booking[]> {
  const res = await fetch(`${API_URL}/appointments`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener las reservas");
  return res.json();
}

export async function getPagos(): Promise<Pago[]> {
  const res = await fetch(`${API_URL}/pagos`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener los pagos");
  return res.json();
}

export async function createAppointment(data: CreateBookingDto): Promise<Booking> {
  const res = await fetch(`${API_URL}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear la reserva");
  return res.json();
}

export async function updateAppointment(id: number, data: UpdateBookingDto): Promise<Booking> {
  const res = await fetch(`${API_URL}/appointments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al editar la reserva");
  return res.json();
}

export async function deleteAppointment(id: number): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/appointments/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar la reserva");
  return res.json();
}

export type Customer = {
  id: number;
  Nombre: string;
  Telefono: string;
  Correo: string;
  username?: string;
  password?: string;
  appointments?: {
    businessId: number;
    negocio?: { Nombre: string };
  }[];
};

export type Business = {
  id: number;
  Nombre: string;
  Localicacion?: string;
  Telefono?: string;
  Correo?: string;
  password?: string;
  descripcion?: string;
  tipoNegocio?: string;
  fotoUrl?: string;
  bannerUrl?: string;
};

export type CreateBusinessDto = {
  Nombre: string;
  Localicacion?: string;
  Telefono?: string;
  Correo?: string;
  password?: string;
  descripcion?: string;
  tipoNegocio?: string;
  fotoUrl?: string;
  bannerUrl?: string;
};

export type UpdateBusinessDto = Partial<CreateBusinessDto>;

export type RegisterBusinessDto = {
  Nombre: string;
  Telefono?: string;
  Correo: string;
  Localicacion?: string;
  password?: string;
};

export type CreateCustomerDto = {
  Nombre: string;
  Telefono: string;
  Correo: string;
  username?: string;
  password?: string;
};

export type UpdateCustomerDto = Partial<CreateCustomerDto>;

export async function getCustomers(): Promise<Customer[]> {
  const res = await fetch(`${API_URL}/clientes`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener los clientes");
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

export async function getBusinesses(): Promise<Business[]> {
  const res = await fetch(`${API_URL}/negocios`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al obtener los negocios');
  return res.json();
}

export async function createBusiness(data: CreateBusinessDto): Promise<Business> {
  const res = await fetch(`${API_URL}/negocios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear el negocio");
  return res.json();
}

export async function updateBusiness(id: number, data: UpdateBusinessDto): Promise<Business> {
  const res = await fetch(`${API_URL}/negocios/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar el negocio");
  return res.json();
}

export async function deleteBusiness(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/negocios/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar el negocio");
}

// Login cliente: acepta username O correo electronico
export async function loginCustomer(identifier: string, password?: string): Promise<Customer> {
  const res = await fetch(`${API_URL}/clientes/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  if (!res.ok) throw new Error("Credenciales incorrectas.");
  return res.json();
}

export async function loginCustomerGoogle(token: string): Promise<Customer> {
  const res = await fetch(`${API_URL}/clientes/google-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) {
    let msg = "Error al iniciar sesión con Google.";
    try { const body = await res.json(); msg = body.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function registerCustomer(data: CreateCustomerDto): Promise<Customer> {
  const res = await fetch(`${API_URL}/clientes/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let msg = "Error al registrar el cliente. Quizas el correo ya exista.";
    try { const body = await res.json(); msg = body.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function loginBusiness(Correo: string, password: string): Promise<Business> {
  const res = await fetch(`${API_URL}/negocios/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Correo, password }),
  });
  if (!res.ok) {
    let msg = "Credenciales incorrectas. Verifica tu correo y contrasena.";
    try { const body = await res.json(); msg = body.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export type RegisterBusinessResponse = {
  message: string;
};

export async function registerBusiness(data: RegisterBusinessDto): Promise<RegisterBusinessResponse> {
  const res = await fetch(`${API_URL}/negocios/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let msg = "Error al registrar el negocio. Quizas el correo ya exista.";
    try { const body = await res.json(); msg = body.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// ── SERVICIOS ─────────────────────────────────────────────────────────────────────────────────

export async function getServices(businessId: number): Promise<Service[]> {
  const res = await fetch(`${API_URL}/servicios?businessId=${businessId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener los servicios");
  return res.json();
}

export async function createService(data: CreateServiceDto): Promise<Service> {
  const res = await fetch(`${API_URL}/servicios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear el servicio");
  return res.json();
}

export async function updateService(id: number, data: UpdateServiceDto): Promise<Service> {
  const res = await fetch(`${API_URL}/servicios/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar el servicio");
  return res.json();
}

export async function deleteService(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/servicios/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar el servicio");
}

// ── RESENAS ───────────────────────────────────────────────────────────────────────────────────

export async function getResenas(businessId?: number): Promise<Resena[]> {
  const url = businessId
    ? `${API_URL}/resenas?businessId=${businessId}`
    : `${API_URL}/resenas`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener las resenas");
  return res.json();
}

export async function getResenaByAppointment(appointmentId: number): Promise<Resena | null> {
  const res = await fetch(`${API_URL}/resenas/appointment/${appointmentId}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Error al obtener la resena");
  return res.json();
}

export async function createResena(data: CreateResenaDto): Promise<Resena> {
  const res = await fetch(`${API_URL}/resenas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear la resena");
  return res.json();
}

export async function deleteResena(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/resenas/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar la resena");
}

// ── SOLICITUDES DE CAMBIO DE PERFIL ────────────────────────────────────────────────────

export async function submitProfileChange(businessId: number, cambios: Record<string, any>): Promise<void> {
  const res = await fetch(`${API_URL}/negocios/${businessId}/solicitudes-perfil`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cambios }),
  });
  if (!res.ok) {
    let msg = "Error al enviar la solicitud.";
    try { const body = await res.json(); msg = body.message || msg; } catch {}
    throw new Error(msg);
  }
}

export async function getPendingProfileChanges(): Promise<ProfileChangeRequest[]> {
  const res = await fetch(`${API_URL}/solicitudes-perfil?estado=pending`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener las solicitudes");
  return res.json();
}

export async function approveProfileChange(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/solicitudes-perfil/${id}/aprobar`, { method: "PATCH" });
  if (!res.ok) throw new Error("Error al aprobar el cambio");
}

export async function rejectProfileChange(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/solicitudes-perfil/${id}/rechazar`, { method: "PATCH" });
  if (!res.ok) throw new Error("Error al rechazar el cambio");
}

// ── SORTEOS ───────────────────────────────────────────────────────────────────────────────────

export type Sorteo = {
  id: number;
  businessId: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  minReservasPrevias: number;
  minGastoPrevio: number;
  condicionReservasDurante: number;
  serviciosValidosId: string | null;
  premioServicioId: number;
  premioDescuento: number;
  cantidadGanadores: number;
  estado: string;
  servicioPremio?: Service;
};

export type CreateSorteoDto = {
  businessId: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  minReservasPrevias?: number;
  minGastoPrevio?: number;
  condicionReservasDurante?: number;
  serviciosValidosId?: string;
  premioServicioId: number;
  premioDescuento: number;
  cantidadGanadores: number;
};

export type GanadorSorteo = {
  id: number;
  sorteoId: number;
  customerId: number;
  fechaGanado: string;
  premioReclamado: boolean;
  sorteo?: Sorteo;
};

export async function createSorteo(data: CreateSorteoDto): Promise<Sorteo> {
  const res = await fetch(`${API_URL}/sorteos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear el sorteo");
  return res.json();
}

export async function getSorteos(businessId?: number): Promise<Sorteo[]> {
  const url = businessId ? `${API_URL}/sorteos?businessId=${businessId}` : `${API_URL}/sorteos`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener los sorteos");
  return res.json();
}

export async function getMisPremios(customerId: number): Promise<GanadorSorteo[]> {
  const res = await fetch(`${API_URL}/ganadores/${customerId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener los premios");
  return res.json();
}

export async function reclamarPremio(id: number): Promise<GanadorSorteo> {
  const res = await fetch(`${API_URL}/ganadores/${id}/reclamar`, { method: "POST" });
  if (!res.ok) throw new Error("Error al reclamar el premio");
  return res.json();
}
