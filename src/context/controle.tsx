'use client';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) {
    return false;
  }
  let sum = 0;
  let remainder;
  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cpf.substring(9, 10))) {
    return false;
  }
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cpf.substring(10, 11))) {
    return false;
  }
  return true;
};

const validateCNPJ = (cnpj: string): boolean => {
  cnpj = cnpj.replace(/[^\d]+/g, '');
  if (cnpj.length !== 14 || !!cnpj.match(/(\d)\1{13}/)) {
    return false;
  }
  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  const digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) {
    return false;
  }
  size = size + 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) {
    return false;
  }
  return true;
};

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
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const formatted = isCNPJ(raw) ? formatCNPJ(raw) : formatCPF(raw);
    setDocument(formatted);

    if (raw.length === 11) {
      setIsValid(validateCPF(raw));
    } else if (raw.length === 14) {
      setIsValid(validateCNPJ(raw));
    } else {
      setIsValid(null);
    }
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
        className={cn(
          "text-base",
          isValid === false && "border-red-500 focus-visible:ring-red-500", 
          isValid === true && "border-green-500 focus-visible:ring-green-500" 
        )}
      />
      {isValid === false && (
        <p className="text-sm text-red-500">CPF/CNPJ inválido.</p>
      )}
      {isValid === true && (
        <p className="text-sm text-green-500">CPF/CNPJ válido.</p>
      )}
    </div>
  );
}

export function InputTelefone() {
  const [telefone, setTelefone] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

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

    if (raw.length === 10 || raw.length === 11) {
      setIsValid(true); 
    } else {
      setIsValid(null);
    }
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
        className={cn(
          "text-base",
          isValid === false && "border-red-500 focus-visible:ring-red-500",
          isValid === true && "border-green-500 focus-visible:ring-green-500"
        )}
      />
      {isValid === false && (
        <p className="text-sm text-red-500">Telefone inválido.</p>
      )}
      {isValid === true && (
        <p className="text-sm text-green-500">Telefone válido.</p>
      )}
    </div>
  );
}

export function InputData() {
  const [data, setData] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '');

    if (raw.length > 8) raw = raw.slice(0, 8);

    const formatted = raw
      .replace(/^(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{4})$/, '$1');

    setData(formatted);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="data" className="text-sm">
        Data de Nascimento
      </Label>
      <Input
        id="data"
        type="text"
        inputMode="numeric"
        placeholder="DD/MM/AAAA"
        value={data}
        onChange={handleChange}
        maxLength={10}
        required
        className="text-base"
      />
    </div>
  );
}

export function InputCEP() {
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAddress = async (cepValue: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`);
      const data = await response.json();

      if (data.erro) {
        setError('CEP não encontrado.');
        setAddress('');
        setNeighborhood('');
        setCity('');
        setState('');
      } else {
        setAddress(data.logradouro || '');
        setNeighborhood(data.bairro || '');
        setCity(data.localidade || '');
        setState(data.uf || '');
      }
    } catch (err) {
      setError('Erro ao buscar CEP. Tente novamente.');
      setAddress('');
      setNeighborhood('');
      setCity('');
      setState('');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '');

    if (raw.length > 8) raw = raw.slice(0, 8);

    const formatted = raw.replace(/^(\d{5})(\d)/, '$1-$2');

    setCep(formatted);

    if (raw.length === 8) {
      fetchAddress(raw);
    } else {
      setAddress('');
      setNeighborhood('');
      setCity('');
      setState('');
      setError('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cep" className="text-sm">
          CEP
        </Label>
        <Input
          id="cep"
          type="text"
          inputMode="numeric"
          placeholder="00000-000"
          value={cep}
          onChange={handleChange}
          maxLength={9}
          required
          className="text-base"
          disabled={loading}
        />
        {loading && <p className="text-sm text-gray-500">Buscando endereço...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address" className="text-sm">
          Endereço
        </Label>
        <Input
          id="address"
          type="text"
          placeholder="Rua, Avenida..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          className="text-base"
          readOnly={loading || !!address} 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="number" className="text-sm">
          Número
        </Label>
        <Input
          id="number"
          type="text"
          placeholder="123"
          required
          className="text-base"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="neighborhood" className="text-sm">
          Bairro
        </Label>
        <Input
          id="neighborhood"
          type="text"
          placeholder="Centro, Jardim..."
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          required
          className="text-base"
          readOnly={loading || !!neighborhood}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="city" className="text-sm">
          Cidade
        </Label>
        <Input
          id="city"
          type="text"
          placeholder="São Paulo, Rio de Janeiro..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          className="text-base"
          readOnly={loading || !!city}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="state" className="text-sm">
          Estado (UF)
        </Label>
        <Input
          id="state"
          type="text"
          placeholder="SP, RJ..."
          value={state}
          onChange={(e) => setState(e.target.value)}
          maxLength={2}
          required
          className="text-base"
          readOnly={loading || !!state}
        />
      </div>
    </div>
  );
}