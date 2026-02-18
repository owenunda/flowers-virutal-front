export enum Role {
  CLIENTE = 'CLIENTE',
  EMPLEADO = 'EMPLEADO',
  PROVEEDOR = 'PROVEEDOR',
}

export interface User {
  sub: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface LoginResponse {
  accessToken: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  basePrice: number;
  stock: number;
  providerId: string;
}

export interface Order {
  id: string;
  customerId: string;
  status: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  qty: number;
  unitPrice: number;
  product?: Product; // If expanded
}
