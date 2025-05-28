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

export function InputCNPJCPF() {
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

export function InputTelefone() {
  const [telefone, setTelefone] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '');

    if (raw.length > 11) raw = raw.slice(0, 11);

    let formatted = raw;

    if (raw.length <= 10) {
      formatted = raw
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      formatted = raw
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }

    setTelefone(formatted);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="telefone" className="text-sm">
        Telefone
      </Label>
      <Input
        id="telefone"
        type="text"
        inputMode="numeric"
        placeholder="(11) 91234-5678"
        value={telefone}
        onChange={handleChange}
        maxLength={15}
        required
        className="text-base"
      />
    </div>
  );
}