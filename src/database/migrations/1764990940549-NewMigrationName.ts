import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigrationName1764990940549 implements MigrationInterface {
    name = 'NewMigrationName1764990940549'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`firstName\` varchar(255) NOT NULL, \`lastName\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`picture\` varchar(255) NULL, \`googleRefreshToken\` text NULL, \`JWTRefreshToken\` text NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_workspace\` (\`id\` varchar(36) NOT NULL, \`role\` enum ('superAdmin', 'admin', 'member', 'guest') NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` varchar(36) NULL, \`workspaceId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cards\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(150) NOT NULL, \`description\` text NULL, \`contactName\` varchar(100) NULL, \`contactEmail\` varchar(150) NULL, \`contactPhone\` varchar(20) NULL, \`industry\` varchar(100) NULL, \`priority\` varchar(255) NULL, \`conversationState\` json NULL, \`dueDate\` timestamp NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`listId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`agents\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL, \`flowConfig\` json NULL, \`temperature\` float NOT NULL DEFAULT '1', \`maxTokens\` int NOT NULL DEFAULT '500', \`lastRunAt\` timestamp NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`workspaceId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`lists\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`order\` int NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`boardId\` varchar(36) NULL, \`agentId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`boards\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(100) NOT NULL, \`description\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`color\` varchar(10) NOT NULL DEFAULT '#FFFFFF', \`createdById\` varchar(36) NULL, \`workspaceId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`workspaces\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`boards_members\` (\`boardsId\` varchar(36) NOT NULL, \`usersId\` varchar(36) NOT NULL, INDEX \`IDX_4e3c41a52d61d7944c093867c6\` (\`boardsId\`), INDEX \`IDX_23ec1a3066f5e25ff51836f0bc\` (\`usersId\`), PRIMARY KEY (\`boardsId\`, \`usersId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`boards_agents\` (\`boardsId\` varchar(36) NOT NULL, \`agentsId\` varchar(36) NOT NULL, INDEX \`IDX_54327b863c00a47a0cb2d581d2\` (\`boardsId\`), INDEX \`IDX_01320e3887b1d186637472a9a8\` (\`agentsId\`), PRIMARY KEY (\`boardsId\`, \`agentsId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user_workspace\` ADD CONSTRAINT \`FK_4ea12fabb12c08c3dc8839d0932\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_workspace\` ADD CONSTRAINT \`FK_46438fa9a476521c49324b59843\` FOREIGN KEY (\`workspaceId\`) REFERENCES \`workspaces\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cards\` ADD CONSTRAINT \`FK_8e71fba12a609e08cf311fde6d9\` FOREIGN KEY (\`listId\`) REFERENCES \`lists\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`agents\` ADD CONSTRAINT \`FK_891465b3cee1cfe275594eb1cd7\` FOREIGN KEY (\`workspaceId\`) REFERENCES \`workspaces\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lists\` ADD CONSTRAINT \`FK_05460f5df61d54daeaf96c54c00\` FOREIGN KEY (\`boardId\`) REFERENCES \`boards\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lists\` ADD CONSTRAINT \`FK_64d5d11438ef9787ab353df4e39\` FOREIGN KEY (\`agentId\`) REFERENCES \`agents\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`boards\` ADD CONSTRAINT \`FK_b82b543934c5e662ec834e5ad48\` FOREIGN KEY (\`createdById\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`boards\` ADD CONSTRAINT \`FK_f13eef6b2a45019e1df9cfe9963\` FOREIGN KEY (\`workspaceId\`) REFERENCES \`workspaces\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`boards_members\` ADD CONSTRAINT \`FK_4e3c41a52d61d7944c093867c67\` FOREIGN KEY (\`boardsId\`) REFERENCES \`boards\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`boards_members\` ADD CONSTRAINT \`FK_23ec1a3066f5e25ff51836f0bc0\` FOREIGN KEY (\`usersId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`boards_agents\` ADD CONSTRAINT \`FK_54327b863c00a47a0cb2d581d27\` FOREIGN KEY (\`boardsId\`) REFERENCES \`boards\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`boards_agents\` ADD CONSTRAINT \`FK_01320e3887b1d186637472a9a84\` FOREIGN KEY (\`agentsId\`) REFERENCES \`agents\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`boards_agents\` DROP FOREIGN KEY \`FK_01320e3887b1d186637472a9a84\``);
        await queryRunner.query(`ALTER TABLE \`boards_agents\` DROP FOREIGN KEY \`FK_54327b863c00a47a0cb2d581d27\``);
        await queryRunner.query(`ALTER TABLE \`boards_members\` DROP FOREIGN KEY \`FK_23ec1a3066f5e25ff51836f0bc0\``);
        await queryRunner.query(`ALTER TABLE \`boards_members\` DROP FOREIGN KEY \`FK_4e3c41a52d61d7944c093867c67\``);
        await queryRunner.query(`ALTER TABLE \`boards\` DROP FOREIGN KEY \`FK_f13eef6b2a45019e1df9cfe9963\``);
        await queryRunner.query(`ALTER TABLE \`boards\` DROP FOREIGN KEY \`FK_b82b543934c5e662ec834e5ad48\``);
        await queryRunner.query(`ALTER TABLE \`lists\` DROP FOREIGN KEY \`FK_64d5d11438ef9787ab353df4e39\``);
        await queryRunner.query(`ALTER TABLE \`lists\` DROP FOREIGN KEY \`FK_05460f5df61d54daeaf96c54c00\``);
        await queryRunner.query(`ALTER TABLE \`agents\` DROP FOREIGN KEY \`FK_891465b3cee1cfe275594eb1cd7\``);
        await queryRunner.query(`ALTER TABLE \`cards\` DROP FOREIGN KEY \`FK_8e71fba12a609e08cf311fde6d9\``);
        await queryRunner.query(`ALTER TABLE \`user_workspace\` DROP FOREIGN KEY \`FK_46438fa9a476521c49324b59843\``);
        await queryRunner.query(`ALTER TABLE \`user_workspace\` DROP FOREIGN KEY \`FK_4ea12fabb12c08c3dc8839d0932\``);
        await queryRunner.query(`DROP INDEX \`IDX_01320e3887b1d186637472a9a8\` ON \`boards_agents\``);
        await queryRunner.query(`DROP INDEX \`IDX_54327b863c00a47a0cb2d581d2\` ON \`boards_agents\``);
        await queryRunner.query(`DROP TABLE \`boards_agents\``);
        await queryRunner.query(`DROP INDEX \`IDX_23ec1a3066f5e25ff51836f0bc\` ON \`boards_members\``);
        await queryRunner.query(`DROP INDEX \`IDX_4e3c41a52d61d7944c093867c6\` ON \`boards_members\``);
        await queryRunner.query(`DROP TABLE \`boards_members\``);
        await queryRunner.query(`DROP TABLE \`workspaces\``);
        await queryRunner.query(`DROP TABLE \`boards\``);
        await queryRunner.query(`DROP TABLE \`lists\``);
        await queryRunner.query(`DROP TABLE \`agents\``);
        await queryRunner.query(`DROP TABLE \`cards\``);
        await queryRunner.query(`DROP TABLE \`user_workspace\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }

}
