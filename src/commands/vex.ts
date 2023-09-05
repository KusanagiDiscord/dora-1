import { Role, SlashCommandBuilder } from 'discord.js';
import ApplicationCommand from '../templates/ApplicationCommand.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default new ApplicationCommand({
  data: (new SlashCommandBuilder()
    .setName('vex')
    .setDescription('ロール付与コマンドの作成')
    .addStringOption(option =>
      option.setName('code')
        .setDescription('任意のコードを入力')
        .setRequired(true)
    )
    .addMentionableOption(option =>
      option.setName('role')
        .setDescription('選択可能なロール')
        .setRequired(true)
    )
  ) as SlashCommandBuilder,

  async execute(interaction) {
    const code = interaction.options.getString('code');
    const role = interaction.options.getMentionable('role');
    const guildId = interaction.guild?.id;
    const userId = interaction.user.id;

    let roleName: string;
    let roleId: string;
    if (role instanceof Role) {
      roleName = `<@&${role.id}>`;
      roleId = role.id;
    } else {
      roleName = 'None';
      roleId = 'None'; // または適切なデフォルト値を設定します
    }

    try {
      // Prismaを使用してデータベースを更新
      await prisma.vex_codes.upsert({
        where: { code_guild_id: { code: code!, guild_id: guildId! } },  // 修正された where オブジェクト
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

      await interaction.reply({ content: `コード: ${code}, ロール: ${roleName}`, ephemeral: true });
    } catch (error) {
      console.error('Database operation failed:', error);
      await interaction.reply({ content: 'データベース操作に失敗しました。', ephemeral: true });
    }
  },
});
