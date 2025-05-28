CREATE TABLE tbClientes (
    bdChave INT AUTO_INCREMENT PRIMARY KEY,
    bdNome VARCHAR(100) NOT NULL,
    bdEmail VARCHAR(100) UNIQUE NOT NULL,
    bdTelefone VARCHAR(20),
    bdcpf CHAR(14) UNIQUE,
    bdDTNASCIMENTO DATE,
    bdLogradouro VARCHAR(100) NOT NULL,
    bdNumero VARCHAR(10) NOT NULL,
    bdComplemento VARCHAR(50),
    bdBairro VARCHAR(50) NOT NULL,
    bdCidade VARCHAR(50) NOT NULL,
    bdEstado CHAR(2) NOT NULL,
    bdCEP CHAR(9) NOT NULL,
    bdDTCriacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    bdAtivo BOOLEAN DEFAULT TRUE
);

CREATE TABLE tbFerramentas (
    bdChave SERIAL PRIMARY KEY,
    bdChaveCli INT REFERENCES tbClientes(bdChave) ON DELETE CASCADE,
    bdNome VARCHAR(100) NOT NULL,
    bdDescricao TEXT,
    bdCategoria VARCHAR(50),
    bdURLIMG TEXT,
    bdPrecoAluguel NUMERIC(10, 2) NOT NULL,
    bdEstado ENUM('disponível', 'alugada', 'manutenção') DEFAULT 'disponível',
    bdDTCADASTRO TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    bdAtivo BOOLEAN DEFAULT TRUE
);

CREATE TABLE tbFerramentas_disponibilizadas (
    bdChave SERIAL PRIMARY KEY,
    bdChaveFer INT REFERENCES tbFerramentas(bdChave),
    bdChaveCli INT REFERENCES tbClientes(bdChave),
    bdPrecoAluguel NUMERIC(10, 2) NOT NULL,
    bdDTDISPONIBILIZACAO TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    bdAtivo BOOLEAN DEFAULT TRUE
);


CREATE TABLE tbAlugueis (
    bdChave SERIAL PRIMARY KEY,
    bdChaveCli INT REFERENCES tbClientes(bdChave),
    bdChaveFer INT REFERENCES tbFerramentas(bdChave),
    bdDTINICIO TIMESTAMP NOT NULL,
    bdDTFIM TIMESTAMP NULL,
    bdStatus ENUM('ativo', 'finalizado', 'cancelado') DEFAULT 'ativo',
    bdVlrTotal NUMERIC(10, 2)
);

CREATE TABLE tbLogAtividades (
    bdChave SERIAL PRIMARY KEY,
    bdChaveCli INT REFERENCES tbClientes(bdChave),
    bdAcao VARCHAR(255),
    bdDTHR TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    bdIPOrigm VARCHAR(45),
    bdNavegador TEXT
);