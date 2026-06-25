CREATE TABLE `concursos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`cargo` varchar(255) NOT NULL,
	`vagas` int NOT NULL,
	`banca` varchar(255) NOT NULL,
	`dataInscricaoInicio` date NOT NULL,
	`dataInscricaoFim` date NOT NULL,
	`dataProva` date,
	`valorInscricao` decimal(10,2) NOT NULL,
	`descricao` text,
	`edital` varchar(500),
	`status` enum('ativo','inativo') NOT NULL DEFAULT 'ativo',
	`criadoEm` timestamp NOT NULL DEFAULT (now()),
	`atualizadoEm` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `concursos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dadosPessoais` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usuarioId` int NOT NULL,
	`cpf` varchar(14) NOT NULL,
	`dataNascimento` date,
	`genero` enum('masculino','feminino','outro','prefiro_nao_informar'),
	`nacionalidade` varchar(100) DEFAULT 'Brasileira',
	`naturalidade` varchar(100),
	`mae` varchar(255),
	`rg` varchar(20),
	`orgaoExpedidor` varchar(10),
	`dataExpedicao` date,
	`atualizadoEm` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dadosPessoais_id` PRIMARY KEY(`id`),
	CONSTRAINT `dadosPessoais_usuarioId_unique` UNIQUE(`usuarioId`),
	CONSTRAINT `dadosPessoais_cpf_unique` UNIQUE(`cpf`)
);
--> statement-breakpoint
CREATE TABLE `inscricoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usuarioId` int NOT NULL,
	`concursoId` int NOT NULL,
	`cpf` varchar(14) NOT NULL,
	`telefone` varchar(15) NOT NULL,
	`cep` varchar(9) NOT NULL,
	`endereco` varchar(500) NOT NULL,
	`numero` varchar(10) NOT NULL,
	`complemento` varchar(255),
	`bairro` varchar(100) NOT NULL,
	`cidade` varchar(100) NOT NULL,
	`estado` varchar(2) NOT NULL,
	`taxaInscricao` decimal(10,2) NOT NULL,
	`isencao` enum('nao','doador_sangue','baixa_renda') NOT NULL DEFAULT 'nao',
	`status` enum('confirmada','cancelada','pendente') NOT NULL DEFAULT 'confirmada',
	`dataInscricao` timestamp NOT NULL DEFAULT (now()),
	`dataCancelamento` timestamp,
	`atualizadoEm` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inscricoes_id` PRIMARY KEY(`id`)
);
