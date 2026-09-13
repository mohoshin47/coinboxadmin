export interface GlobalConfigChannel {
  name: string;
  url: string;
  reward: number;
}

export interface GlobalConfig {
  _id: string;
  refer_reward: number;
  shortdescription: string;
  welcomemessage: string;
  startmessage: string;
  channel_list: GlobalConfigChannel[];
  tokensymbole: string;
  bot_username: string;
  withdrow_message: string;
  createdAt: string;
  updatedAt?: string;
}
