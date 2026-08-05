import { supabase } from "@/lib/supabase";

export async function fetchAllStores() {
  const { data, error } = await supabase.from("stores").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchAllUsers() {
  const { data, error } = await supabase.from("registered_users").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchAllSubscriptionOrders() {
  const { data, error } = await supabase.from("subscription_orders").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchAllPlans() {
  const { data, error } = await supabase.from("subscription_plans").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchAllProducts() {
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchAllOrders() {
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchAllInvoices() {
  const { data, error } = await supabase.from("invoices").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchAllCustomers() {
  const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchAllExpenses() {
  const { data, error } = await supabase.from("expenses").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchAllEmployees() {
  const { data, error } = await supabase.from("employees").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchAllActivityLog() {
  const { data, error } = await supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(200);
  if (error) throw error;
  return data || [];
}

export async function fetchStoreById(storeId: string) {
  const { data, error } = await supabase.from("stores").select("*").eq("id", storeId).single();
  if (error) throw error;
  return data;
}

export async function updateStore(storeId: string, fields: Partial<any>) {
  const { error } = await supabase.from("stores").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", storeId);
  if (error) throw error;
}

export async function deleteStore(storeId: string) {
  const { error } = await supabase.from("stores").delete().eq("id", storeId);
  if (error) throw error;
}

export async function updateUser(userId: string, fields: Partial<any>) {
  const { error } = await supabase.from("registered_users").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", userId);
  if (error) throw error;
}

export async function deleteUser(userId: string) {
  const { error } = await supabase.from("registered_users").delete().eq("id", userId);
  if (error) throw error;
}

export async function updateSubscriptionOrder(orderId: string, fields: Partial<any>) {
  const { error } = await supabase.from("subscription_orders").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", orderId);
  if (error) throw error;
}

export async function deleteSubscriptionOrder(orderId: string) {
  const { error } = await supabase.from("subscription_orders").delete().eq("id", orderId);
  if (error) throw error;
}

export async function createPlan(plan: Partial<any>) {
  const { data, error } = await supabase.from("subscription_plans").insert(plan).select().single();
  if (error) throw error;
  return data;
}

export async function updatePlan(planId: string, fields: Partial<any>) {
  const { error } = await supabase.from("subscription_plans").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", planId);
  if (error) throw error;
}

export async function deletePlan(planId: string) {
  const { error } = await supabase.from("subscription_plans").delete().eq("id", planId);
  if (error) throw error;
}

export async function updateProduct(productId: string, fields: Partial<any>) {
  const { error } = await supabase.from("products").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", productId);
  if (error) throw error;
}

export async function deleteProduct(productId: string) {
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) throw error;
}

export async function updateOrder(orderId: string, fields: Partial<any>) {
  const { error } = await supabase.from("orders").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", orderId);
  if (error) throw error;
}

export async function deleteOrder(orderId: string) {
  const { error } = await supabase.from("orders").delete().eq("id", orderId);
  if (error) throw error;
}

export async function updateInvoice(invoiceId: string, fields: Partial<any>) {
  const { error } = await supabase.from("invoices").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", invoiceId);
  if (error) throw error;
}

export async function deleteInvoice(invoiceId: string) {
  const { error } = await supabase.from("invoices").delete().eq("id", invoiceId);
  if (error) throw error;
}

export async function updateCustomer(customerId: string, fields: Partial<any>) {
  const { error } = await supabase.from("customers").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", customerId);
  if (error) throw error;
}

export async function deleteCustomer(customerId: string) {
  const { error } = await supabase.from("customers").delete().eq("id", customerId);
  if (error) throw error;
}

export async function updateExpense(expenseId: string, fields: Partial<any>) {
  const { error } = await supabase.from("expenses").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", expenseId);
  if (error) throw error;
}

export async function deleteExpense(expenseId: string) {
  const { error } = await supabase.from("expenses").delete().eq("id", expenseId);
  if (error) throw error;
}

export async function updateEmployee(employeeId: string, fields: Partial<any>) {
  const { error } = await supabase.from("employees").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", employeeId);
  if (error) throw error;
}

export async function deleteEmployee(employeeId: string) {
  const { error } = await supabase.from("employees").delete().eq("id", employeeId);
  if (error) throw error;
}
