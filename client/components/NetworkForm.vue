<template>
	<div id="connect" class="window" role="tabpanel" aria-label="Connect">
		<div class="header">
			<SidebarToggle />
		</div>
		<form class="container" method="post" action="" @submit.prevent="onSubmit">
			<h1 class="title">
				<template v-if="defaults.uuid">
					<input v-model="defaults.uuid" type="hidden" name="uuid" />
					Edit {{ defaults.name }}
				</template>
				<template v-else>
					Connect
					<template
						v-if="config?.lockNetwork && store?.state.serverConfiguration?.public"
					>
						to {{ defaults.name }}
					</template>
				</template>
			</h1>
			<template v-if="!config?.lockNetwork">
				<h2>Network settings</h2>
				<div class="connect-row">
					<label for="connect:name">Name</label>
					<input
						id="connect:name"
						v-model.trim="defaults.name"
						class="input"
						name="name"
						maxlength="100"
					/>
				</div>
				<div class="connect-row">
					<label for="connect:host">Server</label>
					<div class="input-wrap">
						<input
							id="connect:host"
							v-model.trim="defaults.host"
							class="input"
							name="host"
							aria-label="Server address"
							maxlength="255"
							required
						/>
						<span id="connect:portseparator">:</span>
						<input
							id="connect:port"
							v-model="defaults.port"
							class="input"
							type="number"
							min="1"
							max="65535"
							name="port"
							aria-label="Server port"
						/>
					</div>
				</div>
				<div class="connect-row">
					<label for="connect:password">Password</label>
					<RevealPassword
						v-slot:default="slotProps"
						class="input-wrap password-container"
					>
						<input
							id="connect:password"
							v-model="defaults.password"
							class="input"
							:type="slotProps.isVisible ? 'text' : 'password'"
							placeholder="Server password (optional)"
							name="password"
							maxlength="300"
						/>
					</RevealPassword>
				</div>
				<div class="connect-row">
					<label></label>
					<div class="input-wrap">
						<label class="tls">
							<input
								v-model="defaults.tls"
								type="checkbox"
								name="tls"
								:disabled="defaults.hasSTSPolicy"
							/>
							Use secure connection (TLS)
							<span
								v-if="defaults.hasSTSPolicy"
								class="tooltipped tooltipped-n tooltipped-no-delay"
								aria-label="This network has a strict transport security policy, you will be unable to disable TLS"
								>🔒 STS</span
							>
						</label>
						<label class="tls">
							<input
								v-model="defaults.rejectUnauthorized"
								type="checkbox"
								name="rejectUnauthorized"
							/>
							Only allow trusted certificates
						</label>
					</div>
				</div>

				<h2>Proxy Settings</h2>
				<div class="connect-row">
					<label></label>
					<div class="input-wrap">
						<label for="connect:proxyEnabled">
							<input
								id="connect:proxyEnabled"
								v-model="defaults.proxyEnabled"
								type="checkbox"
								name="proxyEnabled"
							/>
							Enable Proxy
						</label>
					</div>
				</div>
				<template v-if="defaults.proxyEnabled">
					<div class="connect-row">
						<label for="connect:proxyHost">SOCKS Address</label>
						<div class="input-wrap">
							<input
								id="connect:proxyHost"
								v-model.trim="defaults.proxyHost"
								class="input"
								name="proxyHost"
								aria-label="Proxy host"
								maxlength="255"
							/>
							<span id="connect:proxyPortSeparator">:</span>
							<input
								id="connect:proxyPort"
								v-model="defaults.proxyPort"
								class="input"
								type="number"
								min="1"
								max="65535"
								name="proxyPort"
								aria-label="SOCKS port"
							/>
						</div>
					</div>

					<div class="connect-row">
						<label for="connect:proxyUsername">Proxy username</label>
						<input
							id="connect:proxyUsername"
							ref="proxyUsernameInput"
							v-model.trim="defaults.proxyUsername"
							class="input username"
							name="proxyUsername"
							maxlength="100"
							placeholder="Proxy username"
						/>
					</div>

					<div class="connect-row">
						<label for="connect:proxyPassword">Proxy password</label>
						<RevealPassword
							v-slot:default="slotProps"
							class="input-wrap password-container"
						>
							<input
								id="connect:proxyPassword"
								ref="proxyPassword"
								v-model="defaults.proxyPassword"
								class="input"
								:type="slotProps.isVisible ? 'text' : 'password'"
								placeholder="Proxy password"
								name="proxyPassword"
								maxlength="300"
							/>
						</RevealPassword>
					</div>
				</template>
			</template>
			<template v-else-if="config.lockNetwork && !store.state.serverConfiguration?.public">
				<h2>Network settings</h2>
				<div class="connect-row">
					<label for="connect:name">Name</label>
					<input
						id="connect:name"
						v-model.trim="defaults.name"
						class="input"
						name="name"
						maxlength="100"
					/>
				</div>
				<div class="connect-row">
					<label for="connect:password">Password</label>
					<RevealPassword
						v-slot:default="slotProps"
						class="input-wrap password-container"
					>
						<input
							id="connect:password"
							v-model="defaults.password"
							class="input"
							:type="slotProps.isVisible ? 'text' : 'password'"
							placeholder="Server password (optional)"
							name="password"
							maxlength="300"
						/>
					</RevealPassword>
				</div>
			</template>

			<h2>User preferences</h2>
			<div class="connect-row">
				<label for="connect:nick">Nick</label>
				<input
					id="connect:nick"
					v-model="defaults.nick"
					class="input nick"
					name="nick"
					pattern="[^\s:!@]+"
					maxlength="100"
					required
					@input="onNickChanged"
				/>
			</div>
			<div class="connect-row">
				<label></label>
				<div class="input-wrap">
					<label class="tls no-fallback-nick" for="connect:keepNickOnConnect">
						<input
							id="connect:keepNickOnConnect"
							v-model="defaults.keepNickOnConnect"
							type="checkbox"
							name="keepNickOnConnect"
						/>
						No fallback nick
					</label>
				</div>
			</div>
			<template v-if="!config?.useHexIp">
				<div class="connect-row">
					<label for="connect:username">Username</label>
					<input
						id="connect:username"
						ref="usernameInput"
						v-model.trim="defaults.username"
						class="input username"
						name="username"
						maxlength="100"
					/>
				</div>
			</template>
			<div class="connect-row">
				<label for="connect:realname">Real name</label>
				<input
					id="connect:realname"
					v-model.trim="defaults.realname"
					class="input"
					name="realname"
					maxlength="300"
				/>
			</div>
			<div class="connect-row">
				<label for="connect:leaveMessage">Leave message</label>
				<input
					id="connect:leaveMessage"
					v-model.trim="defaults.leaveMessage"
					autocomplete="off"
					class="input"
					name="leaveMessage"
					placeholder="The Lounge - https://thelounge.chat"
				/>
			</div>
			<template v-if="defaults.uuid && !store.state.serverConfiguration?.public">
				<div class="connect-row">
					<label for="connect:commands">
						Commands
						<span
							class="tooltipped tooltipped-ne tooltipped-no-delay"
							aria-label="One /command per line.
Each command will be executed in
the server tab on new connection"
						>
							<button class="extra-help" />
						</span>
					</label>
					<textarea
						id="connect:commands"
						ref="commandsInput"
						autocomplete="off"
						:value="defaults.commands ? defaults.commands.join('\n') : ''"
						class="input"
						name="commands"
						@input="resizeCommandsInput"
					/>
				</div>
			</template>
			<template v-else-if="!defaults.uuid">
				<div class="connect-row">
					<label for="connect:channels">Channels</label>
					<input
						id="connect:channels"
						v-model.trim="defaults.join"
						class="input"
						name="join"
					/>
				</div>
			</template>

			<template v-if="store.state.serverConfiguration?.public">
				<template v-if="config?.lockNetwork">
					<div class="connect-row">
						<label></label>
						<div class="input-wrap">
							<label class="tls">
								<input v-model="displayPasswordField" type="checkbox" />
								I have a password
							</label>
						</div>
					</div>
					<div v-if="displayPasswordField" class="connect-row">
						<label for="connect:password">Password</label>
						<RevealPassword
							v-slot:default="slotProps"
							class="input-wrap password-container"
						>
							<input
								id="connect:password"
								ref="publicPassword"
								v-model="defaults.password"
								class="input"
								:type="slotProps.isVisible ? 'text' : 'password'"
								placeholder="Server password (optional)"
								name="password"
								maxlength="300"
							/>
						</RevealPassword>
					</div>
				</template>
			</template>
			<template v-else>
				<h2 id="label-auth">Authentication</h2>
				<div class="connect-row connect-auth" role="group" aria-labelledby="label-auth">
					<label class="opt">
						<input
							:checked="!defaults.sasl"
							type="radio"
							name="sasl"
							value=""
							@change="setSaslAuth('')"
						/>
						No authentication
					</label>
					<label class="opt">
						<input
							:checked="defaults.sasl === 'plain'"
							type="radio"
							name="sasl"
							value="plain"
							@change="setSaslAuth('plain')"
						/>
						Username + password (SASL PLAIN)
					</label>
					<label
						v-if="!store.state.serverConfiguration?.public && defaults.tls"
						class="opt"
					>
						<input
							:checked="defaults.sasl === 'external'"
							type="radio"
							name="sasl"
							value="external"
							@change="setSaslAuth('external')"
						/>
						Client certificate (SASL EXTERNAL)
					</label>
				</div>

				<template v-if="defaults.sasl === 'plain'">
					<div class="connect-row">
						<label for="connect:username">Account</label>
						<input
							id="connect:saslAccount"
							v-model.trim="defaults.saslAccount"
							class="input"
							name="saslAccount"
							maxlength="100"
							required
						/>
					</div>
					<div class="connect-row">
						<label for="connect:password">Password</label>
						<RevealPassword
							v-slot:default="slotProps"
							class="input-wrap password-container"
						>
							<input
								id="connect:saslPassword"
								v-model="defaults.saslPassword"
								class="input"
								:type="slotProps.isVisible ? 'text' : 'password'"
								name="saslPassword"
								maxlength="300"
								required
							/>
						</RevealPassword>
					</div>
				</template>
				<div v-else-if="defaults.sasl === 'external'" class="connect-sasl-external">
					<p>The Lounge automatically generates and manages the client certificate.</p>
					<p>
						On the IRC server, you will need to tell the services to attach the
						certificate fingerprint (certfp) to your account, for example:
					</p>
					<pre><code>/msg NickServ CERT ADD</code></pre>
				</div>
			</template>

			<div>
				<button type="submit" class="btn" :disabled="disabled ? true : false">
					<template v-if="defaults.uuid">Save network</template>
					<template v-else>Connect</template>
				</button>
			</div>
		</form>
	</div>
</template>

<style>
#connect .connect-auth {
	display: block;
	margin-bottom: 10px;
}

#connect .connect-auth .opt {
	display: block;
	width: 100%;
}

#connect .connect-auth input {
	margin: 3px 10px 0 0;
}

#connect .connect-sasl-external {
	padding: 10px;
	border-radius: 2px;
	background-color: #d9edf7;
	color: #31708f;
}

#connect .connect-sasl-external pre {
	margin: 0;
	user-select: text;
}
</style>

<script lang="ts">
import RevealPassword from "./RevealPassword.vue";
import SidebarToggle from "./SidebarToggle.vue";
import {defineComponent, nextTick, PropType, ref, watch} from "vue";
import {useStore} from "../js/store";
import {ClientNetwork} from "../js/types";

export type NetworkFormDefaults = Partial<ClientNetwork> & {
	join?: string;
};

export default defineComponent({
	name: "NetworkForm",
	components: {
		RevealPassword,
		SidebarToggle,
	},
	props: {
		handleSubmit: {
			type: Function as PropType<(network: ClientNetwork) => void>,
			required: true,
		},
		defaults: {
			type: Object as PropType<NetworkFormDefaults>,
			required: true,
		},
		disabled: Boolean,
	},
	setup(props) {
		const store = useStore();
		const config = ref(store.state.serverConfiguration);
		const previousUsername = ref(props.defaults?.username);
		const displayPasswordField = ref(false);

		const publicPassword = ref<HTMLInputElement | null>(null);

		watch(displayPasswordField, (newValue) => {
			if (newValue) {
				void nextTick(() => {
					publicPassword.value?.focus();
				});
			}
		});

		const commandsInput = ref<HTMLInputElement | null>(null);

		const resizeCommandsInput = () => {
			if (!commandsInput.value) {
				return;
			}

			// Reset height first so it can down size
			commandsInput.value.style.height = "";

			// 2 pixels to account for the border
			commandsInput.value.style.height = `${Math.ceil(
				commandsInput.value.scrollHeight + 2
			)}px`;
		};

		watch(
			// eslint-disable-next-line
			() => props.defaults?.commands,
			() => {
				void nextTick(() => {
					resizeCommandsInput();
				});
			}
		);

		watch(
			// eslint-disable-next-line
			() => props.defaults?.tls,
			(isSecureChecked) => {
				const ports = [6667, 6697];
				const newPort = isSecureChecked ? 0 : 1;

				// If you disable TLS and current port is 6697,
				// set it to 6667, and vice versa
				if (props.defaults?.port === ports[newPort]) {
					props.defaults.port = ports[1 - newPort];
				}
			}
		);

		const setSaslAuth = (type: string) => {
			if (props.defaults) {
				props.defaults.sasl = type;
			}
		};

		const usernameInput = ref<HTMLInputElement | null>(null);

		const onNickChanged = (event: Event) => {
			if (!usernameInput.value) {
				return;
			}

			const usernameRef = usernameInput.value;

			if (!usernameRef.value || usernameRef.value === previousUsername.value) {
				usernameRef.value = (event.target as HTMLInputElement)?.value;
			}

			previousUsername.value = (event.target as HTMLInputElement)?.value;
		};

		const onSubmit = (event: Event) => {
			const formData = new FormData(event.target as HTMLFormElement);
			const data: Partial<ClientNetwork> = {};

			formData.forEach((value, key) => {
				if (key === "keepNickOnConnect") {
					data[key] = true;
				} else {
					data[key] = value;
				}
			});

			if (!("keepNickOnConnect" in data)) {
				data.keepNickOnConnect = false;
			}

			props.handleSubmit(data as ClientNetwork);
		};

		return {
			store,
			config,
			displayPasswordField,
			publicPassword,
			commandsInput,
			resizeCommandsInput,
			setSaslAuth,
			usernameInput,
			onNickChanged,
			onSubmit,
		};
	},
});
</script>
