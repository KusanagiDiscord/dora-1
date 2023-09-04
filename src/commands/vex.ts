import { Role, SlashCommandBuilder } from 'discord.js'
import ApplicationCommand from '../templates/ApplicationCommand.js'

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
      )) as SlashCommandBuilder,
      async execute(interaction) {
        const code = interaction.options.getString('code');
        const role = interaction.options.getMentionable('role');

        let roleName: string;
        if (role instanceof Role) {
          roleName = `<@&${role.id}>`;
        } else {
          roleName = 'None';
        }

        await interaction.reply({ content: `コード: ${code}, ロール: ${roleName}`, ephemeral: true });
    }
});
