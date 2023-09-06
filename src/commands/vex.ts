import { EmbedBuilder, Role, SlashCommandBuilder } from 'discord.js';
import ApplicationCommand from '../templates/ApplicationCommand.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default new ApplicationCommand({
  data: (new SlashCommandBuilder()
    .setName('vex')
    .setDescription('ロール付与コマンドの作成または削除')
    .addStringOption(option => 
      option.setName('code')
        .setDescription('任意のコードを入力')
        .setRequired(true)
    )
    .addMentionableOption(option => 
      option.setName('role')
        .setDescription('選択可能なロール')
        .setRequired(false) // これをfalseに設定します
    )
    .addBooleanOption(option => 
      option.setName('delete')
        .setDescription('このフラグがtrueの場合、コードを削除します')
        .setRequired(false) // これもfalseに設定します
    )
  ) as SlashCommandBuilder,

  async execute(interaction) {
    const code = interaction.options.getString('code');
    const role = interaction.options.getMentionable('role');
    const deleteFlag = interaction.options.getBoolean('delete');
    const guildId = interaction.guild?.id;
    const userId = interaction.user.id;

    let roleName: string;
    let roleId: string;
    if (role instanceof Role) {
      roleName = `<@&${role.id}>`;
      roleId = role.id;
    } else {
      roleName = 'None';
      roleId = 'None';
    }

    try {
      if (deleteFlag) {
        // 削除ロジック
        await prisma.vex_codes.delete({
          where: { code_guild_id: { code: code!, guild_id: guildId! } },
        });

        const embed = new EmbedBuilder()
          .setTitle('__コード削除__')
          .setDescription(`コード：${code}`)
          .setColor('#ff0000');

        await interaction.reply({ embeds: [embed], ephemeral: true });
      } else {
        // 追加/更新ロジック
        await prisma.vex_codes.upsert({
          where: { code_guild_id: { code: code!, guild_id: guildId! } },
          update: { role_id: roleId, updated_at: new Date() },
          create: {
            code: code!,
            guild_id: guildId!,
            role_id: roleId,
            add_user_id: userId,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        const embed = new EmbedBuilder()
          .setTitle('__コード新規追加__')
          .setDescription(`コード：${code} ロール：${roleName}`)
          .setColor('#3BA55C');

        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    } catch (error) {
      console.error('Database operation failed:', error);
      await interaction.reply({ content: 'データベース操作に失敗しました。', ephemeral: true });
    }
  },
});
