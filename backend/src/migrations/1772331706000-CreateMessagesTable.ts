import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration - Chat Temps Réel (Phase 1)
 * 
 * Architecture : Compromis Winston + Manolo
 * - 1 table messages (MVP rapide)
 * - conversationKey (migration future facile vers table conversations)
 * - missionId/offerId nullable (context)
 * 
 * Features :
 * - Chat 1-to-1 (rooms WebSocket)
 * - Context mission/offer
 * - Tracking lecture (isRead)
 * - Performance optimisée (3 index)
 */
export class CreateMessagesTable1772331706000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Créer table messages avec conversationKey
    await queryRunner.createTable(
      new Table({
        name: 'messages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()', // PostgreSQL
          },
          {
            name: 'conversationKey',
            type: 'varchar',
            length: '255',
            comment: 'Format: user1_user2_mission_123 (sorted alphabetically)',
          },
          {
            name: 'missionId',
            type: 'uuid',
            isNullable: true,
            comment: 'Context: mission concernée (nullable)',
          },
          {
            name: 'offerId',
            type: 'uuid',
            isNullable: true,
            comment: 'Context: offer concernée (nullable)',
          },
          {
            name: 'senderId',
            type: 'uuid',
            comment: 'User qui envoie le message',
          },
          {
            name: 'receiverId',
            type: 'uuid',
            comment: 'User qui reçoit le message',
          },
          {
            name: 'content',
            type: 'text',
            comment: 'Contenu du message (max 2000 chars via DTO)',
          },
          {
            name: 'isRead',
            type: 'boolean',
            default: false,
            comment: 'Message lu par le destinataire',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true, // ifNotExists
    );

    // Index 1 : Conversation history (conversationKey + date)
    // Optimise GET /conversations/:key/messages (history)
    await queryRunner.createIndex(
      'messages',
      new TableIndex({
        name: 'IDX_messages_conversation',
        columnNames: ['conversationKey', 'createdAt'],
      }),
    );

    // Index 2 : Messages non lus par user
    // Optimise count messages non lus par user
    await queryRunner.createIndex(
      'messages',
      new TableIndex({
        name: 'IDX_messages_receiver_unread',
        columnNames: ['receiverId', 'isRead'],
      }),
    );

    // Index 3 : Messages par mission
    // Optimise GET /missions/:id/messages
    await queryRunner.createIndex(
      'messages',
      new TableIndex({
        name: 'IDX_messages_mission',
        columnNames: ['missionId', 'createdAt'],
      }),
    );

    // Foreign keys avec CASCADE
    await queryRunner.createForeignKey(
      'messages',
      new TableForeignKey({
        columnNames: ['missionId'],
        referencedTableName: 'missions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'messages',
      new TableForeignKey({
        columnNames: ['offerId'],
        referencedTableName: 'offers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'messages',
      new TableForeignKey({
        columnNames: ['senderId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'messages',
      new TableForeignKey({
        columnNames: ['receiverId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer foreign keys
    const table = await queryRunner.getTable('messages');
    if (table) {
      const missionFk = table.foreignKeys.find((fk) => fk.columnNames.indexOf('missionId') !== -1);
      const offerFk = table.foreignKeys.find((fk) => fk.columnNames.indexOf('offerId') !== -1);
      const senderFk = table.foreignKeys.find((fk) => fk.columnNames.indexOf('senderId') !== -1);
      const receiverFk = table.foreignKeys.find((fk) => fk.columnNames.indexOf('receiverId') !== -1);
      
      if (missionFk) await queryRunner.dropForeignKey('messages', missionFk);
      if (offerFk) await queryRunner.dropForeignKey('messages', offerFk);
      if (senderFk) await queryRunner.dropForeignKey('messages', senderFk);
      if (receiverFk) await queryRunner.dropForeignKey('messages', receiverFk);
    }

    // Supprimer index
    await queryRunner.dropIndex('messages', 'IDX_messages_conversation');
    await queryRunner.dropIndex('messages', 'IDX_messages_receiver_unread');
    await queryRunner.dropIndex('messages', 'IDX_messages_mission');

    // Supprimer table
    await queryRunner.dropTable('messages');
  }
}
