import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import ApplicationCommand from '../templates/ApplicationCommand.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default new ApplicationCommand({
  data: (new SlashCommandBuilder()
    .setName('vexlist')
    .setDescription('現在のサーバーに登録されているコードの一覧を表示')
  ),
  async execute(interaction) {
    const guildId = interaction.guild?.id;

    if (!guildId) {
      await interaction.reply({ content: 'ギルドIDが不明です。', ephemeral: true });
      return;
    }

    try {
      const codes = await prisma.vex_codes.findMany({
        where: { guild_id: guildId },
      });

      if (codes.length > 0) {
        const codeList = codes.map(code => `コード：\`${code.code}\` 役職：<@&${code.role_id}>`).join('\n');

        // 埋め込みメッセージを作成
        const embed = new EmbedBuilder()
          .setTitle('__コード一覧__')
          .setDescription(codeList)
          .setColor('#2CAFF6');

        await interaction.reply({ embeds: [embed], ephemeral: true });
      } else {
        const embed = new EmbedBuilder()
          .setTitle('__コード一覧__')
          .setDescription('このサーバーにはコードが登録されていません。')
          .setColor('#2CAFF6');
        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    } catch (error) {
      console.error('Database operation failed:', error);
      await interaction.reply({ content: 'データベース操作に失敗しました。', ephemeral: true });
    }
  },
});
