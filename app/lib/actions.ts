'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
  frecuency:z.string(),
  code:z.string()
});

const CustomerFormSchema = z.object({
  id: z.string(),
  name:z.string(),
  phone:z.coerce.number(),
  cedula:z.string(),
  direccion:z.string(),
  barrio:z.string()
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
const CreateCustomer = CustomerFormSchema.omit({ id: true});


export async function createInvoice(formData: FormData) {
  const { customerId, amount, status,frecuency,code } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
    frecuency: formData.get('frecuency'),
    code:formData.get('invoice_code')
  });

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  await sql`
  INSERT INTO invoices (customer_id, amount, status, date, frecuency, code)
  VALUES (${customerId}, ${amountInCents}, ${status}, ${date}, ${frecuency}, ${code})
`;

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function createCustomer(formData: FormData) {

  console.log(formData);

  const { name,phone,cedula,direccion,barrio } = CreateCustomer.parse({
    name: formData.get('name'),
    phone: formData.get('phone'),
    cedula: formData.get('cedula'),
    direccion: formData.get('direccion'),
    barrio: formData.get('barrio')
  });

//   const amountInCents = amount * 100;
//   const date = new Date().toISOString().split('T')[0];

  await sql`
  INSERT INTO customers (name, phone, cedula,direccion,barrio)
  VALUES (${name}, ${phone}, ${cedula}, ${direccion},${barrio})
`;

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}


export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
 
  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}