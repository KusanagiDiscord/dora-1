import { SlashCommandBuilder } from 'discord.js';
import ApplicationCommand from '../templates/ApplicationCommand.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default new ApplicationCommand({
  data: (new SlashCommandBuilder()
    .setName('code')
    .setDescription('ロール付与コマンド')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('任意のコードを入力')
        .setRequired(true)
    )
  ) as SlashCommandBuilder,

  async execute(interaction) {
    const query = interaction.options.getString('query');
    const guildId = interaction.guild?.id;
    const userId = interaction.user.id;

    if (!query || !guildId) {
      await interaction.reply({ content: 'コードがありません', ephemeral: true });
      return;
    }

    try {
      const vexCode = await prisma.vex_codes.findUnique({
        where: { code_guild_id: { code: query, guild_id: guildId } },
      });

      if (vexCode) {
        const role = interaction.guild?.roles.cache.get(vexCode.role_id);
        if (role) {
          const member = interaction.guild?.members.cache.get(userId);
          if (member) {
            await member.roles.add(role);
            await interaction.reply({ content: `<@&${role.id}> が付与されました！`, ephemeral: true });
            return;
          } else {
            await interaction.reply({ content: 'メンバーが見つかりません。', ephemeral: true });
          }
        } else {
          await interaction.reply({ content: 'ロールがありません', ephemeral: true });
        }
      } else {
        await interaction.reply({ content: 'コードがありません', ephemeral: true });
      }
    } catch (error) {
      console.error('Database operation failed:', error);
      await interaction.reply({ content: 'データベース操作に失敗しました。', ephemeral: true });
    }
  },
});
