import {IrcEventHandler} from "../../client";

import Msg from "../../models/msg";

export default <IrcEventHandler>function (irc, network) {
	const client = this;

	irc.on("registered", function (data) {
		// Only update the user's preferred nick (network.nick) if we registered with it
		// If we registered with a fallback nick (e.g., nick123), don't overwrite the preference
		// This allows the existing quit handler to reclaim the preferred nick when available
		if (data.nick === network.nick) {
			// We got our preferred nick, clear keepNick if it was set
			if (network.keepNick === data.nick) {
				network.keepNick = null;
			}
		} else if (data.nick !== network.nick) {
			// We registered with a fallback, don't call setNick which would overwrite the preference
			// Just update the IRC session nick
			irc.user.nick = data.nick;
		}

		const lobby = network.getLobby();
		const msg = new Msg({
			text: "You're now known as " + data.nick,
		});
		lobby.pushMessage(client, msg);

		client.save();
		client.emit("nick", {
			network: network.uuid,
			nick: data.nick,
		});
	});
};
