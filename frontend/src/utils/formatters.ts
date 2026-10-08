export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  const first = local[0];
  const last = local[local.length - 1];
  const asterisks = '*'.repeat(Math.max(local.length - 2, 4));
  return `${first}${asterisks}${last}@${domain}`;
}

export function maskPhone(phone: string): string {
  if (!phone) return phone;
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 4) return '****';
  const last4 = clean.slice(-4);
  return `******${last4}`;
}
