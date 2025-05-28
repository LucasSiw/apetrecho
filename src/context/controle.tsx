'use client';
import { useState } from 'react';
import { Label } from '@/components/ui/label'; 
import { Input } from '@/components/ui/input';

const formatCPF = (value: string) =>
  value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

const formatCNPJ = (value: string) =>
  value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');

const isCNPJ = (value: string) => value.replace(/\D/g, '').length > 11;

export function DocumentInput() {
  const [document, setDocument] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const formatted = isCNPJ(raw) ? formatCNPJ(raw) : formatCPF(raw);
    setDocument(formatted);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="document" className="text-sm">
        CPF ou CNPJ
      </Label>
      <Input
        id="document"
        type="text"
        inputMode="numeric"
        placeholder="Digite seu CPF ou CNPJ"
        value={document}
        onChange={handleChange}
        maxLength={18}
        required
        className="text-base"
      />
    </div>
  );
}

