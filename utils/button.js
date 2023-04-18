const { ButtonBuilder, ButtonStyle } = require('discord.js');

const buttonBuilder = function (ID, Label, Style, URL) {
    const styles = {
        'primary': ButtonStyle.Primary,
        'secondary': ButtonStyle.Secondary,
        'success': ButtonStyle.Success,
        'danger': ButtonStyle.Danger,
        'link': ButtonStyle.Link,
        1: ButtonStyle.Primary,
        2: ButtonStyle.Secondary,
        3: ButtonStyle.Success,
        4: ButtonStyle.Danger,
        5: ButtonStyle.Link
    };

    const createdButton = new ButtonBuilder()
        .setLabel(Label)
        .setStyle(styles[Style]);

    ID ? createdButton.setCustomId(ID) : null;
    URL ? createdButton.setURL(URL) : null;
    return createdButton;
};

const booleanStyleBuilder = function (boolean) {
	return (boolean ? ButtonStyle.Success : ButtonStyle.Secondary);
};

module.exports = { buttonBuilder, booleanStyleBuilder };