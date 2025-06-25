-- CreateTable
CREATE TABLE `tbClientes` (
    `bdChave` INTEGER NOT NULL AUTO_INCREMENT,
    `bdNome` VARCHAR(100) NOT NULL,
    `bdEmail` VARCHAR(100) NOT NULL,
    `bdTelefone` VARCHAR(20) NULL,
    `bdcpf` CHAR(14) NULL,
    `bdDTNASCIMENTO` DATE NULL,
    `bdLogradouro` VARCHAR(100) NOT NULL,
    `bdNumero` VARCHAR(10) NOT NULL,
    `bdComplemento` VARCHAR(50) NULL,
    `bdBairro` VARCHAR(50) NOT NULL,
    `bdCidade` VARCHAR(50) NOT NULL,
    `bdEstado` CHAR(2) NOT NULL,
    `bdCEP` CHAR(9) NOT NULL,
    `bdDTCriacao` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `bdAtivo` BOOLEAN NULL DEFAULT true,
    `bdSenha` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `tbClientes_bdEmail_key`(`bdEmail`),
    UNIQUE INDEX `tbClientes_bdcpf_key`(`bdcpf`),
    PRIMARY KEY (`bdChave`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbFerramentas` (
    `bdChave` BIGINT NOT NULL AUTO_INCREMENT,
    `bdChaveCli` INTEGER NULL,
    `bdNome` VARCHAR(100) NOT NULL,
    `bdDescricao` TEXT NULL,
    `bdCategoria` VARCHAR(50) NULL,
    `bdURLIMG` TEXT NULL,
    `bdImagens` LONGTEXT NULL,
    `bdPrecoAluguel` DECIMAL(10, 2) NOT NULL,
    `bdEstado` VARCHAR(20) NULL DEFAULT 'disponível',
    `bdDTCADASTRO` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `bdAtivo` BOOLEAN NULL DEFAULT true,
    `bdCondicao` VARCHAR(50) NULL,
    `bdObservacoes` TEXT NULL,

    PRIMARY KEY (`bdChave`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbFerramentas_disponibilizadas` (
    `bdChave` INTEGER NOT NULL AUTO_INCREMENT,
    `bdChaveFer` BIGINT NULL,
    `bdChaveCli` INTEGER NULL,
    `bdPrecoAluguel` DECIMAL(10, 2) NOT NULL,
    `bdDTDISPONIBILIZACAO` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `bdAtivo` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`bdChave`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbAlugueis` (
    `bdChave` BIGINT NOT NULL AUTO_INCREMENT,
    `bdChaveCli` INTEGER NULL,
    `bdChaveFer` BIGINT NULL,
    `bdDTINICIO` TIMESTAMP(0) NOT NULL,
    `bdDTFIM` TIMESTAMP(0) NULL,
    `bdStatus` VARCHAR(20) NULL DEFAULT 'ativo',
    `bdVlrTotal` DECIMAL(10, 2) NULL,

    PRIMARY KEY (`bdChave`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbLogAtividades` (
    `bdChave` BIGINT NOT NULL AUTO_INCREMENT,
    `bdChaveCli` INTEGER NULL,
    `bdAcao` VARCHAR(255) NULL,
    `bdDTHR` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `bdIPOrigm` VARCHAR(45) NULL,
    `bdNavegador` TEXT NULL,

    PRIMARY KEY (`bdChave`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tbFerramentas` ADD CONSTRAINT `tbFerramentas_bdChaveCli_fkey` FOREIGN KEY (`bdChaveCli`) REFERENCES `tbClientes`(`bdChave`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbFerramentas_disponibilizadas` ADD CONSTRAINT `tbFerramentas_disponibilizadas_bdChaveFer_fkey` FOREIGN KEY (`bdChaveFer`) REFERENCES `tbFerramentas`(`bdChave`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbFerramentas_disponibilizadas` ADD CONSTRAINT `tbFerramentas_disponibilizadas_bdChaveCli_fkey` FOREIGN KEY (`bdChaveCli`) REFERENCES `tbClientes`(`bdChave`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbAlugueis` ADD CONSTRAINT `tbAlugueis_bdChaveCli_fkey` FOREIGN KEY (`bdChaveCli`) REFERENCES `tbClientes`(`bdChave`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbAlugueis` ADD CONSTRAINT `tbAlugueis_bdChaveFer_fkey` FOREIGN KEY (`bdChaveFer`) REFERENCES `tbFerramentas`(`bdChave`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbLogAtividades` ADD CONSTRAINT `tbLogAtividades_bdChaveCli_fkey` FOREIGN KEY (`bdChaveCli`) REFERENCES `tbClientes`(`bdChave`) ON DELETE SET NULL ON UPDATE CASCADE;
