export type ClientEmitSocketEvents = {
  send_to_server: (one: number, two: boolean, three: string) => void;
};

export type ServerEmitSocketEvents = {
  send_to_client: (one: boolean, two: string, three: number) => void;
};
